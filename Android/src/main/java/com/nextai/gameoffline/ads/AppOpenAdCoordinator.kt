package com.nextai.gameoffline.ads

import android.app.Activity
import android.content.Context
import android.util.Log
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.appopen.AppOpenAd
import com.nextai.gameoffline.BuildConfig
import com.nextai.gameoffline.analytics.GameAnalyticsManager
import com.nextai.gameoffline.billing.BillingEntitlements
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Điều phối vòng đời App Open Ad tại màn hình Splash: không bao giờ chặn điều hướng nếu cache rỗng.
 * Coordinates App Open Ad caching and presentation on Splash without blocking navigation on misses.
 */
internal class AppOpenAdCoordinator(
    private val initializer: MobileAdsInitializer,
    private val gate: FullScreenAdGate,
    private val scheduler: AdScheduler = MainHandlerAdScheduler,
    private val clockMs: () -> Long = { System.currentTimeMillis() }
) {

    private val slot = FullScreenAdSlot<AppOpenAd>(
        cacheTtlMs = CACHE_TTL_MS,
        scheduler = scheduler,
        clockMs = clockMs
    )

    /** Nạp trước App Open Ad với cache TTL 3 giờ 50 phút và backoff sau lỗi. */
    fun load(context: Context, onResult: ((Boolean) -> Unit)? = null) {
        val appContext = context.applicationContext
        scheduler.runOnMain {
            if (BillingEntitlements.shouldSuppressAutomaticAds(appContext)) {
                onResult?.invoke(false)
                return@runOnMain
            }
            if (!AdsConsentManager.canRequestAds(appContext)) {
                AdMediationAnalytics.logSuppressed(appContext, FORMAT, "consent_not_ready")
                onResult?.invoke(false)
                return@runOnMain
            }
            if (!initializer.isReady) {
                initializer.initialize(appContext) { initialized ->
                    if (initialized) {
                        load(appContext, onResult)
                    } else {
                        onResult?.invoke(false)
                    }
                }
                return@runOnMain
            }

            slot.requestLoad(
                canRequest = {
                    !BillingEntitlements.shouldSuppressAutomaticAds(appContext) &&
                        AdsConsentManager.canRequestAds(appContext)
                },
                onSuppressed = { reason ->
                    AdMediationAnalytics.logSuppressed(appContext, FORMAT, reason)
                },
                onResult = onResult,
                onDeferredPreloadTrigger = { load(appContext) },
                startLoad = { startedAtMs, onLoaded, onFailed ->
                    executeNetworkLoad(appContext, startedAtMs, onLoaded, onFailed)
                }
            )
        }
    }

    /** Hiển thị App Open Ad đã sẵn sàng hoặc bỏ qua ngay nếu cache rỗng / Activity không ở tiền cảnh. */
    fun show(
        activity: Activity,
        respectCooldown: Boolean = false,
        onDismissed: (() -> Unit)? = null
    ) {
        scheduler.runOnMain {
            val completed = AtomicBoolean(false)
            val finish = {
                if (completed.compareAndSet(false, true)) {
                    onDismissed?.invoke()
                }
            }

            if (BillingEntitlements.shouldSuppressAutomaticAds(activity)) {
                finish()
                return@runOnMain
            }
            if (!AdsConsentManager.canRequestAds(activity)) {
                AdMediationAnalytics.logSuppressed(activity, FORMAT, "consent_not_ready")
                finish()
                return@runOnMain
            }
            if (!ActivityLifecycleGuard.isForegroundResumed(activity) || gate.isShowing()) {
                finish()
                return@runOnMain
            }
            if (respectCooldown && gate.isWithinCooldown(clockMs())) {
                AdMediationAnalytics.logSuppressed(activity, FORMAT, "frequency_cap")
                finish()
                return@runOnMain
            }

            val cached = slot.takeValidAd()
            if (cached == null) {
                finish()
                load(activity.applicationContext)
                return@runOnMain
            }
            if (!gate.tryAcquireShowing()) {
                slot.restoreAdIfEmpty(cached)
                finish()
                return@runOnMain
            }

            presentAd(activity, cached.ad, finish)
        }
    }

    fun clearExpired() = slot.clearExpiredIfNeeded()

    fun cancelScheduledWork() = slot.cancelScheduledWork()

    fun clearCacheAndWork() = slot.clearCacheAndWork()

    private fun executeNetworkLoad(
        appContext: Context,
        startedAtMs: Long,
        onLoaded: (AppOpenAd) -> Unit,
        onFailed: (Int) -> Unit
    ) {
        GameAnalyticsManager.logAdRequest(FORMAT, AdConstants.APP_OPEN_AD_UNIT_ID)
        AppOpenAd.load(
            appContext,
            AdConstants.APP_OPEN_AD_UNIT_ID,
            AdRequest.Builder().build(),
            object : AppOpenAd.AppOpenAdLoadCallback() {
                override fun onAdLoaded(ad: AppOpenAd) {
                    val latencyMs = (clockMs() - startedAtMs).coerceAtLeast(0L)
                    GameAnalyticsManager.logAdLoaded(FORMAT, AdConstants.APP_OPEN_AD_UNIT_ID, latencyMs)
                    AdMediationAnalytics.logLoaded(
                        appContext,
                        FORMAT,
                        AdResponseFormatter.adapterName(ad.responseInfo),
                        latencyMs
                    )
                    onLoaded(ad)
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    GameAnalyticsManager.logAdFailedToLoad(
                        FORMAT,
                        AdConstants.APP_OPEN_AD_UNIT_ID,
                        error.code,
                        error.message
                    )
                    AdMediationAnalytics.logFailed(
                        appContext,
                        FORMAT,
                        error,
                        AdResponseFormatter.responseSummary(error.responseInfo)
                    )
                    onFailed(error.code)
                }
            }
        )
    }

    private fun presentAd(activity: Activity, ad: AppOpenAd, finish: () -> Unit) {
        val appContext = activity.applicationContext
        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdShowedFullScreenContent() {
                // Tránh hiển thị interstitial ngay sát sau App Open.
                // Reset full-screen cooldown so another ad does not fire right after App Open.
                gate.markFullScreenShown(clockMs())
                GameAnalyticsManager.logAdShowed(FORMAT, AdConstants.APP_OPEN_AD_UNIT_ID)
            }

            override fun onAdImpression() {
                GameAnalyticsManager.logAdImpression(
                    FORMAT,
                    AdConstants.APP_OPEN_AD_UNIT_ID,
                    activity.javaClass.simpleName
                )
            }

            override fun onAdClicked() {
                GameAnalyticsManager.logAdClicked(FORMAT, AdConstants.APP_OPEN_AD_UNIT_ID)
            }

            override fun onAdDismissedFullScreenContent() {
                gate.releaseShowing()
                GameAnalyticsManager.logAdDismissed(FORMAT, AdConstants.APP_OPEN_AD_UNIT_ID)
                finish()
                load(appContext)
            }

            override fun onAdFailedToShowFullScreenContent(error: AdError) {
                gate.releaseShowing()
                GameAnalyticsManager.logAdFailedToShow(
                    FORMAT,
                    AdConstants.APP_OPEN_AD_UNIT_ID,
                    error.code,
                    error.message
                )
                finish()
                load(appContext)
            }
        }

        try {
            ad.show(activity)
        } catch (error: RuntimeException) {
            gate.releaseShowing()
            if (BuildConfig.DEBUG) {
                Log.e(TAG, "Unable to show app open ad", error)
            }
            finish()
            load(appContext)
        }
    }

    private companion object {
        const val TAG = "AppOpenCoordinator"
        const val FORMAT = "APP_OPEN"
        const val CACHE_TTL_MS = 3L * 60L * 60L * 1000L + 50L * 60L * 1000L
    }
}
