package com.nextai.gameoffline.presentation.game

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nextai.gameoffline.data.local.entity.GameEntity
import com.nextai.gameoffline.domain.repository.GameCatalogRepository
import com.nextai.gameoffline.domain.repository.GameStatsRepository
import com.nextai.gameoffline.domain.repository.GameStatsSnapshot
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** Trạng thái khởi nạp màn chơi WebView / Loading state for [GameActivity]. */
sealed interface GameLaunchState {
    data object Loading : GameLaunchState
    data class Ready(
        val game: GameEntity?,
        val launchUrl: String,
        val stats: GameStatsSnapshot
    ) : GameLaunchState
    data class MissingFiles(val cause: Throwable?) : GameLaunchState
}

/** Kết quả phiên chơi khi người dùng thoát màn chơi / Completed game session summary. */
data class CompletedGameSession(
    val durationSec: Long,
    val totalPlayTimeSec: Long
)

/**
 * ViewModel cho màn hình chơi game [GameActivity]: nạp metadata + URL an toàn,
 * ghi nhận thống kê Room (lượt mở, điểm cao, màn cao nhất, thời lượng phiên chơi).
 * JVM-testable ViewModel owning game launch resolution and Room-backed session telemetry.
 */
class GameViewModel(
    val gameName: String,
    private val catalogRepository: GameCatalogRepository,
    private val statsRepository: GameStatsRepository,
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
    private val clockMs: () -> Long = { System.currentTimeMillis() },
    injectedScope: CoroutineScope? = null
) : ViewModel() {

    private val scope: CoroutineScope = injectedScope ?: viewModelScope
    private val _launchState = MutableStateFlow<GameLaunchState>(GameLaunchState.Loading)
    val launchState: StateFlow<GameLaunchState> = _launchState.asStateFlow()

    private var currentGameEntity: GameEntity? = null
    private var sessionStartTimeMs: Long = 0L
    private var accumulatedSessionSec: Long = 0L
    private var isSessionActive: Boolean = false

    fun currentGame(): GameEntity? = currentGameEntity

    /**
     * Tính tổng thời gian chơi tích lũy (giây) trong lần mở `GameActivity` hiện tại,
     * cộng cả các đoạn trước khi tạm dừng và đoạn đang chơi hiện hành.
     * Computes cumulative active play seconds for the current `GameActivity` session.
     */
    fun currentSessionElapsedSec(): Long {
        val activeSegmentSec = if (isSessionActive && sessionStartTimeMs > 0L) {
            ((clockMs() - sessionStartTimeMs) / 1_000L).coerceAtLeast(0L)
        } else {
            0L
        }
        return accumulatedSessionSec + activeSegmentSec
    }

    /**
     * Nạp thông tin game từ Room và kiểm tra đường dẫn WebView trên `ioDispatcher`.
     * Nếu file game R2 bị xóa ngoài ý muốn, tự đặt `isDownloaded = 0` và phát trạng thái lỗi an toàn.
     * Resolves metadata and launch URL safely on `ioDispatcher`, handling missing R2 files cleanly.
     */
    fun loadGame() {
        scope.launch(ioDispatcher) {
            val entity = catalogRepository.getGameByName(gameName)
            currentGameEntity = entity

            val launchResult = catalogRepository.resolveGameLaunchUrl(gameName)
            if (launchResult.isFailure) {
                catalogRepository.updateDownloadStatus(gameName, 0)
                _launchState.value = GameLaunchState.MissingFiles(launchResult.exceptionOrNull())
                return@launch
            }

            val stats = statsRepository.recordGameOpened(gameName)
            sessionStartTimeMs = clockMs()
            isSessionActive = true
            _launchState.value = GameLaunchState.Ready(
                game = entity,
                launchUrl = launchResult.getOrThrow(),
                stats = stats
            )
        }
    }

    /** Lưu điểm số cao mới vào Room / Persist new high score to Room. */
    fun recordScore(score: Int) {
        scope.launch(ioDispatcher) {
            statsRepository.recordHighScore(gameName, score)
        }
    }

    /** Ghi nhận bắt đầu màn chơi từ JS bridge / Record level start from JS bridge. */
    fun recordLevelStart(level: Int) {
        scope.launch(ioDispatcher) {
            statsRepository.recordPlayStarted(gameName, level)
        }
    }

    /** Ghi nhận qua màn chơi và trả về màn cao nhất mới qua callback. */
    fun recordLevelComplete(level: Int, onHighestLevelResolved: (Int) -> Unit) {
        scope.launch(ioDispatcher) {
            val nextHighest = statsRepository.recordHighestLevel(gameName, level + 1)
            onHighestLevelResolved(nextHighest)
        }
    }

    /** Bắt đầu lại bộ đếm thời gian phiên khi Activity quay lại tiền cảnh. */
    fun onForegroundResumed() {
        if (!isSessionActive && _launchState.value is GameLaunchState.Ready) {
            sessionStartTimeMs = clockMs()
            isSessionActive = true
        }
    }

    /**
     * Kết thúc đoạn thời gian phiên chơi hiện tại khi Activity dừng và lưu tổng thời lượng vào Room.
     * Flushes elapsed play duration to Room when the Activity stops.
     */
    fun onBackgroundStopped(onSessionRecorded: (CompletedGameSession) -> Unit) {
        if (!isSessionActive || sessionStartTimeMs <= 0L) {
            return
        }
        val durationSec = (clockMs() - sessionStartTimeMs) / 1_000L
        isSessionActive = false
        if (durationSec <= 0L) {
            return
        }
        accumulatedSessionSec += durationSec
        scope.launch(ioDispatcher) {
            val totalSec = statsRepository.recordPlayTime(gameName, durationSec)
            onSessionRecorded(CompletedGameSession(durationSec = durationSec, totalPlayTimeSec = totalSec))
        }
    }
}
