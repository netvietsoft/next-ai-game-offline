package com.nextai.gameoffline.presentation.game

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import android.webkit.JavascriptInterface
import com.nextai.gameoffline.BuildConfig

/**
 * Cầu nối JavaScript hai chiều giữa Android Native và Game HTML5/WASM/Construct 3.
 * Two-way JavaScript Interface bridge between Android Native and HTML5/WASM/Construct 3 games.
 *
 * Tương thích toàn diện với interface "Android" và "AndroidBridge" mà các game gọi:
 * Fully compatible with "Android" and "AndroidBridge" interfaces invoked by games:
 * - `gameLoaded()`: Game báo đã nạp xong / Game loaded event
 * - `levelStartInGame(level)`: Bắt đầu màn chơi / Level start
 * - `levelCompleteInGame(level, extra)`: Hoàn thành màn chơi / Level complete
 * - `levelLoseInGame(level, extra)`: Thua màn chơi / Level lose
 * - `levelRestartInGame(level)`: Chơi lại màn / Level restart
 * - `levelClick(level)`: Chọn màn chơi / Level click
 * - `scoreInGame(score)`: Cập nhật điểm trong game / Score update
 * - `showInterstitialInGame(place)`: Yêu cầu quảng cáo xen kẽ / Request interstitial ad
 * - `showRewardedInGame(place)` / `showRewardedVideo(rewardType)`: Yêu cầu quảng cáo thưởng / Rewarded ad
 * - `submitScore(score)`: Cập nhật điểm kỷ lục / Submit high score
 * - `vibrate(durationMs)`: Rung phản hồi xúc giác / Haptic feedback
 */
