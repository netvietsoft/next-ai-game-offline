package com.nextai.gameoffline.billing

import android.content.Context
import android.os.SystemClock
import com.nextai.gameoffline.ads.AdManager
import com.nextai.gameoffline.analytics.GameAnalyticsManager

/**
 * Kết quả sau khi ghi nhận 1 lượt xem video thưởng đổi vé sạch quảng cáo.
 * Result returned after recording one rewarded video step toward an Ad-Free Pass.
 */
data class AdFreePassStepResult(
    val watchedSteps: Int,
    val requiredSteps: Int,
    val passActivated: Boolean,
    val remainingMs: Long
)

/**
 * Giao diện lưu trữ trạng thái Vé Không Quảng Cáo nhằm tách phụ thuộc Android cho Unit Test JVM.
 * Storage abstraction decoupling Ad-Free Pass persistence from Android for pure JVM unit tests.
 */
internal interface AdFreePassStore {
    fun getWatchedSteps(): Int
    fun getPassUntilEpochMs(): Long
    fun getPassUntilElapsedMs(): Long
    fun getGrantedDurationMs(): Long
    fun saveState(
        watchedSteps: Int,
        passUntilEpochMs: Long,
        passUntilElapsedMs: Long,
        grantedDurationMs: Long
    )
}

/**
 * Bộ máy tính thời hạn Vé Không Quảng Cáo (thuần Kotlin, dễ kiểm thử JVM):
 * kết hợp cặp mốc `epoch + elapsedRealtime` để chặn gian lận tua ngược đồng hồ máy.
 * Pure Kotlin Ad-Free Pass engine combining wall-clock and monotonic clocks to resist tampering.
 */
internal class AdFreePassEngine(
    private val store: AdFreePassStore,
    private val epochClockMs: () -> Long,
    private val elapsedClockMs: () -> Long
) {

    /** Trả về số bước xem video hiện tại (`0` hoặc `1`). */
    fun watchedSteps(): Int = store.getWatchedSteps().coerceIn(0, REQUIRED_VIDEOS - 1)

    /** Kiểm tra vé còn hiệu lực an toàn chống chỉnh giờ giả hay không. */
    fun isPassActive(): Boolean = remainingPassMs() > 0L

    /**
     * Tính thời gian hiệu lực còn lại (ms), trả `0` nếu hết hạn hoặc phát hiện tua ngược đồng hồ.
     * Computes remaining pass milliseconds, returning `0` on expiry or backwards clock tampering.
     */
    fun remainingPassMs(): Long {
        val untilEpoch = store.getPassUntilEpochMs()
        if (untilEpoch <= 0L) {
            return 0L
        }
        val nowEpoch = epochClockMs()
        val remainingEpoch = untilEpoch - nowEpoch
        if (remainingEpoch <= 0L) {
            return 0L
        }
        val maxAllowed = store.getGrantedDurationMs()
            .coerceIn(PASS_DURATION_MS, MAX_PASS_DURATION_MS)
        if (remainingEpoch > maxAllowed) {
            // Đồng hồ bị chỉnh lùi vượt quá thời lượng vé được cấp -> vô hiệu hóa chống gian lận.
            // Wall clock was rewound beyond the granted duration; reject to prevent tampering.
            return 0L
        }
        val untilElapsed = store.getPassUntilElapsedMs()
        if (untilElapsed <= 0L) {
            return remainingEpoch
        }
        val nowElapsed = elapsedClockMs()
        if (nowElapsed >= untilElapsed) {
            // Trong cùng phiên boot mà đồng hồ đơn điệu đã vượt hạn -> hết hạn thật sự.
            // Monotonic uptime passed expiry in the same boot session -> definitively expired.
            return 0L
        }
        val remainingElapsed = untilElapsed - nowElapsed
        return if (remainingElapsed <= maxAllowed) {
            minOf(remainingEpoch, remainingElapsed)
        } else {
            // Máy vừa khởi động lại làm `elapsedRealtime` nhỏ hơn mốc cũ -> fallback về epoch có trần.
            // Device rebooted so uptime reset; fall back to bounded wall-clock remaining window.
            remainingEpoch
        }
    }

    /** Ghi nhận hoàn thành 1 Rewarded Video; đủ 2 video thì kích hoạt +20 phút sạch quảng cáo. */
    fun recordRewardedVideoWatched(): AdFreePassStepResult {
        val nextSteps = watchedSteps() + 1
        if (nextSteps >= REQUIRED_VIDEOS) {
            val remaining = grantDurationMs(PASS_DURATION_MS, resetSteps = true)
            return AdFreePassStepResult(
                watchedSteps = 0,
                requiredSteps = REQUIRED_VIDEOS,
                passActivated = true,
                remainingMs = remaining
            )
        }
        store.saveState(
            watchedSteps = nextSteps,
            passUntilEpochMs = store.getPassUntilEpochMs(),
            passUntilElapsedMs = store.getPassUntilElapsedMs(),
            grantedDurationMs = store.getGrantedDurationMs()
        )
        return AdFreePassStepResult(
            watchedSteps = nextSteps,
            requiredSteps = REQUIRED_VIDEOS,
            passActivated = false,
            remainingMs = remainingPassMs()
        )
    }

    /** Cộng thêm thời gian vé sạch quảng cáo (ví dụ +15 phút thưởng Nhiệm vụ ngày), tối đa 60 phút. */
    fun grantBonusMinutes(minutes: Int): Long {
        if (minutes <= 0) {
            return remainingPassMs()
        }
        return grantDurationMs(minutes * 60L * 1000L, resetSteps = false)
    }

    private fun grantDurationMs(addedMs: Long, resetSteps: Boolean): Long {
        val currentRemaining = remainingPassMs()
        val totalDuration = (currentRemaining + addedMs).coerceAtMost(MAX_PASS_DURATION_MS)
        val nowEpoch = epochClockMs()
        val nowElapsed = elapsedClockMs()
        val keptSteps = if (resetSteps) 0 else watchedSteps()
        store.saveState(
            watchedSteps = keptSteps,
            passUntilEpochMs = nowEpoch + totalDuration,
            passUntilElapsedMs = nowElapsed + totalDuration,
            grantedDurationMs = totalDuration
        )
        return totalDuration
    }

    companion object {
        const val REQUIRED_VIDEOS = 2
        const val PASS_DURATION_MS = 20L * 60L * 1000L
        const val MAX_PASS_DURATION_MS = 60L * 60L * 1000L
    }
}

