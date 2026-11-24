package com.nextai.gameoffline.presentation.game

import android.app.Activity
import android.webkit.WebView
import android.widget.Toast
import com.nextai.gameoffline.ads.AdManager
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Điều phối hiển thị Interstitial theo điểm dừng màn chơi (thắng/thua/chơi lại), yêu cầu trực tiếp
 * từ game, thoát game sau >= 60s, và Rewarded Video trong màn chơi game.
 * Coordinates in-game interstitial triggers (level breaks, explicit calls, exit-game) and rewarded ads.
 */
internal class GameAdSessionController(
    private val activity: Activity,
    private val gameName: String,
    private val webViewProvider: () -> WebView,
    private val thresholdProvider: () -> Int
) {

    private val levelBreakCounter = LevelBreakAdCounter()

    /**
     * Đếm điểm dừng tự nhiên (`levelComplete`, `levelLose`, `levelRestart`, `levelClick > 1`, `submitScore`
     * cuối ván) và bật Interstitial khi đạt ngưỡng. CHỈ đặt lại bộ đếm khi `shown == true` để tránh
     * nuốt oan lượt đếm khi vướng cooldown 60s hoặc cache rỗng.
     * Counts natural breaks and resets the counter ONLY after an interstitial actually shows (`shown == true`).
     */
    fun onLevelBreakRequested() {
        activity.runOnUiThread {
            if (levelBreakCounter.recordBreakAndShouldRequestAd(thresholdProvider())) {
                AdManager.showInterstitialAd(activity, gameName) { shown ->
                    levelBreakCounter.onAdAttemptCompleted(shown)
                }
            }
        }
    }

    /**
     * Xử lý lời gọi Interstitial trực tiếp từ game (`showInterstitialInGame`, `requestInterstitialAd`),
     * bỏ chặn kép `eachNLevels` và đi thẳng qua cổng 60s / 2 thao tác / màn đệm 700ms của [AdManager].
     * Handles direct in-game interstitial calls without double-gating behind `eachNLevels`.
     */
    fun onExplicitInterstitialRequested() {
        activity.runOnUiThread {
            AdManager.showInterstitialAd(activity, gameName) { shown ->
                levelBreakCounter.onAdAttemptCompleted(shown)
            }
        }
    }

    /**
     * Xét hiển thị Interstitial khi bấm Back rời game về trang chủ nếu phiên chơi >= 45 giây.
     * Luôn bảo đảm gọi `onProceedExit` đúng một lần kể cả khi cache rỗng, cooldown hay người dùng VIP.
     * Shows an exit-game interstitial after >= 45s active play, always invoking `onProceedExit` once.
     */
    fun onExitGameRequested(elapsedSessionSec: Long, onProceedExit: () -> Unit) {
        val completed = AtomicBoolean(false)
        val finishOnce = {
            if (completed.compareAndSet(false, true)) {
                onProceedExit()
            }
        }
        if (!InGameAdTriggerPolicy.shouldTriggerExitInterstitial(elapsedSessionSec)) {
            finishOnce()
            return
        }
        activity.runOnUiThread {
            if (activity.isFinishing || activity.isDestroyed) {
                finishOnce()
                return@runOnUiThread
            }
            AdManager.recordInterstitialUserAction()
            AdManager.showInterstitialAd(activity, gameName) { _ ->
                finishOnce()
            }
        }
    }

    /** Xử lý cầu nối Interstitial riêng cho Construct 3 (Hexa Merge). */
    fun onC3InterstitialRequested(requestId: Int) {
        activity.runOnUiThread {
            AdManager.showInterstitialAd(activity, gameName) { _ ->
                if (!activity.isFinishing && !activity.isDestroyed) {
                    val doneJs = "window.__nextaiC3InterstitialDone && " +
                        "window.__nextaiC3InterstitialDone($requestId);"
                    webViewProvider().evaluateJavascript(doneJs, null)
                }
            }
        }
    }

    /** Hiển thị Rewarded Video và chỉ tiêm script trao thưởng khi nhận callback chính thức. */
    fun onRewardedRequested(callback: String?) {
        activity.runOnUiThread {
            val rewardScript = RewardCallbackResolver.resolve(gameName, callback)
            if (rewardScript == null) {
                Toast.makeText(activity, "Reward unavailable for this game", Toast.LENGTH_SHORT).show()
                return@runOnUiThread
            }
            AdManager.showRewardedAd(
                activity = activity,
                gameName = gameName,
                onNotEarned = {
                    if (!activity.isFinishing && !activity.isDestroyed) {
                        webViewProvider().evaluateJavascript(
                            "window.dispatchEvent(new Event('nextai-reward-unavailable'));",
                            null
                        )
                        Toast.makeText(
                            activity,
                            "Rewarded ad unavailable or not completed. Please try again.",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            ) {
                if (!activity.isFinishing && !activity.isDestroyed) {
                    webViewProvider().evaluateJavascript(rewardScript, null)
                }
            }
        }
    }
}
