package com.nextai.gameoffline.billing

import android.app.Activity
import android.app.Application
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import com.nextai.gameoffline.domain.repository.BillingRepository

/**
 * Giám sát vòng đời ứng dụng để kích hoạt làm mới quyền sở hữu trên [BillingRepository] duy nhất
 * khi ứng dụng quay lại tiền cảnh và định kỳ mỗi giờ, không mở thêm `BillingClient` thứ hai.
 * Observes app foreground transitions to refresh the single shared [BillingRepository].
 */
class BillingEntitlementMonitor(
    private val billingRepository: BillingRepository
) : Application.ActivityLifecycleCallbacks {

    private val mainHandler = Handler(Looper.getMainLooper())
    private var attached = false
    private var visibleActivities = 0
    private var lastRefreshAtMs = 0L

    private val foregroundTicker = object : Runnable {
        override fun run() {
            if (visibleActivities == 0) {
                return
            }
            billingRepository.refreshCachedEntitlement()
            if (SystemClock.elapsedRealtime() - lastRefreshAtMs > HOURLY_REFRESH_MS) {
                triggerRefresh()
            }
            mainHandler.postDelayed(this, TICK_INTERVAL_MS)
        }
    }

    /** Gắn vào [Application] đúng một lần khi khởi động / Attach once during Application.onCreate. */
    fun attach(application: Application) {
        if (attached) {
            return
        }
        attached = true
        billingRepository.refreshCachedEntitlement()
        triggerRefresh()
        application.registerActivityLifecycleCallbacks(this)
    }

    private fun triggerRefresh() {
        lastRefreshAtMs = SystemClock.elapsedRealtime()
        billingRepository.refresh(loadProducts = false)
    }

    override fun onActivityStarted(activity: Activity) {
        if (visibleActivities++ == 0) {
            billingRepository.refreshCachedEntitlement()
            if (SystemClock.elapsedRealtime() - lastRefreshAtMs > FOREGROUND_DEBOUNCE_MS) {
                triggerRefresh()
            }
            mainHandler.removeCallbacks(foregroundTicker)
            mainHandler.postDelayed(foregroundTicker, TICK_INTERVAL_MS)
        }
    }

    override fun onActivityStopped(activity: Activity) {
        visibleActivities = (visibleActivities - 1).coerceAtLeast(0)
        if (visibleActivities == 0) {
            mainHandler.removeCallbacks(foregroundTicker)
        }
    }

    override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) = Unit
    override fun onActivityResumed(activity: Activity) = Unit
    override fun onActivityPaused(activity: Activity) = Unit
    override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) = Unit
    override fun onActivityDestroyed(activity: Activity) = Unit

    private companion object {
        const val FOREGROUND_DEBOUNCE_MS = 3_000L
        const val TICK_INTERVAL_MS = 60_000L
        const val HOURLY_REFRESH_MS = 60L * 60L * 1_000L
    }
}
