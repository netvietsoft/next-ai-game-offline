package com.nextai.gameoffline.notifications

import android.content.Context
import android.content.Intent
import com.nextai.gameoffline.crash.CrashReportingManager

/**
 * Đo click từ Intent mở Activity trực tiếp, không dùng notification trampoline bị cấm.
 * Measures clicks from a direct Activity launch Intent without a forbidden notification trampoline.
 */
object NotificationClickTracker {

    /**
     * Xử lý Intent đúng một lần trong onCreate/onNewIntent rồi xóa payload đã tiêu thụ.
     * Handle an Intent once from onCreate/onNewIntent and clear the consumed payload.
     *
     * @return true khi Intent đến từ notification hợp lệ / when the Intent is a valid notification open.
     */
    fun handleIntent(context: Context, intent: Intent?): Boolean {
        if (intent?.action != ACTION_OPEN_NOTIFICATION) return false
        val notificationId = intent.getStringExtra(NotificationExtras.NOTIFICATION_ID) ?: return false
        val slotIndex = intent.getIntExtra(NotificationExtras.SLOT_INDEX, INVALID_VALUE)
        val minuteOfDay = intent.getIntExtra(NotificationExtras.MINUTE_OF_DAY, INVALID_VALUE)
        val scheduledAtMillis = intent.getLongExtra(NotificationExtras.SCHEDULED_AT_MILLIS, 0L)
        if (NotificationSchedulePolicy.minutesOfDay().getOrNull(slotIndex) != minuteOfDay ||
            scheduledAtMillis <= 0L
        ) return false

        try {
            val metrics = context.getSharedPreferences(METRICS_PREFERENCES, Context.MODE_PRIVATE)
            if (metrics.getString("${KEY_LAST_HANDLED_NOTIFICATION_ID}_$slotIndex", null) == notificationId) {
                clearConsumedPayload(intent)
                return true
            }

            val hour = minuteOfDay / 60
            val slotOpenCount = metrics.getLong(slotCountKey(slotIndex), 0L) + 1L
            val hourOpenCount = metrics.getLong(hourCountKey(hour), 0L) + 1L
            metrics.edit()
                .putString("${KEY_LAST_HANDLED_NOTIFICATION_ID}_$slotIndex", notificationId)
                .putLong(slotCountKey(slotIndex), slotOpenCount)
                .putLong(hourCountKey(hour), hourOpenCount)
                .apply()

            NotificationAnalyticsTracker.logOpened(
                context,
                notificationId,
                slotIndex,
                minuteOfDay,
                scheduledAtMillis,
                slotOpenCount,
                hourOpenCount,
                intent.getIntExtra(NotificationExtras.CONTENT_DAY, 0),
                intent.getStringExtra(NotificationExtras.GAME_NAME)
            )
            clearConsumedPayload(intent)
            return true
        } catch (exception: Exception) {
            CrashReportingManager.recordNonFatal("notification_open", exception)
            clearConsumedPayload(intent)
            return false
        }
    }

    /**
     * Xóa action và extra notification để xoay màn hình không ghi click lần hai.
     * Clear the notification action and extras so recreation cannot count a second click.
     */
    private fun clearConsumedPayload(intent: Intent) {
        intent.action = null
        intent.data = null
        intent.removeExtra(NotificationExtras.NOTIFICATION_ID)
        intent.removeExtra(NotificationExtras.SLOT_INDEX)
        intent.removeExtra(NotificationExtras.MINUTE_OF_DAY)
        intent.removeExtra(NotificationExtras.SCHEDULED_AT_MILLIS)
        intent.removeExtra(NotificationExtras.DISPLAY_NOTIFICATION_ID)
        intent.removeExtra(NotificationExtras.CONTENT_DAY)
        intent.removeExtra(NotificationExtras.GAME_NAME)
    }

    /** Tạo khóa đếm theo slot / Build the per-slot counter key. */
    private fun slotCountKey(slotIndex: Int) = "open_count_slot_$slotIndex"

    /** Tạo khóa đếm theo giờ / Build the per-hour counter key. */
    private fun hourCountKey(hour: Int) = "open_count_hour_$hour"

    const val ACTION_OPEN_NOTIFICATION = "com.nextai.game.offline.action.OPEN_NOTIFICATION"

    private const val METRICS_PREFERENCES = "notification_open_metrics_v1"
    private const val KEY_LAST_HANDLED_NOTIFICATION_ID = "last_handled_notification_id"
    private const val INVALID_VALUE = -1
}
