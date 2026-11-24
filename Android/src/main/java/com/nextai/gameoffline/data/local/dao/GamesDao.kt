package com.nextai.gameoffline.data.local.dao

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Upsert
import com.nextai.gameoffline.data.local.entity.GameEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object (DAO) thực hiện các truy vấn trên bảng `games`.
 * Data Access Object for querying the `games` table.
 */
@Dao
interface GamesDao {

    /**
     * Lấy toàn bộ danh mục, gồm game đóng gói và game tải theo nhu cầu từ R2.
     * Get the complete catalog, including bundled and R2 on-demand games.
     */
    @Query("SELECT * FROM games ORDER BY position ASC")
    fun getAllGames(): Flow<List<GameEntity>>

    /**
     * Lấy game theo thể loại mà không ẩn các game chưa tải.
     * Get games by category without hiding on-demand titles.
     */
    @Query("SELECT * FROM games WHERE category = :category ORDER BY position ASC")
    fun getGamesByCategory(category: String): Flow<List<GameEntity>>

    /**
     * Tìm kiếm game theo tên, tiêu đề hoặc mã số thứ tự (#ID).
     * Search games by title, name keyword, or position/ID number.
     */
    @Query("SELECT * FROM games WHERE (title LIKE '%' || :query || '%' OR name LIKE '%' || :query || '%' OR CAST(position AS TEXT) = :query OR CAST(position AS TEXT) LIKE :query || '%' OR ('#' || CAST(position AS TEXT)) LIKE :query || '%') ORDER BY position ASC")
    fun searchGames(query: String): Flow<List<GameEntity>>

    /**
     * Xóa toàn bộ danh mục chỉ khi reset rõ ràng; không dùng để seed/refresh.
     * Clear games only for an explicit reset; never use this for catalog refresh.
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
     * Cập nhật danh mục trong transaction mà không DELETE/REPLACE hàng cha.
     * Upsert the catalog in a transaction without deleting/replacing parent rows.
     * Giữ điểm, yêu thích và banner có khóa ngoại CASCADE tới games.
     * Preserve scores, favorites and banners with cascading foreign keys to games.
     */
    @Upsert
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
