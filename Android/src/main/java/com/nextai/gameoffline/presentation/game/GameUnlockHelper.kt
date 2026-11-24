package com.nextai.gameoffline.presentation.game

import android.os.Handler
import android.os.Looper
import android.util.Log
import android.webkit.WebView
import com.nextai.gameoffline.BuildConfig
import java.lang.ref.WeakReference

/**
 * Trình hỗ trợ mở khóa và kích hoạt trò chơi HTML5 / Construct 2 / Construct 3 / Phaser.
 * Helper to unlock and activate HTML5 / Construct 2 / Construct 3 / Phaser mini-games.
 *
 * Lý do cốt lõi (Root Cause):
 * 1. Các game của 720 Media kiểm tra bản quyền nội bộ qua `clearLocalStorage`. Nếu Native Shell
 *    không truyền đúng mã khóa dự án (hoặc cấu hình PixiJS như `jigsaw_puzzle`), biến kiểm tra
 *    trong game giữ nguyên `false` làm game dừng ở màn hình `0%` hoặc khóa thao tác chạm.
 * 2. Nhiều game Construct 3 (như `#29 knife_hit`) cài `setAudioEnabled` gọi `System.Signal(...)`.
 *    Nếu gọi `c3_callFunction("setAudioEnabled")` trước khi layout đầu tiên chạy (`isRuntimeReady`
 *    còn `false`), C3 đẩy trigger `On Signal` vào hàng đợi trễ nhưng lại pop ngăn xếp signal ngay,
 *    gây lỗi `Uncaught (in promise) Error: not in a signal` làm hỏng tiến trình khởi tạo màn hình.
 *    Do đó chỉ kích hoạt `setAudioEnabled`/`setAdsTimer`/`setReadyToShowAds` sau `gameLoaded()`.
 */
object GameUnlockHelper {

    private const val TAG = "NextAIGameUnlock"
    internal const val GAME_LOADED_UNLOCK_DELAY_MS = 80L
    private val mainHandler: Handler by lazy { Handler(Looper.getMainLooper()) }

    /**
     * Biểu thức JS an toàn đọc khóa dự án Construct 3 mà không ném `ReferenceError`/`TypeError`
     * trên các game non-C3 hoặc game C3 chạy trong Web Worker (`_localRuntime == null`).
     * Null-safe IIFE extracting the dynamic Construct 3 key without throwing on non-C3/Worker games.
     */
    internal val DYNAMIC_C3_KEY_EXPR: String = """
        (function() {
            var iface = window.c3_runtimeInterface;
            if (!iface) {
                return null;
            }
            var rt = iface._localRuntime ||
                (typeof iface._GetLocalRuntime === 'function' ? iface._GetLocalRuntime() : null);
            if (!rt || !rt._projectName) {
                return null;
            }
            return "" + rt._projectName + rt._projectVersion +
                rt._originalViewportHeight + rt._originalViewportWidth;
        })()
    """.trimIndent()

    /**
     * Fallback toàn cục đọc khóa Construct 3 trực tiếp từ `./data.json` nội bộ (cache vào
     * `window.__nextaiC3Key`) khi `_localRuntime` bị minify hoặc chạy trong Web Worker.
     * Universal local `./data.json` fallback for C3 games with minified or Worker runtimes.
     */
    internal val DYNAMIC_C3_DATA_JSON_UNLOCK_SCRIPT: String = """
        (function() {
            if (typeof window.c3_callFunction !== 'function') {
                return;
            }
            if (window.__nextaiC3Key) {
                window.c3_callFunction("clearLocalStorage", [window.__nextaiC3Key]);
                return;
            }
            if (window.__nextaiC3KeyLoading) {
                return;
            }
            window.__nextaiC3KeyLoading = true;
            fetch('./data.json')
                .then(function(resp) {
                    return resp && resp.ok ? resp.json() : null;
                })
                .then(function(data) {
                    var p = data && data.project;
                    if (!p || !p.length) {
                        return;
                    }
                    var key = "" + p[0] + (p[16] || "") + p[11] + p[10];
                    window.__nextaiC3Key = key;
                    if (typeof window.c3_callFunction === 'function') {
                        window.c3_callFunction("clearLocalStorage", [key]);
                    }
                })
                .catch(function() {})
                .finally(function() {
                    window.__nextaiC3KeyLoading = false;
                });
        })();
    """.trimIndent()

