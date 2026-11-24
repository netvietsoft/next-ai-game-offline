package com.nextai.gameoffline.presentation.game

import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader
import com.nextai.gameoffline.BuildConfig
import com.nextai.gameoffline.data.remote.GamePackageSecurityPolicy
import java.io.ByteArrayInputStream
import java.io.File

/**
 * Custom WebViewClient tăng cường bảo mật và tối ưu hóa tải tài nguyên cho Game.
 * Custom WebViewClient enforcing sandbox security and optimizing game resource loading.
 *
 * Biện pháp phòng vệ bảo mật (Security Hardening):
 * - Sử dụng WebViewAssetLoader để tải asset an toàn qua domain ảo https://appassets.androidplatform.net/
 * - Bỏ qua giới hạn CORS của file:// protocol và hỗ trợ đầy đủ ES6 module + WebWorker.
 * - Chặn đứng mọi nỗ lực điều hướng ra domain độc hại bên ngoài.
 */
class GameWebViewClient(
    private val context: Context,
    private val gameName: String,
    private val onPageFinishedLoading: () -> Unit
) : WebViewClient() {

    private val internalGamesDir = File(context.filesDir, "games")
    private val internalGameDir = File(internalGamesDir, gameName).canonicalFile

    init {
        require(GamePackageSecurityPolicy.isValidGameName(gameName)) { "Invalid game identifier" }
    }

    private val assetLoader = WebViewAssetLoader.Builder()
        .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context))
        .addPathHandler("/downloaded_games/", WebViewAssetLoader.InternalStoragePathHandler(context, internalGamesDir))
        .addPathHandler("/res/", WebViewAssetLoader.ResourcesPathHandler(context))
        .build()

    override fun shouldInterceptRequest(
        view: WebView?,
        request: WebResourceRequest?
    ): WebResourceResponse? {
        val uri = request?.url ?: return null
        if (!isTrustedAssetUri(uri)) {
            android.util.Log.w("GameWebViewClient", "Blocked external WebView resource host")
            return emptyResponse(403, "Forbidden")
        }
        val path = uri.path.orEmpty()
        val decodedRelativePath = Uri.decode(path.removePrefix("/"))
        if (!isSafeRelativePath(decodedRelativePath)) {
            return emptyResponse(403, "Forbidden")
        }
        val host = uri.host.orEmpty()
        var response: WebResourceResponse? = null

        // 1. Cho phép WebViewAssetLoader xử lý các tài nguyên tiêu chuẩn dưới /assets/ và /downloaded_games/
        // Allow WebViewAssetLoader to handle standard paths starting with /assets/ and /downloaded_games/
        if (host.equals("appassets.androidplatform.net", ignoreCase = true)) {
            response = assetLoader.shouldInterceptRequest(uri)
        }

        // 2. Xử lý fallback cho tài nguyên gọi dạng root-relative (/loading-logo.png, /data.json, /scripts/...)
        // Resolve root-relative fallback paths (/loading-logo.png, /data.json, /scripts/...)
        if (response == null && host.equals("appassets.androidplatform.net", ignoreCase = true)) {
            try {
                val relativePath = decodedRelativePath

                // A1. Kiểm tra trong bộ nhớ trong nếu là game tải về từ Cloudflare R2: context.filesDir/games/$gameName/$relativePath
                // Check internal storage first for R2 downloaded games: context.filesDir/games/$gameName/$relativePath
                val internalFile = File(internalGameDir, relativePath).canonicalFile
                val internalPrefix = internalGameDir.path + File.separator
                var stream: java.io.InputStream? = if (
                    internalFile.path.startsWith(internalPrefix) && internalFile.exists() && internalFile.isFile
                ) {
                    try { internalFile.inputStream() } catch (e: Exception) { null }
                } else {
                    null
                }

                // A2. Nếu không có trong bộ nhớ trong, kiểm tra trong assets: games/$gameName/$relativePath
                // If not found in internal storage, check inside assets folder: games/$gameName/$relativePath
                if (stream == null) {
                    stream = try {
                        context.assets.open("games/$gameName/$relativePath")
                    } catch (e: Exception) {
                        null
                    }
                }

                // B. Chỉ fallback vào bốn thư mục dùng chung đã đóng gói dưới assets/games.
                // Fall back only to the four bundled shared directories under assets/games.
                if (stream == null && isAllowedSharedGameAsset(relativePath)) {
                    stream = try {
                        context.assets.open("games/$relativePath")
                    } catch (e: Exception) {
                        null
                    }
                }

                // C. Chỉ cho phép danh sách thư viện root đã biết (gồm cả đường dẫn ../ từ game R2).
                // Allow only the known root-library allowlist, including ../ paths from R2 games.
                if (stream == null) {
                    val rootAssetPath = resolveAllowedRootAssetPath(relativePath)
                    if (rootAssetPath != null) {
                        stream = try {
                            context.assets.open(rootAssetPath)
                        } catch (e: Exception) {
                            null
                        }
                    }
                }

                if (stream != null) {
                    response = WebResourceResponse(getMimeType(path), "UTF-8", stream)
                } else if (path.endsWith("loading-logo.png", ignoreCase = true)) {
                    val logoStream = context.assets.open("loading-logo.png")
                    response = WebResourceResponse("image/png", "UTF-8", logoStream)
                } else if (path.endsWith("cordova.js", ignoreCase = true)) {
                    val mockCordova = """
                        (function() {
                            window.cordova = window.cordova || {
                                platformId: 'android',
                                version: '10.0.0',
                                exec: function() {},
                                define: function(id, f) { window.cordova.modules = window.cordova.modules || {}; window.cordova.modules[id] = f; },
                                require: function(id) { return (window.cordova.modules && window.cordova.modules[id]) || {}; }
                            };
                            setTimeout(function() {
                                var evt = document.createEvent('Events');
                                evt.initEvent('deviceready', false, false);
                                document.dispatchEvent(evt);
                            }, 40);
                        })();
                    """.trimIndent()
                    response = WebResourceResponse(
                        "application/javascript",
                        "UTF-8",
                        mockCordova.byteInputStream(Charsets.UTF_8)
                    )
                } else if (path.endsWith("cordova_plugins.js", ignoreCase = true)) {
                    val mockPlugins =
                        "if(window.cordova&&window.cordova.define){" +
                            "cordova.define('cordova/plugin_list',function(r,e,m){" +
                            "m.exports=[];m.metadata={};});}"
                    response = WebResourceResponse(
                        "application/javascript",
                        "UTF-8",
                        mockPlugins.byteInputStream(Charsets.UTF_8)
                    )
                }
            } catch (e: Exception) {
                // Ignore fallback error
            }
        }

        if (response == null) return emptyResponse(404, "Not Found")
        GameResourcePatcher.patchIfNeeded(gameName, decodedRelativePath, response)

        // 3. Đảm bảo MIME type chính xác cho WebAssembly, JavaScript, JSON và tài nguyên game
        // Ensure precise MIME types for WebAssembly, JavaScript, JSON, and game assets
        response.mimeType = getMimeType(path)

        // 4. Bổ sung CORS headers cho Web Worker và Fetch API trong game HTML5
        // Add CORS headers for Web Workers and Fetch API inside HTML5 games
        val headers = response.responseHeaders?.toMutableMap() ?: mutableMapOf()
        headers["Access-Control-Allow-Origin"] = TRUSTED_ORIGIN
        headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        headers["Content-Security-Policy"] = CONTENT_SECURITY_POLICY
        headers["X-Content-Type-Options"] = "nosniff"
        headers["Referrer-Policy"] = "no-referrer"
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.responseHeaders = headers

        return response
    }

    private fun getMimeType(path: String): String {
        return when {
            path.endsWith(".wasm", ignoreCase = true) -> "application/wasm"
            path.endsWith(".js", ignoreCase = true) ||
                path.endsWith(".mjs", ignoreCase = true) -> "application/javascript"
            path.endsWith(".json", ignoreCase = true) -> "application/json"
            path.endsWith(".html", ignoreCase = true) ||
                path.endsWith(".htm", ignoreCase = true) -> "text/html"
            path.endsWith(".css", ignoreCase = true) -> "text/css"
            path.endsWith(".png", ignoreCase = true) -> "image/png"
            path.endsWith(".jpg", ignoreCase = true) ||
                path.endsWith(".jpeg", ignoreCase = true) -> "image/jpeg"
            path.endsWith(".webp", ignoreCase = true) -> "image/webp"
            path.endsWith(".svg", ignoreCase = true) -> "image/svg+xml"
            path.endsWith(".mp3", ignoreCase = true) -> "audio/mpeg"
            path.endsWith(".ogg", ignoreCase = true) -> "audio/ogg"
            path.endsWith(".wav", ignoreCase = true) -> "audio/wav"
            path.endsWith(".webm", ignoreCase = true) -> "audio/webm"
            path.endsWith(".woff", ignoreCase = true) -> "font/woff"
            path.endsWith(".woff2", ignoreCase = true) -> "font/woff2"
            path.endsWith(".ttf", ignoreCase = true) -> "font/ttf"
            path.endsWith(".otf", ignoreCase = true) -> "font/otf"
            else -> "application/octet-stream"
        }
    }

    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val uri = request?.url ?: return true
        val url = uri.toString()

        // Chỉ main-frame trên origin HTTPS ảo và javascript nội trang được phép.
        // Only the virtual HTTPS origin and in-page javascript navigation are allowed.
        return if (isTrustedAssetUri(uri) || url == "about:blank" || uri.scheme == "javascript") {
            false
        } else {
            if (BuildConfig.DEBUG) {
                android.util.Log.w("GameWebViewClient", "Blocked external navigation outside sandbox")
            }
            true
        }
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        if (BuildConfig.DEBUG) {
            android.util.Log.i("GameWebViewClient", "[$gameName] Page loaded: $url")
        }

        // Chỉ chặn context menu và cấp focus cho cửa sổ game; không ghi đè touch-action/layout.
        // Only suppress context menu and grant window focus; never override touch-action/layout.
        val jsFocus = """
            (function() {
                try {
                    window.addEventListener('contextmenu', function(e) { e.preventDefault(); }, { passive: false });
                    window.focus();
                    if (document.body) { document.body.focus(); }
                } catch(e) {}
            })();
        """.trimIndent()
        view?.evaluateJavascript(jsFocus, null)

        onPageFinishedLoading()

        // Thực hiện mở khóa bổ sung sau 500ms và 1500ms cho các game khởi tạo async (WASM/Worker).
        // Additional delayed unlocks at 500ms and 1500ms for async/WASM game engines.
        view?.postDelayed({ onPageFinishedLoading() }, 500L)
        view?.postDelayed({ onPageFinishedLoading() }, 1_500L)
    }

    override fun onReceivedError(
        view: WebView?,
        request: WebResourceRequest?,
        error: android.webkit.WebResourceError?
    ) {
        super.onReceivedError(view, request, error)
        if (!BuildConfig.DEBUG) {
            return
        }
        if (request?.isForMainFrame == true) {
            android.util.Log.e(
                "GameWebViewClient",
                "Main frame error ${request.url}: ${error?.description} (${error?.errorCode})"
            )
        } else {
            android.util.Log.w(
                "GameWebViewClient",
                "Subresource error ${request?.url}: ${error?.description}"
            )
        }
    }

    override fun onReceivedHttpError(
        view: WebView?,
        request: WebResourceRequest?,
        errorResponse: WebResourceResponse?
    ) {
        super.onReceivedHttpError(view, request, errorResponse)
        if (BuildConfig.DEBUG) {
            android.util.Log.w(
                "GameWebViewClient",
                "HTTP ${errorResponse?.statusCode} for ${request?.url}"
            )
        }
    }

    /** Chỉ chấp nhận origin HTTPS do WebViewAssetLoader sở hữu. */
    private fun isTrustedAssetUri(uri: Uri): Boolean =
        uri.scheme.equals("https", ignoreCase = true) &&
            uri.host.equals(TRUSTED_HOST, ignoreCase = true) &&
            uri.userInfo == null &&
            uri.port == -1

    /** Từ chối đường dẫn rỗng, backslash và mọi phân đoạn traversal. */
    private fun isSafeRelativePath(path: String): Boolean =
        path.isNotBlank() &&
            '\u0000' !in path &&
            '\\' !in path &&
            path.split('/').none { it.isBlank() || it == "." || it == ".." }

    /** Chỉ cho phép thư viện dùng chung đã đóng gói trong assets/games. */
    private fun isAllowedSharedGameAsset(path: String): Boolean =
        SHARED_GAME_PREFIXES.any(path::startsWith)

    /**
     * Ánh xạ allowlist thư viện gốc dùng chung (kể cả `../jquery.min.js` từ game R2
     * tại `/downloaded_games/<lib>` hoặc `/assets/games/<lib>`).
     */
    private fun resolveAllowedRootAssetPath(path: String): String? {
        if (path in SHARED_ROOT_ASSETS || path.startsWith("icons/")) {
            return path
        }
        val stripped = when {
            path.startsWith("downloaded_games/") -> path.removePrefix("downloaded_games/")
            path.startsWith("assets/games/") -> path.removePrefix("assets/games/")
            else -> return null
        }
        return stripped.takeIf { it in SHARED_ROOT_ASSETS }
    }

    /** Tạo phản hồi rỗng an toàn / Build a safe empty response. */
    private fun emptyResponse(statusCode: Int, reason: String) = WebResourceResponse(
        "text/plain",
        "UTF-8",
        statusCode,
        reason,
        mapOf("Cache-Control" to "no-store"),
        ByteArrayInputStream(ByteArray(0))
    )

    companion object {
        private const val TRUSTED_HOST = "appassets.androidplatform.net"
        private const val TRUSTED_ORIGIN = "https://appassets.androidplatform.net"
        private const val CONTENT_SECURITY_POLICY =
            "default-src 'self' data: blob:; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:; " +
                "worker-src 'self' blob:; connect-src 'self' data: blob:; " +
                "style-src 'self' 'unsafe-inline' data: blob:; " +
                "img-src 'self' data: blob:; media-src 'self' data: blob:; " +
                "font-src 'self' data:; frame-src 'self'; object-src 'none'; " +
                "base-uri 'none'; form-action 'none'"
        private val SHARED_GAME_PREFIXES = listOf("fonts/", "iads/", "icons/", "plugins/")
        private val SHARED_ROOT_ASSETS = setOf(
            "cordova.js", "createjs.min.js", "detectmobilebrowser.js", "fetchLocal.js",
            "jquery.min.js", "loading-logo.png", "mobile-detect.js", "modernizr-2.6.2.min.js",
            "phaser.min.js", "proton.min.js", "TweenMax.min.js"
        )
    }
}
