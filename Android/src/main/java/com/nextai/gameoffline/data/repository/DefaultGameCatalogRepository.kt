package com.nextai.gameoffline.data.repository

import android.content.Context
import com.nextai.gameoffline.data.local.AppDatabase
import com.nextai.gameoffline.data.local.dao.GamesDao
import com.nextai.gameoffline.data.local.entity.GameEntity
import com.nextai.gameoffline.data.remote.GameDownloadCoordinator
import com.nextai.gameoffline.data.remote.GameDownloadManager
import com.nextai.gameoffline.domain.repository.GameCatalogRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.StateFlow

/**
 * Triển khai mặc định của [GameCatalogRepository] kết hợp Room [GamesDao] và Cloudflare R2.
 * Default implementation of [GameCatalogRepository] combining Room [GamesDao] and R2 downloads.
 */
class DefaultGameCatalogRepository(
    context: Context,
    private val gamesDao: GamesDao
) : GameCatalogRepository {

    private val appContext = context.applicationContext

    override fun observeAllGames(): Flow<List<GameEntity>> {
        return gamesDao.getAllGames()
    }

    override suspend fun ensureCatalogSeeded() {
        if (gamesDao.getGamesCount() == 0) {
            AppDatabase.populateGamesCatalogDirect(appContext, gamesDao, force = false)
        }
    }

    override suspend fun getGameByName(gameName: String): GameEntity? {
        return gamesDao.getGameByName(gameName)
    }

    override suspend fun isGameInstalled(gameName: String): Boolean {
        return GameDownloadManager.isGameInstalled(appContext, gameName)
    }

    override suspend fun resolveGameLaunchUrl(gameName: String): Result<String> {
        return runCatching {
            GameDownloadManager.getGameLaunchUrl(appContext, gameName)
        }
    }

    override suspend fun updateDownloadStatus(gameName: String, isDownloaded: Int) {
        gamesDao.updateDownloadStatus(gameName, isDownloaded)
    }

    override fun startDownload(game: GameEntity): StateFlow<GameDownloadCoordinator.State> {
        return GameDownloadCoordinator.start(appContext, game)
    }
}
