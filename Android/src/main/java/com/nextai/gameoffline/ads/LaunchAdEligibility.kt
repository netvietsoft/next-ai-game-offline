package com.nextai.gameoffline.ads

import android.content.Context

/**
 * Lưu trữ và đọc số lần mở ứng dụng (`nextai_launch_prefs`) để đồng bộ điều kiện nạp/hiển thị
 * App Open Ad giữa [com.nextai.gameoffline.presentation.splash.SplashAdActivity], [AdManager]
 * và [AppOpenLifecycleObserver], tránh lãng phí `app_open_load` trong 2 lần mở đầu.
 * Persists and reads launch counts so Splash, [AdManager], and [AppOpenLifecycleObserver] share
 * one source of truth and skip `app_open_load` during the first 2 launches.
 */
internal object LaunchAdEligibility {

    private const val PREFS_NAME = "nextai_launch_prefs"
    private const val KEY_COMPLETED_LAUNCHES = "completed_launches"

    /**
     * Ghi nhận một lần mở ứng dụng mới tại Splash và trả về `true` nếu phiên này đủ điều kiện
     * nạp/hiển thị App Open Ad (từ lần mở thứ 3 trở đi).
     * Increments launch count at Splash and returns `true` when App Open is eligible (3rd+ launch).
     */
    fun recordLaunchAndCheckAppOpenEligible(context: Context): Boolean {
        val prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val priorOpens = prefs.getInt(KEY_COMPLETED_LAUNCHES, 0)
        prefs.edit().putInt(KEY_COMPLETED_LAUNCHES, priorOpens + 1).apply()
        return AdOptimizationPolicy.shouldPreloadAppOpenOnLaunch(priorOpens)
    }

    /**
     * Kiểm tra phiên hiện tại có được phép gọi `app_open_load` / hiển thị App Open hay không.
     * Checks whether the current session may preload or show App Open ads without mutating state.
     */
    fun canPreloadAppOpenInSession(context: Context): Boolean {
        val prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val completedLaunches = prefs.getInt(KEY_COMPLETED_LAUNCHES, 0)
        return AdOptimizationPolicy.shouldPreloadAppOpenInSession(completedLaunches)
    }
}
