package com.nextai.gameoffline.data.remote

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.util.Log
import com.nextai.gameoffline.BuildConfig
import com.nextai.gameoffline.R
import com.nextai.gameoffline.analytics.GameAnalyticsManager
import com.nextai.gameoffline.data.local.GameCatalogSync
import com.nextai.gameoffline.data.local.entity.GameEntity
import com.nextai.gameoffline.di.appContainer
import java.io.File
import java.io.FileNotFoundException
import java.net.URL
import java.util.concurrent.ConcurrentHashMap
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext

/**
 * Điều phối tải và cài đặt các gói game HTML5 đã được allowlist từ Cloudflare R2.
 * Ủy quyền manifest/receipt cho [GameIntegrityManifestStore], kiểm tra mạng cho
 * [NetworkConnectivityChecker], giải nén/cài đặt cho [GamePackageInstaller].
 * Coordinates allowlisted HTML5 game downloads from Cloudflare R2 via SRP collaborators.
 */
object GameDownloadManager {

    private const val TAG = "GameDownloadManager"
    private const val PROGRESS_THROTTLE_MS = 200L
    private const val BYTES_PER_MIB = 1_048_576.0
    private val downloadMutexes = ConcurrentHashMap<String, Mutex>()

    /**
     * Kiểm tra game đóng gói hoặc game R2 đã cài hợp lệ có sẵn trên máy.
     * Checks whether a bundled or verified R2 game is available locally.
     */
    fun isGameInstalled(context: Context, gameName: String): Boolean {
        if (!GamePackageSecurityPolicy.isValidGameName(gameName)) {
            return false
        }
        if (hasBundledGame(context, gameName)) {
            return true
        }
        val spec = GameIntegrityManifestStore.specOrNull(context, gameName) ?: return false
        return GameIntegrityManifestStore.hasVerifiedRemoteInstall(context, spec)
    }

    /**
     * Trả URL origin ảo an toàn cho WebView, không bao giờ trả `file://`.
     * Returns a safe virtual-origin URL for WebView and never a `file://` URL.
     */
    fun getGameLaunchUrl(context: Context, gameName: String): String {
        require(GamePackageSecurityPolicy.isValidGameName(gameName)) { "Invalid game identifier" }
        if (hasBundledGame(context, gameName)) {
            return "https://appassets.androidplatform.net/assets/games/$gameName/index.html"
        }
        val spec = GameIntegrityManifestStore.specOrNull(context, gameName)
            ?: throw SecurityException("Game is not allowlisted")
        if (GameIntegrityManifestStore.hasVerifiedRemoteInstall(context, spec)) {
            return "https://appassets.androidplatform.net/downloaded_games/$gameName/index.html"
        }
        throw SecurityException("Remote game installation is not verified")
    }

    /**
     * Tải, xác minh toàn vẹn, giải nén vào staging rồi kích hoạt nguyên tử.
     * Kiểm tra kết nối mạng trước khi gọi HTTP để báo rõ lỗi ngoại tuyến và không trộn vào `UnknownHostException`.
     * Downloads, verifies, stages, and atomically installs an R2 game after checking connectivity.
     */
    suspend fun downloadAndExtractGame(
        context: Context,
        game: GameEntity,
        onProgress: (Int) -> Unit,
        onSuccess: () -> Unit,
        onError: (String) -> Unit,
        onStage: (String) -> Unit = {},
        onBytes: (Long, Long) -> Unit = { _, _ -> }
    ) = withContext(Dispatchers.IO) {
        val mainHandler = Handler(Looper.getMainLooper())
        val startedAt = SystemClock.elapsedRealtime()
        val postStage: (String) -> Unit = { value ->
            if (BuildConfig.DEBUG) {
                val elapsed = SystemClock.elapsedRealtime() - startedAt
                Log.d(TAG, "${game.name} stage=$value elapsed_ms=$elapsed")
            }
            mainHandler.post { onStage(value) }
        }
        val mutex = downloadMutexes.getOrPut(game.name) { Mutex() }
        mutex.withLock {
            var cacheZip: File? = null
            var stagingDir: File? = null
            try {
                require(GamePackageSecurityPolicy.isValidGameName(game.name)) {
                    "Invalid game identifier"
                }
                if (repairBundledInstallIfPresent(context, game.name)) {
                    mainHandler.post { onSuccess() }
                    return@withLock
                }
                val spec = GameIntegrityManifestStore.specOrNull(context, game.name)
                    ?: throw FileNotFoundException("Game package unavailable")
                if (repairVerifiedRemoteInstallIfPresent(context, game.name, spec)) {
                    mainHandler.post { onSuccess() }
                    return@withLock
                }
                if (!NetworkConnectivityChecker.isNetworkAvailable(context)) {
                    // Tách biệt người chơi ngoại tuyến khỏi lỗi hạ tầng (UnknownHostException).
                    // Separate offline players from infrastructure DNS/CDN failures.
                    GameAnalyticsManager.logGameDownload(
                        gameName = game.name,
                        status = "offline",
                        sizeMb = spec.sizeBytes / BYTES_PER_MIB,
                        errorMessage = "NoNetworkConnection"
                    )
                    val message = context.getString(R.string.game_download_no_network)
                    mainHandler.post { onError(message) }
                    return@withLock
                }

                val downloadUrl = validateDownloadUrl(game, spec)
                cacheZip = File(context.cacheDir, "r2_${game.name}.zip")
                cacheZip.delete()

                GameAnalyticsManager.logGameDownload(
                    gameName = game.name,
                    status = "started",
                    sizeMb = spec.sizeBytes / BYTES_PER_MIB
                )
                postStage("connecting")
                transferPackage(downloadUrl, cacheZip, spec, mainHandler, postStage, onProgress, onBytes)

                postStage("installing")
                val gamesRoot = File(context.filesDir, "games")
                if (!gamesRoot.mkdirs() && !gamesRoot.isDirectory) {
                    throw SecurityException("Cannot create games root")
                }
                stagingDir = File(gamesRoot, ".staging_${game.name}")
                stagingDir.deleteRecursively()
                GamePackageInstaller.extractVerifiedPackage(cacheZip, stagingDir, spec)

                // Giữ receipt và Room nhất quán với seed danh mục.
                // Commit install receipt and Room status consistently with catalog seeding.
                GameCatalogSync.mutex.withLock {
                    GamePackageInstaller.installStagedGame(context, game.name, stagingDir)
                    GameIntegrityManifestStore.writeInstallReceipt(context, spec)
                    context.appContainer.database.gamesDao().updateDownloadStatus(game.name, 1)
                }
                GameAnalyticsManager.logGameDownload(
                    gameName = game.name,
                    status = "completed",
                    sizeMb = spec.sizeBytes / BYTES_PER_MIB
                )
                mainHandler.post { onSuccess() }
            } catch (error: Exception) {
                if (error is CancellationException && error !is TimeoutCancellationException) {
                    throw error
                }
                if (BuildConfig.DEBUG) {
                    Log.e(
                        TAG,
                        "R2 install failed (${game.name}): ${error.javaClass.simpleName}: ${error.message}"
                    )
                }
                GameAnalyticsManager.logGameDownload(
                    gameName = game.name,
                    status = "failed",
                    errorMessage = error.javaClass.simpleName
                )
                val message = context.getString(GameDownloadErrorMapper.resolveMessageRes(error))
                mainHandler.post { onError(message) }
            } finally {
                cacheZip?.delete()
                stagingDir?.deleteRecursively()
            }
        }
    }

