package com.nextai.gameoffline.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Thực thể quản lý chiến dịch video quảng cáo ngoại tuyến khi thiết bị mất mạng.
 * Entity managing offline video interstitial ads when device has no internet.
 */
@Entity(tableName = "offline_games_interstitial")
data class OfflineAdEntity(
    @PrimaryKey
    @ColumnInfo(name = "version")
    val version: Int, // Phiên bản video ad

    @ColumnInfo(name = "url")
    val url: String, // Đường dẫn file MP4 cục bộ trong bộ nhớ máy hoặc assets/iads/

    @ColumnInfo(name = "actionUrl")
    val actionUrl: String, // Deep-link hoặc Store link khi người dùng bấm vào ad

    @ColumnInfo(name = "showDailyLimit", defaultValue = "5")
    val showDailyLimit: Int = 5 // Giới hạn số lần hiển thị tối đa mỗi ngày
)
