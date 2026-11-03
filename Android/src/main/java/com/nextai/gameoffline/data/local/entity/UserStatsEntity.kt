package com.nextai.gameoffline.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey

/**
 * Thực thể lưu trữ thống kê, kỷ lục điểm số và yêu thích của người chơi.
 * Entity storing user game statistics, high scores and favorites.
 */
@Entity(
    tableName = "user_game_stats",
    foreignKeys = [
        ForeignKey(
            entity = GameEntity::class,
            parentColumns = ["name"],
            childColumns = ["game_name"],
            onDelete = ForeignKey.CASCADE
        )
    ]
)
data class UserStatsEntity(
    @PrimaryKey
    @ColumnInfo(name = "game_name")
    val gameName: String, // Tên định danh của game

    @ColumnInfo(name = "high_score", defaultValue = "0")
    val highScore: Int = 0, // Điểm số cao nhất người chơi đạt được

    @ColumnInfo(name = "games_played", defaultValue = "0")
    val gamesPlayed: Int = 0, // Tổng số ván đã chơi

    @ColumnInfo(name = "total_time_spent_sec", defaultValue = "0")
    val totalTimeSpentSec: Int = 0, // Tổng thời gian đã chơi (giây)

    @ColumnInfo(name = "is_favorite", defaultValue = "0")
    val isFavorite: Int = 0, // 1: Yêu thích (Đánh dấu trái tim), 0: Không

    @ColumnInfo(name = "last_played")
    val lastPlayed: Long = System.currentTimeMillis() // Thời điểm chơi gần nhất (Epoch timestamp)
)
