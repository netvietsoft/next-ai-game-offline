package com.nextai.gameoffline.data.remote

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.nextai.gameoffline.GameApplication
import com.nextai.gameoffline.data.local.entity.GameEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedInputStream
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.zip.ZipInputStream

/**
 * Trình quản lý tải động mini-game theo yêu cầu từ Cloudflare R2 / Server CDN.
 * Dynamic on-demand game download manager from Cloudflare R2 / CDN server.
 *
 * Tính năng chính (Key features):
 * 1. Kiểm tra trạng thái tồn tại cục bộ của game (trong assets gói sẵn hoặc trong bộ nhớ trong filesDir).
 * 2. Tải file ZIP nén từ Cloudflare R2 và giải nén trực tiếp vào `context.filesDir/games/{gameName}`.
 * 3. Báo cáo tiến trình tải theo thời gian thực (0% - 100%).
 * 4. Cập nhật trạng thái `is_downloaded = 1` trong SQLite Room Database khi hoàn tất.
 */
object GameDownloadManager {

    private const val TAG = "GameDownloadManager"

    // Cloudflare R2 CDN Base URL (Có thể cấu hình động qua Backend hoặc Remote Config)
    // Cloudflare R2 CDN Base URL (Configurable via Backend or Remote Config)
    private const val DEFAULT_R2_BASE_URL = "https://pub-r2.nextai.games/games"

    /**
     * Kiểm tra xem game đã sẵn sàng để chơi ngay hay chưa.
     * Check if game is ready to play immediately (bundled or downloaded).
     */
    fun isGameInstalled(context: Context, gameName: String): Boolean {
        // 1. Kiểm tra trong bộ nhớ trong (Downloaded games from R2)
        val internalGameIndex = File(context.filesDir, "games/$gameName/index.html")
        if (internalGameIndex.exists() && internalGameIndex.length() > 0) {
            return true
        }

        // 2. Kiểm tra trong thư mục assets tích hợp sẵn (Top 100 bundled games)
        return try {
            context.assets.open("games/$gameName/index.html").use { true }
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Lấy đường dẫn URL an toàn để nạp vào WebView.
     * Get secure URL to load into WebView.
     */
    fun getGameLaunchUrl(context: Context, gameName: String): String {
        val internalGameIndex = File(context.filesDir, "games/$gameName/index.html")
        return if (internalGameIndex.exists() && internalGameIndex.length() > 0) {
            "https://appassets.androidplatform.net/downloaded_games/$gameName/index.html"
        } else {
            "https://appassets.androidplatform.net/assets/games/$gameName/index.html"
        }
    }

    /**
     * Tải gói game ZIP từ Cloudflare R2 và giải nén vào bộ nhớ máy.
     * Download game ZIP from Cloudflare R2 and extract to local storage.
     */
    suspend fun downloadAndExtractGame(
        context: Context,
        game: GameEntity,
        onProgress: (Int) -> Unit,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) = withContext(Dispatchers.IO) {
        val mainHandler = Handler(Looper.getMainLooper())
        val downloadUrl = if (!game.remoteUrl.isNullOrBlank()) {
            game.remoteUrl
        } else {
            "$DEFAULT_R2_BASE_URL/${game.name}.zip"
        }

        val cacheZipFile = File(context.cacheDir, "${game.name}_temp.zip")
        val targetGameDir = File(context.filesDir, "games/${game.name}")

        try {
            Log.i(TAG, "Bắt đầu tải game: ${game.name} từ URL: $downloadUrl")
            val url = URL(downloadUrl)
            val connection = url.openConnection() as HttpURLConnection
            connection.connectTimeout = 15000
            connection.readTimeout = 30000
            connection.instanceFollowRedirects = true
            connection.connect()

            val responseCode = connection.responseCode
            if (responseCode !in 200..299) {
                throw Exception("Máy chủ Cloudflare R2 phản hồi mã HTTP $responseCode: Không tìm thấy gói game hoặc chưa kích hoạt Public Bucket.")
            }

            val fileLength = connection.contentLength
            val inputStream = BufferedInputStream(connection.inputStream)
            val outputStream = FileOutputStream(cacheZipFile)

            val data = ByteArray(8192)
            var total: Long = 0
            var count: Int

            while (inputStream.read(data).also { count = it } != -1) {
                total += count
                outputStream.write(data, 0, count)
                if (fileLength > 0) {
                    val progress = ((total * 100) / fileLength).toInt()
                    mainHandler.post { onProgress(progress) }
                }
            }

            outputStream.flush()
            outputStream.close()
            inputStream.close()
            connection.disconnect()

            // Giải nén file ZIP vào thư mục đích
            // Extract ZIP into destination folder
            extractZipFile(cacheZipFile, targetGameDir)

            // Xóa file ZIP tạm trong bộ nhớ cache
            // Clean up temporary ZIP file in cache
            if (cacheZipFile.exists()) {
                cacheZipFile.delete()
            }

            // Cập nhật trạng thái trong Room SQLite Database
            // Update downloaded status in Room Database
            val db = GameApplication.instance.database
            db.gamesDao().updateDownloadStatus(game.name, 1)

            Log.i(TAG, "Tải và cài đặt thành công game: ${game.name} tại: ${targetGameDir.absolutePath}")
            mainHandler.post { onSuccess() }

        } catch (e: Exception) {
            Log.e(TAG, "Lỗi khi tải game ${game.name}: ${e.message}", e)
            if (cacheZipFile.exists()) {
                cacheZipFile.delete()
            }
            val errorMsg = e.localizedMessage ?: "Lỗi kết nối tới kho game Cloudflare R2"
            mainHandler.post { onError(errorMsg) }
        }
    }

    /**
     * Giải nén file ZIP an toàn chống lỗ hổng Zip Slip.
     * Safely extract ZIP file preventing Zip Slip vulnerability.
     */
    private fun extractZipFile(zipFile: File, targetDir: File) {
        if (!targetDir.exists()) {
            targetDir.mkdirs()
        }

        val canonicalTargetPath = targetDir.canonicalPath
        ZipInputStream(BufferedInputStream(zipFile.inputStream())).use { zis ->
            var entry = zis.nextEntry
            while (entry != null) {
                val newFile = File(targetDir, entry.name)
                // Chặn lỗ hổng bảo mật Zip Slip
                // Prevent Zip Slip vulnerability
                if (!newFile.canonicalPath.startsWith(canonicalTargetPath)) {
                    throw SecurityException("Phát hiện tệp zip độc hại (Zip Slip attempt): ${entry.name}")
                }

                if (entry.isDirectory) {
                    newFile.mkdirs()
                } else {
                    newFile.parentFile?.mkdirs()
                    FileOutputStream(newFile).use { fos ->
                        val buffer = ByteArray(8192)
                        var len: Int
                        while (zis.read(buffer).also { len = it } != -1) {
                            fos.write(buffer, 0, len)
                        }
                        fos.flush()
                    }
                }
                zis.closeEntry()
                entry = zis.nextEntry
            }
        }
    }
}
