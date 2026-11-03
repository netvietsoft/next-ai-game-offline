package com.nextai.gameoffline.analytics

import android.content.Context
import android.os.Bundle
import android.util.Log
import com.google.firebase.analytics.FirebaseAnalytics

/**
 * Trình quản lý toàn diện sự kiện Firebase Analytics cho Game Gate Offline.
 * Comprehensive Firebase Analytics Manager for Game Gate Offline.
 *
 * Theo dõi chi tiết mọi sự kiện từ cơ bản tới chuyên sâu:
 * - Vòng đời từng game: Mở game, bắt đầu chơi, thời gian chơi, cấp độ (level) đạt được.
 * - Quảng cáo AdMob: Request, Loaded, Impression, Click, Failed, Dismissed, Reward Earned.
 * - Mua hàng trong ứng dụng (In-App Purchase / Billing): Paywall, Mua thành công, Lỗi, Khôi phục.
 */
object GameAnalyticsManager {

    private const val TAG = "GameGateAnalytics"

    private var firebaseAnalytics: FirebaseAnalytics? = null
    private var isInitialized = false

    /**
     * Khởi tạo Firebase Analytics một lần từ Application onCreate.
     * Initialize Firebase Analytics once from Application onCreate.
     */
    fun init(context: Context) {
        if (isInitialized) return
        try {
            firebaseAnalytics = FirebaseAnalytics.getInstance(context.applicationContext)
            isInitialized = true
            Log.i(TAG, "Firebase Analytics initialized successfully for Game Gate Offline")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to initialize Firebase Analytics: ${e.message}")
        }
    }

    /**
     * Phương thức lõi đẩy sự kiện lên Firebase Analytics và ghi Logcat.
     * Core method to log events to Firebase Analytics and Android Logcat.
     */
    private fun logEvent(eventName: String, params: Bundle = Bundle()) {
        try {
            firebaseAnalytics?.logEvent(eventName, params)
            // Ghi logcat trực quan phục vụ kiểm thử ADB
            val paramsStr = params.keySet().joinToString(", ") { key -> "$key=${params.get(key)}" }
            Log.i(TAG, "📊 [EVENT] $eventName -> {$paramsStr}")
        } catch (e: Exception) {
            Log.e(TAG, "Error logging event $eventName: ${e.message}")
        }
    }

    // =========================================================================
    // 1. GAME EVENTS (Sự kiện trò chơi từ cơ bản đến chuyên sâu)
    // =========================================================================

    /**
     * Sự kiện khi người chơi mở một trò chơi (ví dụ: Apple worm).
     * Event triggered when user opens a specific game (e.g., Apple worm).
     *
     * @param gameName Tên định danh game (apple_worm)
     * @param gameTitle Tên hiển thị game (Apple Worm)
     * @param category Thể loại game (Casual, Puzzle, Arcade, v.v.)
     * @param openCount Tổng số lần đã mở game này
     * @param highestLevel Màn chơi cao nhất đã đạt được
     * @param totalTimeSpentSec Tổng thời gian đã chơi game này tính bằng giây
     */
    fun logGameOpen(
        gameName: String,
        gameTitle: String = gameName,
        category: String = "All",
        openCount: Int = 1,
        highestLevel: Int = 1,
        totalPlayTimeSec: Long = 0L
    ) {
        val bundle = Bundle().apply {
            putString("game_name", gameName)
            putString("game_title", gameTitle)
            putString("game_category", category)
            putInt("open_count", openCount)
            putInt("highest_level", highestLevel)
            putLong("total_play_time_sec", totalPlayTimeSec)
            putLong("timestamp", System.currentTimeMillis())
        }
        logEvent("game_open", bundle)
    }

    /**
     * Sự kiện bắt đầu ván chơi mới.
     * Event triggered when starting a new game session.
     */
    fun logGameStart(
        gameName: String,
        level: Int = 1,
        playCount: Int = 1
    ) {
        val bundle = Bundle().apply {
            putString("game_name", gameName)
            putInt("level", level)
            putInt("play_count", playCount)
            putLong("timestamp", System.currentTimeMillis())
        }
        logEvent("game_start", bundle)
    }

    /**
     * Sự kiện bắt đầu màn chơi cụ thể (Level Start).
     * Event triggered when a specific level starts in game.
     */
    fun logGameLevelStart(gameName: String, level: Int) {
        val bundle = Bundle().apply {
            putString("game_name", gameName)
            putInt("level", level)
            putLong("timestamp", System.currentTimeMillis())
        }
        logEvent("game_level_start", bundle)
    }

    /**
     * Sự kiện hoàn thành màn chơi (Level Complete).
     * Event triggered when player completes a level.
     */
    fun logGameLevelComplete(gameName: String, level: Int, extraScore: Long? = null) {
        val bundle = Bundle().apply {
            putString("game_name", gameName)
            putInt("level", level)
            extraScore?.let { putLong("score", it) }
            putLong("timestamp", System.currentTimeMillis())
        }
        logEvent("game_level_complete", bundle)
    }

