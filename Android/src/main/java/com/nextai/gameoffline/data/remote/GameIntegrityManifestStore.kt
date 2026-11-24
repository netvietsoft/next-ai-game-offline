package com.nextai.gameoffline.data.remote

import android.content.Context
import java.io.File
import org.json.JSONObject

/**
 * Metadata tin cậy cho mỗi gói R2 sinh từ manifest đóng gói trong APK.
 * Trusted package metadata loaded from the APK-bundled R2 integrity manifest.
 */
internal data class GameIntegritySpec(
    val name: String,
    val sizeBytes: Long,
    val sha256: String,
    val extractedSizeBytes: Long,
    val fileCount: Int
)

/**
 * Quản lý đọc/cache manifest toàn vẹn R2 (`r2_game_integrity.json`) và biên lai cài đặt cục bộ.
 * Tách khỏi [GameDownloadManager] theo SRP để giữ mỗi lớp ngắn gọn, dễ đọc và dễ bảo trì.
 * Manages APK-bundled R2 integrity manifest parsing/caching and verified install receipts.
 */
internal object GameIntegrityManifestStore {

    private const val INTEGRITY_ASSET = "r2_game_integrity.json"
    private const val INSTALL_RECEIPTS = "r2_game_install_receipts_v1"
    private const val EXPECTED_REMOTE_GAME_COUNT = 319
    private const val MAX_PACKAGE_BYTES = 128L * 1024L * 1024L
    const val MAX_EXTRACTED_BYTES = 128L * 1024L * 1024L
    const val MAX_FILE_COUNT = 10_000
    private val VALID_SHA256 = Regex("^[a-f0-9]{64}$")

    @Volatile
    private var cachedSpecs: Map<String, GameIntegritySpec>? = null

    /** Tra cứu metadata toàn vẹn nếu là game remote / Look up integrity metadata for a remote game. */
    fun specOrNull(context: Context, gameName: String): GameIntegritySpec? =
        loadAllSpecs(context)[gameName]

    /**
     * Chỉ tin bản cài remote khi `index.html` tồn tại và receipt khớp SHA-256 trong manifest hiện tại.
     * Trusts a remote install only when `index.html` exists and the receipt matches manifest SHA-256.
     */
    fun hasVerifiedRemoteInstall(context: Context, spec: GameIntegritySpec): Boolean {
        val gamesRoot = File(context.filesDir, "games")
        val target = File(gamesRoot, spec.name)
        val backup = File(gamesRoot, ".backup_${spec.name}")
        val receipt = context.getSharedPreferences(INSTALL_RECEIPTS, Context.MODE_PRIVATE)
            .getString(spec.name, null)
        if (receipt != spec.sha256) {
            return false
        }
        if (!target.exists() && backup.exists() && !backup.renameTo(target)) {
            return false
        }
        val index = File(target, "index.html")
        return index.isFile && index.length() > 0L
    }

    /** Lưu receipt bền vững trước khi cập nhật Room / Persist receipt before marking Room installed. */
    fun writeInstallReceipt(context: Context, spec: GameIntegritySpec) {
        val stored = context.getSharedPreferences(INSTALL_RECEIPTS, Context.MODE_PRIVATE)
            .edit()
            .putString(spec.name, spec.sha256)
            .commit()
        if (!stored) {
            throw SecurityException("Cannot persist install receipt")
        }
    }

    private fun loadAllSpecs(context: Context): Map<String, GameIntegritySpec> =
        cachedSpecs ?: synchronized(this) {
            cachedSpecs ?: parseManifest(context).also { cachedSpecs = it }
        }

    private fun parseManifest(context: Context): Map<String, GameIntegritySpec> {
        val json = context.assets.open(INTEGRITY_ASSET).bufferedReader().use { it.readText() }
        val root = JSONObject(json)
        if (root.getInt("schemaVersion") != 1 || root.getInt("gameCount") != EXPECTED_REMOTE_GAME_COUNT) {
            throw SecurityException("Unsupported integrity manifest")
        }
        val games = root.getJSONArray("games")
        if (games.length() != EXPECTED_REMOTE_GAME_COUNT) {
            throw SecurityException("Manifest count mismatch")
        }
        val result = LinkedHashMap<String, GameIntegritySpec>(games.length())
        for (index in 0 until games.length()) {
            val item = games.getJSONObject(index)
            val spec = GameIntegritySpec(
                name = item.getString("name"),
                sizeBytes = item.getLong("sizeBytes"),
                sha256 = item.getString("sha256"),
                extractedSizeBytes = item.getLong("extractedSizeBytes"),
                fileCount = item.getInt("fileCount")
            )
            if (!isValidSpecRecord(spec) || result.put(spec.name, spec) != null) {
                throw SecurityException("Invalid integrity record")
            }
        }
        return result
    }

    private fun isValidSpecRecord(spec: GameIntegritySpec): Boolean =
        GamePackageSecurityPolicy.isValidGameName(spec.name) &&
            VALID_SHA256.matches(spec.sha256) &&
            spec.sizeBytes in 1..MAX_PACKAGE_BYTES &&
            spec.extractedSizeBytes in 1..MAX_EXTRACTED_BYTES &&
            spec.fileCount in 1..MAX_FILE_COUNT
}
