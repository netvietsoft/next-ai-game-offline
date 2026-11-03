package com.nextai.gameoffline.presentation.game

import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader

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

    private val internalGamesDir = java.io.File(context.filesDir, "games")

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
        val host = uri.host ?: ""
        var response: WebResourceResponse? = null

        // 1. Cho phép WebViewAssetLoader xử lý các tài nguyên tiêu chuẩn dưới /assets/ và /downloaded_games/
        // Allow WebViewAssetLoader to handle standard paths starting with /assets/ and /downloaded_games/
        if (host.equals("appassets.androidplatform.net", ignoreCase = true)) {
            response = assetLoader.shouldInterceptRequest(uri)
        }

        val path = uri.path ?: ""

        // 2. Xử lý fallback cho tài nguyên gọi dạng root-relative (/loading-logo.png, /data.json, /scripts/...)
        // Resolve root-relative fallback paths (/loading-logo.png, /data.json, /scripts/...)
        if (response == null && host.equals("appassets.androidplatform.net", ignoreCase = true)) {
            try {
                val relativePath = path.removePrefix("/")

                // A1. Kiểm tra trong bộ nhớ trong nếu là game tải về từ Cloudflare R2: context.filesDir/games/$gameName/$relativePath
                // Check internal storage first for R2 downloaded games: context.filesDir/games/$gameName/$relativePath
                val internalFile = java.io.File(internalGamesDir, "$gameName/$relativePath")
                var stream: java.io.InputStream? = if (internalFile.exists() && internalFile.isFile) {
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

                // B. Nếu không có trong thư mục game, kiểm tra ở thư mục assets gốc
                // Check root assets if not found in game folder (e.g. loading-logo.png, phaser.min.js)
                if (stream == null) {
                    stream = try {
                        context.assets.open(relativePath)
                    } catch (e: Exception) {
                        null
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
                    response = WebResourceResponse("application/javascript", "UTF-8", mockCordova.byteInputStream(Charsets.UTF_8))
                } else if (path.endsWith("cordova_plugins.js", ignoreCase = true)) {
                    val mockPlugins = "if(window.cordova&&window.cordova.define){cordova.define('cordova/plugin_list',function(r,e,m){m.exports=[];m.metadata={};});}"
                    response = WebResourceResponse("application/javascript", "UTF-8", mockPlugins.byteInputStream(Charsets.UTF_8))
                }
            } catch (e: Exception) {
                // Ignore fallback error
            }
        }

        if (response == null) return null

        // 3. Đảm bảo MIME type chính xác cho WebAssembly, JavaScript, JSON và tài nguyên game
        // Ensure precise MIME types for WebAssembly, JavaScript, JSON, and game assets
        response.mimeType = getMimeType(path)

        // 4. Bổ sung CORS headers cho Web Worker và Fetch API trong game HTML5
        // Add CORS headers for Web Workers and Fetch API inside HTML5 games
        val headers = response.responseHeaders?.toMutableMap() ?: mutableMapOf()
        headers["Access-Control-Allow-Origin"] = "*"
        headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response.responseHeaders = headers

        return response
    }

    private fun getMimeType(path: String): String {
        return when {
            path.endsWith(".wasm", ignoreCase = true) -> "application/wasm"
            path.endsWith(".js", ignoreCase = true) || path.endsWith(".mjs", ignoreCase = true) -> "application/javascript"
            path.endsWith(".json", ignoreCase = true) -> "application/json"
            path.endsWith(".html", ignoreCase = true) || path.endsWith(".htm", ignoreCase = true) -> "text/html"
            path.endsWith(".css", ignoreCase = true) -> "text/css"
            path.endsWith(".png", ignoreCase = true) -> "image/png"
            path.endsWith(".jpg", ignoreCase = true) || path.endsWith(".jpeg", ignoreCase = true) -> "image/jpeg"
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
        val url = request?.url?.toString() ?: return false

        // Chỉ cho phép URL local trong assets domain hoặc file:// android_asset hoặc data/about/blob/javascript
        return if (url.startsWith("https://appassets.androidplatform.net/") ||
            url.startsWith("file:///android_asset/") ||
            url.startsWith("about:") ||
            url.startsWith("data:") ||
            url.startsWith("blob:") ||
            url.startsWith("javascript:")) {
            false // Cho phép WebView tự nạp
        } else {
            android.util.Log.w("GameWebViewClient", "Chặn URL ngoài sandbox: $url")
            true // Chặn không cho mở URL bên ngoài
        }
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        android.util.Log.i("GameWebViewClient", "[$gameName] Nạp trang thành công: $url")

        // Chỉ chặn context menu (giữ đè menu chuột phải) và cấp focus cho cửa sổ game.
        // TUYỆT ĐỐI KHÔNG can thiệp CSS touch-action hoặc kích thước layout của game!
        // Only suppress context menu and ensure window focus.
        // NEVER inject CSS overriding touch-action or dimensions!
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

        // Thực hiện mở khóa bổ sung sau 500ms và 1500ms để đón các game khởi tạo async (WASM / WebWorker)
        // Additional delayed unlocks at 500ms and 1500ms for async/WASM game engines
        view?.postDelayed({
            onPageFinishedLoading()
        }, 500)
        view?.postDelayed({
            onPageFinishedLoading()
        }, 1500)
    }

    override fun onReceivedError(
        view: WebView?,
        request: WebResourceRequest?,
        error: android.webkit.WebResourceError?
    ) {
        super.onReceivedError(view, request, error)
        if (request?.isForMainFrame == true) {
            android.util.Log.e("GameWebViewClient", "Lỗi tải Main Frame ${request.url}: ${error?.description} (${error?.errorCode})")
        } else {
            android.util.Log.w("GameWebViewClient", "Lỗi tài nguyên phụ ${request?.url}: ${error?.description}")
        }
    }

    override fun onReceivedHttpError(
        view: WebView?,
        request: WebResourceRequest?,
        errorResponse: WebResourceResponse?
    ) {
        super.onReceivedHttpError(view, request, errorResponse)
        android.util.Log.w("GameWebViewClient", "Lỗi HTTP ${errorResponse?.statusCode} cho ${request?.url}")
    }
}