    /**
     * Sự kiện thua hoặc Game Over ở màn chơi cụ thể.
     * Event triggered when player loses / game over at a level.
     */
    fun logGameLevelFailed(gameName: String, level: Int, reason: String? = null) {
        val bundle = Bundle().apply {
            putString("game_name", gameName)
            putInt("level", level)
            reason?.let { putString("reason", it) }
            putLong("timestamp", System.currentTimeMillis())
        }
        logEvent("game_level_failed", bundle)
    }

    /**
     * Sự kiện người chơi đạt tới cột mốc level mới (Chơi tới level mấy).
     * Event recording player's highest level progression.
     */
    fun logGameLevelReached(gameName: String, highestLevel: Int) {
        val bundle = Bundle().apply {
            putString("game_name", gameName)
            putInt("highest_level_reached", highestLevel)
            putLong("timestamp", System.currentTimeMillis())
        }
        logEvent("game_level_reached", bundle)
    }

    /**
     * Sự kiện chơi lại màn (Level Restart).
     * Event triggered when player restarts the current level.
     */
    fun logGameLevelRestart(gameName: String, level: Int) {
        val bundle = Bundle().apply {
            putString("game_name", gameName)
            putInt("level", level)
        }
        logEvent("game_level_restart", bundle)
    }

    /**
     * Sự kiện ghi nhận thời gian chơi (khi người chơi thoát hoặc tạm dừng game).
     * Event logging session play time and cumulative play time.
     *
     * @param gameName Tên game
     * @param sessionDurationSec Thời gian ván vừa chơi (giây)
     * @param totalPlayTimeSec Tổng thời gian tích lũy (giây)
     * @param highestLevel Level cao nhất tại thời điểm thoát
     */
    fun logGamePlayTime(
        gameName: String,
        sessionDurationSec: Long,
        totalPlayTimeSec: Long,
        highestLevel: Int = 1
    ) {
        val bundle = Bundle().apply {
            putString("game_name", gameName)
            putLong("session_duration_sec", sessionDurationSec)
            putDouble("session_duration_min", sessionDurationSec / 60.0)
            putLong("total_play_time_sec", totalPlayTimeSec)
            putInt("highest_level", highestLevel)
        }
        logEvent("game_play_time", bundle)
    }

    /**
     * Sự kiện nộp điểm số trong game.
     * Event triggered when a score is updated or submitted.
     */
    fun logGameScore(gameName: String, score: Int, isHighScore: Boolean = false) {
        val bundle = Bundle().apply {
            putString("game_name", gameName)
            putInt("score", score)
            putBoolean("is_high_score", isHighScore)
        }
        logEvent("game_score_submitted", bundle)
    }

    /**
     * Sự kiện tải gói game mở rộng từ Cloudflare R2 on-demand.
     * Event tracking on-demand game download progress from Cloudflare R2.
     */
    fun logGameDownload(gameName: String, status: String, sizeMb: Double = 0.0, errorMessage: String? = null) {
        val bundle = Bundle().apply {
            putString("game_name", gameName)
            putString("status", status) // "started", "completed", "failed"
            putDouble("size_mb", sizeMb)
            errorMessage?.let { putString("error_message", it) }
        }
        logEvent("game_download", bundle)
    }

    // =========================================================================
    // 2. ADS EVENTS (Tất cả sự kiện của hệ thống quảng cáo AdMob)
    // =========================================================================

    /**
     * Gửi yêu cầu tải quảng cáo (Banner, Interstitial, Rewarded, App Open).
     * Ad load requested.
     */
    fun logAdRequest(adType: String, adUnitId: String) {
        val bundle = Bundle().apply {
            putString("ad_type", adType) // "BANNER", "INTERSTITIAL", "REWARDED", "APP_OPEN"
            putString("ad_unit_id", adUnitId)
            putLong("timestamp", System.currentTimeMillis())
        }
        logEvent("ad_request", bundle)
    }

    /**
     * Tải quảng cáo thành công.
     * Ad successfully loaded.
     */
    fun logAdLoaded(adType: String, adUnitId: String, durationMs: Long = 0L) {
        val bundle = Bundle().apply {
            putString("ad_type", adType)
            putString("ad_unit_id", adUnitId)
            putLong("load_duration_ms", durationMs)
        }
        logEvent("ad_loaded", bundle)
    }

    /**
     * Tải quảng cáo thất bại (kèm mã lỗi và mô tả lỗi).
     * Ad failed to load (with error code & message).
     */
    fun logAdFailedToLoad(adType: String, adUnitId: String, errorCode: Int, errorMessage: String) {
        val bundle = Bundle().apply {
            putString("ad_type", adType)
            putString("ad_unit_id", adUnitId)
            putInt("error_code", errorCode)
            putString("error_message", errorMessage)
        }
        logEvent("ad_failed_to_load", bundle)
    }

    /**
     * Quảng cáo được hiển thị trên màn hình (Impression).
     * Ad impression displayed on screen.
     */
    fun logAdImpression(adType: String, adUnitId: String, screenName: String = "", gameName: String? = null) {
        val bundle = Bundle().apply {
            putString("ad_type", adType)
            putString("ad_unit_id", adUnitId)
            putString("screen_name", screenName)
            gameName?.let { putString("game_name", it) }
        }
        logEvent("ad_impression", bundle)
    }

