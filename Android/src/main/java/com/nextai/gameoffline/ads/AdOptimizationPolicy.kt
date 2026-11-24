package com.nextai.gameoffline.ads

/**
 * Chính sách thuần Kotlin cho thời gian đệm hiển thị, độ trễ preload lại, banner thu gọn AdMob
 * và điều kiện lazy-preload nhằm tối ưu Show Rate & giữ CTR Banner ở ngưỡng an toàn.
 * Pure Kotlin policy for interstitial buffer timing, post-dismiss preload delay, collapsible
 * banner safety, and lazy-preload eligibility to optimize AdMob Show Rate.
 */
object AdOptimizationPolicy {

    /**
     * Thời gian màn hình đệm chặn chạm trước khi hiển thị Interstitial (700ms = 0.7s).
     * Touch-blocking buffer duration before showing an interstitial ad (700ms = 0.7s).
     */
    const val INTERSTITIAL_LOADING_BUFFER_MS = 700L

    /**
     * Độ trễ trước khi tự động nạp sẵn Interstitial tiếp theo sau khi tắt quảng cáo (3 giây).
     * Delay before preloading the next interstitial after dismissing the previous ad (3 seconds).
     */
    const val INTERSTITIAL_PRELOAD_DELAY_MS = 3_000L

    /**
     * Số lần mở ứng dụng trước đó tối thiểu trước khi nạp/hiển thị App Open Ad (bỏ qua 2 lần mở đầu).
     * Minimum prior app launches required before preloading or showing App Open ads (skips first 2).
     */
    const val MIN_PRIOR_OPENS_FOR_APP_OPEN = 2

    /**
     * Thời gian trì hoãn khởi tạo Banner sau khi bắt đầu nạp game (800ms) nhằm tránh tranh chấp
     * tiến trình Chromium/WASM với WebView game (`Unable to obtain a JavascriptEngine`).
     * Initial delay before loading gameplay banners so WebView startup does not contend for JS engine.
     */
    const val GAMEPLAY_BANNER_INITIAL_DELAY_MS = 800L

    /**
     * Chuỗi thời gian giãn cách tự động thử lại khi Banner tải lỗi (`No fill` / lỗi JS Engine).
     * Exponential backoff intervals for automatic Banner retries after load failures.
     */
    val BANNER_RETRY_DELAYS_MS: List<Long> = listOf(15_000L, 30_000L, 60_000L)

    /** Khóa extra chuẩn của AdMobAdapter cho banner thu gọn / Standard AdMobAdapter extra key for collapsible banners. */
    const val COLLAPSIBLE_BANNER_EXTRA_KEY = "collapsible"

    /** Neo banner thu gọn ở cạnh dưới màn hình / Anchor collapsible banner at the bottom edge. */
    const val COLLAPSIBLE_BANNER_BOTTOM = "bottom"

    /**
     * Tắt hoàn toàn banner thu gọn đáy (`collapsible = "bottom"`) ở cả Trang chủ lẫn màn chơi game
     * để giữ Anchored Adaptive Banner tiêu chuẩn, kéo CTR từ 5.72% về < 3.0% an toàn chính sách AdMob.
     * Disables bottom collapsible banners across all screens to keep standard adaptive banner CTR safe.
     */
    fun shouldUseCollapsibleBanner(isGameplayScreen: Boolean): Boolean = false

    /**
     * Trả về độ trễ retry (ms) cho lần tải Banner thất bại thứ [failureAttempt] (bắt đầu từ 1),
     * hoặc `null` nếu đã hết hạn mức retry tự động.
     * Returns retry backoff delay in ms for 1-based [failureAttempt], or `null` when retries are exhausted.
     */
    fun nextBannerRetryDelayMs(failureAttempt: Int): Long? {
        if (failureAttempt <= 0 || failureAttempt > BANNER_RETRY_DELAYS_MS.size) {
            return null
        }
        return BANNER_RETRY_DELAYS_MS[failureAttempt - 1]
    }

    /**
     * Chỉ nạp và hiển thị App Open trên màn khởi động từ lần mở thứ 3 trở đi (`priorOpens >= 2`).
     * Only preload and show launch App Open ads starting from the 3rd open (`priorOpens >= 2`).
     */
    fun shouldPreloadAppOpenOnLaunch(priorOpens: Int): Boolean =
        priorOpens >= MIN_PRIOR_OPENS_FOR_APP_OPEN

    /**
     * Kiểm tra phiên hiện tại (sau khi Splash đã cộng bộ đếm `completed_launches`) có được phép
     * nạp/hiển thị App Open Ad hay không (bỏ qua hoàn toàn trong 2 lần mở đầu tiên).
     * Checks whether the active session (after launch increment) is eligible for App Open ads.
     */
    fun shouldPreloadAppOpenInSession(completedLaunches: Int): Boolean =
        completedLaunches > MIN_PRIOR_OPENS_FOR_APP_OPEN

    /**
     * Kiểm tra request nạp Interstitial hiện tại có đang nằm trong cửa sổ chờ preload hay không.
     * Checks whether an interstitial load request is still inside the deferred preload window.
     */
    fun isPreloadDeferred(nowMs: Long, notBeforeMs: Long): Boolean = nowMs < notBeforeMs

    /**
     * Tính số mili-giây còn lại tới thời điểm được phép nạp sẵn Interstitial kế tiếp.
     * Computes remaining milliseconds before the next interstitial preload may start.
     */
    fun remainingPreloadDelayMs(nowMs: Long, notBeforeMs: Long): Long =
        (notBeforeMs - nowMs).coerceAtLeast(0L)
}
