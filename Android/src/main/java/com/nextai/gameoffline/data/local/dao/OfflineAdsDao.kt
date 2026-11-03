package com.nextai.gameoffline.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.nextai.gameoffline.data.local.entity.OfflineAdEntity

/**
 * DAO quản lý danh sách video quảng cáo ngoại tuyến.
 * DAO managing offline video ads.
 */
@Dao
interface OfflineAdsDao {

    @Query("SELECT * FROM offline_games_interstitial ORDER BY version DESC LIMIT 1")
    suspend fun getLatestOfflineAd(): OfflineAdEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdate(ad: OfflineAdEntity)
}
