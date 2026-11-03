package com.nextai.gameoffline.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey

/**
 * Thực thể Banner nổi bật hiển thị ở Carousel đầu trang chủ.
 * Entity representing Featured Carousel Banners displayed on Home screen.
 */
@Entity(
    tableName = "banners",
    primaryKeys = ["gameId", "position"],
    foreignKeys = [
        ForeignKey(
            entity = GameEntity::class,
            parentColumns = ["name"],
            childColumns = ["gameId"],
            onDelete = ForeignKey.CASCADE
        )
    ]
)
data class BannerEntity(
    @ColumnInfo(name = "gameId")
    val gameId: String, // Khóa ngoại liên kết với `games.name`

    @ColumnInfo(name = "position")
    val position: Int, // Vị trí hiển thị trong Carousel (1, 2, 3...)

    @ColumnInfo(name = "image_url")
    val imageUrl: String // Đường dẫn ảnh banner (Local drawable hoặc remote CDN)
)
