package com.nextai.gameoffline.presentation.game

import android.annotation.SuppressLint
import android.app.Activity
import android.util.Log
import android.webkit.ConsoleMessage
import android.webkit.JsResult
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.webkit.ServiceWorkerClientCompat
import androidx.webkit.ServiceWorkerControllerCompat
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewFeature
import com.nextai.gameoffline.BuildConfig

/**
 * Cấu hình bảo mật sandbox cho WebView, ServiceWorker và chế độ toàn màn hình (Immersive Mode).
 * Tách hoàn toàn khỏi [GameActivity] để giữ Activity mỏng và dễ đọc.
 * Configures WebView security hardening, ServiceWorker sandboxing, and immersive system UI hiding.
 */
internal object GameWebViewConfigurator {

    private const val TAG = "GameWebViewConfig"

    /**
     * Áp dụng thiết lập WebView an toàn (chặn file/content access, bật Safe Browsing,
     * giữ nguyên viewport 1:1 cho cảm ứng canvas HTML5).
     * Applies hardened WebView settings while preserving 1:1 HTML5 canvas touch mapping.
     */
    @SuppressLint("SetJavaScriptEnabled")
    fun applyHardenedSettings(webView: WebView) {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowContentAccess = false
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            javaScriptCanOpenWindowsAutomatically = false
            setSupportMultipleWindows(false)
            loadWithOverviewMode = true
            useWideViewPort = true
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            cacheMode = WebSettings.LOAD_DEFAULT
            mediaPlaybackRequiresUserGesture = false
        }
        if (WebViewFeature.isFeatureSupported(WebViewFeature.SAFE_BROWSING_ENABLE)) {
            WebSettingsCompat.setSafeBrowsingEnabled(webView.settings, true)
        }
    }

    /** Tạo [WebChromeClient] tự xác nhận dialog JS và chỉ log console ở bản debug. */
    fun createWebChromeClient(gameName: String): WebChromeClient {
        return object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                if (BuildConfig.DEBUG) {
                    Log.d(
                        "NextAIGame",
                        "[$gameName] JS: ${consoleMessage?.message()} " +
                            "(${consoleMessage?.sourceId()}:${consoleMessage?.lineNumber()})"
                    )
                }
                return true
            }

            override fun onJsAlert(
                view: WebView?,
                url: String?,
                message: String?,
                result: JsResult?
            ): Boolean {
                result?.confirm()
                return true
            }

            override fun onJsConfirm(
                view: WebView?,
                url: String?,
                message: String?,
                result: JsResult?
            ): Boolean {
                result?.confirm()
                return true
            }
        }
    }

    /** Áp cùng allowlist lên Service Worker để JS tải về không thể né `WebViewClient`. */
    fun attachServiceWorkerSandbox(client: GameWebViewClient) {
        if (!WebViewFeature.isFeatureSupported(WebViewFeature.SERVICE_WORKER_BASIC_USAGE)) {
            return
        }
        val controller = ServiceWorkerControllerCompat.getInstance()
        if (WebViewFeature.isFeatureSupported(WebViewFeature.SERVICE_WORKER_FILE_ACCESS)) {
            controller.serviceWorkerWebSettings.allowFileAccess = false
        }
        if (WebViewFeature.isFeatureSupported(WebViewFeature.SERVICE_WORKER_CONTENT_ACCESS)) {
            controller.serviceWorkerWebSettings.allowContentAccess = false
        }
        controller.setServiceWorkerClient(object : ServiceWorkerClientCompat() {
            override fun shouldInterceptRequest(request: WebResourceRequest) =
                client.shouldInterceptRequest(null, request)
        })
    }

    /** Gỡ ServiceWorkerClient khi `GameActivity` đóng để không giữ tham chiếu cũ. */
    fun clearServiceWorkerSandbox() {
        if (WebViewFeature.isFeatureSupported(WebViewFeature.SERVICE_WORKER_BASIC_USAGE)) {
            ServiceWorkerControllerCompat.getInstance().setServiceWorkerClient(null)
        }
    }

    /** Bật chế độ Immersive toàn màn hình an toàn trên API 24–36. */
    fun hideSystemBars(activity: Activity) {
        try {
            WindowCompat.setDecorFitsSystemWindows(activity.window, false)
            val controller = WindowCompat.getInsetsController(
                activity.window,
                activity.window.decorView
            )
            controller.hide(WindowInsetsCompat.Type.systemBars())
            controller.systemBarsBehavior =
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        } catch (error: Exception) {
            if (BuildConfig.DEBUG) {
                Log.e(TAG, "Error hiding system bars", error)
            }
        }
    }
}
