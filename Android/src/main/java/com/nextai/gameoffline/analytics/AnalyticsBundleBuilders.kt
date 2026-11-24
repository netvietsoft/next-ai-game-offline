package com.nextai.gameoffline.analytics

import android.os.Bundle

/**
 * Bộ dựng `Bundle` tham số sự kiện Firebase/GA4 tách riêng theo SRP để giữ [GameAnalyticsManager]
 * gọn nhẹ (<= 350 dòng) theo Luật Cứng Mục 2 trong `AGENTS.md`.
 * SRP parameter bundle builders keeping [GameAnalyticsManager] concise and maintainable.
 */
internal object AnalyticsBundleBuilders {

    fun gameOpen(
        gameName: String,
        gameTitle: String,
        category: String,
        openCount: Int,
        highestLevel: Int,
        totalPlayTimeSec: Long
    ): Bundle = Bundle().apply {
        putString("game_name", gameName)
        putString("game_title", gameTitle)
        putString("game_category", category)
        putInt("open_count", openCount)
        putInt("highest_level", highestLevel)
        putLong("total_play_time_sec", totalPlayTimeSec)
        putLong("timestamp", System.currentTimeMillis())
    }

    fun gameLevelEvent(
        gameName: String,
        level: Int,
        playCount: Int? = null,
        extraScore: Long? = null,
        reason: String? = null,
        includeTimestamp: Boolean = true
    ): Bundle = Bundle().apply {
        putString("game_name", gameName)
        putInt("level", level)
        putString("level_label", "level_$level")
        playCount?.let { putInt("play_count", it) }
        extraScore?.let { putLong("score", it) }
        reason?.let { putString("reason", it) }
        if (includeTimestamp) {
            putLong("timestamp", System.currentTimeMillis())
        }
    }

    fun gamePlayTime(
        gameName: String,
        sessionDurationSec: Long,
        totalPlayTimeSec: Long,
        highestLevel: Int
    ): Bundle = Bundle().apply {
        putString("game_name", gameName)
        putLong("session_duration_sec", sessionDurationSec)
        putDouble("session_duration_min", sessionDurationSec / 60.0)
        putLong("total_play_time_sec", totalPlayTimeSec)
        putInt("highest_level", highestLevel)
    }

    fun gameDownload(
        gameName: String,
        status: String,
        sizeMb: Double,
        errorMessage: String?
    ): Bundle = Bundle().apply {
        putString("game_name", gameName)
        putString("status", status)
        putDouble("size_mb", sizeMb)
        errorMessage?.let { putString("error_message", it) }
    }

    fun gameSearch(query: String, resultCount: Int): Bundle = Bundle().apply {
        putString("search_term", query)
        putInt("result_count", resultCount.coerceAtLeast(0))
        putLong("timestamp", System.currentTimeMillis())
    }

    fun adLifecycle(
        adType: String,
        adUnitId: String,
        durationMs: Long? = null,
        errorCode: Int? = null,
        errorMessage: String? = null,
        screenName: String? = null,
        gameName: String? = null,
        includeTimestamp: Boolean = false
    ): Bundle = Bundle().apply {
        putString("ad_type", adType)
        putString("ad_unit_id", adUnitId)
        durationMs?.let { putLong("load_duration_ms", it) }
        errorCode?.let { putInt("error_code", it) }
        errorMessage?.let { putString("error_message", it) }
        screenName?.let { putString("screen_name", it) }
        gameName?.let { putString("game_name", it) }
        if (includeTimestamp) {
            putLong("timestamp", System.currentTimeMillis())
        }
    }

    fun adRewardEarned(
        gameName: String?,
        rewardType: String,
        rewardAmount: Int
    ): Bundle = Bundle().apply {
        gameName?.let { putString("game_name", it) }
        putString("reward_type", rewardType)
        putInt("reward_amount", rewardAmount)
        putLong("timestamp", System.currentTimeMillis())
    }

    fun adFreePassActivated(source: String, durationMinutes: Int): Bundle = Bundle().apply {
        putString("source", source)
        putInt("duration_minutes", durationMinutes)
        putLong("timestamp", System.currentTimeMillis())
    }

    fun dailyQuestCompleted(streakDays: Int): Bundle = Bundle().apply {
        putInt("streak_days", streakDays)
        putLong("timestamp", System.currentTimeMillis())
    }
}
