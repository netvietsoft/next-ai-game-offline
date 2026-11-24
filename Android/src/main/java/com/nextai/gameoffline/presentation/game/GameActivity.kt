package com.nextai.gameoffline.presentation.game

import android.content.pm.ActivityInfo
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.MotionEvent
import android.view.View
import android.webkit.WebView
import android.widget.FrameLayout
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.nextai.gameoffline.BuildConfig
import com.nextai.gameoffline.R
import com.nextai.gameoffline.ads.AdManager
import com.nextai.gameoffline.ads.AdsConsentManager
import com.nextai.gameoffline.ads.EntitlementAdObserver
import com.nextai.gameoffline.analytics.GameAnalyticsManager
import com.nextai.gameoffline.crash.CrashReportingManager
import com.nextai.gameoffline.data.remote.GamePackageSecurityPolicy
import com.nextai.gameoffline.di.appContainer
import com.nextai.gameoffline.notifications.NotificationClickTracker
import com.nextai.gameoffline.presentation.settings.GameSettingsManager
import kotlinx.coroutines.launch

/**
 * Màn hình chơi Mini-Game HTML5/WASM (Clean MVVM): dùng layout XML `activity_game.xml`
 * và ủy quyền nạp metadata, URL an toàn, thống kê phiên chơi cho [GameViewModel],
 * điều phối Banner cho [GameBannerLifecycleHelper] và Interstitial/Rewarded cho [GameAdSessionController].
 * Thin MVVM Activity hosting the sandboxed game WebView via `activity_game.xml` and SRP helpers.
 */
class GameActivity : AppCompatActivity() {

    private lateinit var viewModel: GameViewModel
    private lateinit var adSessionController: GameAdSessionController
    private lateinit var bannerLifecycleHelper: GameBannerLifecycleHelper
    private lateinit var questTracker: GameBridgeQuestTracker
    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private var gameName: String = DEFAULT_GAME_NAME
    private var hasStartedWebViewLoad = false
    private var isExitTransitionInProgress = false

    private val mainHandler = Handler(Looper.getMainLooper())
    private val progressTimeoutRunnable = Runnable {
        if (::progressBar.isInitialized && progressBar.visibility == View.VISIBLE) {
            progressBar.visibility = View.GONE
        }
    }

    private val adsReadyListener: () -> Unit = {
        AdManager.onConsentChanged(this)
        if (!isFinishing && !isDestroyed && ::bannerLifecycleHelper.isInitialized) {
            bannerLifecycleHelper.refreshBanner()
        }
    }

    override fun dispatchTouchEvent(event: MotionEvent): Boolean {
        if (event.actionMasked == MotionEvent.ACTION_UP) {
            AdManager.recordInterstitialUserAction()
        }
        return super.dispatchTouchEvent(event)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        NotificationClickTracker.handleIntent(this, intent)

        val requestedName = intent.getStringExtra(EXTRA_GAME_NAME)
        gameName = requestedName?.takeIf(GamePackageSecurityPolicy::isValidGameName) ?: DEFAULT_GAME_NAME
        val initialHorizontal = intent.getIntExtra(EXTRA_IS_HORIZONTAL, 0)
        requestedOrientation = if (initialHorizontal == 1) {
            ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
        } else {
            ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        }

        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)
        setContentView(R.layout.activity_game)

        webView = findViewById(R.id.gameWebView)
        progressBar = findViewById(R.id.gameProgressBar)
        val bannerContainer = findViewById<FrameLayout>(R.id.gameBannerContainer)
        webView.requestFocus()
        webView.requestFocusFromTouch()

        viewModel = ViewModelProvider(
            this,
            appContainer.gameViewModelFactory(gameName)
        )[GameViewModel::class.java]
        adSessionController = GameAdSessionController(
            activity = this,
            gameName = gameName,
            webViewProvider = { webView },
            thresholdProvider = {
                viewModel.currentGame()?.eachNLevels ?: InGameAdTriggerPolicy.DEFAULT_BREAK_THRESHOLD
            }
        )
        bannerLifecycleHelper = GameBannerLifecycleHelper(
            activity = this,
            bannerContainer = bannerContainer,
            gameName = gameName,
            currentGameProvider = { viewModel.currentGame() }
        )
        questTracker = GameBridgeQuestTracker(this, gameName)

