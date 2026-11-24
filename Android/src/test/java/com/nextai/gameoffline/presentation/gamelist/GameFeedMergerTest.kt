package com.nextai.gameoffline.presentation.gamelist

import com.nextai.gameoffline.data.local.entity.GameEntity
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Kiểm thử bộ trộn danh sách game và thẻ Native Ad In-Feed cho lưới 2 cột Trang chủ.
 * JVM unit tests for [GameFeedMerger].
 */
class GameFeedMergerTest {

    private fun fakeGames(count: Int): List<GameEntity> {
        return (1..count).map { idx ->
            GameEntity(
                name = "game_$idx",
                title = "Game $idx",
                category = "Casual",
                position = idx,
                isDownloaded = 1
            )
        }
    }

    @Test
    fun omitsAllNativeSlotsWhenVipOrSearchingOrShortList() {
        val fiftyGames = fakeGames(50)

        val vipFeed = GameFeedMerger.merge(fiftyGames, "All", adsEnabled = false, isSearching = false)
        assertTrue(vipFeed.none { it is GameFeedItem.NativeAdSlot })
        assertEquals(50, vipFeed.size)

        val searchFeed = GameFeedMerger.merge(fiftyGames, "All", adsEnabled = true, isSearching = true)
        assertTrue(searchFeed.none { it is GameFeedItem.NativeAdSlot })
        assertEquals(50, searchFeed.size)

        val shortFeed = GameFeedMerger.merge(fakeGames(12), "Arcade", adsEnabled = true, isSearching = false)
        assertTrue(shortFeed.none { it is GameFeedItem.NativeAdSlot })
    }

    @Test
    fun insertsRowAlignedNativeSlotsUpToMaxCap() {
        val hundredGames = fakeGames(100)
        val merged = GameFeedMerger.merge(hundredGames, "All", adsEnabled = true, isSearching = false)

        val adPositions = merged.mapIndexedNotNull { index, item ->
            if (item is GameFeedItem.NativeAdSlot) index else null
        }
        assertEquals(GameFeedMerger.MAX_AD_SLOTS_PER_FEED, adPositions.size)

        // Kiểm tra trước mỗi thẻ Native Ad luôn có số lượng game chẵn để không tạo hàng lẻ 2 cột.
        // Verify an even count of preceding games before every ad slot to keep 2-column rows balanced.
        var gamesBeforeSlot = 0
        for (item in merged) {
            if (item is GameFeedItem.NativeAdSlot) {
                assertEquals(0, gamesBeforeSlot % 2)
            } else {
                gamesBeforeSlot++
            }
        }
        assertEquals(100, gamesBeforeSlot)
    }

    @Test
    fun prependsContinuePlayingShelfOnlyOnAllTabWhenNotSearchingAndMarksHotTop15() {
        val games = fakeGames(30)
        val recents = listOf(games[4], games[0])

        val allFeed = GameFeedMerger.merge(
            games = games,
            categoryKey = "All",
            adsEnabled = true,
            isSearching = false,
            recentGames = recents
        )
        assertTrue(allFeed[0] is GameFeedItem.RecentGamesShelf)
        assertEquals(recents, (allFeed[0] as GameFeedItem.RecentGamesShelf).games)

        // Kệ Continue Playing không làm lệch ranh giới hàng chẵn của Native Ad.
        var gamesBeforeSlot = 0
        for (item in allFeed) {
            when (item) {
                is GameFeedItem.RecentGamesShelf -> Unit
                is GameFeedItem.NativeAdSlot -> assertEquals(0, gamesBeforeSlot % 2)
                is GameFeedItem.GameCard -> gamesBeforeSlot++
            }
        }

        // Ẩn kệ Continue Playing khi sang tab phụ hoặc đang tìm kiếm.
        val categoryFeed = GameFeedMerger.merge(
            games = games,
            categoryKey = "Puzzle",
            adsEnabled = true,
            isSearching = false,
            recentGames = recents
        )
        assertTrue(categoryFeed.none { it is GameFeedItem.RecentGamesShelf })
        val searchFeed = GameFeedMerger.merge(
            games = games,
            categoryKey = "All",
            adsEnabled = true,
            isSearching = true,
            recentGames = recents
        )
        assertTrue(searchFeed.none { it is GameFeedItem.RecentGamesShelf })

        // Kiểm tra nhãn HOT đúng Top 15.
        assertTrue(GameFeedMerger.isHotGame(games[0]))
        assertTrue(GameFeedMerger.isHotGame(games[14]))
        assertEquals(false, GameFeedMerger.isHotGame(games[15]))
    }
}
