package com.nextai.gameoffline.ads

/**
 * Cổng kiểm soát dùng chung cho quảng cáo toàn màn hình (Interstitial, Rewarded, App Open):
 * đảm bảo tại mỗi thời điểm chỉ có tối đa một quảng cáo toàn màn hình được hiển thị,
 * đồng thời theo dõi mốc thời gian hiển thị gần nhất và số thao tác người dùng.
 * Shared exclusivity gate and frequency-cap tracker across full-screen ad formats.
 */
internal class FullScreenAdGate(
    private val minInterstitialIntervalMs: Long = DEFAULT_MIN_INTERSTITIAL_INTERVAL_MS,
    private val minUserActions: Int = DEFAULT_MIN_USER_ACTIONS
) {

    private val lock = Any()
    private var showing = false
    private var lastShownAtMs = 0L
    private var userActionsSinceFullScreen = 0

    /** Trả về true nếu đang có quảng cáo toàn màn hình hoặc màn hình đệm đang mở. */
    fun isShowing(): Boolean = synchronized(lock) { showing }

    /**
     * Cố gắng giữ quyền hiển thị toàn màn hình theo cơ chế nguyên tử.
     * Atomically attempts to acquire exclusive full-screen display ownership.
     */
    fun tryAcquireShowing(): Boolean = synchronized(lock) {
        if (showing) {
            return false
        }
        showing = true
        true
    }

    /** Giải phóng quyền hiển thị khi quảng cáo đóng hoặc bị hủy. */
    fun releaseShowing() = synchronized(lock) {
        showing = false
    }

    /** Ghi nhận một thao tác chạm thực của người chơi để tính ngưỡng tần suất. */
    fun recordUserAction() = synchronized(lock) {
        userActionsSinceFullScreen = (userActionsSinceFullScreen + 1).coerceAtMost(MAX_TRACKED_ACTIONS)
    }

    /** Kiểm tra người chơi đã thực hiện đủ số thao tác tối thiểu hay chưa. */
    fun hasEnoughUserActions(): Boolean = synchronized(lock) {
        userActionsSinceFullScreen >= minUserActions
    }

    /** Kiểm tra đang nằm trong khoảng chờ tối thiểu (60 giây) kể từ quảng cáo trước. */
    fun isWithinCooldown(nowMs: Long): Boolean = synchronized(lock) {
        nowMs - lastShownAtMs < minInterstitialIntervalMs
    }

    /** Ghi nhận quảng cáo toàn màn hình vừa hiển thị và đặt lại bộ đếm thao tác. */
    fun markFullScreenShown(nowMs: Long) = synchronized(lock) {
        lastShownAtMs = nowMs
        userActionsSinceFullScreen = 0
    }

    companion object {
        const val DEFAULT_MIN_INTERSTITIAL_INTERVAL_MS = 60_000L
        const val DEFAULT_MIN_USER_ACTIONS = 2
        private const val MAX_TRACKED_ACTIONS = 1_000
    }
}
