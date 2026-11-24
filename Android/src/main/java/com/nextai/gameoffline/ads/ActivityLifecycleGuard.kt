package com.nextai.gameoffline.ads

import android.app.Activity
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner

/**
 * Bộ kiểm tra vòng đời Activity an toàn trước khi mở Dialog hoặc quảng cáo toàn màn hình.
 * Activity lifecycle guards applied before presenting dialogs or full-screen ads.
 *
 * Kiểm tra thêm `Lifecycle.State.RESUMED` để ngăn hiển thị quảng cáo khi ứng dụng đã vào nền
 * (ví dụ người dùng bấm Home trong lúc màn hình đệm 700ms đang chạy).
 * Enforces `Lifecycle.State.RESUMED` so full-screen ads never appear after backgrounding
 * (e.g., if the user presses Home during the 700ms interstitial buffer).
 */
internal object ActivityLifecycleGuard {

    /**
     * Kiểm tra cửa sổ Activity vẫn còn tồn tại (chưa đóng hoặc hủy).
     * Returns true when the Activity window is still alive and not finishing or destroyed.
     */
    fun isWindowAlive(activity: Activity): Boolean {
        return !activity.isFinishing && !activity.isDestroyed
    }

    /**
     * Kiểm tra Activity đang ở tiền cảnh (RESUMED) để được phép mở overlay/quảng cáo toàn màn hình.
     * Returns true only when the Activity is alive and currently in the RESUMED foreground state.
     */
    fun isForegroundResumed(activity: Activity): Boolean {
        if (!isWindowAlive(activity)) {
            return false
        }
        if (activity is LifecycleOwner) {
            return activity.lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED)
        }
        return true
    }
}
