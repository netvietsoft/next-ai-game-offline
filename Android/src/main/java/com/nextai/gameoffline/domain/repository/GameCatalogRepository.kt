package com.nextai.gameoffline.domain.repository

import com.nextai.gameoffline.data.local.entity.GameEntity
import com.nextai.gameoffline.data.remote.GameDownloadCoordinator
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.StateFlow

/**
 * Giao diện kho dữ liệu danh mục 419 mini-game (bundled + on-demand Cloudflare R2).
 * Domain repository contract for the 419-game hybrid catalog (bundled + R2 on-demand).
 */
interface GameCatalogRepository {

    /** Quan sát toàn bộ danh mục mini-game theo thứ tự hiển thị. */
    fun observeAllGames(): Flow<List<GameEntity>>

    /** Đảm bảo catalog đã được seed đầy đủ nếu bảng games đang trống. */
    suspend fun ensureCatalogSeeded()

    /** Tra cứu metadata một mini-game theo tên định danh. */
    suspend fun getGameByName(gameName: String): GameEntity?

    /** Kiểm tra mini-game đã sẵn sàng trên máy (assets hoặc R2 đã cài) hay chưa. */
    suspend fun isGameInstalled(gameName: String): Boolean

    /** Phân giải URL khởi chạy WebView an toàn, trả về Failure nếu file R2 bị thiếu. */
    suspend fun resolveGameLaunchUrl(gameName: String): Result<String>

    /** Cập nhật cờ `is_downloaded` trong Room khi phát hiện file thay đổi. */
    suspend fun updateDownloadStatus(gameName: String, isDownloaded: Int)

    /** Bắt đầu hoặc gắn vào tiến trình tải gói game từ R2. */
    fun startDownload(game: GameEntity): StateFlow<GameDownloadCoordinator.State>
}
