package com.nextai.gameoffline.presentation.gamelist

import com.nextai.gameoffline.data.local.entity.GameEntity

/**
 * Phần tử hiển thị trong lưới Trang chủ: kệ chơi tiếp, thẻ Mini-Game hoặc Native Ad.
 * Sealed feed item displayed in the 2-column Launcher RecyclerView.
 */
sealed interface GameFeedItem {
    data class RecentGamesShelf(val games: List<GameEntity>) : GameFeedItem
    data class GameCard(val game: GameEntity) : GameFeedItem
    data class NativeAdSlot(val slotId: String) : GameFeedItem
}

/**
 * Bộ trộn thuần Kotlin chèn kệ ngang "Continue Playing" ở đầu tab All và các khe Native Ad In-Feed
 * theo ranh giới hàng chẵn (2 cột), không bao giờ tạo hàng lẻ trống, và tự tắt quảng cáo khi VIP /
 * chưa có consent / đang tìm kiếm.
 * Pure Kotlin feed merger composing the Continue Playing shelf, game cards, and row-aligned Native Ads.
 */
object GameFeedMerger {

    /** Số game hiển thị trước thẻ Native Ad đầu tiên (6 hàng × 2 cột = 12 game). */
    const val FIRST_AD_AFTER_GAMES = 12

    /** Khoảng cách game giữa các thẻ Native Ad tiếp theo (7 hàng × 2 cột = 14 game). */
    const val AD_INTERVAL_GAMES = 14

    /** Giới hạn số khe Native Ad tối đa trên mỗi tab danh mục để tránh tải thừa. */
    const val MAX_AD_SLOTS_PER_FEED = 6

    /** Ngưỡng vị trí đầu bảng được gắn huy hiệu `HOT` (Top 15). */
    const val HOT_BADGE_MAX_POSITION = 15

    /** Kiểm tra một game có đủ điều kiện gắn huy hiệu `HOT` (Top 15 theo xếp hạng GA4) hay không. */
    fun isHotGame(game: GameEntity): Boolean = game.position in 1..HOT_BADGE_MAX_POSITION

    /**
     * Trộn kệ "Continue Playing", danh sách game và các khe Native Ad In-Feed ở ranh giới hàng chẵn.
     * Merges optional Continue Playing shelf, game cards, and row-aligned Native Ad slots.
     */
    fun merge(
        games: List<GameEntity>,
        categoryKey: String,
        adsEnabled: Boolean,
        isSearching: Boolean,
        recentGames: List<GameEntity> = emptyList()
    ): List<GameFeedItem> {
        val result = ArrayList<GameFeedItem>(games.size + MAX_AD_SLOTS_PER_FEED + 1)
        if (categoryKey == "All" && !isSearching && recentGames.isNotEmpty()) {
            result.add(GameFeedItem.RecentGamesShelf(recentGames))
        }

        if (!adsEnabled || isSearching || games.size < FIRST_AD_AFTER_GAMES) {
            games.forEach { result.add(GameFeedItem.GameCard(it)) }
            return result
        }

        var nextAdThreshold = FIRST_AD_AFTER_GAMES
        var insertedSlots = 0

        for (index in games.indices) {
            result.add(GameFeedItem.GameCard(games[index]))
            val displayedCount = index + 1
            val hasMoreGamesBelow = displayedCount < games.size
            if (
                displayedCount == nextAdThreshold &&
                hasMoreGamesBelow &&
                insertedSlots < MAX_AD_SLOTS_PER_FEED
            ) {
                insertedSlots++
                result.add(GameFeedItem.NativeAdSlot("${categoryKey}#native_$insertedSlots"))
                nextAdThreshold += AD_INTERVAL_GAMES
            }
        }
        return result
    }
}
