package com.nextai.gameoffline.data.repository

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.nextai.gameoffline.BuildConfig
import com.nextai.gameoffline.data.local.dao.UserStatsDao
import com.nextai.gameoffline.data.local.entity.UserStatsEntity
import com.nextai.gameoffline.domain.repository.GameStatsRepository
import com.nextai.gameoffline.domain.repository.GameStatsSnapshot
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext

/**
 * Kho lưu trữ thống kê người chơi tập trung trong Room (`user_game_stats`), thay thế hoàn toàn
 * tệp `SharedPreferences("game_gate_stats_prefs")` cũ với tối đa ~2.095 khóa phẳng.
 * Tự động di trú một lần dữ liệu cũ từ `SharedPreferences` sang Room để không mất tiến độ người chơi.
 * Room-backed [GameStatsRepository] replacing flat legacy `SharedPreferences` with safe one-time migration.
 */
class RoomGameStatsRepository(
    context: Context,
    private val userStatsDao: UserStatsDao,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
) : GameStatsRepository {

    private val legacyPrefs: SharedPreferences = context.applicationContext
        .getSharedPreferences(LEGACY_PREFS_NAME, Context.MODE_PRIVATE)
    private val migrationMutex = Mutex()
    private val migratedGames = mutableSetOf<String>()

    override suspend fun recordGameOpened(gameName: String): GameStatsSnapshot {
        return withContext(ioDispatcher) {
            migrateLegacyStatsIfNeeded(gameName)
            val entity = userStatsDao.recordOpen(gameName)
            if (BuildConfig.DEBUG) {
                Log.d(TAG, "[$gameName] openCount -> ${entity.openCount}")
            }
            entity.toSnapshot()
        }
    }

    override suspend fun recordPlayStarted(gameName: String, level: Int) {
        withContext(ioDispatcher) {
            migrateLegacyStatsIfNeeded(gameName)
            userStatsDao.recordPlayStart(gameName, level.coerceAtLeast(1))
        }
    }

    override suspend fun recordHighestLevel(gameName: String, level: Int): Int {
        return withContext(ioDispatcher) {
            migrateLegacyStatsIfNeeded(gameName)
            userStatsDao.recordHighestLevel(gameName, level.coerceAtLeast(1))
        }
    }

    override suspend fun recordHighScore(gameName: String, score: Int) {
        withContext(ioDispatcher) {
            migrateLegacyStatsIfNeeded(gameName)
            userStatsDao.updateHighScore(gameName, score)
        }
    }

    override suspend fun recordPlayTime(gameName: String, sessionDurationSec: Long): Long {
        return withContext(ioDispatcher) {
            migrateLegacyStatsIfNeeded(gameName)
            userStatsDao.recordPlayTime(gameName, sessionDurationSec)
        }
    }

    override suspend fun toggleFavorite(gameName: String) {
        withContext(ioDispatcher) {
            migrateLegacyStatsIfNeeded(gameName)
            userStatsDao.toggleFavorite(gameName)
        }
    }

    override suspend fun getStats(gameName: String): GameStatsSnapshot {
        return withContext(ioDispatcher) {
            migrateLegacyStatsIfNeeded(gameName)
            userStatsDao.getStatsForGame(gameName)?.toSnapshot()
                ?: GameStatsSnapshot(gameName = gameName)
        }
    }

    override fun observeRecentGameNames(limit: Int): Flow<List<String>> {
        return userStatsDao.observeRecentGames(limit.coerceAtLeast(1))
            .map { entries -> entries.map(UserStatsEntity::gameName) }
    }

    /**
     * Di trú một lần dữ liệu cũ (nếu có) từ `game_gate_stats_prefs` sang Room theo từng game
     * bằng phép lấy max/cộng gộp an toàn rồi xóa các khóa cũ đã chuyển xong.
     * Lazily migrates any existing legacy SharedPreferences counters for `gameName` into Room once.
     */
    private suspend fun migrateLegacyStatsIfNeeded(gameName: String) {
        if (gameName in migratedGames) {
            return
        }
        migrationMutex.withLock {
            if (gameName in migratedGames) {
                return
            }
            val openKey = KEY_PREFIX_OPEN + gameName
            val playKey = KEY_PREFIX_PLAY + gameName
            val levelKey = KEY_PREFIX_LEVEL + gameName
            val timeKey = KEY_PREFIX_TIME + gameName
            val lastPlayedKey = KEY_PREFIX_LAST_PLAYED + gameName

            val hasLegacyData = legacyPrefs.contains(openKey) ||
                legacyPrefs.contains(playKey) ||
                legacyPrefs.contains(levelKey) ||
                legacyPrefs.contains(timeKey)

            if (hasLegacyData) {
                val legacyOpen = legacyPrefs.getInt(openKey, 0)
                val legacyPlay = legacyPrefs.getInt(playKey, 0)
                val legacyLevel = legacyPrefs.getInt(levelKey, 1)
                val legacyTime = legacyPrefs.getLong(timeKey, 0L)
                val legacyLastPlayed = legacyPrefs.getLong(lastPlayedKey, System.currentTimeMillis())

                val existing = userStatsDao.getStatsForGame(gameName)
                val merged = UserStatsEntity(
                    gameName = gameName,
                    highScore = existing?.highScore ?: 0,
                    gamesPlayed = maxOf(existing?.gamesPlayed ?: 0, legacyPlay),
                    totalTimeSpentSec = maxOf(existing?.totalTimeSpentSec ?: 0L, legacyTime),
                    isFavorite = existing?.isFavorite ?: 0,
                    lastPlayed = maxOf(existing?.lastPlayed ?: 0L, legacyLastPlayed),
                    openCount = maxOf(existing?.openCount ?: 0, legacyOpen),
                    highestLevel = maxOf(existing?.highestLevel ?: 1, legacyLevel)
                )
                userStatsDao.insertOrUpdate(merged)
                legacyPrefs.edit()
                    .remove(openKey)
                    .remove(playKey)
                    .remove(levelKey)
                    .remove(timeKey)
                    .remove(lastPlayedKey)
                    .apply()
            }
            migratedGames.add(gameName)
        }
    }

    private fun UserStatsEntity.toSnapshot(): GameStatsSnapshot {
        return GameStatsSnapshot(
            gameName = gameName,
            openCount = openCount,
            playCount = gamesPlayed,
            highestLevel = highestLevel,
            totalPlayTimeSec = totalTimeSpentSec,
            highScore = highScore,
            isFavorite = isFavorite == 1,
            lastPlayedTimestamp = lastPlayed
        )
    }

    private companion object {
        const val TAG = "RoomGameStatsRepo"
        const val LEGACY_PREFS_NAME = "game_gate_stats_prefs"
        const val KEY_PREFIX_OPEN = "open_count_"
        const val KEY_PREFIX_PLAY = "play_count_"
        const val KEY_PREFIX_LEVEL = "highest_level_"
        const val KEY_PREFIX_TIME = "total_time_sec_"
        const val KEY_PREFIX_LAST_PLAYED = "last_played_"
    }
}
