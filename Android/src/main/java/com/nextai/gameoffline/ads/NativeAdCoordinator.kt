package com.nextai.gameoffline.ads

import android.content.Context
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.AdLoader
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.nativead.NativeAd
import com.google.android.gms.ads.nativead.NativeAdOptions
import com.nextai.gameoffline.analytics.GameAnalyticsManager
import com.nextai.gameoffline.billing.BillingEntitlements

/**
 * Điều phối vòng đời và bộ đệm (pool) cho quảng cáo Native Ad dùng chung ở 3 vị trí:
 * thẻ In-Feed lưới Trang chủ, hộp thoại tải game R2 và hộp thoại xác nhận thoát ứng dụng.
 * Coordinates TTL-bounded caching, request deduplication, retry backoff, and safe disposal for Native Ads.
 */
internal class NativeAdCoordinator(
    private val initializer: MobileAdsInitializer,
    private val scheduler: AdScheduler = MainHandlerAdScheduler,
    private val clockMs: () -> Long = { System.currentTimeMillis() }
) {

    private data class CachedNativeAd(
        val ad: NativeAd,
        val loadedAtMs: Long
    )

    private val cachedPool = ArrayDeque<CachedNativeAd>()
    private val pendingConsumers = ArrayDeque<(NativeAd?) -> Unit>()
    private var isLoading = false
    private var failureCount = 0
    private var retryAtMs = 0L
    private var retryRunnable: Runnable? = null

    /** Chủ động nạp sẵn Native Ad vào pool để mở dialog hoặc cuộn lưới không bị trễ. */
    fun preload(context: Context) {
        val appContext = context.applicationContext
        scheduler.runOnMain {
            if (!canServeNativeAd(appContext)) {
                return@runOnMain
            }
            clearExpiredInternal()
            if (cachedPool.size >= MAX_POOL_SIZE || isLoading) {
                return@runOnMain
            }
            requestLoadInternal(appContext)
        }
    }

    /**
     * Lấy ngay một `NativeAd` còn hạn trong pool hoặc nạp bất đồng bộ nếu pool đang rỗng.
     * Caller chịu trách nhiệm gọi [release] khi ViewHolder/Dialog không còn dùng quảng cáo nữa.
     * Pops a cached NativeAd immediately or loads one asynchronously; caller must [release] it.
     */
    fun acquire(context: Context, onReady: (NativeAd?) -> Unit) {
        val appContext = context.applicationContext
        scheduler.runOnMain {
            if (!canServeNativeAd(appContext)) {
                onReady(null)
                return@runOnMain
            }
            clearExpiredInternal()
            val cached = cachedPool.removeFirstOrNull()
            if (cached != null) {
                onReady(cached.ad)
                if (cachedPool.size < MAX_POOL_SIZE && !isLoading) {
                    requestLoadInternal(appContext)
                }
                return@runOnMain
            }

            pendingConsumers.addLast(onReady)
            if (!isLoading) {
                requestLoadInternal(appContext)
            }
        }
    }

    /** Hủy đối tượng `NativeAd` an toàn trên Main Thread để tránh rò rỉ bộ nhớ WebView/bitmap. */
    fun release(nativeAd: NativeAd?) {
        if (nativeAd == null) {
            return
        }
        scheduler.runOnMain {
            runCatching { nativeAd.destroy() }
        }
    }

    fun clearExpired() {
        scheduler.runOnMain {
            clearExpiredInternal()
        }
    }

    fun cancelScheduledWork() {
        scheduler.runOnMain {
            cancelRetryRunnable()
        }
    }

    fun clearCacheAndWork() {
        scheduler.runOnMain {
            cancelRetryRunnable()
            while (cachedPool.isNotEmpty()) {
                val item = cachedPool.removeFirst()
                runCatching { item.ad.destroy() }
            }
            flushPendingConsumersWithNull()
        }
    }

    private fun canServeNativeAd(appContext: Context): Boolean {
        return !BillingEntitlements.shouldSuppressAutomaticAds(appContext) &&
            AdsConsentManager.canRequestAds(appContext)
    }

    private fun clearExpiredInternal() {
        val now = clockMs()
        val iterator = cachedPool.iterator()
        while (iterator.hasNext()) {
            val entry = iterator.next()
            if (now - entry.loadedAtMs >= CACHE_TTL_MS) {
                iterator.remove()
                runCatching { entry.ad.destroy() }
            }
        }
    }

    private fun requestLoadInternal(appContext: Context) {
        if (!initializer.isReady) {
            initializer.initialize(appContext) { initialized ->
                scheduler.runOnMain {
                    if (initialized && canServeNativeAd(appContext)) {
                        requestLoadInternal(appContext)
                    } else {
                        flushPendingConsumersWithNull()
                    }
                }
            }
            return
        }

        val now = clockMs()
        if (now < retryAtMs) {
            AdMediationAnalytics.logSuppressed(appContext, FORMAT, "retry_cooldown")
            flushPendingConsumersWithNull()
            return
        }

        isLoading = true
        val startedAtMs = now
        GameAnalyticsManager.logAdRequest(FORMAT, AdConstants.NATIVE_AD_UNIT_ID)

        val options = NativeAdOptions.Builder()
            .setAdChoicesPlacement(NativeAdOptions.ADCHOICES_TOP_RIGHT)
            .build()

        val loader = AdLoader.Builder(appContext, AdConstants.NATIVE_AD_UNIT_ID)
            .forNativeAd { loadedAd ->
                handleNativeAdLoaded(appContext, loadedAd, startedAtMs)
            }
            .withAdListener(object : AdListener() {
                override fun onAdImpression() {
                    GameAnalyticsManager.logAdImpression(
                        FORMAT,
                        AdConstants.NATIVE_AD_UNIT_ID,
                        "NativePlacement"
                    )
                }

                override fun onAdClicked() {
                    GameAnalyticsManager.logAdClicked(FORMAT, AdConstants.NATIVE_AD_UNIT_ID)
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    handleNativeAdFailed(appContext, error)
                }
            })
            .withNativeAdOptions(options)
            .build()

        loader.loadAd(AdRequest.Builder().build())
    }

    private fun handleNativeAdLoaded(appContext: Context, loadedAd: NativeAd, startedAtMs: Long) {
        scheduler.runOnMain {
            isLoading = false
            val latencyMs = (clockMs() - startedAtMs).coerceAtLeast(0L)
            GameAnalyticsManager.logAdLoaded(FORMAT, AdConstants.NATIVE_AD_UNIT_ID, latencyMs)
            AdMediationAnalytics.logLoaded(
                appContext,
                FORMAT,
                AdResponseFormatter.adapterName(loadedAd.responseInfo),
                latencyMs
            )
            failureCount = 0
            retryAtMs = 0L
            cancelRetryRunnable()

            if (!canServeNativeAd(appContext)) {
                runCatching { loadedAd.destroy() }
                flushPendingConsumersWithNull()
                return@runOnMain
            }

            val waitingConsumer = pendingConsumers.removeFirstOrNull()
            if (waitingConsumer != null) {
                waitingConsumer(loadedAd)
            } else if (cachedPool.size < MAX_POOL_SIZE) {
                cachedPool.addLast(CachedNativeAd(loadedAd, clockMs()))
            } else {
                runCatching { loadedAd.destroy() }
            }

            if (pendingConsumers.isNotEmpty() || cachedPool.size < MAX_POOL_SIZE) {
                requestLoadInternal(appContext)
            }
        }
    }

    private fun handleNativeAdFailed(appContext: Context, error: LoadAdError) {
        scheduler.runOnMain {
            isLoading = false
            GameAnalyticsManager.logAdFailedToLoad(
                FORMAT,
                AdConstants.NATIVE_AD_UNIT_ID,
                error.code,
                error.message
            )
            AdMediationAnalytics.logFailed(
                appContext,
                FORMAT,
                error,
                AdResponseFormatter.responseSummary(error.responseInfo)
            )
            failureCount++
            scheduleRetry(appContext, error.code)
            flushPendingConsumersWithNull()
        }
    }

    private fun scheduleRetry(appContext: Context, errorCode: Int) {
        val delayMs = AdRetryPolicy.nextDelayMillis(errorCode, failureCount)
        if (delayMs == null) {
            retryAtMs = Long.MAX_VALUE
            return
        }
        retryAtMs = clockMs() + delayMs
        if (failureCount > MAX_AUTOMATIC_RETRIES) {
            return
        }
        cancelRetryRunnable()
        val task = Runnable {
            retryRunnable = null
            preload(appContext)
        }
        retryRunnable = task
        scheduler.postDelayed(delayMs, task)
    }

    private fun flushPendingConsumersWithNull() {
        while (pendingConsumers.isNotEmpty()) {
            val consumer = pendingConsumers.removeFirst()
            consumer(null)
        }
    }

    private fun cancelRetryRunnable() {
        retryRunnable?.let(scheduler::cancel)
        retryRunnable = null
    }

    private companion object {
        const val FORMAT = "NATIVE"
        const val MAX_POOL_SIZE = 2
        const val MAX_AUTOMATIC_RETRIES = 2
        const val CACHE_TTL_MS = 55L * 60L * 1000L
    }
}