        mainHandler.postDelayed(progressTimeoutRunnable, PROGRESS_DISMISS_TIMEOUT_MS)
        lifecycle.addObserver(
            EntitlementAdObserver(this) {
                if (!isFinishing && !isDestroyed && ::bannerLifecycleHelper.isInitialized) {
                    bannerLifecycleHelper.refreshBanner()
                }
            }
        )

        GameWebViewConfigurator.hideSystemBars(this)
        registerBackNavigation()
        setupWebView()
        observeLaunchState()
        viewModel.loadGame()
    }

    private fun registerBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (isExitTransitionInProgress) {
                    return
                }
                if (webView.canGoBack()) {
                    webView.goBack()
                    return
                }
                isExitTransitionInProgress = true
                adSessionController.onExitGameRequested(viewModel.currentSessionElapsedSec()) {
                    if (!isFinishing && !isDestroyed) {
                        finish()
                    }
                }
            }
        })
    }

    private fun observeLaunchState() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.launchState.collect { state ->
                    when (state) {
                        GameLaunchState.Loading -> Unit
                        is GameLaunchState.MissingFiles -> handleMissingFiles(state.cause)
                        is GameLaunchState.Ready -> handleGameReady(state)
                    }
                }
            }
        }
    }

    private fun handleMissingFiles(cause: Throwable?) {
        if (cause != null) {
            CrashReportingManager.recordNonFatal("game_launch_missing_files", cause)
        }
        if (!isFinishing && !isDestroyed) {
            Toast.makeText(this, R.string.game_launch_missing_files, Toast.LENGTH_LONG).show()
            finish()
        }
    }

    private fun handleGameReady(state: GameLaunchState.Ready) {
        if (isFinishing || isDestroyed || hasStartedWebViewLoad) {
            return
        }
        hasStartedWebViewLoad = true

        state.game?.let { entity ->
            if (entity.isHorizontal == 1) {
                if (requestedOrientation != ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE) {
                    requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
                }
                bannerLifecycleHelper.clear()
            } else {
                if (requestedOrientation != ActivityInfo.SCREEN_ORIENTATION_PORTRAIT) {
                    requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
                }
            }
        }

        if (BuildConfig.DEBUG) {
            Log.i(TAG, "Loading game $gameName from ${state.launchUrl}")
        }
        webView.loadUrl(state.launchUrl)
        // Trì hoãn nạp Banner 800ms sau khi webView bắt đầu tải để tránh tranh chấp JavascriptEngine.
        // Delay initial banner startup by 800ms after `webView.loadUrl` to avoid Chromium contention.
        bannerLifecycleHelper.scheduleInitialBannerLoad()
        questTracker.onGameOpened()

        GameAnalyticsManager.logGameOpen(
            gameName = gameName,
            gameTitle = state.game?.title ?: gameName,
            category = state.game?.category ?: "Casual",
            openCount = state.stats.openCount,
            highestLevel = state.stats.highestLevel,
            totalPlayTimeSec = state.stats.totalPlayTimeSec
        )
    }

    private fun setupWebView() {
        GameWebViewConfigurator.applyHardenedSettings(webView)
        val bridge = AndroidGameBridge(
            context = this,
            gameName = gameName,
            onScoreSubmitted = { score -> viewModel.recordScore(score) },
            onLevelStarted = { level -> viewModel.recordLevelStart(level) },
            onLevelCompleted = { level, extra ->
                val scoreExtra = extra?.toLongOrNull()
                GameAnalyticsManager.logGameLevelComplete(gameName, level, scoreExtra)
                questTracker.onLevelCompleted()
                viewModel.recordLevelComplete(level) { newHighest ->
                    GameAnalyticsManager.logGameLevelReached(gameName, newHighest)
                }
            },
            onLevelBreakAdRequested = adSessionController::onLevelBreakRequested,
            onExplicitInterstitialAdRequested = adSessionController::onExplicitInterstitialRequested,
            onC3InterstitialRequested = adSessionController::onC3InterstitialRequested,
            onShowRewardedAdRequested = adSessionController::onRewardedRequested,
            onGameLoaded = {
                runOnUiThread {
                    if (!isFinishing && !isDestroyed) {
                        progressBar.visibility = View.GONE
                        // Trì hoãn 80ms để Construct 3 thoát hẳn khối async OnStartOfLayout trước khi
                        // gọi `setAudioEnabled` (tránh lỗi `Error: not in a signal` trên `#29 knife_hit`).
                        // Defer 80ms so C3 finishes its async OnStartOfLayout before signaling audio.
                        GameUnlockHelper.unlockGame(
                            webView = webView,
                            gameName = gameName,
                            isRuntimeReady = true,
                            audioEnabled = isAudioPlaybackEnabled(),
                            delayMs = GameUnlockHelper.GAME_LOADED_UNLOCK_DELAY_MS
                        )
                        applyAudioSettings()
                        bannerLifecycleHelper.onGameLoaded()
                    }
                }
            }
        )
        webView.addJavascriptInterface(bridge, "AndroidBridge")
        webView.addJavascriptInterface(bridge, "Android")
        webView.webChromeClient = GameWebViewConfigurator.createWebChromeClient(gameName)

        val secureClient = GameWebViewClient(this, gameName) {
            progressBar.visibility = View.GONE
            GameUnlockHelper.unlockGame(
                webView = webView,
                gameName = gameName,
                isRuntimeReady = false,
                audioEnabled = isAudioPlaybackEnabled()
            )
            applyAudioSettings()
            bannerLifecycleHelper.onGameLoaded()
        }
        webView.webViewClient = secureClient
        GameWebViewConfigurator.attachServiceWorkerSandbox(secureClient)
    }

    private fun isAudioPlaybackEnabled(): Boolean {
        val isMuted = GameSettingsManager.isGameAudioMuted(this)
        val hasAudioChannel = GameSettingsManager.isSoundEnabled(this) ||
            GameSettingsManager.isMusicEnabled(this)
        return !isMuted && hasAudioChannel
    }

    private fun applyAudioSettings() {
        webView.evaluateJavascript(GameAudioScriptHelper.buildSyncScript(this), null)
    }

    private fun flushPlayTimeSession() {
        viewModel.onBackgroundStopped { session ->
            GameAnalyticsManager.logGamePlayTime(
                gameName = gameName,
                sessionDurationSec = session.durationSec,
                totalPlayTimeSec = session.totalPlayTimeSec
            )
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            GameWebViewConfigurator.hideSystemBars(this)
        }
    }

    override fun onStart() {
        super.onStart()
        AdsConsentManager.addReadyListener(adsReadyListener)
    }

    override fun onStop() {
        AdsConsentManager.removeReadyListener(adsReadyListener)
        super.onStop()
    }

    override fun onResume() {
        super.onResume()
        viewModel.onForegroundResumed()
        webView.onResume()
        // Chỉ gọi reward_load khi người chơi mở game thuộc danh sách 71 game có Rewarded Video.
        // Only preload Rewarded ads when opening one of the 71 verified Rewarded-enabled games.
        val supportsRewarded = RewardCallbackResolver.supportsRewarded(gameName)
        AdManager.preloadFullScreenAds(applicationContext, preloadRewarded = supportsRewarded)
        bannerLifecycleHelper.onResume()
        webView.evaluateJavascript("window.resumeGame && window.resumeGame();", null)
    }

    override fun onPause() {
        super.onPause()
        flushPlayTimeSession()
        webView.onPause()
        bannerLifecycleHelper.onPause()
        webView.evaluateJavascript("window.pauseGame && window.pauseGame();", null)
    }

    override fun onDestroy() {
        mainHandler.removeCallbacks(progressTimeoutRunnable)
        flushPlayTimeSession()
        bannerLifecycleHelper.clear()
        webView.removeJavascriptInterface("AndroidBridge")
        webView.removeJavascriptInterface("Android")
        webView.stopLoading()
        GameWebViewConfigurator.clearServiceWorkerSandbox()
        webView.destroy()
        super.onDestroy()
    }

    companion object {
        const val EXTRA_GAME_NAME = "extra_game_name"
        const val EXTRA_IS_HORIZONTAL = "extra_is_horizontal"
        private const val TAG = "GameActivity"
        private const val DEFAULT_GAME_NAME = "block_blast"
        private const val PROGRESS_DISMISS_TIMEOUT_MS = 4_000L
    }
}
