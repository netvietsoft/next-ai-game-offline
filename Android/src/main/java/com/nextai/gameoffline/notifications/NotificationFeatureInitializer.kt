package com.nextai.gameoffline.notifications

import android.Manifest
import android.app.Activity
import android.app.AlertDialog
import android.app.Application
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.content.Context
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.nextai.gameoffline.R
import com.nextai.gameoffline.presentation.gamelist.GameListActivity

/**
 * Điểm khởi tạo duy nhất cho lịch notification và luồng xin quyền Android 13+.
 * Single initialization point for notification scheduling and Android 13+ permission flow.
 */
object NotificationFeatureInitializer {

    @Volatile
    private var initialized = false

    /**
     * Khởi tạo idempotent từ Application.onCreate, không tạo foreground service.
     * Initialize idempotently from Application.onCreate without creating a foreground service.
     */
    fun initialize(application: Application) {
        if (initialized) return
        synchronized(this) {
            if (initialized) return
            NotificationScheduler.ensureScheduled(application)
            application.registerActivityLifecycleCallbacks(NotificationPermissionCallbacks())
            initialized = true
        }
    }
}

/**
 * Hiển thị lời giải thích một lần rồi xin POST_NOTIFICATIONS trên launcher.
 * Shows a one-time rationale before requesting POST_NOTIFICATIONS on the launcher.
 */
private class NotificationPermissionCallbacks : Application.ActivityLifecycleCallbacks {

    /** Theo dõi launcher đã sẵn sàng / Observe when the launcher is ready. */
    override fun onActivityResumed(activity: Activity) {
        if (activity !is GameListActivity) return
        val state = permissionState(activity)
        reportStateIfChanged(activity, state)
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU || state == STATUS_GRANTED) return

        val preferences = activity.getSharedPreferences(PERMISSION_PREFERENCES, Context.MODE_PRIVATE)
        if (preferences.getBoolean(KEY_RATIONALE_SHOWN, false)) return

        Handler(Looper.getMainLooper()).postDelayed({
            if (!activity.isFinishing && !activity.isDestroyed &&
                activity.lifecycle.currentState.isAtLeast(androidx.lifecycle.Lifecycle.State.RESUMED) &&
                !preferences.getBoolean(KEY_RATIONALE_SHOWN, false) &&
                ContextCompat.checkSelfPermission(activity, Manifest.permission.POST_NOTIFICATIONS) !=
                PackageManager.PERMISSION_GRANTED
            ) {
                showRationale(activity)
                // Chỉ đánh dấu sau khi dialog thực sự được mở / Mark only after the dialog actually opens.
                preferences.edit().putBoolean(KEY_RATIONALE_SHOWN, true).apply()
            }
        }, RATIONALE_DELAY_MILLIS)
    }

    /**
     * Giải thích giá trị của reminder trước khi mở hộp thoại quyền hệ thống.
     * Explain reminder value before opening the system permission dialog.
     */
    private fun showRationale(activity: Activity) {
        AlertDialog.Builder(activity)
            .setTitle(R.string.notification_permission_title)
            .setMessage(R.string.notification_permission_message)
            .setPositiveButton(R.string.notification_permission_allow) { _, _ ->
                NotificationAnalyticsTracker.logPermissionStatus(activity, STATUS_REQUESTED)
                ActivityCompat.requestPermissions(
                    activity,
                    arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                    REQUEST_CODE_NOTIFICATIONS
                )
            }
            .setNegativeButton(R.string.notification_permission_not_now) { _, _ ->
                NotificationAnalyticsTracker.logPermissionStatus(activity, STATUS_RATIONALE_DECLINED)
            }
            .show()
    }

    /**
     * Chỉ ghi Analytics khi trạng thái quyền thay đổi để tránh nhân bản sự kiện.
     * Log Analytics only when permission state changes to avoid duplicate events.
     */
    private fun reportStateIfChanged(context: Context, status: String) {
        val preferences = context.getSharedPreferences(PERMISSION_PREFERENCES, Context.MODE_PRIVATE)
        if (preferences.getString(KEY_LAST_REPORTED_STATUS, null) == status) return
        preferences.edit().putString(KEY_LAST_REPORTED_STATUS, status).apply()
        NotificationAnalyticsTracker.logPermissionStatus(context, status)
    }

    /** Lấy trạng thái quyền hiện tại / Resolve the current permission state. */
    private fun permissionState(context: Context): String {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            return if (NotificationManagerCompat.from(context).areNotificationsEnabled()) {
                STATUS_GRANTED
            } else {
                STATUS_BLOCKED_IN_SETTINGS
            }
        }
        return if (ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) ==
            PackageManager.PERMISSION_GRANTED
        ) {
            STATUS_GRANTED
        } else {
            STATUS_DENIED
        }
    }

    override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) = Unit
    override fun onActivityStarted(activity: Activity) = Unit
    override fun onActivityPaused(activity: Activity) = Unit
    override fun onActivityStopped(activity: Activity) = Unit
    override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) = Unit
    override fun onActivityDestroyed(activity: Activity) = Unit

    companion object {
        private const val PERMISSION_PREFERENCES = "notification_permission_v1"
        private const val KEY_RATIONALE_SHOWN = "rationale_shown"
        private const val KEY_LAST_REPORTED_STATUS = "last_reported_status"
        private const val REQUEST_CODE_NOTIFICATIONS = 7_201
        private const val RATIONALE_DELAY_MILLIS = 1_200L
        private const val STATUS_GRANTED = "granted"
        private const val STATUS_DENIED = "denied"
        private const val STATUS_REQUESTED = "requested"
        private const val STATUS_RATIONALE_DECLINED = "rationale_declined"
        private const val STATUS_BLOCKED_IN_SETTINGS = "blocked_in_settings"
    }
}
