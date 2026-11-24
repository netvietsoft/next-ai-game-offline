package com.nextai.gameoffline.presentation.gamelist

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nextai.gameoffline.data.local.entity.GameEntity
import com.nextai.gameoffline.data.remote.GameDownloadCoordinator
import com.nextai.gameoffline.domain.repository.GameCatalogRepository
import com.nextai.gameoffline.domain.repository.GameStatsRepository
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Trạng thái danh sách trò chơi bất biến của màn hình chính Launcher, bao gồm kệ
 * "Continue Playing" (`recentGames`) và cờ ngoại tuyến (`isOffline`) để ưu tiên game chơi ngay.
 * Immutable UI state for the Launcher grid, search query, recent shelf, and offline status.
 */
data class GameListUiState(
    val allGames: List<GameEntity> = emptyList(),
    val recentGames: List<GameEntity> = emptyList(),
    val searchQuery: String = "",
    val isOffline: Boolean = false
)

/**
 * ViewModel cho màn hình danh sách Mini-Game, tách hoàn toàn việc truy vấn Room,
 * tìm kiếm, kệ chơi tiếp gần đây, sắp xếp offline-first, tải R2 và yêu thích khỏi [GameListActivity].
 * JVM-testable ViewModel owning catalog observation, recent shelf, offline sorting, and downloads.
 */
class GameListViewModel(
    private val catalogRepository: GameCatalogRepository,
    private val statsRepository: GameStatsRepository,
    private val networkAvailableProvider: () -> Boolean = { true },
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO,
    injectedScope: CoroutineScope? = null
) : ViewModel() {

    private val scope: CoroutineScope = injectedScope ?: viewModelScope
    private val isOfflineFlow = MutableStateFlow(!networkAvailableProvider())
    private val _uiState = MutableStateFlow(GameListUiState(isOffline = isOfflineFlow.value))
    val uiState: StateFlow<GameListUiState> = _uiState.asStateFlow()

    init {
        observeCatalogAndRecents()
    }

    private fun observeCatalogAndRecents() {
        scope.launch(ioDispatcher) {
            catalogRepository.ensureCatalogSeeded()
            combine(
                catalogRepository.observeAllGames(),
                statsRepository.observeRecentGameNames(GameCatalogSorter.DEFAULT_RECENT_LIMIT),
                isOfflineFlow
            ) { games, recentNames, offline ->
                val sortedGames = GameCatalogSorter.sortForDisplay(games, isOffline = offline)
                val resolvedRecents = GameCatalogSorter.resolveRecentGames(sortedGames, recentNames)
                Triple(sortedGames, resolvedRecents, offline)
            }.collectLatest { (sortedGames, resolvedRecents, offline) ->
                _uiState.update { current ->
                    current.copy(
                        allGames = sortedGames,
                        recentGames = resolvedRecents,
                        isOffline = offline
                    )
                }
            }
        }
    }

    /** Làm mới trạng thái mạng mỗi khi Trang chủ quay lại tiền cảnh (`onResume`). */
    fun refreshNetworkState() {
        isOfflineFlow.value = !networkAvailableProvider()
    }

    /** Cập nhật từ khóa tìm kiếm tức thời / Update live search query. */
    fun updateSearchQuery(rawQuery: String) {
        val trimmed = rawQuery.trim()
        _uiState.update { current -> current.copy(searchQuery = trimmed) }
    }

    /** Đảo trạng thái yêu thích trong Room trên `ioDispatcher`. */
    fun toggleFavorite(gameName: String) {
        scope.launch(ioDispatcher) {
            statsRepository.toggleFavorite(gameName)
        }
    }

    /** Kiểm tra trên `ioDispatcher` xem gói game đã có sẵn trên máy hay cần tải từ R2. */
    suspend fun isGameReadyToLaunch(gameName: String): Boolean {
        return withContext(ioDispatcher) {
            catalogRepository.isGameInstalled(gameName)
        }
    }

    /** Bắt đầu tải gói game R2 và trả về dòng trạng thái tiến trình thực. */
    fun startDownload(game: GameEntity): StateFlow<GameDownloadCoordinator.State> {
        return catalogRepository.startDownload(game)
    }
}
