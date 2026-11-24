package com.nextai.gameoffline.presentation.game

/**
 * Chính sách thuần Kotlin quyết định thời điểm đủ điều kiện bật Interstitial trong màn chơi game:
 * - Điểm dừng màn chơi (`levelComplete`, `levelLose`, `levelRestart`, `levelClick > 1`, `submitScore` cuối ván):
 *   đếm tới ngưỡng `eachNLevels` (mặc định 2 màn).
 * - Thoát game về trang chủ: chỉ kích hoạt khi tổng thời gian chơi trong phiên >= 45 giây.
 * Pure Kotlin policy governing in-game level-break threshold and exit-game interstitial eligibility.
 */
object InGameAdTriggerPolicy {

    /**
     * Thời gian chơi tối thiểu (45 giây) trong một phiên trước khi xét hiện Interstitial lúc thoát game.
     * Minimum active play duration (45 seconds) before showing an exit-game interstitial.
     */
    const val MIN_EXIT_INTERSTITIAL_PLAY_SEC = 45L

    /** Ngưỡng mặc định số điểm dừng màn chơi trước khi yêu cầu Interstitial (2 điểm dừng). */
    const val DEFAULT_BREAK_THRESHOLD = 2

    /**
     * Nhóm game chỉ gọi `submitScore(...)` tại thời điểm kết thúc ván (Game Over),
     * không gọi `levelCompleteInGame` / `levelLoseInGame`.
     * Games that emit `submitScore(...)` strictly at Game Over rather than mid-round.
     */
    val SCORE_ON_GAMEOVER_GAMES: Set<String> = setOf(
        "lines98",
        "merge_dice",
        "drop_n_merge",
        "magic_candy",
        "twenty48"
    )

    /**
     * Chuẩn hóa ngưỡng số màn từ catalog về giá trị dương an toàn.
     * Normalizes a catalog level threshold to a safe positive integer.
     */
    fun normalizeBreakThreshold(rawThreshold: Int?): Int {
        val candidate = rawThreshold ?: DEFAULT_BREAK_THRESHOLD
        return candidate.coerceAtLeast(1)
    }

    /**
     * Kiểm tra bộ đếm điểm dừng tự nhiên (thắng/thua/chơi lại) đã đạt ngưỡng hiển thị hay chưa.
     * Checks whether accumulated natural level breaks reached the configured threshold.
     */
    fun shouldTriggerOnLevelBreak(breakCount: Int, rawThreshold: Int?): Boolean {
        return breakCount >= normalizeBreakThreshold(rawThreshold)
    }

    /**
     * Kiểm tra sự kiện `levelClick(level)` có đại diện cho bước chuyển màn (> 1) hợp lệ hay không.
     * Checks whether `levelClick` represents a level transition past level 1.
     */
    fun shouldTriggerOnLevelClick(level: Int): Boolean = level > 1

    /**
     * Chỉ cho phép `submitScore` kích hoạt điểm dừng quảng cáo với nhóm game đã xác minh nộp điểm lúc hết ván.
     * Allows `submitScore` to count as a natural break only for verified Score-On-GameOver games.
     */
    fun shouldTriggerOnSubmitScore(gameName: String): Boolean = gameName in SCORE_ON_GAMEOVER_GAMES

    /**
     * Kiểm tra phiên chơi đã đủ dài để hiển thị Interstitial khi bấm Back rời game hay chưa.
     * Checks whether the session lasted long enough to show an interstitial when exiting the game.
     */
    fun shouldTriggerExitInterstitial(
        elapsedPlaySec: Long,
        minPlaySec: Long = MIN_EXIT_INTERSTITIAL_PLAY_SEC
    ): Boolean {
        return elapsedPlaySec >= minPlaySec.coerceAtLeast(1L)
    }
}

/**
 * Bộ đếm điểm dừng màn chơi thuần Kotlin chống lỗi xóa oan bộ đếm:
 * chỉ đặt lại về `0` khi Interstitial THỰC SỰ hiển thị (`shown == true`);
 * nếu bị chặn bởi cooldown 60s hoặc cache rỗng (`shown == false`), giữ nguyên bộ đếm
 * để ngay màn kế tiếp khi hết cooldown là hiển thị tức thì.
 * Pure Kotlin level-break counter that only resets to zero after an interstitial actually shows.
 */
internal class LevelBreakAdCounter {

    var breakCount: Int = 0
        private set

    /** Tăng bộ đếm điểm dừng và trả `true` nếu đã đạt ngưỡng kích hoạt quảng cáo. */
    fun recordBreakAndShouldRequestAd(rawThreshold: Int?): Boolean {
        breakCount++
        return InGameAdTriggerPolicy.shouldTriggerOnLevelBreak(breakCount, rawThreshold)
    }

    /** Chỉ reset bộ đếm về `0` khi Interstitial thực sự đã hiển thị toàn màn hình. */
    fun onAdAttemptCompleted(shown: Boolean) {
        if (shown) {
            breakCount = 0
        }
    }
}
