package com.nextai.gameoffline.presentation.gamelist

import com.nextai.gameoffline.data.local.entity.GameEntity

/**
 * Bộ sắp xếp & ánh xạ danh mục thuần Kotlin cho Trang chủ Launcher:
 * - Khi thiết bị đang ngoại tuyến (`isOffline = true`), ưu tiên đẩy toàn bộ game đã cài sẵn
 *   (`isDownloaded == 1`) lên trước nhóm cần tải R2 để người dùng bấm là chơi ngay không bị chặn.
 * - Ánh xạ danh sách tên game gần đây sang [GameEntity] giữ nguyên thứ tự chơi mới nhất.
 * Pure Kotlin sorting and recent-game resolution helpers for the Launcher catalog.
 */
object GameCatalogSorter {

    /**
     * Sắp xếp danh sách game hiển thị theo `position` (GA4 ranking) hoặc ưu tiên offline-first
     * khi thiết bị không có kết nối mạng.
     * Sorts catalog games by GA4 `position`, prioritizing installed games first when offline.
     */
    fun sortForDisplay(games: List<GameEntity>, isOffline: Boolean): List<GameEntity> {
        if (!isOffline) {
            return games.sortedBy(GameEntity::position)
        }
        return games.sortedWith(
            compareByDescending<GameEntity> { it.isDownloaded == 1 }
                .thenBy(GameEntity::position)
        )
    }

    /**
     * Chuyển danh sách tên game chơi gần đây (từ Room `last_played DESC`) sang danh sách [GameEntity]
     * giữ nguyên thứ tự thời gian và bỏ qua game không còn trong catalog.
     * Resolves recent game IDs into ordered [GameEntity] entries matching the live catalog.
     */
    fun resolveRecentGames(
        allGames: List<GameEntity>,
        recentGameNames: List<String>,
        maxCount: Int = DEFAULT_RECENT_LIMIT
    ): List<GameEntity> {
        if (allGames.isEmpty() || recentGameNames.isEmpty()) {
            return emptyList()
        }
        val gamesByName = allGames.associateBy(GameEntity::name)
        return recentGameNames
            .asSequence()
            .mapNotNull(gamesByName::get)
            .distinctBy(GameEntity::name)
            .take(maxCount.coerceAtLeast(1))
            .toList()
    }

    const val DEFAULT_RECENT_LIMIT = 10
}
