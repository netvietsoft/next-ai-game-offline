package com.nextai.gameoffline.presentation.game

import android.webkit.WebResourceResponse
import java.io.ByteArrayInputStream

/**
 * Bộ vá tài nguyên JS an toàn trên đường tải của [GameWebViewClient] mà không làm thay đổi
 * gói ZIP trên R2 (giữ nguyên toàn vẹn SHA-256 trong `r2_game_integrity.json`).
 * Safe in-flight JS resource patcher for [GameWebViewClient] that preserves R2 ZIP SHA-256 integrity.
 *
 * Lý do cốt lõi (Root Cause):
 * 5 game CreateJS từ kho R2 (`memory_chess`, `color_link`, `dig_dig_clicker`, `one_stroke`,
 * `slide_roll`) chứa đoạn kiểm tra hạn dùng `cerify_key`/`build_id` trong `js/plugins.js`.
 * Khi đồng hồ thiết bị vượt ngày hết hạn, `checkVerifyData()` trả về `true` làm màn hình hiện
 * "This version has expired / outdated" và `setGameLaunch()` rơi vào vòng lặp vô hạn `while(true)`.
 * Chèn ghi đè `function checkVerifyData(){return false;}` ở cuối `js/plugins.js` giúp vô hiệu hóa
 * bộ đếm hết hạn mà vẫn giữ nguyên mọi hàm tiện ích (`addCommas`, `swapArray`, `getAnglePosition`).
 */
internal object GameResourcePatcher {

    internal const val TIMEBOMB_OVERRIDE_SUFFIX =
        "\n;function checkVerifyData(){return false;}\n"

    private val TIMEBOMB_PLUGIN_GAMES: Set<String> = setOf(
        "memory_chess",
        "color_link",
        "dig_dig_clicker",
        "one_stroke",
        "slide_roll"
    )

    /**
     * Kiểm tra tài nguyên đang tải có cần vá bộ đếm hết hạn `cerify_key` hay không.
     * Returns whether the requested game asset needs the `checkVerifyData` expiry bypass.
     */
    internal fun needsTimebombBypass(gameName: String, relativePath: String): Boolean {
        if (gameName !in TIMEBOMB_PLUGIN_GAMES) {
            return false
        }
        return relativePath.equals("js/plugins.js", ignoreCase = true) ||
            relativePath.endsWith("/js/plugins.js", ignoreCase = true)
    }

    /**
     * Nối hàm ghi đè `checkVerifyData` vào cuối nội dung `plugins.js` cho JVM unit test và runtime.
     * Appends the `checkVerifyData` bypass suffix to `plugins.js` content cleanly.
     */
    internal fun patchPluginsScript(originalJs: String): String {
        return originalJs + TIMEBOMB_OVERRIDE_SUFFIX
    }

    /**
     * Vá luồng dữ liệu của [WebResourceResponse] nếu khớp danh sách game bị khóa hạn dùng.
     * Patches the response stream in-place when targeting one of the expiry-gated `plugins.js` files.
     */
    fun patchIfNeeded(
        gameName: String,
        relativePath: String,
        response: WebResourceResponse
    ): WebResourceResponse {
        if (!needsTimebombBypass(gameName, relativePath)) {
            return response
        }
        val sourceStream = response.data ?: return response
        return try {
            val originalText = sourceStream.bufferedReader(Charsets.UTF_8).use { it.readText() }
            val patchedBytes = patchPluginsScript(originalText).toByteArray(Charsets.UTF_8)
            response.data = ByteArrayInputStream(patchedBytes)
            response
        } catch (_: Exception) {
            response
        }
    }
}