    /**
     * Kiểm tra game có script mở khóa riêng hay không.
     * Returns whether the given game has a dedicated unlock script in [GameUnlockCatalog].
     */
    internal fun hasSpecificUnlock(gameName: String): Boolean {
        return GameUnlockCatalog.contains(gameName)
    }

    /**
     * Trả về script mở khóa chuyên biệt cho unit test và kiểm chứng nội bộ.
     * Returns the dedicated unlock script for internal verification and JVM tests.
     */
    internal fun specificUnlockScript(gameName: String): String? {
        return GameUnlockCatalog.scriptFor(gameName)
    }

    /**
     * Xác định có được phép gọi `window.clearLocalStorage()` không tham số cho game hay không.
     * Bỏ qua khi game đã có script tĩnh hoặc khi hàm `clearLocalStorage()` của game dùng để xóa
     * tiến trình lưu người chơi (`mahjong_deluxe`, `wordly`, `nonogram`).
     */
    internal fun shouldInvokeEmptyClearLocalStorage(gameName: String): Boolean {
        return !GameUnlockCatalog.contains(gameName) &&
            !GameUnlockCatalog.shouldSkipEmptyClearLocalStorage(gameName)
    }

    /**
     * Tạo chuỗi JS gọi `c3_callFunction("clearLocalStorage", [...])` với khóa động đã thoát ký tự
     * an toàn để chống vỡ cú pháp hoặc JS injection.
     * Builds the dynamic Construct 3 unlock call with properly escaped JS string literals.
     */
    internal fun buildDynamicC3UnlockScript(rawResult: String?): String? {
        val cleanKey = rawResult
            ?.trim()
            ?.removeSurrounding("\"")
            ?.trim()
        if (cleanKey.isNullOrEmpty() || cleanKey == "null" || cleanKey == "undefined") {
            return null
        }
        val escaped = escapeJsStringLiteral(cleanKey)
        return "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"$escaped\"]);"
    }

    /**
     * Dựng script mở khóa chung cho Construct 2 / Construct 3 / HTML5.
     * - Bỏ qua `window.clearLocalStorage()` rỗng khi game đã có script riêng hoặc khi hàm đó xóa
     *   dữ liệu save của người chơi.
     * - Chỉ gọi nhóm tín hiệu runtime C3 (`setAudioEnabled`, `setAdsTimer`, `setReadyToShowAds`)
     *   khi [includeC3RuntimeSignals] là `true` (sau `gameLoaded()`) và chỉ chạy một lần duy nhất
     *   để tránh lỗi `Error: not in a signal` khi layout đầu tiên chưa sẵn sàng.
     */
    internal fun buildGeneralUnlockScript(
        includeEmptyClearLocalStorage: Boolean,
        includeC3RuntimeSignals: Boolean = true,
        audioEnabled: Boolean = true
    ): String {
        val clearFallbackLine = if (includeEmptyClearLocalStorage) {
            """
                            if (typeof window.clearLocalStorage === 'function') {
                                try { window.clearLocalStorage(); } catch(e) {}
                            }
            """.trimEnd()
        } else {
            ""
        }

        val audioFlag = if (audioEnabled) "true" else "false"
        val c3SignalsBlock = if (includeC3RuntimeSignals) {
            """
                            if (typeof c3_callFunction === 'function' && !window.__nextaiC3SignalsApplied) {
                                window.__nextaiC3SignalsApplied = true;
                                try {
                                    c3_callFunction("setAudioEnabled", [$audioFlag]);
                                    c3_callFunction("setAdsTimer", [90]);
                                    c3_callFunction("setReadyToShowAds");
                                } catch(e) {}
                            }
            """.trimEnd()
        } else {
            ""
        }

        return """
                    (function() {
                        try {
                            if (typeof c2_callFunction === 'function') {
                                var c2Rt = window.cr_getC2Runtime && window.cr_getC2Runtime();
                                var c2Key = (c2Rt && c2Rt.projectName) || "";
                                if (c2Key) {
                                    c2_callFunction("clearLocalStorage", [c2Key]);
                                }
                                c2_callFunction("setAudioEnabled", [$audioFlag]);
                            }$clearFallbackLine$c3SignalsBlock
                            window.focus();
                            if (document.body) {
                                document.body.focus();
                            }
                        } catch(err) {
                            console.warn("[NextAI] Unlock fallback warning: " + err);
                        }
                    })();
                """.trimIndent()
    }