    private suspend fun transferPackage(
        downloadUrl: URL,
        cacheZip: File,
        spec: GameIntegritySpec,
        mainHandler: Handler,
        postStage: (String) -> Unit,
        onProgress: (Int) -> Unit,
        onBytes: (Long, Long) -> Unit
    ) {
        var lastProgress = -1
        var lastBytesAt = 0L
        var receivedFirstByte = false
        GamePackageTransfer().download(
            url = downloadUrl.toString(),
            destination = cacheZip,
            expectedBytes = spec.sizeBytes,
            expectedSha256 = spec.sha256
        ) { bytes, total ->
            if (!receivedFirstByte) {
                receivedFirstByte = true
                postStage("downloading")
            }
            val progress = ((bytes * 100L) / total).toInt().coerceIn(0, 100)
            val now = SystemClock.elapsedRealtime()
            if (progress != lastProgress || now - lastBytesAt >= PROGRESS_THROTTLE_MS || bytes == total) {
                lastProgress = progress
                lastBytesAt = now
                mainHandler.post {
                    onProgress(progress)
                    onBytes(bytes, total)
                }
            }
        }
    }

    /** Tự sửa trạng thái DB nếu game thực tế đã đóng gói sẵn trong APK (vd: `tap_away_3D`). */
    private suspend fun repairBundledInstallIfPresent(context: Context, gameName: String): Boolean {
        if (!hasBundledGame(context, gameName)) {
            return false
        }
        GameCatalogSync.mutex.withLock {
            context.appContainer.database.gamesDao().updateDownloadStatus(gameName, 1)
        }
        return true
    }

    /** Đồng bộ lại DB nếu bản cài R2 đã tồn tại và khớp receipt SHA-256 trên máy. */
    private suspend fun repairVerifiedRemoteInstallIfPresent(
        context: Context,
        gameName: String,
        spec: GameIntegritySpec
    ): Boolean {
        if (!GameIntegrityManifestStore.hasVerifiedRemoteInstall(context, spec)) {
            return false
        }
        return GameCatalogSync.mutex.withLock {
            if (GameIntegrityManifestStore.hasVerifiedRemoteInstall(context, spec)) {
                context.appContainer.database.gamesDao().updateDownloadStatus(gameName, 1)
                true
            } else {
                false
            }
        }
    }

    /**
     * Luôn ưu tiên URL HTTPS chuẩn theo allowlist để tránh URL cũ sót trong DB làm hỏng lượt tải.
     * Always prefer the canonical allowlisted HTTPS URL so stale DB rows cannot break downloads.
     */
    private fun validateDownloadUrl(game: GameEntity, spec: GameIntegritySpec): URL {
        val expected = GamePackageSecurityPolicy.expectedUrl(spec.name)
        if (!GamePackageSecurityPolicy.isTrustedUrl(expected, spec.name)) {
            throw SecurityException("Untrusted package URL")
        }
        val configured = game.remoteUrl?.takeIf(String::isNotBlank)
        if (configured != null && configured != expected && BuildConfig.DEBUG) {
            Log.w(TAG, "Replacing stale DB remoteUrl for ${spec.name} with canonical R2 URL")
        }
        return URL(expected)
    }

    /** Kiểm tra game bundled trong APK / Check whether a game is bundled in the APK. */
    private fun hasBundledGame(context: Context, gameName: String): Boolean = try {
        context.assets.open("games/$gameName/index.html").use { true }
    } catch (_: Exception) {
        false
    }
}
