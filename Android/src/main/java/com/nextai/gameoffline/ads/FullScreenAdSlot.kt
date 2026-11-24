package com.nextai.gameoffline.ads

/**
 * State machine dùng chung cho mọi định dạng quảng cáo toàn màn hình (Interstitial, Rewarded,
 * App Open) — thay thế 3 bản sao copy-paste trước đây trong `AdManager.kt`.
 * Reusable full-screen ad slot encapsulating caching, TTL expiration, request deduplication,
 * exponential backoff retries, and deferred post-dismiss preloading (100% JVM unit-testable).
 */
internal class FullScreenAdSlot<T : Any>(
    private val cacheTtlMs: Long,
    private val maxAutomaticRetries: Int = DEFAULT_MAX_AUTOMATIC_RETRIES,
    private val scheduler: AdScheduler = MainHandlerAdScheduler,
    private val clockMs: () -> Long = { System.currentTimeMillis() },
    private val retryDelayProvider: (errorCode: Int, failureCount: Int) -> Long? = { code, count ->
        AdRetryPolicy.nextDelayMillis(code, count)
    }
) {

    /** Gói đối tượng quảng cáo cùng mốc thời gian nạp để phục vụ hoàn trả cache an toàn. */
    data class CachedAd<T : Any>(
        val ad: T,
        val loadedAtMs: Long
    )

    private var cachedAd: T? = null
    private var loadedAtMs: Long = 0L
    private var isLoading: Boolean = false
    private var failureCount: Int = 0
    private var retryAtMs: Long = 0L
    private var retryRunnable: Runnable? = null
    private var deferredPreloadNotBeforeMs: Long = 0L
    private var deferredPreloadRunnable: Runnable? = null
    private val pendingCallbacks = mutableListOf<(Boolean) -> Unit>()

    /** Xóa quảng cáo khỏi cache nếu đã quá hạn TTL. */
    fun clearExpiredIfNeeded() {
        val now = clockMs()
        if (cachedAd != null && now - loadedAtMs >= cacheTtlMs) {
            cachedAd = null
            loadedAtMs = 0L
        }
    }

    /**
     * Lấy ra quảng cáo còn hạn sử dụng và dọn cache để chuẩn bị hiển thị.
     * Pops a valid non-expired cached ad for presentation, or returns null on miss/expiry.
     */
    fun takeValidAd(): CachedAd<T>? {
        clearExpiredIfNeeded()
        val current = cachedAd ?: return null
        val timestamp = loadedAtMs
        cachedAd = null
        loadedAtMs = 0L
        return CachedAd(current, timestamp)
    }

    /**
     * Hoàn trả quảng cáo về cache nếu Activity rời tiền cảnh trong lúc đệm 700ms mà cache đang rỗng.
     * Restores a popped ad back into cache when the slot is still empty and ad has not expired.
     */
    fun restoreAdIfEmpty(entry: CachedAd<T>) {
        if (cachedAd != null) {
            return
        }
        if (clockMs() - entry.loadedAtMs >= cacheTtlMs) {
            return
        }
        cachedAd = entry.ad
        loadedAtMs = entry.loadedAtMs
    }

    /**
     * Yêu cầu nạp quảng cáo với chống trùng request, tôn trọng cửa sổ chờ preload 3s và backoff.
     * Requests a load with deduplication, deferred preload window enforcement, and retry backoff.
     */
    fun requestLoad(
        canRequest: () -> Boolean,
        onSuppressed: (reason: String) -> Unit,
        onResult: ((Boolean) -> Unit)? = null,
        onDeferredPreloadTrigger: () -> Unit = {},
        startLoad: (startedAtMs: Long, onLoaded: (T) -> Unit, onFailed: (Int) -> Unit) -> Unit
    ) {
        scheduler.runOnMain {
            clearExpiredIfNeeded()
            if (cachedAd != null) {
                onResult?.invoke(true)
                return@runOnMain
            }

            val now = clockMs()
            if (AdOptimizationPolicy.isPreloadDeferred(now, deferredPreloadNotBeforeMs)) {
                if (deferredPreloadRunnable == null && !isLoading) {
                    val remainingMs = AdOptimizationPolicy.remainingPreloadDelayMs(
                        now,
                        deferredPreloadNotBeforeMs
                    )
                    scheduleDeferredPreload(remainingMs, onDeferredPreloadTrigger)
                }
                onSuppressed("preload_delay_3s")
                onResult?.invoke(false)
                return@runOnMain
            }

            onResult?.let(pendingCallbacks::add)
            if (isLoading) {
                return@runOnMain
            }

            if (now < retryAtMs) {
                onSuppressed("retry_cooldown")
                completeLoad(false)
                return@runOnMain
            }

            isLoading = true
            startLoad(
                now,
                { loadedAd ->
                    scheduler.runOnMain {
                        if (!canRequest()) {
                            completeLoad(false)
                            return@runOnMain
                        }
                        cachedAd = loadedAd
                        loadedAtMs = clockMs()
                        failureCount = 0
                        retryAtMs = 0L
                        cancelRetryRunnable()
                        completeLoad(true)
                    }
                },
                { errorCode ->
                    scheduler.runOnMain {
                        cachedAd = null
                        loadedAtMs = 0L
                        failureCount++
                        scheduleRetry(errorCode, onDeferredPreloadTrigger)
                        completeLoad(false)
                    }
                }
            )
        }
    }

    /**
     * Lên lịch tự động nạp trước sau khoảng trễ (ví dụ 3 giây sau khi đóng Interstitial).
     * Schedules an automatic deferred preload (e.g., 3 seconds after dismissing an Interstitial).
     */
    fun scheduleDeferredPreload(delayMs: Long, onTrigger: () -> Unit) {
        scheduler.runOnMain {
            val safeDelayMs = delayMs.coerceAtLeast(0L)
            deferredPreloadNotBeforeMs = clockMs() + safeDelayMs
            cancelDeferredPreloadRunnable()
            val task = Runnable {
                deferredPreloadRunnable = null
                deferredPreloadNotBeforeMs = 0L
                onTrigger()
            }
            deferredPreloadRunnable = task
            scheduler.postDelayed(safeDelayMs, task)
        }
    }

    /** Hủy toàn bộ retry và lịch preload đang chờ nhưng giữ lại cache hiện có. */
    fun cancelScheduledWork() {
        scheduler.runOnMain {
            cancelRetryRunnable()
            cancelDeferredPreload()
        }
    }

    /** Xóa sạch quảng cáo trong cache và hủy toàn bộ tác vụ hẹn giờ (VIP / thu hồi consent). */
    fun clearCacheAndWork() {
        scheduler.runOnMain {
            cancelRetryRunnable()
            cancelDeferredPreload()
            cachedAd = null
            loadedAtMs = 0L
        }
    }

    private fun scheduleRetry(errorCode: Int, retryAction: () -> Unit) {
        val delayMs = retryDelayProvider(errorCode, failureCount)
        if (delayMs == null) {
            retryAtMs = Long.MAX_VALUE
            return
        }
        retryAtMs = clockMs() + delayMs
        if (failureCount > maxAutomaticRetries) {
            return
        }
        cancelRetryRunnable()
        val task = Runnable {
            retryRunnable = null
            retryAction()
        }
        retryRunnable = task
        scheduler.postDelayed(delayMs, task)
    }

    private fun completeLoad(success: Boolean) {
        isLoading = false
        val callbacks = pendingCallbacks.toList()
        pendingCallbacks.clear()
        callbacks.forEach { it.invoke(success) }
    }

    private fun cancelRetryRunnable() {
        retryRunnable?.let(scheduler::cancel)
        retryRunnable = null
    }

    private fun cancelDeferredPreloadRunnable() {
        deferredPreloadRunnable?.let(scheduler::cancel)
        deferredPreloadRunnable = null
    }

    private fun cancelDeferredPreload() {
        cancelDeferredPreloadRunnable()
        deferredPreloadNotBeforeMs = 0L
    }

    companion object {
        const val DEFAULT_MAX_AUTOMATIC_RETRIES = 2
    }
}