    /**
     * Thoát các ký tự điều khiển và dấu ngoặc kép cho chuỗi JS thuần (chạy được trên JVM test).
     * Escapes special characters for a double-quoted JavaScript string literal.
     */
    private fun escapeJsStringLiteral(value: String): String {
        val builder = StringBuilder(value.length)
        for (ch in value) {
            when (ch) {
                '\\' -> builder.append("\\\\")
                '"' -> builder.append("\\\"")
                '\n' -> builder.append("\\n")
                '\r' -> builder.append("\\r")
                '\t' -> builder.append("\\t")
                '\u2028' -> builder.append("\\u2028")
                '\u2029' -> builder.append("\\u2029")
                else -> builder.append(ch)
            }
        }
        return builder.toString()
    }

    /**
     * Mở khóa trò chơi một cách an toàn và toàn diện, dùng `WeakReference` để không giữ WebView
     * sau khi `GameActivity` đã đóng.
     * Safely unlocks the mini-game using a `WeakReference` so a destroyed WebView is never retained.
     */
    fun unlockGame(
        webView: WebView?,
        gameName: String,
        isRuntimeReady: Boolean = false,
        audioEnabled: Boolean = true,
        delayMs: Long = 0L
    ) {
        if (webView == null) {
            return
        }
        val webViewRef = WeakReference(webView)
        val task = Runnable {
            val targetWebView = webViewRef.get() ?: return@Runnable
            if (!targetWebView.isAttachedToWindow) {
                return@Runnable
            }
            executeUnlockScripts(
                targetWebView = targetWebView,
                webViewRef = webViewRef,
                gameName = gameName,
                isRuntimeReady = isRuntimeReady,
                audioEnabled = audioEnabled
            )
        }
        if (delayMs > 0L) {
            mainHandler.postDelayed(task, delayMs)
        } else {
            mainHandler.post(task)
        }
    }

    private fun executeUnlockScripts(
        targetWebView: WebView,
        webViewRef: WeakReference<WebView>,
        gameName: String,
        isRuntimeReady: Boolean,
        audioEnabled: Boolean
    ) {
        try {
            val specificScript = GameUnlockCatalog.scriptFor(gameName)
            if (specificScript != null) {
                if (BuildConfig.DEBUG) {
                    Log.i(TAG, "[$gameName] Running dedicated unlock script (ready=$isRuntimeReady)")
                }
                targetWebView.evaluateJavascript(specificScript, null)
            } else {
                targetWebView.evaluateJavascript(DYNAMIC_C3_KEY_EXPR) { result ->
                    val activeWebView = webViewRef.get() ?: return@evaluateJavascript
                    if (!activeWebView.isAttachedToWindow) {
                        return@evaluateJavascript
                    }
                    val dynamicScript = buildDynamicC3UnlockScript(result)
                    if (dynamicScript != null) {
                        if (BuildConfig.DEBUG) {
                            Log.i(TAG, "[$gameName] Applying dynamic Construct 3 unlock key")
                        }
                        activeWebView.evaluateJavascript(dynamicScript, null)
                    } else {
                        activeWebView.evaluateJavascript(DYNAMIC_C3_DATA_JSON_UNLOCK_SCRIPT, null)
                    }
                }
            }

            val generalUnlockJs = buildGeneralUnlockScript(
                includeEmptyClearLocalStorage = shouldInvokeEmptyClearLocalStorage(gameName),
                includeC3RuntimeSignals = isRuntimeReady,
                audioEnabled = audioEnabled
            )
            targetWebView.evaluateJavascript(generalUnlockJs, null)
        } catch (error: Exception) {
            if (BuildConfig.DEBUG) {
                Log.e(TAG, "[$gameName] Exception in unlockGame", error)
            }
        }
    }
}
