package com.nextai.gameoffline.presentation.game

import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.ActivityInfo
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.webkit.WebSettings
import android.webkit.WebView
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.gms.ads.AdView
import com.nextai.gameoffline.GameApplication
import com.nextai.gameoffline.ads.AdManager
import com.nextai.gameoffline.analytics.GameAnalyticsManager
import com.nextai.gameoffline.billing.BillingConstants
import com.nextai.gameoffline.data.local.GameTrackingRepository
import com.nextai.gameoffline.data.local.entity.GameEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Activity chứa WebView toàn màn hình chạy mini-game HTML5/WASM.
 * Full-screen Activity hosting the WebView container for HTML5/WASM games.
 */
class GameActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var bannerContainer: FrameLayout
    private var bannerAdView: AdView? = null
    private var gameName: String = "block_blast"
    private var currentGameEntity: GameEntity? = null
    private var levelCountPlayed = 0
    private var sessionStartTimeMs: Long = 0L
    private var isGameSessionActive = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        gameName = intent.getStringExtra(EXTRA_GAME_NAME) ?: "block_blast"
        val isHorizontal = intent.getIntExtra(EXTRA_IS_HORIZONTAL, 0)

        // Thiết lập hướng màn hình theo cấu hình game / Set screen orientation
        if (isHorizontal == 1) {
            requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
        } else {
            requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        }

        // Khởi tạo Root Layout dạng Linear dọc để Banner nằm tách biệt hoàn toàn phía dưới WebView (không đè menu game)
        // Create vertical LinearLayout so Banner is strictly separated below WebView, NEVER overlapping game canvas
        val rootLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(android.graphics.Color.BLACK)
        }

        val gameContainer = FrameLayout(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                0,
                1f // Tự động co giãn chiếm toàn bộ không gian còn lại phía trên banner / Occupies remaining vertical space
            )
        }

        // Kích hoạt Remote WebContents Debugging để kiểm tra DOM và sự kiện touch
        // Enable Remote WebContents Debugging for inspecting DOM and touch events
        WebView.setWebContentsDebuggingEnabled(true)

        webView = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            // Cấu hình nhận tương tác cảm ứng trực tiếp từ Chromium RenderWidget
            // Direct touch interaction configuration from Chromium RenderWidget
            isFocusable = true
            isFocusableInTouchMode = true
            overScrollMode = View.OVER_SCROLL_NEVER
            isVerticalScrollBarEnabled = false
            isHorizontalScrollBarEnabled = false
            requestFocus()
            requestFocusFromTouch()
        }

        progressBar = ProgressBar(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.WRAP_CONTENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                gravity = android.view.Gravity.CENTER
            }
            isClickable = false
            isFocusable = false
        }

        // Hẹn giờ an toàn tự ẩn progressBar sau tối đa 4 giây để tránh cản trở tương tác
        // Safety timeout to dismiss progressBar after max 4 seconds
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            if (::progressBar.isInitialized && progressBar.visibility == View.VISIBLE) {
                progressBar.visibility = View.GONE
            }
        }, 4000)

        gameContainer.addView(webView)
        gameContainer.addView(progressBar)
        rootLayout.addView(gameContainer)

        // Container chứa Banner Ad ở đáy màn hình (chỉ hiển thị cho game dọc và không che menu game)
        // Banner Ad Container at screen bottom (only for portrait games, strictly non-overlapping)
        bannerContainer = FrameLayout(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                gravity = android.view.Gravity.CENTER_HORIZONTAL
            }
            visibility = View.GONE
            setBackgroundColor(android.graphics.Color.BLACK)
        }
        rootLayout.addView(bannerContainer)

        setContentView(rootLayout)

        // Bật chế độ Fullscreen Immersive an toàn sau setContentView / Safe Fullscreen Immersive Mode
        hideSystemUI()

        // Xử lý nút Back quay lại danh sách game / Handle back button to exit game
        onBackPressedDispatcher.addCallback(this, object : androidx.activity.OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })

        // Cấu hình tối ưu hóa phần cứng cho WebView / Configure WebView hardware optimization
        setupWebView()

        // Nạp thông tin game từ SQLite Database / Load game metadata from database
        loadGameMetadataAndStart()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            allowFileAccessFromFileURLs = true
            allowUniversalAccessFromFileURLs = true
            // BẬT OverviewMode và WideViewPort để WebView tuân thủ đúng thẻ <meta name="viewport"> của game HTML5
            // Giúp tọa độ cảm ứng (touch/click) ăn khớp 100% với canvas game trên mọi tỷ lệ màn hình và mật độ DPI
            // ENABLE OverviewMode and WideViewPort to respect <meta name="viewport"> in HTML5 games
            // Ensures touch/click coordinates map accurately 1:1 onto the game canvas on all screens/DPIs
            loadWithOverviewMode = true
            useWideViewPort = true
            // TẮT hoàn toàn Zoom để cử chỉ ngón tay không bị Android Gesture Detector nuốt và gửi ACTION_CANCEL
            // DISABLE Zoom completely so finger jitter doesn't trigger zoom detector and fire ACTION_CANCEL
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            cacheMode = WebSettings.LOAD_DEFAULT
            mediaPlaybackRequiresUserGesture = false
        }

        // Đăng ký Javascript Bridge (Hỗ trợ cả AndroidBridge và Android) / Register Javascript Bridge
        val bridge = AndroidGameBridge(
            context = this,
            gameName = gameName,
            onScoreSubmitted = { score -> handleScoreSubmission(score) },
            onShowInterstitialAdRequested = { handleInterstitialAd() },
            onShowRewardedAdRequested = { handleRewardedAd() },
            onGameLoaded = {
                runOnUiThread {
                    progressBar.visibility = View.GONE
                    GameUnlockHelper.unlockGame(webView, gameName)
                    applyAudioSettings()
                }
            }
        )
        webView.addJavascriptInterface(bridge, "AndroidBridge")
        webView.addJavascriptInterface(bridge, "Android")

        webView.webChromeClient = object : android.webkit.WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
                android.util.Log.d(
                    "NextAIGame",
                    "[$gameName] JS: ${consoleMessage?.message()} (${consoleMessage?.sourceId()}:${consoleMessage?.lineNumber()})"
                )
                return true
            }

            override fun onJsAlert(
                view: WebView?,
                url: String?,
                message: String?,
                result: android.webkit.JsResult?
            ): Boolean {
                result?.confirm()
                return true
            }

            override fun onJsConfirm(
                view: WebView?,
                url: String?,
                message: String?,
                result: android.webkit.JsResult?
            ): Boolean {
                result?.confirm()
                return true
            }
        }

        webView.webViewClient = GameWebViewClient(this, gameName) {
            progressBar.visibility = View.GONE
            GameUnlockHelper.unlockGame(webView, gameName)
            applyAudioSettings()
        }
    }

    /**
     * Đồng bộ cài đặt âm thanh (Bật/Tắt) vào môi trường game HTML5/Construct 3/Howler.
     * Synchronize audio preferences (Enable/Disable/Mute) into the HTML5/Construct 3/Howler runtime.
     */
    private fun applyAudioSettings() {
        val isMuted = com.nextai.gameoffline.presentation.settings.GameSettingsManager.isGameAudioMuted(this)
        val soundEnabled = com.nextai.gameoffline.presentation.settings.GameSettingsManager.isSoundEnabled(this)
        val musicEnabled = com.nextai.gameoffline.presentation.settings.GameSettingsManager.isMusicEnabled(this)

        val shouldMuteAll = isMuted || (!soundEnabled && !musicEnabled)

        val script = buildString {
            append("try { ")
            if (shouldMuteAll) {
                // Tắt hoàn toàn âm thanh game: Howler, Construct 2/3, HTML5 Audio, Web Audio API
                // Completely mute all game audio: Howler, Construct 2/3, HTML5 Audio, Web Audio API
                append("if (window.Howler) { try { Howler.mute(true); } catch(e){} } ")
                append("if (window.c3_callFunction) { try { window.c3_callFunction('SetMasterVolume', [-80]); } catch(e){} } ")
                append("if (window.cr_setSuspended) { try { /* keep game loop alive */ } catch(e){} } ")
                append("document.querySelectorAll('audio, video').forEach(function(el) { try { el.muted = true; el.pause(); } catch(e){} }); ")
                append("if (window.AudioContext || window.webkitAudioContext) { ")
                append("  if (window.__gameAudioCtx && window.__gameAudioCtx.state === 'running') { try { window.__gameAudioCtx.suspend(); } catch(e){} } ")
                append("} ")
            } else {
                // Bật lại âm thanh game / Restore game audio
                append("if (window.Howler) { try { Howler.mute(false); } catch(e){} } ")
                append("if (window.c3_callFunction) { try { window.c3_callFunction('SetMasterVolume', [0]); } catch(e){} } ")
                if (!musicEnabled) {
                    append("document.querySelectorAll('audio').forEach(function(el) { if (el.src && (el.src.includes('bgm') || el.src.includes('music'))) el.muted = true; }); ")
                } else {
                    append("document.querySelectorAll('audio, video').forEach(function(el) { try { el.muted = false; } catch(e){} }); ")
                }
                append("if (window.__gameAudioCtx && window.__gameAudioCtx.state === 'suspended') { try { window.__gameAudioCtx.resume(); } catch(e){} } ")
            }
            append("} catch(e) {}")
        }
        webView.evaluateJavascript(script, null)
    }

    private fun loadGameMetadataAndStart() {
        lifecycleScope.launch(Dispatchers.IO) {
            val db = GameApplication.instance.database
            currentGameEntity = db.gamesDao().getGameByName(gameName)

            withContext(Dispatchers.Main) {
                // Tự động đồng bộ hướng màn hình theo cấu hình trong Database
                // Automatically synchronize orientation based on Database entity
                currentGameEntity?.let { entity ->
                    if (entity.isHorizontal == 1) {
                        if (requestedOrientation != ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE) {
                            requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
                        }
                        // Game ngang tuyệt đối KHÔNG hiển thị banner / Never show banner for landscape games
                        bannerContainer.visibility = View.GONE
                        bannerAdView?.destroy()
                        bannerAdView = null
                    } else {
                        if (requestedOrientation != ActivityInfo.SCREEN_ORIENTATION_PORTRAIT) {
                            requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
                        }
                        // Game dọc: Hiển thị banner nếu không phải VIP / Portrait games: Show banner if not VIP
                        setupBannerAd()
                    }
                }

                // Nạp file HTML5 game từ assets gói sẵn hoặc bộ nhớ trong (nếu tải từ Cloudflare R2) qua Virtual Domain an toàn
                // Load HTML5 game file from bundled assets or internal storage (if downloaded from Cloudflare R2) via secure Virtual Domain
                val gameLaunchUrl = com.nextai.gameoffline.data.remote.GameDownloadManager.getGameLaunchUrl(this@GameActivity, gameName)
                android.util.Log.i("GameActivity", "Đang nạp game: $gameName từ $gameLaunchUrl")
                webView.loadUrl(gameLaunchUrl)

                // Ghi nhận sự kiện mở game chuyên sâu vào Firebase Analytics & Repository
                // Log comprehensive game open event to Firebase Analytics & Repository
                val trackingRepo = GameTrackingRepository.getInstance(this@GameActivity)
                val newOpenCount = trackingRepo.incrementOpenCount(gameName)
                val currentStats = trackingRepo.getGameStats(gameName)

                GameAnalyticsManager.logGameOpen(
                    gameName = gameName,
                    gameTitle = currentGameEntity?.title ?: gameName,
                    category = currentGameEntity?.category ?: "Casual",
                    openCount = newOpenCount,
                    highestLevel = currentStats.highestLevel,
                    totalPlayTimeSec = currentStats.totalPlayTimeSec
                )

                sessionStartTimeMs = System.currentTimeMillis()
                isGameSessionActive = true
            }
        }
    }

    /**
     * Khởi tạo và hiển thị AdMob Banner ở đáy màn hình.
     * Kiểm tra chặt chẽ: chỉ hiển thị cho game dọc, chưa mua VIP, và tự động ẩn nếu nạp thất bại.
     * Initialize and show AdMob Banner at bottom.
     * Strict checks: portrait only, not VIP, and auto-hidden on failure.
     */
    private fun setupBannerAd() {
        val isPremium = getSharedPreferences("nextai_billing_prefs", Context.MODE_PRIVATE)
            .getBoolean(BillingConstants.PREF_IS_PREMIUM_USER, false)

        val isLandscape = currentGameEntity?.isHorizontal == 1 || requestedOrientation == ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE

        if (isPremium || isLandscape) {
            bannerContainer.visibility = View.GONE
            bannerAdView?.destroy()
            bannerAdView = null
            return
        }

        if (bannerAdView == null) {
            bannerAdView = AdManager.initBannerAd(
                context = this,
                container = bannerContainer,
                onLoaded = {
                    android.util.Log.i("GameActivity", "Banner AdMob nạp thành công ở đáy màn hình (Không đè menu game)")
                },
                onFailed = { errorMsg ->
                    android.util.Log.w("GameActivity", "Banner AdMob không hiển thị: $errorMsg")
                    bannerContainer.visibility = View.GONE
                }
            )
        }
    }

    private fun handleScoreSubmission(score: Int) {
        lifecycleScope.launch(Dispatchers.IO) {
            val db = GameApplication.instance.database
            db.userStatsDao().updateHighScore(gameName, score)
        }
    }

    private fun handleInterstitialAd() {
        levelCountPlayed++
        val threshold = currentGameEntity?.eachNLevels ?: 3
        if (levelCountPlayed >= threshold) {
            levelCountPlayed = 0
            runOnUiThread {
                AdManager.showInterstitialAd(this)
            }
        }
    }

    private fun handleRewardedAd() {
        runOnUiThread {
            AdManager.showRewardedAd(this) {
                // Thưởng cho người chơi trong game / Grant reward in JS
                webView.evaluateJavascript("window.onRewardGranted && window.onRewardGranted();", null)
            }
        }
    }

    private fun hideSystemUI() {
        try {
            androidx.core.view.WindowCompat.setDecorFitsSystemWindows(window, false)
            val controller = androidx.core.view.WindowCompat.getInsetsController(window, window.decorView)
            controller.hide(androidx.core.view.WindowInsetsCompat.Type.systemBars())
            controller.systemBarsBehavior = androidx.core.view.WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        } catch (e: Exception) {
            android.util.Log.e("GameActivity", "Error hiding system UI", e)
        }
    }

    private fun recordSessionPlayTime() {
        if (isGameSessionActive && sessionStartTimeMs > 0) {
            val now = System.currentTimeMillis()
            val durationSec = (now - sessionStartTimeMs) / 1000
            if (durationSec > 0) {
                val trackingRepo = GameTrackingRepository.getInstance(this)
                val updatedTotal = trackingRepo.addPlayTime(gameName, durationSec)
                GameAnalyticsManager.logGamePlayTime(
                    gameName = gameName,
                    sessionDurationSec = durationSec,
                    totalPlayTimeSec = updatedTotal
                )
            }
            sessionStartTimeMs = now
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            hideSystemUI()
        }
    }

    override fun onResume() {
        super.onResume()
        sessionStartTimeMs = System.currentTimeMillis()
        webView.onResume()
        bannerAdView?.resume()
        webView.evaluateJavascript("window.resumeGame && window.resumeGame();", null)
    }

    override fun onPause() {
        super.onPause()
        recordSessionPlayTime()
        webView.onPause()
        bannerAdView?.pause()
        webView.evaluateJavascript("window.pauseGame && window.pauseGame();", null)
    }

    override fun onDestroy() {
        recordSessionPlayTime()
        isGameSessionActive = false
        bannerAdView?.destroy()
        bannerAdView = null
        webView.destroy()
        super.onDestroy()
    }

    companion object {
        const val EXTRA_GAME_NAME = "extra_game_name"
        const val EXTRA_IS_HORIZONTAL = "extra_is_horizontal"
    }
}
