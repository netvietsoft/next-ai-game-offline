package com.nextai.gameoffline.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import com.nextai.gameoffline.data.local.entity.UserStatsEntity
import kotlinx.coroutines.flow.Flow

/**
 * DAO quản lý thống kê người chơi tập trung trong Room (điểm kỷ lục, số lần mở/chơi,
 * màn chơi cao nhất, thời gian chơi và yêu thích) với các thao tác upsert theo transaction.
 * Room DAO managing all per-game player stats with transactional upsert guarantees.
 */
@Dao
interface UserStatsDao {

    /** Lấy bản ghi thống kê của một trò chơi cụ thể / Fetch statistics for a single game. */
    @Query("SELECT * FROM user_game_stats WHERE game_name = :gameName LIMIT 1")
    suspend fun getStatsForGame(gameName: String): UserStatsEntity?

    /** Dòng dữ liệu các trò chơi được đánh dấu yêu thích / Observe favorite games stream. */
    @Query("SELECT * FROM user_game_stats WHERE is_favorite = 1 ORDER BY last_played DESC")
    fun getFavoriteGames(): Flow<List<UserStatsEntity>>

    /**
     * Quan sát các game người chơi đã mở gần đây nhất phục vụ kệ "Continue Playing" trên Trang chủ.
     * Observes recently played games ordered by most recent timestamp for the Continue Playing shelf.
     */
    @Query(
        "SELECT * FROM user_game_stats WHERE open_count > 0 " +
            "ORDER BY last_played DESC LIMIT :limit"
    )
    fun observeRecentGames(limit: Int = 10): Flow<List<UserStatsEntity>>

    /** Chèn mới nếu chưa tồn tại hàng thống kê / Insert default row if not yet present. */
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertIfAbsent(stats: UserStatsEntity): Long

    /** Ghi đè toàn bộ bản ghi thống kê / Insert or replace a stats record. */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(stats: UserStatsEntity)

    /** Cập nhật điểm kỷ lục nếu điểm mới cao hơn / Update high score if strictly higher. */
    @Query(
        "UPDATE user_game_stats SET high_score = :newScore, last_played = :timestamp " +
            "WHERE game_name = :gameName AND high_score < :newScore"
    )
    suspend fun updateHighScoreIfHigher(gameName: String, newScore: Int, timestamp: Long)

    /** Tăng số lần mở game / Increment game open counter. */
    @Query(
        "UPDATE user_game_stats SET open_count = open_count + 1, last_played = :timestamp " +
            "WHERE game_name = :gameName"
    )
    suspend fun incrementOpenCountRaw(gameName: String, timestamp: Long)

    /** Tăng số ván chơi / Increment play session counter. */
    @Query(
        "UPDATE user_game_stats SET games_played = games_played + 1, last_played = :timestamp " +
            "WHERE game_name = :gameName"
    )
    suspend fun incrementPlayCountRaw(gameName: String, timestamp: Long)

    /** Cập nhật màn chơi cao nhất nếu vượt kỷ lục cũ / Update highest level when increased. */
    @Query(
        "UPDATE user_game_stats SET highest_level = :level, last_played = :timestamp " +
            "WHERE game_name = :gameName AND highest_level < :level"
    )
    suspend fun updateHighestLevelIfHigher(gameName: String, level: Int, timestamp: Long)

    /** Cộng dồn thời gian chơi tính bằng giây / Accumulate session duration in seconds. */
    @Query(
        "UPDATE user_game_stats SET total_time_spent_sec = total_time_spent_sec + :durationSec, " +
            "last_played = :timestamp WHERE game_name = :gameName"
    )
    suspend fun addPlayTimeRaw(gameName: String, durationSec: Long, timestamp: Long)

    /** Chuyển đổi trạng thái yêu thích / Toggle favorite flag on an existing stats row. */
    @Query(
        "UPDATE user_game_stats SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END, " +
            "last_played = :timestamp WHERE game_name = :gameName"
    )
    suspend fun toggleFavoriteRaw(gameName: String, timestamp: Long)

    /**
     * Đảm bảo hàng tồn tại rồi cập nhật điểm kỷ lục (khắc phục lỗi UPDATE 0 hàng trước đây).
     * Ensures the stats row exists before updating the high score.
     */
    @Transaction
    suspend fun updateHighScore(
        gameName: String,
        newScore: Int,
        timestamp: Long = System.currentTimeMillis()
    ) {
        insertIfAbsent(UserStatsEntity(gameName = gameName, lastPlayed = timestamp))
        updateHighScoreIfHigher(gameName, newScore, timestamp)
    }

    /**
     * Đảm bảo hàng tồn tại rồi đảo trạng thái yêu thích trong một transaction.
     * Ensures the stats row exists and atomically toggles the favorite flag.
     */
    @Transaction
    suspend fun toggleFavorite(
        gameName: String,
        timestamp: Long = System.currentTimeMillis()
    ) {
        insertIfAbsent(UserStatsEntity(gameName = gameName, lastPlayed = timestamp))
        toggleFavoriteRaw(gameName, timestamp)
    }

    /** Ghi nhận một lượt mở game và trả về bản ghi mới nhất / Record open and return stats. */
    @Transaction
    suspend fun recordOpen(
        gameName: String,
        timestamp: Long = System.currentTimeMillis()
    ): UserStatsEntity {
        insertIfAbsent(UserStatsEntity(gameName = gameName, lastPlayed = timestamp))
        incrementOpenCountRaw(gameName, timestamp)
        return getStatsForGame(gameName)
            ?: UserStatsEntity(gameName = gameName, openCount = 1, lastPlayed = timestamp)
    }

    /** Ghi nhận bắt đầu ván chơi và cập nhật màn chơi cao nhất / Record play start & level. */
    @Transaction
    suspend fun recordPlayStart(
        gameName: String,
        level: Int,
        timestamp: Long = System.currentTimeMillis()
    ) {
        insertIfAbsent(UserStatsEntity(gameName = gameName, lastPlayed = timestamp))
        incrementPlayCountRaw(gameName, timestamp)
        if (level > 1) {
            updateHighestLevelIfHigher(gameName, level, timestamp)
        }
    }

    /** Cập nhật màn chơi cao nhất và trả về giá trị hiện hành / Update & return highest level. */
    @Transaction
    suspend fun recordHighestLevel(
        gameName: String,
        level: Int,
        timestamp: Long = System.currentTimeMillis()
    ): Int {
        insertIfAbsent(UserStatsEntity(gameName = gameName, lastPlayed = timestamp))
        if (level > 1) {
            updateHighestLevelIfHigher(gameName, level, timestamp)
        }
        return getStatsForGame(gameName)?.highestLevel ?: maxOf(1, level)
    }

    /** Cộng dồn thời gian chơi và trả về tổng mới / Accumulate play time and return total. */
    @Transaction
    suspend fun recordPlayTime(
        gameName: String,
        durationSec: Long,
        timestamp: Long = System.currentTimeMillis()
    ): Long {
        insertIfAbsent(UserStatsEntity(gameName = gameName, lastPlayed = timestamp))
        if (durationSec > 0L) {
            addPlayTimeRaw(gameName, durationSec, timestamp)
        }
        return getStatsForGame(gameName)?.totalTimeSpentSec ?: maxOf(0L, durationSec)
    }
}
