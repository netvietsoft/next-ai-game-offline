package com.nextai.gameoffline.presentation.game

import android.app.Activity
import android.content.pm.ActivityInfo
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.widget.FrameLayout
import com.google.android.gms.ads.AdView
import com.nextai.gameoffline.BuildConfig
import com.nextai.gameoffline.ads.AdManager
import com.nextai.gameoffline.ads.AdOptimizationPolicy
import com.nextai.gameoffline.ads.AdsConsentManager
import com.nextai.gameoffline.billing.BillingEntitlements
import com.nextai.gameoffline.data.local.entity.GameEntity

/**
 * Quản lý vòng đời Banner trong [GameActivity] theo SRP:
 * - Giữ nguyên quy tắc tắt hoàn toàn Banner ở 48 game màn ngang (`isHorizontal == 1`).
 * - Trì hoãn nạp Banner ban đầu 800ms (hoặc ngay khi `onGameLoaded` nổ) để tránh tranh chấp
 *   tiến trình Chromium/WASM gây lỗi `Unable to obtain a JavascriptEngine`.
 * - Đồng bộ `bannerAdView` qua callback retry và tự reset về `null` khi lỗi cuối để lần
 *   `onResume` tiếp theo luôn có cơ hội phục hồi Banner.
 * SRP helper managing delayed gameplay banner startup, backoff retries, and clean disposal.
 */
internal class GameBannerLifecycleHelper(
    private val activity: Activity,
    private val bannerContainer: FrameLayout,
    private val gameName: String,
    private val currentGameProvider: () -> GameEntity?
) {

    private val mainHandler = Handler(Looper.getMainLooper())
    private var bannerAdView: AdView? = null
    private var isBannerLoadScheduled = false
    private var hasGameFinishedInitialLoad = false
    private val delayedSetupRunnable = Runnable {
        isBannerLoadScheduled = false
        hasGameFinishedInitialLoad = true
        setupBannerIfEligible()
    }

    /**
     * Lên lịch nạp Banner sau 800ms kể từ khi bắt đầu `webView.loadUrl(...)` để nhường
     * tài nguyên Chromium/WASM cho game khởi tạo trước.
     * Schedules initial banner load 800ms after `webView.loadUrl(...)` to avoid JS engine contention.
     */
    fun scheduleInitialBannerLoad() {
        val currentGame = currentGameProvider()
        if (isLandscapeGame(currentGame)) {
            clear()
            return
        }
        if (bannerAdView != null || isBannerLoadScheduled) {
            return
        }
        isBannerLoadScheduled = true
        mainHandler.postDelayed(
            delayedSetupRunnable,
            AdOptimizationPolicy.GAMEPLAY_BANNER_INITIAL_DELAY_MS
        )
    }

    /** Gọi ngay khi game báo `gameLoaded()` / trang đã nạp xong để hiện Banner không cần đợi thêm. */
    fun onGameLoaded() {
        hasGameFinishedInitialLoad = true
        if (isBannerLoadScheduled) {
            mainHandler.removeCallbacks(delayedSetupRunnable)
            isBannerLoadScheduled = false
        }
        setupBannerIfEligible()
    }

    /** Kiểm tra lại điều kiện hiển thị khi thay đổi VIP/consent hoặc quay lại `onResume`. */
    fun refreshBanner() {
        if (!hasGameFinishedInitialLoad && isBannerLoadScheduled) {
            return
        }
        setupBannerIfEligible()
    }

    fun onResume() {
        refreshBanner()
        bannerAdView?.resume()
    }

    fun onPause() {
        bannerAdView?.pause()
    }

    /** Hủy sạch mọi callback chờ, hẹn giờ retry và `AdView` hiện có. */
    fun clear() {
        mainHandler.removeCallbacks(delayedSetupRunnable)
        isBannerLoadScheduled = false
        AdManager.destroyBannerAd(bannerContainer)
        bannerAdView = null
    }

    private fun setupBannerIfEligible() {
        if (activity.isFinishing || activity.isDestroyed) {
            return
        }
        val currentGame = currentGameProvider()
        val suppressAds = BillingEntitlements.shouldSuppressAutomaticAds(activity)
        val isLandscape = isLandscapeGame(currentGame)
        if (suppressAds || isLandscape || !AdsConsentManager.canRequestAds(activity)) {
            clear()
            return
        }
        if (currentGame == null || bannerAdView != null) {
            return
        }
        bannerAdView = AdManager.initBannerAd(
            context = activity,
            container = bannerContainer,
            gameName = gameName,
            collapsibleBottom = AdOptimizationPolicy.shouldUseCollapsibleBanner(isGameplayScreen = true),
            onLoaded = {
                if (BuildConfig.DEBUG) {
                    Log.i(TAG, "Bottom adaptive banner loaded for $gameName")
                }
            },
            onFailed = { errorMsg ->
                if (BuildConfig.DEBUG) {
                    Log.w(TAG, "Banner failed to load for $gameName: $errorMsg")
                }
                bannerAdView = null
                bannerContainer.visibility = View.GONE
            },
            onAdViewUpdated = { updatedView ->
                bannerAdView = updatedView
            }
        )
    }

    private fun isLandscapeGame(game: GameEntity?): Boolean {
        return game?.isHorizontal == 1 ||
            activity.requestedOrientation == ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE
    }

    private companion object {
        const val TAG = "GameBannerHelper"
    }
}
