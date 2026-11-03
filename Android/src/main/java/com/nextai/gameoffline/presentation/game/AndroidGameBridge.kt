package com.nextai.gameoffline.presentation.game

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import android.webkit.JavascriptInterface

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
    private val onShowInterstitialAdRequested: () -> Unit,
    private val onShowRewardedAdRequested: () -> Unit,
    private val onGameLoaded: () -> Unit
) {

    companion object {
        private const val TAG = "NextAIGameBridge"
    }

    /**
     * Báo hiệu game đã nạp tài nguyên hoàn tất (Construct 3 & HTML5 engine event).
     * Signal that game assets are loaded (Construct 3 & HTML5 engine event).
     */
    @JavascriptInterface
    fun gameLoaded() {
        Log.i(TAG, "[$gameName] gameLoaded()")
        onGameLoaded()
    }

    /**
     * Tương thích với onGameReady callback.
     * Compatible with onGameReady callback.
     */
    @JavascriptInterface
    fun onGameReady() {
        Log.i(TAG, "[$gameName] onGameReady()")
        onGameLoaded()
    }

    private val trackingRepo = com.nextai.gameoffline.data.local.GameTrackingRepository.getInstance(context)

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
        Log.d(TAG, "[$gameName] levelStartInGame(level=$level)")
        trackingRepo.incrementPlayCount(gameName)
        trackingRepo.updateHighestLevel(gameName, level)
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

    fun levelCompleteInGame(level: Int, extra: String?) {
        Log.i(TAG, "[$gameName] levelCompleteInGame(level=$level, extra=$extra)")
        val nextLevel = level + 1
        val newHighest = trackingRepo.updateHighestLevel(gameName, nextLevel)
        val scoreExtra = extra?.toLongOrNull()
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logGameLevelComplete(gameName, level, scoreExtra)
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logGameLevelReached(gameName, newHighest)
        onShowInterstitialAdRequested()
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

    fun levelLoseInGame(level: Int, extra: String?) {
        Log.i(TAG, "[$gameName] levelLoseInGame(level=$level, extra=$extra)")
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logGameLevelFailed(gameName, level, extra)
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
        Log.d(TAG, "[$gameName] levelRestartInGame(level=$level)")
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logGameLevelRestart(gameName, level)
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
        Log.d(TAG, "[$gameName] levelClick(level=$level)")
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logGameLevelReached(gameName, level)
    }

    /**
     * JavaScript gọi khi cập nhật điểm số trong màn chơi (scoreInGame).
     * Called by JS when score is updated during gameplay.
     */
    @JavascriptInterface
    fun scoreInGame(scoreStr: String) {
        val score = scoreStr.toIntOrNull() ?: 0
        Log.d(TAG, "[$gameName] scoreInGame(scoreStr=$scoreStr -> $score)")
        onScoreSubmitted(score)
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logGameScore(gameName, score)
    }

    @JavascriptInterface
    fun scoreInGame(score: Int) {
        Log.d(TAG, "[$gameName] scoreInGame(score=$score)")
        onScoreSubmitted(score)
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logGameScore(gameName, score)
    }

    /**
     * JavaScript gọi khi nộp điểm kỷ lục (submitScore).
     * Called by JS when high score is submitted.
     */
    @JavascriptInterface
    fun submitScore(score: Int) {
        Log.i(TAG, "[$gameName] submitScore(score=$score)")
        onScoreSubmitted(score)
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logGameScore(gameName, score)
    }

    @JavascriptInterface
    fun submitScore(scoreStr: String) {
        val score = scoreStr.toIntOrNull() ?: 0
        Log.i(TAG, "[$gameName] submitScore(scoreStr=$scoreStr -> $score)")
        onScoreSubmitted(score)
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logGameScore(gameName, score)
    }

    /**
     * JavaScript yêu cầu hiển thị quảng cáo Interstitial.
     * Called by JS to request an interstitial advertisement.
     */
    @JavascriptInterface
    fun showInterstitialInGame(adPlace: String) {
        Log.d(TAG, "[$gameName] showInterstitialInGame(adPlace=$adPlace)")
        onShowInterstitialAdRequested()
    }

    @JavascriptInterface
    fun requestInterstitialAd() {
        Log.d(TAG, "[$gameName] requestInterstitialAd()")
        onShowInterstitialAdRequested()
    }

    /**
     * JavaScript yêu cầu hiển thị quảng cáo nhận thưởng (Rewarded Video).
     * Called by JS to request a rewarded video advertisement.
     */
    @JavascriptInterface
    fun showRewardedInGame(adPlace: String) {
        Log.d(TAG, "[$gameName] showRewardedInGame(adPlace=$adPlace)")
        onShowRewardedAdRequested()
    }

    @JavascriptInterface
    fun showRewardedVideo(rewardType: String) {
        Log.d(TAG, "[$gameName] showRewardedVideo(rewardType=$rewardType)")
        onShowRewardedAdRequested()
    }

    @JavascriptInterface
    fun requestRewardedVideo() {
        Log.d(TAG, "[$gameName] requestRewardedVideo()")
        onShowRewardedAdRequested()
    }

    /**
     * Các sự kiện điều hướng và liên kết trong game.
     * Navigation and redirect event handlers from HTML5 games.
     */
    @JavascriptInterface
    fun gameOpenLink() {
        Log.d(TAG, "[$gameName] gameOpenLink()")
    }

    @JavascriptInterface
    fun gameCloseRedirectWindow() {
        Log.d(TAG, "[$gameName] gameCloseRedirectWindow()")
    }

    @JavascriptInterface
    fun gameOpenRedirectWindow() {
        Log.d(TAG, "[$gameName] gameOpenRedirectWindow()")
    }

    @JavascriptInterface
    fun gameProgressEvent(str: String) {
        Log.d(TAG, "[$gameName] gameProgressEvent($str)")
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
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                val vibrator = vibratorManager?.defaultVibrator
                vibrator?.vibrate(VibrationEffect.createOneShot(milliseconds, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                @Suppress("DEPRECATION")
                vibrator?.vibrate(milliseconds)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Vibrate unavailable on this device: ${e.message}")
        }
    }
}

