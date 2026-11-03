package com.nextai.gameoffline.data.local

import android.content.Context
import android.content.SharedPreferences
import android.util.Log

/**
 * Kho lưu trữ thống kê chi tiết từng trò chơi (Số lần mở, số ván chơi, thời gian chơi, level cao nhất).
 * Repository storing granular statistics for each mini-game (Open count, play count, play time, highest level).
 *
 * Dữ liệu được lưu trữ bền vững trên SharedPreferences độc lập cho từng game,
 * phục vụ việc đẩy sự kiện Firebase Analytics chuyên sâu và hiển thị tiến trình.
 * Data is persistently stored across device reboots and app updates for Firebase Analytics tracking.
 */
class GameTrackingRepository(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    data class GameStats(
        val gameName: String,
        val openCount: Int,
        val playCount: Int,
        val highestLevel: Int,
        val totalPlayTimeSec: Long,
        val lastPlayedTimestamp: Long
    )

    /**
     * Tăng số lần mở game (khi người chơi bấm vào game từ Launcher).
     * Increment game open count (called when user clicks/opens game from launcher).
     */
    fun incrementOpenCount(gameName: String): Int {
        val key = KEY_PREFIX_OPEN + gameName
        val current = prefs.getInt(key, 0) + 1
        prefs.edit()
            .putInt(key, current)
            .putLong(KEY_PREFIX_LAST_PLAYED + gameName, System.currentTimeMillis())
            .apply()
        Log.d(TAG, "[$gameName] incrementOpenCount -> $current")
        return current
    }

    /**
     * Tăng số ván chơi (khi người chơi bắt đầu bấm Start/Level 1/New Game).
     * Increment play count (called when user starts a game session/level).
     */
    fun incrementPlayCount(gameName: String): Int {
        val key = KEY_PREFIX_PLAY + gameName
        val current = prefs.getInt(key, 0) + 1
        prefs.edit().putInt(key, current).apply()
        Log.d(TAG, "[$gameName] incrementPlayCount -> $current")
        return current
    }

    /**
     * Cập nhật màn chơi cao nhất đạt được (Chơi tới level mấy).
     * Update highest level reached in the game (Level progress).
     */
    fun updateHighestLevel(gameName: String, level: Int): Int {
        if (level <= 0) return getHighestLevel(gameName)
        val key = KEY_PREFIX_LEVEL + gameName
        val currentHighest = prefs.getInt(key, 1)
        val newHighest = maxOf(currentHighest, level)
        if (newHighest > currentHighest) {
            prefs.edit().putInt(key, newHighest).apply()
            Log.i(TAG, "[$gameName] Level Up! Highest level updated: $currentHighest -> $newHighest")
        }
        return newHighest
    }

    /**
     * Cộng dồn thời gian chơi của phiên vừa kết thúc (tính bằng giây).
     * Accumulate session play time (in seconds) to total game play duration.
     */
    fun addPlayTime(gameName: String, sessionDurationSec: Long): Long {
        if (sessionDurationSec <= 0) return getTotalPlayTimeSec(gameName)
        val key = KEY_PREFIX_TIME + gameName
        val currentTotal = prefs.getLong(key, 0L)
        val newTotal = currentTotal + sessionDurationSec
        prefs.edit().putLong(key, newTotal).apply()
        Log.d(TAG, "[$gameName] addPlayTime +${sessionDurationSec}s -> Total: ${newTotal}s")
        return newTotal
    }

    fun getOpenCount(gameName: String): Int = prefs.getInt(KEY_PREFIX_OPEN + gameName, 0)

    fun getPlayCount(gameName: String): Int = prefs.getInt(KEY_PREFIX_PLAY + gameName, 0)

    fun getHighestLevel(gameName: String): Int = prefs.getInt(KEY_PREFIX_LEVEL + gameName, 1)

    fun getTotalPlayTimeSec(gameName: String): Long = prefs.getLong(KEY_PREFIX_TIME + gameName, 0L)

    fun getGameStats(gameName: String): GameStats {
        return GameStats(
            gameName = gameName,
            openCount = getOpenCount(gameName),
            playCount = getPlayCount(gameName),
            highestLevel = getHighestLevel(gameName),
            totalPlayTimeSec = getTotalPlayTimeSec(gameName),
            lastPlayedTimestamp = prefs.getLong(KEY_PREFIX_LAST_PLAYED + gameName, System.currentTimeMillis())
        )
    }

    companion object {
        private const val TAG = "GameTrackingRepo"
        private const val PREFS_NAME = "game_gate_stats_prefs"
        private const val KEY_PREFIX_OPEN = "open_count_"
        private const val KEY_PREFIX_PLAY = "play_count_"
        private const val KEY_PREFIX_LEVEL = "highest_level_"
        private const val KEY_PREFIX_TIME = "total_time_sec_"
        private const val KEY_PREFIX_LAST_PLAYED = "last_played_"

        @Volatile
        private var INSTANCE: GameTrackingRepository? = null

        fun getInstance(context: Context): GameTrackingRepository {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: GameTrackingRepository(context.applicationContext).also { INSTANCE = it }
            }
        }
    }
}
