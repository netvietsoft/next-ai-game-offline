package com.nextai.gameoffline.ads

import android.app.Activity
import android.app.Application
import android.os.Bundle
import android.os.SystemClock
import com.nextai.gameoffline.billing.BillingEntitlements

/**
 * Giám sát vòng đời toàn tiến trình để hiển thị App Open Ad khi người chơi quay lại ứng dụng từ nền.
 * Bỏ qua thay đổi cấu hình (xoay màn hình Portrait ↔ Landscape), Splash, Paywall và chính AdActivity.
 * Process-level ActivityLifecycleCallbacks showing cached App Open ads on foreground resume.
 */
class AppOpenLifecycleObserver(
    private val clockMs: () -> Long = { SystemClock.elapsedRealtime() }
) : Application.ActivityLifecycleCallbacks {

    private var attached = false
    private var startedActivityCount = 0
    private var isChangingConfigurations = false
    private var hasLeftForeground = false
    private var backgroundedAtMs = 0L
    private var lastResumeAdAtMs = -AppOpenResumePolicy.MIN_RESUME_INTERVAL_MS
    private var pendingResumeCheck = false
    private var pendingBackgroundDurationMs = 0L

    /** Gắn vào [Application] đúng một lần tại `Application.onCreate`. */
    fun attach(application: Application) {
        if (attached) {
            return
        }
        attached = true
        application.registerActivityLifecycleCallbacks(this)
    }

    override fun onActivityStarted(activity: Activity) {
        val wasInBackground = startedActivityCount == 0 && !isChangingConfigurations
        startedActivityCount++
        if (!wasInBackground) {
            return
        }
        if (hasLeftForeground) {
            pendingBackgroundDurationMs = (clockMs() - backgroundedAtMs).coerceAtLeast(0L)
            pendingResumeCheck = true
        }
    }

    override fun onActivityResumed(activity: Activity) {
        if (!pendingResumeCheck) {
            return
        }
        pendingResumeCheck = false

        val nowMs = clockMs()
        val msSinceLastResume = (nowMs - lastResumeAdAtMs).coerceAtLeast(0L)
        val eligibleByPolicy = AppOpenResumePolicy.shouldShowOnResume(
            hasLeftForeground = hasLeftForeground,
            backgroundDurationMs = pendingBackgroundDurationMs,
            msSinceLastResumeAd = msSinceLastResume,
            activitySimpleName = activity.javaClass.simpleName
        )
        if (!eligibleByPolicy) {
            return
        }
        if (
            BillingEntitlements.shouldSuppressAutomaticAds(activity) ||
            !AdsConsentManager.canRequestAds(activity)
        ) {
            return
        }
        if (!LaunchAdEligibility.canPreloadAppOpenInSession(activity)) {
            return
        }

        lastResumeAdAtMs = nowMs
        AdManager.showAppOpenAd(activity, respectCooldown = true)
    }

    override fun onActivityStopped(activity: Activity) {
        isChangingConfigurations = activity.isChangingConfigurations
        startedActivityCount = (startedActivityCount - 1).coerceAtLeast(0)
        if (startedActivityCount == 0 && !isChangingConfigurations) {
            hasLeftForeground = true
            backgroundedAtMs = clockMs()
        }
    }

    override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) = Unit

    override fun onActivityPaused(activity: Activity) = Unit

    override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) = Unit

    override fun onActivityDestroyed(activity: Activity) = Unit
}
