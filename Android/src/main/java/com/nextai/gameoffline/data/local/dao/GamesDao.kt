package com.nextai.gameoffline.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.nextai.gameoffline.data.local.entity.GameEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object (DAO) thực hiện các truy vấn trên bảng `games`.
 * Data Access Object for querying the `games` table.
 */
@Dao
interface GamesDao {

    /**
     * Lấy toàn bộ danh sách mini-game đã sẵn sàng chơi ngoại tuyến.
     * Get all mini-games that are downloaded and ready to play offline.
     */
    @Query("SELECT * FROM games WHERE is_downloaded = 1 ORDER BY position ASC")
    fun getAllGames(): Flow<List<GameEntity>>

    /**
     * Lấy danh sách game theo thể loại cụ thể.
     * Get games filtered by category that are ready to play.
     */
    @Query("SELECT * FROM games WHERE category = :category AND is_downloaded = 1 ORDER BY position ASC")
    fun getGamesByCategory(category: String): Flow<List<GameEntity>>

    /**
     * Tìm kiếm game theo tên, tiêu đề hoặc mã số thứ tự (#ID).
     * Search games by title, name keyword, or position/ID number.
     */
    @Query("SELECT * FROM games WHERE is_downloaded = 1 AND (title LIKE '%' || :query || '%' OR name LIKE '%' || :query || '%' OR CAST(position AS TEXT) = :query OR CAST(position AS TEXT) LIKE :query || '%' OR ('#' || CAST(position AS TEXT)) LIKE :query || '%') ORDER BY position ASC")
    fun searchGames(query: String): Flow<List<GameEntity>>

    /**
     * Xóa toàn bộ danh mục game trước khi nạp lại.
     * Clear all games before refreshing catalog.
     */
    @Query("DELETE FROM games")
    suspend fun deleteAll()

    /**
     * Lấy chi tiết một mini-game theo tên định danh.
     * Get a single game entity by its name identifier.
     */
    @Query("SELECT * FROM games WHERE name = :gameName LIMIT 1")
    suspend fun getGameByName(gameName: String): GameEntity?

    /**
     * Thêm hoặc cập nhật danh sách mini-game vào cơ sở dữ liệu.
     * Insert or update a list of games in the database.
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(games: List<GameEntity>)

    /**
     * Đếm tổng số lượng mini-game có trong cơ sở dữ liệu.
     * Count total number of games stored in the database.
     */
    @Query("SELECT COUNT(*) FROM games")
    suspend fun getGamesCount(): Int

    /**
     * Cập nhật trạng thái đã tải về máy từ Cloudflare R2.
     * Update downloaded status of game from Cloudflare R2.
     */
    @Query("UPDATE games SET is_downloaded = :isDownloaded WHERE name = :gameName")
    suspend fun updateDownloadStatus(gameName: String, isDownloaded: Int)
}