    /**
     * Người dùng click vào quảng cáo.
     * User clicked on advertisement.
     */
    fun logAdClicked(adType: String, adUnitId: String, gameName: String? = null) {
        val bundle = Bundle().apply {
            putString("ad_type", adType)
            putString("ad_unit_id", adUnitId)
            gameName?.let { putString("game_name", it) }
        }
        logEvent("ad_clicked", bundle)
    }

    /**
     * Người dùng tắt quảng cáo toàn màn hình.
     * Fullscreen ad dismissed by user.
     */
    fun logAdDismissed(adType: String, adUnitId: String) {
        val bundle = Bundle().apply {
            putString("ad_type", adType)
            putString("ad_unit_id", adUnitId)
        }
        logEvent("ad_dismissed", bundle)
    }

    /**
     * Lỗi khi gọi hiển thị quảng cáo.
     * Ad failed to show.
     */
    fun logAdFailedToShow(adType: String, adUnitId: String, errorCode: Int, errorMessage: String) {
        val bundle = Bundle().apply {
            putString("ad_type", adType)
            putString("ad_unit_id", adUnitId)
            putInt("error_code", errorCode)
            putString("error_message", errorMessage)
        }
        logEvent("ad_failed_to_show", bundle)
    }

    /**
     * Người dùng xem hết video nhận thưởng thành công.
     * User completed rewarded video and earned reward.
     */
    fun logAdRewardEarned(gameName: String? = null, rewardType: String = "game_continue", rewardAmount: Int = 1) {
        val bundle = Bundle().apply {
            gameName?.let { putString("game_name", it) }
            putString("reward_type", rewardType)
            putInt("reward_amount", rewardAmount)
            putLong("timestamp", System.currentTimeMillis())
        }
        logEvent("ad_reward_earned", bundle)
    }

    // =========================================================================
    // 3. IN-APP PURCHASE (IAP / BILLING EVENTS)
    // =========================================================================

    /**
     * Mở màn hình Paywall VIP (Payment Wall).
     * User viewed VIP Paywall screen.
     */
    fun logPaywallViewed(source: String = "launcher_header") {
        val bundle = Bundle().apply {
            putString("source", source) // "launcher_header", "settings_dialog", "game_exit"
            putLong("timestamp", System.currentTimeMillis())
        }
        logEvent("inapp_paywall_viewed", bundle)
    }

    /**
     * Người dùng bấm nút Mua gói VIP (Bắt đầu Google Play Billing Flow).
     * User initiated purchase flow.
     */
    fun logPurchaseInitiated(productId: String, price: String = "$1.99") {
        val bundle = Bundle().apply {
            putString("product_id", productId)
            putString("price", price)
            putLong("timestamp", System.currentTimeMillis())
        }
        logEvent("inapp_purchase_initiated", bundle)
    }

    /**
     * Mua gói VIP thành công (Purchase completed & verified).
     * In-app purchase completed successfully.
     */
    fun logPurchaseSuccess(productId: String, orderId: String = "", purchaseToken: String = "") {
        val bundle = Bundle().apply {
            putString("product_id", productId)
            putString("order_id", orderId)
            putString("purchase_token_masked", purchaseToken.take(12) + "...")
            putLong("timestamp", System.currentTimeMillis())
        }
        logEvent("inapp_purchase_success", bundle)
    }

    /**
     * Giao dịch mua hàng thất bại.
     * In-app purchase failed.
     */
    fun logPurchaseFailed(productId: String, responseCode: Int, debugMessage: String) {
        val bundle = Bundle().apply {
            putString("product_id", productId)
            putInt("response_code", responseCode)
            putString("debug_message", debugMessage)
        }
        logEvent("inapp_purchase_failed", bundle)
    }

    /**
     * Người dùng hủy thanh toán (User canceled).
     * User canceled in-app purchase.
     */
    fun logPurchaseCanceled(productId: String) {
        val bundle = Bundle().apply {
            putString("product_id", productId)
        }
        logEvent("inapp_purchase_canceled", bundle)
    }

    /**
     * Người dùng bấm Khôi phục mua hàng (Restore purchases).
     * Restore purchases initiated.
     */
    fun logRestoreInitiated() {
        logEvent("inapp_restore_initiated")
    }

    /**
     * Khôi phục mua hàng thành công.
     * Restore purchases succeeded.
     */
    fun logRestoreSuccess(productId: String) {
        val bundle = Bundle().apply {
            putString("product_id", productId)
            putLong("timestamp", System.currentTimeMillis())
        }
        logEvent("inapp_restore_success", bundle)
    }

    /**
     * Không tìm thấy giao dịch cũ để khôi phục.
     * No previous purchases found on Google account.
     */
    fun logRestoreNoneFound() {
        logEvent("inapp_restore_none_found")
    }

    fun logRestoreNotFound() {
        logRestoreNoneFound()
    }
}
