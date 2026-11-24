package com.nextai.gameoffline.domain.repository

import kotlinx.coroutines.flow.Flow

/**
 * Bản chụp bất biến thống kê chơi của một mini-game.
 * Immutable snapshot of per-game player engagement and progress metrics.
 */
data class GameStatsSnapshot(
    val gameName: String,
    val openCount: Int = 0,
    val playCount: Int = 0,
    val highestLevel: Int = 1,
    val totalPlayTimeSec: Long = 0L,
    val highScore: Int = 0,
    val isFavorite: Boolean = false,
    val lastPlayedTimestamp: Long = 0L
)

/**
 * Giao diện kho lưu trữ thống kê người chơi tập trung trên Room (`user_game_stats`).
 * Domain repository contract for Room-backed per-game player progress and favorites.
 */
interface GameStatsRepository {

    /** Ghi nhận một lượt mở game từ Launcher và trả về thống kê mới nhất. */
    suspend fun recordGameOpened(gameName: String): GameStatsSnapshot

    /** Ghi nhận bắt đầu ván chơi / màn chơi mới. */
    suspend fun recordPlayStarted(gameName: String, level: Int)

    /** Cập nhật màn chơi cao nhất đạt được và trả về giá trị cao nhất hiện hành. */
    suspend fun recordHighestLevel(gameName: String, level: Int): Int

    /** Cập nhật điểm kỷ lục mới nếu cao hơn điểm cũ. */
    suspend fun recordHighScore(gameName: String, score: Int)

    /** Cộng dồn thời gian chơi của phiên (giây) và trả về tổng thời gian mới. */
    suspend fun recordPlayTime(gameName: String, sessionDurationSec: Long): Long

    /** Đảo trạng thái yêu thích (trái tim) của một mini-game. */
    suspend fun toggleFavorite(gameName: String)

    /** Đọc bản chụp thống kê hiện tại của một mini-game. */
    suspend fun getStats(gameName: String): GameStatsSnapshot

    /**
     * Quan sát danh sách ID game đã mở gần đây nhất theo thứ tự thời gian giảm dần.
     * Observes recently opened game IDs ordered by most recent play timestamp.
     */
    fun observeRecentGameNames(limit: Int = 10): Flow<List<String>>
}
