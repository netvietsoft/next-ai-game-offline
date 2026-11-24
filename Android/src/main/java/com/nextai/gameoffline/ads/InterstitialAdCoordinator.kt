package com.nextai.gameoffline.ads

import android.app.Activity
import android.content.Context
import android.util.Log
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.nextai.gameoffline.BuildConfig
import com.nextai.gameoffline.analytics.GameAnalyticsManager
import com.nextai.gameoffline.billing.BillingEntitlements
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Điều phối vòng đời quảng cáo Interstitial qua thác nước 3 tầng eCPM ([WaterfallAdUnitChain]),
 * cache TTL, giới hạn tần suất 60s / 2 thao tác, đệm chặn chạm 700ms (`RESUMED`) và preload 3s.
 * Coordinates 3-tier waterfall Interstitial caching, 60s/2-action caps, 700ms buffer, and preloads.
 */
internal class InterstitialAdCoordinator(
    private val initializer: MobileAdsInitializer,
    private val gate: FullScreenAdGate,
    private val scheduler: AdScheduler = MainHandlerAdScheduler,
    private val clockMs: () -> Long = { System.currentTimeMillis() },
    private val waterfallChain: WaterfallAdUnitChain = WaterfallAdUnitChain(
        AdConstants::interstitialWaterfallUnits
    )
) {

    private val slot = FullScreenAdSlot<WaterfallAdUnitChain.LoadedUnit<InterstitialAd>>(
        cacheTtlMs = CACHE_TTL_MS,
        scheduler = scheduler,
        clockMs = clockMs
    )

    /** Nạp trước Interstitial theo thác nước eCPM với chống trùng request và backoff lỗi. */
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
                    executeWaterfallLoad(appContext, startedAtMs, onLoaded, onFailed)
                }
            )
        }
    }

    /**
     * Hiện màn hình đệm `Loading Ad…` 700ms chặn chạm trước khi hiển thị Interstitial đã cache.
     * Callback [onFinished] trả `true` CHỈ KHI `onAdShowedFullScreenContent()` thực sự nổ.
     * Presents a cached interstitial after a 700ms touch-blocking overlay; reports true only if shown.
     */
    fun show(
        activity: Activity,
        gameName: String? = null,
        onFinished: ((shown: Boolean) -> Unit)? = null
    ) {
        scheduler.runOnMain {
            val completed = AtomicBoolean(false)
            val finish: (Boolean) -> Unit = { shown ->
                if (completed.compareAndSet(false, true)) {
                    onFinished?.invoke(shown)
                }
            }

            if (BillingEntitlements.shouldSuppressAutomaticAds(activity)) {
                finish(false)
                return@runOnMain
            }
            if (!AdsConsentManager.canRequestAds(activity)) {
                AdMediationAnalytics.logSuppressed(activity, FORMAT, "consent_not_ready")
                finish(false)
                return@runOnMain
            }
            if (!ActivityLifecycleGuard.isForegroundResumed(activity) || gate.isShowing()) {
                AdMediationAnalytics.logSuppressed(activity, FORMAT, "activity_or_fullscreen_busy")
                finish(false)
                return@runOnMain
            }
            if (!gate.hasEnoughUserActions()) {
                AdMediationAnalytics.logSuppressed(activity, FORMAT, "insufficient_user_actions")
                load(activity.applicationContext)
                finish(false)
                return@runOnMain
            }
            if (gate.isWithinCooldown(clockMs())) {
                AdMediationAnalytics.logSuppressed(activity, FORMAT, "frequency_cap")
                load(activity.applicationContext)
                finish(false)
                return@runOnMain
            }

            val cached = slot.takeValidAd()
            if (cached == null) {
                AdMediationAnalytics.logSuppressed(activity, FORMAT, "cache_miss")
                load(activity.applicationContext)
                finish(false)
                return@runOnMain
            }
            if (!gate.tryAcquireShowing()) {
                slot.restoreAdIfEmpty(cached)
                finish(false)
                return@runOnMain
            }

            presentAfterLoadingBuffer(activity, gameName, cached, finish)
        }
    }

    fun clearExpired() = slot.clearExpiredIfNeeded()

    fun cancelScheduledWork() = slot.cancelScheduledWork()

    fun clearCacheAndWork() = slot.clearCacheAndWork()

    private fun executeWaterfallLoad(
        appContext: Context,
        startedAtMs: Long,
        onLoaded: (WaterfallAdUnitChain.LoadedUnit<InterstitialAd>) -> Unit,
        onFailed: (Int) -> Unit
    ) {
        waterfallChain.loadSequentially(
            loadSingleUnit = { adUnitId, _, onTierSuccess, onTierFailure ->
                loadSingleTier(appContext, adUnitId, startedAtMs, onTierSuccess, onTierFailure)
            },
            onLoaded = onLoaded,
            onAllFailed = onFailed
        )
    }

    private fun loadSingleTier(
        appContext: Context,
        adUnitId: String,
        startedAtMs: Long,
        onTierSuccess: (InterstitialAd) -> Unit,
        onTierFailure: (Int) -> Unit
    ) {
        GameAnalyticsManager.logAdRequest(FORMAT, adUnitId)
        InterstitialAd.load(
            appContext,
            adUnitId,
            AdRequest.Builder().build(),
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    val latencyMs = (clockMs() - startedAtMs).coerceAtLeast(0L)
                    GameAnalyticsManager.logAdLoaded(FORMAT, adUnitId, latencyMs)
                    AdMediationAnalytics.logLoaded(
                        appContext,
                        FORMAT,
                        AdResponseFormatter.adapterName(ad.responseInfo),
                        latencyMs
                    )
                    onTierSuccess(ad)
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    GameAnalyticsManager.logAdFailedToLoad(FORMAT, adUnitId, error.code, error.message)
                    AdMediationAnalytics.logFailed(
                        appContext,
                        FORMAT,
                        error,
                        AdResponseFormatter.responseSummary(error.responseInfo)
                    )
                    onTierFailure(error.code)
                }
            }
        )
    }

    private fun presentAfterLoadingBuffer(
        activity: Activity,
        gameName: String?,
        cached: FullScreenAdSlot.CachedAd<WaterfallAdUnitChain.LoadedUnit<InterstitialAd>>,
        finish: (Boolean) -> Unit
    ) {
        val bufferDialog = AdLoadingOverlayDialog.show(activity)
        val showTask = Runnable {
            AdLoadingOverlayDialog.dismissSafely(bufferDialog)

            val isStillEligible = !BillingEntitlements.shouldSuppressAutomaticAds(activity) &&
                AdsConsentManager.canRequestAds(activity)
            if (!ActivityLifecycleGuard.isForegroundResumed(activity) || !isStillEligible) {
                if (isStillEligible) {
                    slot.restoreAdIfEmpty(cached)
                }
                gate.releaseShowing()
                finish(false)
                return@Runnable
            }

            presentAdNow(activity, gameName, cached.ad, finish)
        }
        scheduler.postDelayed(AdOptimizationPolicy.INTERSTITIAL_LOADING_BUFFER_MS, showTask)
    }

    private fun presentAdNow(
        activity: Activity,
        gameName: String?,
        loaded: WaterfallAdUnitChain.LoadedUnit<InterstitialAd>,
        finish: (Boolean) -> Unit
    ) {
        val appContext = activity.applicationContext
        val winningUnitId = loaded.adUnitId
        var didShow = false
        loaded.ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdShowedFullScreenContent() {
                didShow = true
                gate.markFullScreenShown(clockMs())
                GameAnalyticsManager.logAdShowed(FORMAT, winningUnitId, gameName)
            }

            override fun onAdImpression() {
                GameAnalyticsManager.logAdImpression(
                    FORMAT,
                    winningUnitId,
                    activity.javaClass.simpleName,
                    gameName
                )
            }

            override fun onAdClicked() {
                GameAnalyticsManager.logAdClicked(FORMAT, winningUnitId, gameName)
            }

            override fun onAdDismissedFullScreenContent() {
                gate.releaseShowing()
                GameAnalyticsManager.logAdDismissed(FORMAT, winningUnitId)
                schedulePostDismissPreload(appContext)
                finish(didShow)
            }

            override fun onAdFailedToShowFullScreenContent(error: AdError) {
                gate.releaseShowing()
                GameAnalyticsManager.logAdFailedToShow(FORMAT, winningUnitId, error.code, error.message)
                schedulePostDismissPreload(appContext)
                finish(didShow)
            }
        }

        try {
            loaded.ad.show(activity)
        } catch (error: RuntimeException) {
            gate.releaseShowing()
            if (BuildConfig.DEBUG) {
                Log.e(TAG, "Unable to show interstitial ad", error)
            }
            schedulePostDismissPreload(appContext)
            finish(didShow)
        }
    }

    private fun schedulePostDismissPreload(appContext: Context) {
        if (
            BillingEntitlements.shouldSuppressAutomaticAds(appContext) ||
            !AdsConsentManager.canRequestAds(appContext)
        ) {
            return
        }
        slot.scheduleDeferredPreload(AdOptimizationPolicy.INTERSTITIAL_PRELOAD_DELAY_MS) {
            load(appContext)
        }
    }

    private companion object {
        const val TAG = "InterstitialCoordinator"
        const val FORMAT = "INTERSTITIAL"
        const val CACHE_TTL_MS = 55L * 60L * 1000L
    }
}
