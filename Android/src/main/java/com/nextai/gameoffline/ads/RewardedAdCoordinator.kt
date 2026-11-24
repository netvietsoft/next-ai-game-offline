package com.nextai.gameoffline.ads

import android.app.Activity
import android.content.Context
import android.util.Log
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import com.nextai.gameoffline.BuildConfig
import com.nextai.gameoffline.analytics.GameAnalyticsManager
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Điều phối vòng đời quảng cáo tự nguyện nhận thưởng (Rewarded Video) qua thác nước 3 tầng eCPM.
 * Quảng cáo thưởng vẫn khả dụng khi người chơi chủ động bấm xem (nhận vật phẩm hoặc đổi Vé Sạch QC).
 * Coordinates 3-tier waterfall Rewarded Video caching, presentation, and official reward callbacks.
 */
internal class RewardedAdCoordinator(
    private val initializer: MobileAdsInitializer,
    private val gate: FullScreenAdGate,
    private val scheduler: AdScheduler = MainHandlerAdScheduler,
    private val clockMs: () -> Long = { System.currentTimeMillis() },
    private val waterfallChain: WaterfallAdUnitChain = WaterfallAdUnitChain(
        AdConstants::rewardedWaterfallUnits
    )
) {

    private val slot = FullScreenAdSlot<WaterfallAdUnitChain.LoadedUnit<RewardedAd>>(
        cacheTtlMs = CACHE_TTL_MS,
        scheduler = scheduler,
        clockMs = clockMs
    )

    /** Nạp trước Rewarded Video theo thác nước eCPM với chống trùng request và backoff lỗi. */
    fun load(context: Context, onResult: ((Boolean) -> Unit)? = null) {
        val appContext = context.applicationContext
        scheduler.runOnMain {
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
                canRequest = { AdsConsentManager.canRequestAds(appContext) },
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
     * Hiển thị Rewarded Video đã cache và chỉ trao thưởng từ callback `OnUserEarnedRewardListener`.
     * Presents a cached rewarded ad and grants rewards strictly from the official SDK callback.
     */
    fun show(
        activity: Activity,
        gameName: String? = null,
        onNotEarned: () -> Unit = {},
        onRewardGranted: () -> Unit
    ) {
        scheduler.runOnMain {
            val completed = AtomicBoolean(false)
            val notifyNotEarned = {
                if (completed.compareAndSet(false, true)) {
                    onNotEarned()
                }
            }

            if (!AdsConsentManager.canRequestAds(activity)) {
                AdMediationAnalytics.logSuppressed(activity, FORMAT, "consent_not_ready")
                notifyNotEarned()
                return@runOnMain
            }
            if (!ActivityLifecycleGuard.isForegroundResumed(activity) || gate.isShowing()) {
                AdMediationAnalytics.logSuppressed(activity, FORMAT, "activity_or_fullscreen_busy")
                notifyNotEarned()
                return@runOnMain
            }

            val cached = slot.takeValidAd()
            if (cached == null) {
                AdMediationAnalytics.logSuppressed(activity, FORMAT, "cache_miss")
                load(activity.applicationContext)
                notifyNotEarned()
                return@runOnMain
            }
            if (!gate.tryAcquireShowing()) {
                slot.restoreAdIfEmpty(cached)
                notifyNotEarned()
                return@runOnMain
            }

            presentAd(activity, gameName, cached.ad, completed, notifyNotEarned, onRewardGranted)
        }
    }

    fun clearExpired() = slot.clearExpiredIfNeeded()

    fun cancelScheduledWork() = slot.cancelScheduledWork()

    fun clearCacheAndWork() = slot.clearCacheAndWork()

    private fun executeWaterfallLoad(
        appContext: Context,
        startedAtMs: Long,
        onLoaded: (WaterfallAdUnitChain.LoadedUnit<RewardedAd>) -> Unit,
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
        onTierSuccess: (RewardedAd) -> Unit,
        onTierFailure: (Int) -> Unit
    ) {
        GameAnalyticsManager.logAdRequest(FORMAT, adUnitId)
        RewardedAd.load(
            appContext,
            adUnitId,
            AdRequest.Builder().build(),
            object : RewardedAdLoadCallback() {
                override fun onAdLoaded(ad: RewardedAd) {
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

    private fun presentAd(
        activity: Activity,
        gameName: String?,
        loaded: WaterfallAdUnitChain.LoadedUnit<RewardedAd>,
        completed: AtomicBoolean,
        notifyNotEarned: () -> Unit,
        onRewardGranted: () -> Unit
    ) {
        val appContext = activity.applicationContext
        val winningUnitId = loaded.adUnitId
        loaded.ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdShowedFullScreenContent() {
                // Reset cooldown full-screen để không bật Interstitial ngay sát sau Rewarded.
                // Reset full-screen cooldown so interstitials do not fire immediately after rewarded.
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
                load(appContext)
                notifyNotEarned()
            }

            override fun onAdFailedToShowFullScreenContent(error: AdError) {
                gate.releaseShowing()
                GameAnalyticsManager.logAdFailedToShow(FORMAT, winningUnitId, error.code, error.message)
                load(appContext)
                notifyNotEarned()
            }
        }

        try {
            loaded.ad.show(activity) { reward ->
                if (completed.compareAndSet(false, true)) {
                    GameAnalyticsManager.logAdRewardEarned(gameName, reward.type, reward.amount)
                    onRewardGranted()
                }
            }
        } catch (error: RuntimeException) {
            gate.releaseShowing()
            if (BuildConfig.DEBUG) {
                Log.e(TAG, "Unable to show rewarded ad", error)
            }
            load(appContext)
            notifyNotEarned()
        }
    }

    private companion object {
        const val TAG = "RewardedCoordinator"
        const val FORMAT = "REWARDED"
        const val CACHE_TTL_MS = 55L * 60L * 1000L
    }
}
