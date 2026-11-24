package com.nextai.gameoffline.presentation.gamelist

import com.nextai.gameoffline.data.local.entity.GameEntity
import com.nextai.gameoffline.data.remote.GameDownloadCoordinator
import com.nextai.gameoffline.domain.repository.GameCatalogRepository
import com.nextai.gameoffline.domain.repository.GameStatsRepository
import com.nextai.gameoffline.domain.repository.GameStatsSnapshot
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Unit Test JVM cho [GameListViewModel], [GameCatalogSorter] và [SearchAnalyticsDebouncer]:
 * kiểm chứng seed catalog, kệ Continue Playing, sắp xếp offline-first và làm sạch từ khóa tìm kiếm.
 * Pure JVM unit tests for Launcher ViewModel, offline sorting, recent shelf, and search sanitizer.
 */
class GameListViewModelTest {

    private class FakeCatalogRepo : GameCatalogRepository {
        val gamesFlow = MutableStateFlow(
            listOf(
                GameEntity(name = "abalone", title = "Abalone", category = "Classic", position = 1, isDownloaded = 0),
                GameEntity(name = "chess", title = "Chess", category = "2 Players", position = 2, isDownloaded = 1),
                GameEntity(name = "ludo", title = "Ludo", category = "2 Players", position = 3, isDownloaded = 1)
            )
        )
        var seedCalls = 0
        var installedSet = setOf("chess", "ludo")

        override fun observeAllGames(): Flow<List<GameEntity>> = gamesFlow
        override suspend fun ensureCatalogSeeded() { seedCalls++ }
        override suspend fun getGameByName(gameName: String): GameEntity? =
            gamesFlow.value.firstOrNull { it.name == gameName }
        override suspend fun isGameInstalled(gameName: String): Boolean = gameName in installedSet
        override suspend fun resolveGameLaunchUrl(gameName: String): Result<String> =
            Result.success("https://appassets.androidplatform.net/assets/games/$gameName/index.html")
        override suspend fun updateDownloadStatus(gameName: String, isDownloaded: Int) = Unit
        override fun startDownload(game: GameEntity): StateFlow<GameDownloadCoordinator.State> =
            MutableStateFlow(GameDownloadCoordinator.State.Preparing)
    }

    private class FakeStatsRepo : GameStatsRepository {
        val toggledFavorites = mutableListOf<String>()
        val recentNamesFlow = MutableStateFlow<List<String>>(emptyList())

        override suspend fun recordGameOpened(gameName: String) = GameStatsSnapshot(gameName)
        override suspend fun recordPlayStarted(gameName: String, level: Int) = Unit
        override suspend fun recordHighestLevel(gameName: String, level: Int) = level
        override suspend fun recordHighScore(gameName: String, score: Int) = Unit
        override suspend fun recordPlayTime(gameName: String, sessionDurationSec: Long) = sessionDurationSec
        override suspend fun toggleFavorite(gameName: String) { toggledFavorites.add(gameName) }
        override suspend fun getStats(gameName: String) = GameStatsSnapshot(gameName)
        override fun observeRecentGameNames(limit: Int): Flow<List<String>> = recentNamesFlow
    }

    @Test
    fun initializesCatalogRecentGamesAndOfflinePrioritySorting() = runBlocking {
        val catalogRepo = FakeCatalogRepo()
        val statsRepo = FakeStatsRepo()
        statsRepo.recentNamesFlow.value = listOf("ludo", "chess", "nonexistent_game")
        var online = false
        val scope = CoroutineScope(SupervisorJob() + Dispatchers.Unconfined)

        val viewModel = GameListViewModel(
            catalogRepository = catalogRepo,
            statsRepository = statsRepo,
            networkAvailableProvider = { online },
            ioDispatcher = Dispatchers.Unconfined,
            injectedScope = scope
        )

        assertEquals(1, catalogRepo.seedCalls)
        assertTrue(viewModel.uiState.value.isOffline)
        // Khi offline, game isDownloaded == 1 (chess, ludo) được đẩy lên trước game R2 (abalone).
        assertEquals(listOf("chess", "ludo", "abalone"), viewModel.uiState.value.allGames.map { it.name })
        // Kệ Continue Playing giữ đúng thứ tự last_played DESC và bỏ qua game không tồn tại.
        assertEquals(listOf("ludo", "chess"), viewModel.uiState.value.recentGames.map { it.name })

        // Khi có mạng trở lại, giữ nguyên thứ tự xếp hạng GA4 `position`.
        online = true
        viewModel.refreshNetworkState()
        assertEquals(false, viewModel.uiState.value.isOffline)
        assertEquals(listOf("abalone", "chess", "ludo"), viewModel.uiState.value.allGames.map { it.name })

        viewModel.updateSearchQuery("  chess  ")
        assertEquals("chess", viewModel.uiState.value.searchQuery)

        viewModel.toggleFavorite("chess")
        assertEquals(listOf("chess"), statsRepo.toggledFavorites)
        assertTrue(viewModel.isGameReadyToLaunch("chess"))
    }

    @Test
    fun searchSanitizer_enforcesLengthLowercaseAndBlocksPii() {
        assertNull(SearchAnalyticsDebouncer.sanitizeQuery(""))
        assertNull(SearchAnalyticsDebouncer.sanitizeQuery("a"))
        assertNull(SearchAnalyticsDebouncer.sanitizeQuery("user@example.com"))
        assertNull(SearchAnalyticsDebouncer.sanitizeQuery("call 0912345678"))
        assertEquals("block blast", SearchAnalyticsDebouncer.sanitizeQuery("  Block   Blast \n "))
        val longQuery = "a".repeat(60)
        assertEquals(40, SearchAnalyticsDebouncer.sanitizeQuery(longQuery)?.length)
    }
}
