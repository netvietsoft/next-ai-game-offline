package com.nextai.gameoffline.analytics

import android.content.Context
import android.os.Bundle
import android.util.Log
import com.google.firebase.analytics.FirebaseAnalytics
import com.nextai.gameoffline.BuildConfig

/**
 * Facade đẩy sự kiện Firebase Analytics cho Galaxy Game (Game, R2, Search, AdMob, IAP Billing).
 * Tham số Bundle được tách sang [AnalyticsBundleBuilders] để giữ lớp gọn nhẹ <= 350 dòng.
 * Firebase Analytics tracker facade delegating payload construction to [AnalyticsBundleBuilders].
 */
object GameAnalyticsManager {

    private const val TAG = "GameGateAnalytics"

    private var firebaseAnalytics: FirebaseAnalytics? = null
    private var isInitialized = false

    /** Khởi tạo Firebase Analytics một lần từ `Application.onCreate`. */
    fun init(context: Context) {
        if (isInitialized) return
        try {
            firebaseAnalytics = FirebaseAnalytics.getInstance(context.applicationContext)
            isInitialized = true
            if (BuildConfig.DEBUG) {
                Log.i(TAG, "Firebase Analytics initialized successfully for Galaxy Game")
            }
        } catch (e: Exception) {
            if (BuildConfig.DEBUG) {
                Log.w(TAG, "Failed to initialize Firebase Analytics: ${e.message}")
            }
        }
    }

    private fun logEvent(eventName: String, params: Bundle = Bundle()) {
        try {
            firebaseAnalytics?.logEvent(eventName, params)
            if (BuildConfig.DEBUG) {
                // Chỉ log tên khóa ở debug để production không rò dữ liệu chẩn đoán.
                // Log parameter keys only in debug so production never leaks diagnostics.
                val parameterNames = params.keySet().joinToString(", ")
                Log.i(TAG, "[EVENT] $eventName -> keys=[$parameterNames]")
            }
        } catch (e: Exception) {
            if (BuildConfig.DEBUG) {
                Log.e(TAG, "Error logging event $eventName: ${e.message}")
            }
        }
    }

    // --- 1. GAME & SEARCH EVENTS ---

    fun logGameOpen(
        gameName: String,
        gameTitle: String = gameName,
        category: String = "All",
        openCount: Int = 1,
        highestLevel: Int = 1,
        totalPlayTimeSec: Long = 0L
    ) {
        val bundle = AnalyticsBundleBuilders.gameOpen(
            gameName, gameTitle, category, openCount, highestLevel, totalPlayTimeSec
        )
        logEvent("game_open", bundle)
    }

    fun logGameStart(gameName: String, level: Int = 1, playCount: Int = 1) {
        val bundle = AnalyticsBundleBuilders.gameLevelEvent(gameName, level, playCount = playCount)
        logEvent("game_start", bundle)
    }

    fun logGameLevelStart(gameName: String, level: Int) {
        logEvent("game_level_start", AnalyticsBundleBuilders.gameLevelEvent(gameName, level))
    }

    fun logGameLevelComplete(gameName: String, level: Int, extraScore: Long? = null) {
        val bundle = AnalyticsBundleBuilders.gameLevelEvent(gameName, level, extraScore = extraScore)
        logEvent("game_level_complete", bundle)
    }

    fun logGameLevelFailed(gameName: String, level: Int, reason: String? = null) {
        val bundle = AnalyticsBundleBuilders.gameLevelEvent(gameName, level, reason = reason)
        logEvent("game_level_failed", bundle)
    }

    fun logGameLevelReached(gameName: String, highestLevel: Int) {
        val bundle = Bundle().apply {
            putString("game_name", gameName)
            putInt("highest_level_reached", highestLevel)
            putString("level_label", "level_$highestLevel")
            putLong("timestamp", System.currentTimeMillis())
        }
        logEvent("game_level_reached", bundle)
    }

    fun logGameLevelRestart(gameName: String, level: Int) {
        val bundle = AnalyticsBundleBuilders.gameLevelEvent(gameName, level, includeTimestamp = false)
        logEvent("game_level_restart", bundle)
    }

    fun logGamePlayTime(
        gameName: String,
        sessionDurationSec: Long,
        totalPlayTimeSec: Long,
        highestLevel: Int = 1
    ) {
        val bundle = AnalyticsBundleBuilders.gamePlayTime(
            gameName, sessionDurationSec, totalPlayTimeSec, highestLevel
        )
        logEvent("game_play_time", bundle)
    }

    fun logGameScore(gameName: String, score: Int, isHighScore: Boolean = false) {
        val bundle = Bundle().apply {
            putString("game_name", gameName)
            putInt("score", score)
            putBoolean("is_high_score", isHighScore)
        }
        logEvent("game_score_submitted", bundle)
    }

    fun logGameDownload(
        gameName: String,
        status: String,
        sizeMb: Double = 0.0,
        errorMessage: String? = null
    ) {
        val bundle = AnalyticsBundleBuilders.gameDownload(gameName, status, sizeMb, errorMessage)
        logEvent("game_download", bundle)
    }

    /**
     * Ghi nhận từ khóa tìm kiếm trên Trang chủ sau khi đã debounce 800ms và làm sạch PII.
     * Logs a debounced, sanitized search term and result count from the Launcher search bar.
     */
    fun logGameSearch(query: String, resultCount: Int) {
        logEvent("game_search", AnalyticsBundleBuilders.gameSearch(query, resultCount))
    }

    // --- 2. ADMOB & MEDIATION EVENTS ---

