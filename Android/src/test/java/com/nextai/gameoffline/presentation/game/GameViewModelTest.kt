package com.nextai.gameoffline.presentation.game

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
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Unit Test JVM cho [GameViewModel]: kiểm chứng nạp URL an toàn, khôi phục khi mất file R2
 * và ghi nhận thống kê phiên chơi (điểm cao, màn chơi, thời lượng) vào [GameStatsRepository].
 * Pure JVM unit tests for [GameViewModel] launch recovery and session telemetry recording.
 */
class GameViewModelTest {

    private class FakeCatalogRepo(
        private val launchResult: Result<String>
    ) : GameCatalogRepository {
        var lastDownloadStatusUpdate: Pair<String, Int>? = null
        val entity = GameEntity(name = "abalone", title = "Abalone", category = "Classic", position = 1)

        override fun observeAllGames(): Flow<List<GameEntity>> = MutableStateFlow(listOf(entity))
        override suspend fun ensureCatalogSeeded() = Unit
        override suspend fun getGameByName(gameName: String): GameEntity = entity
        override suspend fun isGameInstalled(gameName: String): Boolean = launchResult.isSuccess
        override suspend fun resolveGameLaunchUrl(gameName: String): Result<String> = launchResult
        override suspend fun updateDownloadStatus(gameName: String, isDownloaded: Int) {
            lastDownloadStatusUpdate = gameName to isDownloaded
        }
        override fun startDownload(game: GameEntity): StateFlow<GameDownloadCoordinator.State> =
            MutableStateFlow(GameDownloadCoordinator.State.Preparing)
    }

    private class FakeStatsRepo : GameStatsRepository {
        var openCount = 0
        var highScore = 0
        var highestLevel = 1
        var totalPlaySec = 0L

        override suspend fun recordGameOpened(gameName: String): GameStatsSnapshot {
            openCount++
            return GameStatsSnapshot(gameName = gameName, openCount = openCount, highestLevel = highestLevel)
        }

        override suspend fun recordPlayStarted(gameName: String, level: Int) {
            highestLevel = maxOf(highestLevel, level)
        }

        override suspend fun recordHighestLevel(gameName: String, level: Int): Int {
            highestLevel = maxOf(highestLevel, level)
            return highestLevel
        }

        override suspend fun recordHighScore(gameName: String, score: Int) {
            highScore = maxOf(highScore, score)
        }

        override suspend fun recordPlayTime(gameName: String, sessionDurationSec: Long): Long {
            totalPlaySec += sessionDurationSec
            return totalPlaySec
        }

        override suspend fun toggleFavorite(gameName: String) = Unit
        override suspend fun getStats(gameName: String) = GameStatsSnapshot(gameName)
        override fun observeRecentGameNames(limit: Int): Flow<List<String>> = MutableStateFlow(emptyList())
    }

    @Test
    fun loadGame_emitsReadyAndFlushesSessionPlayTimeOnStop() {
        var nowMs = 10_000L
        val catalogRepo = FakeCatalogRepo(
            Result.success("https://appassets.androidplatform.net/assets/games/abalone/index.html")
        )
        val statsRepo = FakeStatsRepo()
        val scope = CoroutineScope(SupervisorJob() + Dispatchers.Unconfined)

        val viewModel = GameViewModel(
            gameName = "abalone",
            catalogRepository = catalogRepo,
            statsRepository = statsRepo,
            ioDispatcher = Dispatchers.Unconfined,
            clockMs = { nowMs },
            injectedScope = scope
        )

        viewModel.loadGame()
        val state = viewModel.launchState.value
        assertTrue(state is GameLaunchState.Ready)
        assertEquals(1, statsRepo.openCount)

        viewModel.recordScore(420)
        assertEquals(420, statsRepo.highScore)

        var resolvedHighest = 0
        viewModel.recordLevelComplete(3) { resolvedHighest = it }
        assertEquals(4, resolvedHighest)

        nowMs += 45_000L
        var recordedSession: CompletedGameSession? = null
        viewModel.onBackgroundStopped { recordedSession = it }
        assertEquals(45L, recordedSession?.durationSec)
        assertEquals(45L, statsRepo.totalPlaySec)
    }

    @Test
    fun loadGame_marksNotDownloadedAndEmitsMissingFilesOnSecurityException() {
        val catalogRepo = FakeCatalogRepo(Result.failure(SecurityException("Missing index.html")))
        val statsRepo = FakeStatsRepo()
        val scope = CoroutineScope(SupervisorJob() + Dispatchers.Unconfined)

        val viewModel = GameViewModel(
            gameName = "abalone",
            catalogRepository = catalogRepo,
            statsRepository = statsRepo,
            ioDispatcher = Dispatchers.Unconfined,
            injectedScope = scope
        )

        viewModel.loadGame()
        assertTrue(viewModel.launchState.value is GameLaunchState.MissingFiles)
        assertEquals("abalone" to 0, catalogRepo.lastDownloadStatusUpdate)
        assertEquals(0, statsRepo.openCount)
    }

    @Test
    fun currentSessionElapsedSec_accumulatesAcrossPauseAndResume() {
        var nowMs = 5_000L
        val catalogRepo = FakeCatalogRepo(
            Result.success("https://appassets.androidplatform.net/assets/games/abalone/index.html")
        )
        val statsRepo = FakeStatsRepo()
        val scope = CoroutineScope(SupervisorJob() + Dispatchers.Unconfined)

        val viewModel = GameViewModel(
            gameName = "abalone",
            catalogRepository = catalogRepo,
            statsRepository = statsRepo,
            ioDispatcher = Dispatchers.Unconfined,
            clockMs = { nowMs },
            injectedScope = scope
        )

        viewModel.loadGame()
        nowMs += 35_000L
        assertEquals(35L, viewModel.currentSessionElapsedSec())

        viewModel.onBackgroundStopped { }
        // Thời gian ở nền không được cộng vào thời gian chơi tích lũy.
        nowMs += 120_000L
        assertEquals(35L, viewModel.currentSessionElapsedSec())

        viewModel.onForegroundResumed()
        nowMs += 30_000L
        assertEquals(65L, viewModel.currentSessionElapsedSec())
    }
}
