package com.nextai.gameoffline.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey

/**
 * Thực thể lưu trữ toàn bộ thống kê người chơi theo từng trò chơi (điểm cao, số lần mở,
 * số ván chơi, màn chơi cao nhất, tổng thời gian chơi và yêu thích).
 * Room entity storing all per-game player progress, session totals, high scores, and favorites.
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
    val gameName: String,

    @ColumnInfo(name = "high_score", defaultValue = "0")
    val highScore: Int = 0,

    @ColumnInfo(name = "games_played", defaultValue = "0")
    val gamesPlayed: Int = 0,

    @ColumnInfo(name = "total_time_spent_sec", defaultValue = "0")
    val totalTimeSpentSec: Long = 0L,

    @ColumnInfo(name = "is_favorite", defaultValue = "0")
    val isFavorite: Int = 0,

    @ColumnInfo(name = "last_played")
    val lastPlayed: Long = System.currentTimeMillis(),

    @ColumnInfo(name = "open_count", defaultValue = "0")
    val openCount: Int = 0,

    @ColumnInfo(name = "highest_level", defaultValue = "1")
    val highestLevel: Int = 1
)