/**
 * Quản lý vé "Xem 2 Video Thưởng = 20 Phút Không Quảng Cáo Tự Động" dùng trên Android runtime.
 * Android singleton facade for the temporary rewarded Ad-Free Pass.
 */
object AdFreePassManager {

    const val REQUIRED_VIDEOS = AdFreePassEngine.REQUIRED_VIDEOS
    const val PASS_DURATION_MINUTES = 20
    private const val PREFS_NAME = "nextai_ad_free_pass_prefs"
    private const val KEY_WATCHED_STEPS = "watched_steps"
    private const val KEY_UNTIL_EPOCH = "pass_until_epoch_ms"
    private const val KEY_UNTIL_ELAPSED = "pass_until_elapsed_ms"
    private const val KEY_GRANTED_DURATION = "pass_granted_duration_ms"

    private fun engine(context: Context): AdFreePassEngine {
        val prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val store = object : AdFreePassStore {
            override fun getWatchedSteps(): Int = prefs.getInt(KEY_WATCHED_STEPS, 0)
            override fun getPassUntilEpochMs(): Long = prefs.getLong(KEY_UNTIL_EPOCH, 0L)
            override fun getPassUntilElapsedMs(): Long = prefs.getLong(KEY_UNTIL_ELAPSED, 0L)
            override fun getGrantedDurationMs(): Long = prefs.getLong(KEY_GRANTED_DURATION, 0L)
            override fun saveState(
                watchedSteps: Int,
                passUntilEpochMs: Long,
                passUntilElapsedMs: Long,
                grantedDurationMs: Long
            ) {
                prefs.edit()
                    .putInt(KEY_WATCHED_STEPS, watchedSteps)
                    .putLong(KEY_UNTIL_EPOCH, passUntilEpochMs)
                    .putLong(KEY_UNTIL_ELAPSED, passUntilElapsedMs)
                    .putLong(KEY_GRANTED_DURATION, grantedDurationMs)
                    .apply()
            }
        }
        return AdFreePassEngine(
            store = store,
            epochClockMs = System::currentTimeMillis,
            elapsedClockMs = SystemClock::elapsedRealtime
        )
    }

    @Synchronized
    fun watchedSteps(context: Context): Int = engine(context).watchedSteps()

    @Synchronized
    fun isPassActive(context: Context): Boolean = engine(context).isPassActive()

    @Synchronized
    fun remainingPassMs(context: Context): Long = engine(context).remainingPassMs()

    /** Ghi nhận 1 video thưởng đã xem xong; khi đủ 2 video tự kích hoạt vé và ẩn ngay quảng cáo tự động. */
    @Synchronized
    fun recordRewardedVideoWatched(context: Context): AdFreePassStepResult {
        val result = engine(context).recordRewardedVideoWatched()
        if (result.passActivated) {
            AdManager.onEntitlementChanged(context.applicationContext)
            GameAnalyticsManager.logAdFreePassActivated("rewarded_2_videos", PASS_DURATION_MINUTES)
        }
        return result
    }

    /** Cộng thêm phút sạch quảng cáo (ví dụ +15 phút từ Daily Quest) và ẩn ngay quảng cáo tự động. */
    @Synchronized
    fun grantBonusMinutes(
        context: Context,
        minutes: Int,
        source: String = "daily_quest"
    ): Long {
        val remaining = engine(context).grantBonusMinutes(minutes)
        if (remaining > 0L) {
            AdManager.onEntitlementChanged(context.applicationContext)
            GameAnalyticsManager.logAdFreePassActivated(source, minutes)
        }
        return remaining
    }
}
