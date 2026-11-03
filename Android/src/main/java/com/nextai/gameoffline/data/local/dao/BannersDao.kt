package com.nextai.gameoffline.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.nextai.gameoffline.data.local.entity.BannerEntity
import kotlinx.coroutines.flow.Flow

/**
 * DAO truy vấn bảng `banners` cho header carousel.
 * DAO for querying the `banners` table for header carousel.
 */
@Dao
interface BannersDao {

    /**
     * Lấy toàn bộ danh sách banner carousel sắp xếp theo vị trí.
     * Get all header banners ordered by position.
     */
    @Query("SELECT * FROM banners ORDER BY position ASC")
    fun getAllBanners(): Flow<List<BannerEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(banners: List<BannerEntity>)
}