    fun logAdRequest(adType: String, adUnitId: String) {
        val bundle = AnalyticsBundleBuilders.adLifecycle(adType, adUnitId, includeTimestamp = true)
        logEvent("ad_request", bundle)
        logAdFormatEvent(adType, "load", bundle)
    }

    fun logAdLoaded(adType: String, adUnitId: String, durationMs: Long = 0L) {
        val bundle = AnalyticsBundleBuilders.adLifecycle(adType, adUnitId, durationMs = durationMs)
        logEvent("ad_loaded", bundle)
        logAdFormatEvent(adType, "loaded", bundle)
    }

    fun logAdFailedToLoad(adType: String, adUnitId: String, errorCode: Int, errorMessage: String) {
        val bundle = AnalyticsBundleBuilders.adLifecycle(
            adType, adUnitId, errorCode = errorCode, errorMessage = errorMessage
        )
        logEvent("ad_failed_to_load", bundle)
        logAdFormatEvent(adType, "load_fail", bundle)
    }

    fun logAdImpression(
        adType: String,
        adUnitId: String,
        screenName: String = "",
        gameName: String? = null
    ) {
        val bundle = AnalyticsBundleBuilders.adLifecycle(
            adType, adUnitId, screenName = screenName, gameName = gameName
        )
        logEvent("ad_impression", bundle)
        // Banner và Native dùng callback impression thay vì callback fullscreen shown.
        // Banner and Native expose an impression callback rather than a fullscreen showed callback.
        if (adType == "BANNER" || adType == "NATIVE") {
            logAdFormatEvent(adType, "showed", bundle)
        }
    }

    fun logAdClicked(adType: String, adUnitId: String, gameName: String? = null) {
        val bundle = AnalyticsBundleBuilders.adLifecycle(adType, adUnitId, gameName = gameName)
        logEvent("ad_clicked", bundle)
        logAdFormatEvent(adType, "click", bundle)
    }

    fun logAdShowed(adType: String, adUnitId: String, gameName: String? = null) {
        val bundle = AnalyticsBundleBuilders.adLifecycle(adType, adUnitId, gameName = gameName)
        logAdFormatEvent(adType, "showed", bundle)
    }

    fun logAdDismissed(adType: String, adUnitId: String) {
        logEvent("ad_dismissed", AnalyticsBundleBuilders.adLifecycle(adType, adUnitId))
    }

    fun logAdFailedToShow(adType: String, adUnitId: String, errorCode: Int, errorMessage: String) {
        val bundle = AnalyticsBundleBuilders.adLifecycle(
            adType, adUnitId, errorCode = errorCode, errorMessage = errorMessage
        )
        logEvent("ad_failed_to_show", bundle)
    }

    fun logAdRewardEarned(
        gameName: String? = null,
        rewardType: String = "game_continue",
        rewardAmount: Int = 1
    ) {
        val bundle = AnalyticsBundleBuilders.adRewardEarned(gameName, rewardType, rewardAmount)
        logEvent("ad_reward_earned", bundle)
    }

    private fun logAdFormatEvent(adType: String, stage: String, params: Bundle) {
        AdEventNames.forStage(adType, stage)?.let { logEvent(it, params) }
    }

    // --- 3. IN-APP PURCHASE (BILLING) EVENTS ---

    fun logPaywallViewed(source: String = "launcher_header") {
        val bundle = Bundle().apply {
            putString("source", source)
            putLong("timestamp", System.currentTimeMillis())
        }
        logEvent("inapp_paywall_viewed", bundle)
    }

    fun logPurchaseInitiated(productId: String, price: String) {
        val bundle = Bundle().apply {
            putString("product_id", productId)
            putString("price", price)
            putLong("timestamp", System.currentTimeMillis())
        }
        logEvent("inapp_purchase_initiated", bundle)
    }

    fun logPurchaseSuccess(productId: String) {
        val bundle = Bundle().apply {
            putString("product_id", productId)
            putLong("timestamp", System.currentTimeMillis())
        }
        logEvent("inapp_purchase_success", bundle)
    }

    fun logPurchaseFailed(productId: String, responseCode: Int, debugMessage: String) {
        val bundle = Bundle().apply {
            putString("product_id", productId)
            putInt("response_code", responseCode)
            putString("debug_message", debugMessage)
        }
        logEvent("inapp_purchase_failed", bundle)
    }

    fun logPurchaseCanceled(productId: String) {
        val bundle = Bundle().apply { putString("product_id", productId) }
        logEvent("inapp_purchase_canceled", bundle)
    }

    fun logRestoreInitiated() = logEvent("inapp_restore_initiated")

    fun logRestoreSuccess(productId: String) {
        val bundle = Bundle().apply {
            putString("product_id", productId)
            putLong("timestamp", System.currentTimeMillis())
        }
        logEvent("inapp_restore_success", bundle)
    }

    fun logRestoreNoneFound() = logEvent("inapp_restore_none_found")

    fun logRestoreNotFound() = logRestoreNoneFound()

    /** Ghi nhận kích hoạt Vé Sạch Quảng Cáo (từ 2 Rewarded Video hoặc thưởng Daily Quest). */
    fun logAdFreePassActivated(source: String, durationMinutes: Int) {
        logEvent(
            "ad_free_pass_activated",
            AnalyticsBundleBuilders.adFreePassActivated(source, durationMinutes)
        )
    }

    /** Ghi nhận hoàn thành đủ 3/3 Nhiệm vụ ngày kèm số ngày chuỗi Streak liên tiếp. */
    fun logDailyQuestCompleted(streakDays: Int) {
        logEvent("daily_quest_completed", AnalyticsBundleBuilders.dailyQuestCompleted(streakDays))
    }
}