class AndroidGameBridge(
    private val context: Context,
    private val gameName: String,
    private val onScoreSubmitted: (Int) -> Unit,
    private val onLevelStarted: (Int) -> Unit,
    private val onLevelCompleted: (Int, String?) -> Unit,
    private val onLevelBreakAdRequested: () -> Unit,
    private val onExplicitInterstitialAdRequested: () -> Unit,
    private val onC3InterstitialRequested: (Int) -> Unit,
    private val onShowRewardedAdRequested: (String?) -> Unit,
    private val onGameLoaded: () -> Unit
) {

    companion object {
        private const val TAG = "NextAIGameBridge"
        private const val MIN_VIBRATION_MS = 1L
        private const val MAX_VIBRATION_MS = 500L
        private const val MAX_LOG_VALUE_LENGTH = 120
    }

    /**
     * Báo hiệu game đã nạp tài nguyên hoàn tất (Construct 3 & HTML5 engine event).
     * Signal that game assets are loaded (Construct 3 & HTML5 engine event).
     */
    @JavascriptInterface
    fun gameLoaded() {
        debugLog("[$gameName] gameLoaded()")
        onGameLoaded()
    }

    /**
     * Tương thích với onGameReady callback.
     * Compatible with onGameReady callback.
     */
    @JavascriptInterface
    fun onGameReady() {
        debugLog("[$gameName] onGameReady()")
        onGameLoaded()
    }

    /**
     * JavaScript gọi khi bắt đầu màn chơi mới.
     * Called by JS when starting a new level.
     */
    @JavascriptInterface
    fun levelStartInGame(levelStr: String) {
        val level = levelStr.toIntOrNull() ?: 1
        levelStartInGame(level)
    }

    @JavascriptInterface
    fun levelStartInGame(level: Int) {
        debugLog("[$gameName] levelStartInGame(level=$level)")
        onLevelStarted(level)
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logGameLevelStart(gameName, level)
    }

    /**
     * JavaScript gọi khi người chơi vượt qua một màn chơi.
     * Called by JS when level is completed.
     */
    @JavascriptInterface
    fun levelCompleteInGame(levelStr: String) {
        val level = levelStr.toIntOrNull() ?: 1
        levelCompleteInGame(level, null)
    }

    @JavascriptInterface
    fun levelCompleteInGame(level: Int) {
        levelCompleteInGame(level, null)
    }

    @JavascriptInterface
    fun levelCompleteInGame(levelStr: String, extra: String?) {
        val level = levelStr.toIntOrNull() ?: 1
        levelCompleteInGame(level, extra)
    }

    @JavascriptInterface
    fun levelCompleteInGame(level: Int, extra: String?) {
        debugLog("[$gameName] levelCompleteInGame(level=$level, extra=$extra)")
        onLevelCompleted(level, extra)
        onLevelBreakAdRequested()
    }

    /**
     * JavaScript gọi khi người chơi thua màn chơi.
     * Called by JS when level is lost / game over.
     */
    @JavascriptInterface
    fun levelLoseInGame(levelStr: String) {
        val level = levelStr.toIntOrNull() ?: 1
        levelLoseInGame(level, null)
    }

    @JavascriptInterface
    fun levelLoseInGame(level: Int) {
        levelLoseInGame(level, null)
    }

    @JavascriptInterface
    fun levelLoseInGame(levelStr: String, extra: String?) {
        val level = levelStr.toIntOrNull() ?: 1
        levelLoseInGame(level, extra)
    }

    @JavascriptInterface
    fun levelLoseInGame(level: Int, extra: String?) {
        debugLog("[$gameName] levelLoseInGame(level=$level, extra=$extra)")
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logGameLevelFailed(gameName, level, extra)
        onLevelBreakAdRequested()
    }

    /**
     * JavaScript gọi khi người chơi bấm chơi lại màn.
     * Called by JS when level is restarted.
     */
    @JavascriptInterface
    fun levelRestartInGame(levelStr: String) {
        val level = levelStr.toIntOrNull() ?: 1
        levelRestartInGame(level)
    }

    @JavascriptInterface
    fun levelRestartInGame(level: Int) {
        debugLog("[$gameName] levelRestartInGame(level=$level)")
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logGameLevelRestart(gameName, level)
        onLevelBreakAdRequested()
    }

    /**
     * JavaScript gọi khi người chơi bấm vào chọn màn.
     * Called by JS when level is clicked.
     */
    @JavascriptInterface
    fun levelClick(levelStr: String) {
        val level = levelStr.toIntOrNull() ?: 1
        levelClick(level)
    }

    @JavascriptInterface
    fun levelClick(level: Int) {
        debugLog("[$gameName] levelClick(level=$level)")
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logGameLevelReached(gameName, level)
        if (InGameAdTriggerPolicy.shouldTriggerOnLevelClick(level)) {
            onLevelBreakAdRequested()
        }
    }

    /**
     * JavaScript gọi khi cập nhật điểm số trong màn chơi (scoreInGame).
     * Called by JS when score is updated during gameplay.
     */
    @JavascriptInterface
    fun scoreInGame(scoreStr: String) {
        val score = scoreStr.toIntOrNull() ?: 0
        debugLog("[$gameName] scoreInGame(scoreStr=$scoreStr -> $score)")
        onScoreSubmitted(score)
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logGameScore(gameName, score)
    }

    @JavascriptInterface
    fun scoreInGame(score: Int) {
        debugLog("[$gameName] scoreInGame(score=$score)")
        onScoreSubmitted(score)
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logGameScore(gameName, score)
    }

    /**
     * JavaScript gọi khi nộp điểm kỷ lục cuối ván (submitScore).
     * Chỉ kích hoạt điểm dừng quảng cáo cho nhóm Score-On-GameOver đã xác minh; tuyệt đối
     * không gắn vào `scoreInGame` vốn bắn liên tục trong khi đang chơi.
     * Called by JS on end-of-round score submission; triggers level break only for audited games.
     */
    @JavascriptInterface
    fun submitScore(score: Int) {
        debugLog("[$gameName] submitScore(score=$score)")
        onScoreSubmitted(score)
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logGameScore(gameName, score)
        if (InGameAdTriggerPolicy.shouldTriggerOnSubmitScore(gameName)) {
            onLevelBreakAdRequested()
        }
    }

    @JavascriptInterface
    fun submitScore(scoreStr: String) {
        val score = scoreStr.toIntOrNull() ?: 0
        debugLog("[$gameName] submitScore(scoreStr=$scoreStr -> $score)")
        onScoreSubmitted(score)
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logGameScore(gameName, score)
        if (InGameAdTriggerPolicy.shouldTriggerOnSubmitScore(gameName)) {
            onLevelBreakAdRequested()
        }
    }

    /**
     * JavaScript yêu cầu hiển thị quảng cáo Interstitial.
     * Called by JS to request an interstitial advertisement.
     */
    @JavascriptInterface
    fun showInterstitialInGame(adPlace: String) {
        debugLog("[$gameName] showInterstitialInGame(adPlace=$adPlace)")
        onExplicitInterstitialAdRequested()
    }

    @JavascriptInterface
    fun requestInterstitialAd() {
        debugLog("[$gameName] requestInterstitialAd()")
        onExplicitInterstitialAdRequested()
    }

    /** Cầu nối C3 riêng cho Hexa Merge / C3 bridge limited to Hexa Merge. */
    @JavascriptInterface
    fun requestC3Interstitial(requestId: Int) {
        if (gameName == "hexa_merge" && requestId in 1..1_000_000) onC3InterstitialRequested(requestId)
    }

    /**
     * JavaScript yêu cầu hiển thị quảng cáo nhận thưởng (Rewarded Video).
     * Called by JS to request a rewarded video advertisement.
     */
    @JavascriptInterface
    fun showRewardedInGame(adPlace: String) {
        debugLog("[$gameName] showRewardedInGame(adPlace=$adPlace)")
        onShowRewardedAdRequested(null)
    }

    @JavascriptInterface
    fun showRewardedVideo(rewardType: String) {
        debugLog("[$gameName] showRewardedVideo(rewardType=$rewardType)")
        onShowRewardedAdRequested(rewardType)
    }

    @JavascriptInterface
    fun requestRewardedVideo() {
        debugLog("[$gameName] requestRewardedVideo()")
        onShowRewardedAdRequested(null)
    }

    /**
     * Các sự kiện điều hướng và liên kết trong game.
     * Navigation and redirect event handlers from HTML5 games.
     */
    @JavascriptInterface
    fun gameOpenLink() {
        debugLog("[$gameName] gameOpenLink()")
    }

    @JavascriptInterface
    fun gameCloseRedirectWindow() {
        debugLog("[$gameName] gameCloseRedirectWindow()")
    }

    @JavascriptInterface
    fun gameOpenRedirectWindow() {
        debugLog("[$gameName] gameOpenRedirectWindow()")
    }

    @JavascriptInterface
    fun gameProgressEvent(str: String) {
        debugLog("[$gameName] gameProgressEvent($str)")
    }

    /**
     * Tạo hiệu ứng rung phản hồi xúc giác.
     * Trigger haptic vibration effect on the device.
     */
    @JavascriptInterface
    fun vibrate(milliseconds: Long) {
        triggerVibrate(milliseconds)
    }

    @JavascriptInterface
    fun vibrate() {
        triggerVibrate(50L)
    }

    private fun triggerVibrate(milliseconds: Long) {
        // Kiểm tra cài đặt rung xúc giác từ người dùng / Check user haptic preference
        if (!com.nextai.gameoffline.presentation.settings.GameSettingsManager.isHapticEnabled(context)) {
            return
        }
        try {
            // Giới hạn bridge để nội dung game không thể giữ motor rung quá lâu.
            // Bound the bridge so game content cannot hold the vibration motor for too long.
            val safeDurationMs = milliseconds.coerceIn(MIN_VIBRATION_MS, MAX_VIBRATION_MS)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                val vibrator = vibratorManager?.defaultVibrator
                vibrator?.vibrate(VibrationEffect.createOneShot(safeDurationMs, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                @Suppress("DEPRECATION")
                vibrator?.vibrate(safeDurationMs)
            }
        } catch (e: Exception) {
            if (BuildConfig.DEBUG) Log.w(TAG, "Vibrate unavailable on this device")
        }
    }

    /**
     * Chỉ ghi dữ liệu bridge đã làm sạch ở debug để tránh log injection/rò dữ liệu production.
     * Logs sanitized bridge data only in debug to prevent production leakage and log injection.
     */
    private fun debugLog(message: String) {
        if (!BuildConfig.DEBUG) return
        Log.d(TAG, message.replace('\n', ' ').replace('\r', ' ').take(MAX_LOG_VALUE_LENGTH))
    }

}

