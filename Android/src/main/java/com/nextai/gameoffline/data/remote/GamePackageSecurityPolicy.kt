package com.nextai.gameoffline.data.remote

import java.net.URL
import java.util.Locale

/**
 * Chính sách thuần Kotlin cho tên game, ZIP entry và URL R2.
 * Pure Kotlin policy for game names, ZIP entries, and R2 URLs.
 */
internal object GamePackageSecurityPolicy {

    private const val TRUSTED_HOST = "pub-087272be70054d98a65246778849e2d0.r2.dev"
    private const val TRUSTED_BASE_URL = "https://$TRUSTED_HOST/games"
    // Cho phép chữ hoa/thường để khớp chính xác các ID hợp lệ trong danh mục/manifest (vd: tap_away_3D),
    // đồng thời vẫn chặn tuyệt đối ký tự traversal, khoảng trắng hoặc dấu gạch chéo.
    // Allow mixed-case ASCII IDs from the catalog/manifest (e.g., tap_away_3D) while blocking traversal chars.
    private val validGameName = Regex("^[A-Za-z0-9_]+$")
    private val blockedExtensions = setOf("apk", "aab", "dex", "jar", "so", "class")

    /** Kiểm tra ID game / Validate a game identifier. */
    fun isValidGameName(name: String): Boolean = validGameName.matches(name)

    /** Tạo URL canonical cho một game / Build the canonical URL for one game. */
    fun expectedUrl(name: String): String {
        require(isValidGameName(name)) { "Invalid game identifier" }
        return "$TRUSTED_BASE_URL/$name.zip"
    }

    /**
     * Chỉ chấp nhận URL HTTPS canonical, không port lạ, user-info, query hay fragment.
     * Accept only the canonical HTTPS URL with no custom port, user-info, query, or fragment.
     */
    fun isTrustedUrl(candidate: String, gameName: String): Boolean = try {
        if (candidate != expectedUrl(gameName)) {
            false
        } else {
            val url = URL(candidate)
            url.protocol == "https" &&
                url.host.equals(TRUSTED_HOST, ignoreCase = true) &&
                (url.port == -1 || url.port == 443) &&
                url.userInfo == null &&
                url.query == null &&
                url.ref == null &&
                url.path == "/games/$gameName.zip"
        }
    } catch (_: Exception) {
        false
    }

    /** Kiểm tra path ZIP chống traversal / Validate a ZIP path against traversal. */
    fun isSafeZipEntry(name: String): Boolean =
        name.isNotBlank() &&
            '\u0000' !in name &&
            '\\' !in name &&
            !name.startsWith('/') &&
            name.split('/').none { it.isBlank() || it == "." || it == ".." }

    /** Chặn Android executable tải ngoài Play / Block Android executable payloads. */
    fun isBlockedExecutable(fileName: String): Boolean =
        fileName.substringAfterLast('.', missingDelimiterValue = "")
            .lowercase(Locale.US) in blockedExtensions
}
