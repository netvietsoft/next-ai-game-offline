package com.nextai.gameoffline.presentation.splash

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import androidx.appcompat.app.AppCompatActivity
import com.nextai.gameoffline.R
import com.nextai.gameoffline.ads.AdManager
import com.nextai.gameoffline.ads.AdsConsentManager
import com.nextai.gameoffline.ads.LaunchAdEligibility
import com.nextai.gameoffline.billing.BillingEntitlements
import com.nextai.gameoffline.notifications.NotificationClickTracker
import com.nextai.gameoffline.presentation.gamelist.GameListActivity

/**
 * Màn hình khởi động có thời hạn để chờ SDK mediation và làm ấm cache quảng cáo.
 * Time-bounded launch screen that waits for mediation initialization and warms the ad cache.
 *
 * Chỉ giai đoạn preload Ads bị giới hạn 2,5 giây; form consent không bị tự động đóng.
 * Only ad preloading is capped at 2.5 seconds; an active consent form is never auto-dismissed.
 */
class SplashAdActivity : AppCompatActivity() {

    private val handler = Handler(Looper.getMainLooper())
    private val motionController by lazy { SplashMotionController(this) }
    private val startedAtMs = SystemClock.elapsedRealtime()
    private var hasNavigated = false
    private var isResumedForAds = false
    private var readyToAdvance = false
    private var hasAttemptedAppOpen = false
    private var pendingNavigation = false
    private var canShowLaunchAd = false
    private val timeoutRunnable = Runnable { advanceFromSplash() }

    override fun onCreate(savedInstanceState: Bundle?) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // Gỡ ngay màn splash hệ thống Android 12+ để hiển thị trực tiếp màn Loading Ads.
            // Immediately remove the Android 12+ system splash so only the Loading Ads screen shows.
            splashScreen.setOnExitAnimationListener { splashView -> splashView.remove() }
        }
        super.onCreate(savedInstanceState)
        NotificationClickTracker.handleIntent(this, intent)
        setContentView(R.layout.activity_ad_splash)
        motionController.start()

        canShowLaunchAd = savedInstanceState?.getBoolean("can_show_launch_ad")
            ?: LaunchAdEligibility.recordLaunchAndCheckAppOpenEligible(this)

        val isPremium = BillingEntitlements.isPremium(this)

        if (isPremium) {
            // VIP không khởi tạo SDK quảng cáo hoặc tạo request.
            // Premium users neither initialize the ads SDK nor create ad requests.
            navigateAfterMinimumDuration()
        } else {
            AdsConsentManager.gatherConsent(this) { canRequestAds ->
                // Không tiếp tục với Activity đã đóng hoặc bị tạo lại.
                // Do not continue with an Activity that has finished or been recreated.
                if (isFinishing || isDestroyed || hasNavigated) return@gatherConsent
                if (canRequestAds) {
                    handler.postDelayed(timeoutRunnable, MAX_SPLASH_WAIT_MS)
                    AdManager.preloadForLaunch(
                        context = this,
                        preloadAppOpen = canShowLaunchAd
                    ) {
                        navigateAfterMinimumDuration()
                    }
                } else {
                    navigateAfterMinimumDuration()
                }
            }
        }
    }

    /**
     * Giữ splash đủ lâu để tránh nháy màn hình nhưng không cố kéo dài thời gian xem.
     * Keeps the splash long enough to prevent flicker without artificially extending exposure.
     */
    private fun navigateAfterMinimumDuration() {
        // Callback SDK có thể đến sau onDestroy; không đăng thêm tác vụ cho Activity cũ.
        // An SDK callback can arrive after onDestroy; do not enqueue work for the old Activity.
        if (isFinishing || isDestroyed || hasNavigated) return
        val remainingMs = (MIN_SPLASH_VISIBLE_MS -
            (SystemClock.elapsedRealtime() - startedAtMs)).coerceAtLeast(0L)
        handler.postDelayed({ advanceFromSplash() }, remainingMs)
    }

    /**
     * Chỉ thử App Open tại splash đang hiển thị; bỏ qua ngay khi cache rỗng.
     * Attempts App Open only on the visible splash, proceeding immediately on a cache miss.
     */
    private fun advanceFromSplash() {
        if (isFinishing || isDestroyed || hasNavigated || hasAttemptedAppOpen) {
            return
        }
        if (!isResumedForAds) {
            readyToAdvance = true
            return
        }
        readyToAdvance = false
        hasAttemptedAppOpen = true
        handler.removeCallbacks(timeoutRunnable)
        if (canShowLaunchAd) {
            AdManager.showAppOpenAd(this) { finishSplashWhenResumed() }
        } else {
            finishSplashWhenResumed()
        }
    }

    /**
     * Chờ splash trở lại tiền cảnh trước khi điều hướng.
     * Navigate only after the splash resumes in the foreground.
     */
    private fun finishSplashWhenResumed() {
        if (isFinishing || isDestroyed || hasNavigated) {
            return
        }
        if (isResumedForAds) {
            navigateToGameList()
        } else {
            pendingNavigation = true
        }
    }

    override fun onResume() {
        super.onResume()
        motionController.resume()
        isResumedForAds = true
        if (pendingNavigation) {
            pendingNavigation = false
            navigateToGameList()
        } else if (readyToAdvance) {
            advanceFromSplash()
        }
    }

    override fun onPause() {
        isResumedForAds = false
        motionController.pause()
        super.onPause()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        outState.putBoolean("can_show_launch_ad", canShowLaunchAd)
        super.onSaveInstanceState(outState)
    }

    /**
     * Điều hướng đúng một lần tới danh sách game.
     * Navigates exactly once to the game list.
     */
    private fun navigateToGameList() {
        if (hasNavigated || isFinishing || isDestroyed) return
        hasNavigated = true
        handler.removeCallbacks(timeoutRunnable)
        startActivity(Intent(this, GameListActivity::class.java))
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        finish()
    }

    override fun onDestroy() {
        motionController.stop()
        handler.removeCallbacksAndMessages(null)
        super.onDestroy()
    }

    /** Ghi click nếu splash đang tồn tại nhận notification mới / Record a new notification intent. */
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        NotificationClickTracker.handleIntent(this, intent)
    }

    private companion object {
        const val MIN_SPLASH_VISIBLE_MS = 650L
        const val MAX_SPLASH_WAIT_MS = 2_500L
    }
}
