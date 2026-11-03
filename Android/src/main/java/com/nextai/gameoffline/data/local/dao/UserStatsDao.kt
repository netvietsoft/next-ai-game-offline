package com.nextai.gameoffline.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.nextai.gameoffline.data.local.entity.UserStatsEntity
import kotlinx.coroutines.flow.Flow

/**
 * DAO quản lý điểm số kỷ lục, số lần chơi và trạng thái yêu thích của từng game.
 * DAO managing high scores, play count and favorite status.
 */
@Dao
interface UserStatsDao {

    /**
     * Lấy thống kê của một game cụ thể.
     * Get statistics for a specific game.
     */
    @Query("SELECT * FROM user_game_stats WHERE game_name = :gameName LIMIT 1")
    suspend fun getStatsForGame(gameName: String): UserStatsEntity?

    /**
     * Lấy danh sách toàn bộ các game mà người dùng đã đánh dấu Yêu thích.
     * Get all favorite games stream.
     */
    @Query("SELECT * FROM user_game_stats WHERE is_favorite = 1 ORDER BY last_played DESC")
    fun getFavoriteGames(): Flow<List<UserStatsEntity>>

    /**
     * Thêm hoặc cập nhật bản ghi thống kê game.
     * Insert or update user statistics record.
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(stats: UserStatsEntity)

    /**
     * Cập nhật điểm số kỷ lục mới nếu điểm mới cao hơn điểm cũ.
     * Update high score if the new score exceeds the previous record.
     */
    @Query("UPDATE user_game_stats SET high_score = :newScore, last_played = :timestamp WHERE game_name = :gameName AND high_score < :newScore")
    suspend fun updateHighScore(gameName: String, newScore: Int, timestamp: Long = System.currentTimeMillis())

    /**
     * Chuyển đổi trạng thái yêu thích (Toggle favorite).
     * Toggle favorite status.
     */
    @Query("UPDATE user_game_stats SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE game_name = :gameName")
    suspend fun toggleFavorite(gameName: String)
}
