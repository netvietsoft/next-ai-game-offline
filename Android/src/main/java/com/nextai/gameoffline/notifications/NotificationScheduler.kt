package com.nextai.gameoffline.notifications

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * Lập lịch 3 khung giờ nhắc nhở cục bộ (08h / 12h / 20h) mà không yêu cầu quyền Exact Alarm.
 * Schedules three local daily reminders (08:00 / 12:00 / 20:00) without Exact Alarm access.
 */
object NotificationScheduler {
    internal const val SCHEDULE_VERSION = 2
    private const val PREFERENCES_NAME = "daily_notification_schedule_v1"
    private const val KEY_VERSION = "schedule_version"
    private const val KEY_TIME_ZONE = "last_time_zone"
    private const val KEY_ROTATION_START_DAY = "rotation_start_day_v2"
    private const val ALARM_REQUEST_CODE_BASE = 41_000
    private const val LEGACY_SLOT_COUNT = 5

    /**
     * Lập lịch idempotent và hủy đủ 5 slot cũ khi nâng cấp phiên bản lịch.
     * Schedules slots idempotently and cancels all 5 legacy slots during migration.
     */
    @Synchronized
    fun ensureScheduled(context: Context, force: Boolean = false, reason: String = "app_start") {
        val app = context.applicationContext
        val prefs = app.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)
        val migrated = prefs.getInt(KEY_VERSION, 0) != SCHEDULE_VERSION
        if (migrated) {
            cancelLegacySlots(app)
        }
        val now = System.currentTimeMillis()
        if (!prefs.contains(KEY_ROTATION_START_DAY)) {
            val todayIndex = NotificationSchedulePolicy.localDayIndex(now)
            prefs.edit().putLong(KEY_ROTATION_START_DAY, todayIndex).apply()
        }
        val zone = TimeZone.getDefault().id
        val reset = force || migrated || prefs.getString(KEY_TIME_ZONE, null) != zone
        NotificationSchedulePolicy.minutesOfDay().forEachIndexed { slot, minute ->
            val stored = prefs.getLong(triggerKey(slot), 0L)
            val lastAttempt = prefs.getLong(attemptKey(slot), 0L)
            // Application.onCreate không đẩy alarm vừa đến hạn sang ngày mai.
            // Do not defer a just-due alarm to tomorrow on process startup.
            val trigger = NotificationSchedulePolicy.triggerForRecovery(
                now = now,
                minute = minute,
                stored = stored,
                lastAttempt = lastAttempt,
                reset = reset
            )
            // Re-arm kể cả trigger không đổi vì force-stop hủy alarm; PendingIntent cố định tránh trùng.
            // Re-arm even unchanged triggers because force-stop clears alarms; fixed PendingIntents replace them.
            scheduleSlot(app, slot, minute, trigger, reason)
        }
        prefs.edit()
            .putInt(KEY_VERSION, SCHEDULE_VERSION)
            .putString(KEY_TIME_ZONE, zone)
            .apply()
    }

    private fun cancelLegacySlots(app: Context) {
        val alarms = app.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        for (slot in 0 until LEGACY_SLOT_COUNT) {
            val intent = Intent(app, DailyNotificationReceiver::class.java)
                .setAction(DailyNotificationReceiver.ACTION_DELIVER_NOTIFICATION)
            val oldPending = PendingIntent.getBroadcast(
                app,
                ALARM_REQUEST_CODE_BASE + slot,
                intent,
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
            )
            if (oldPending != null) {
                alarms.cancel(oldPending)
                oldPending.cancel()
            }
        }
    }

    /** Không bù các slot đã qua / Schedule the next occurrence without catching up missed slots. */
    fun scheduleNextOccurrence(context: Context, slotIndex: Int, reason: String = "delivered") {
        val minute = NotificationSchedulePolicy.minutesOfDay().getOrNull(slotIndex) ?: return
        scheduleSlot(context.applicationContext, slotIndex, minute,
            NotificationSchedulePolicy.nextTriggerAtMillis(System.currentTimeMillis(), minute), reason)
    }

    /** Nội dung theo ngày đã lên lịch / Content follows the scheduled civil day. */
    fun contentDay(context: Context, scheduledAtMillis: Long): Int {
        val prefs = context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)
        return NotificationSchedulePolicy.rotationDay(prefs.getLong(KEY_ROTATION_START_DAY,
            NotificationSchedulePolicy.localDayIndex(System.currentTimeMillis())), scheduledAtMillis)
    }

    /** Claim mỗi slot/ngày một lần / Claim an occurrence once to prevent duplicate delivery. */
    @Synchronized
    fun claimOccurrence(context: Context, slot: Int, scheduledAtMillis: Long, notificationId: String): Boolean {
        val prefs = context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)
        if (prefs.getLong(attemptKey(slot), 0L) >= scheduledAtMillis ||
            prefs.getString("attempt_id_slot_$slot", null) == notificationId) return false
        return prefs.edit().putLong(attemptKey(slot), scheduledAtMillis)
            .putString("attempt_id_slot_$slot", notificationId).commit()
    }

    /**
     * Đặt một PendingIntent duy nhất cho mỗi slot; Android có thể trì hoãn nhẹ theo Doze.
     * Schedules one fixed PendingIntent per slot; Android Doze may shift delivery slightly.
     */
    private fun scheduleSlot(context: Context, slot: Int, minute: Int, trigger: Long, reason: String) {
        val formatter = SimpleDateFormat("yyyyMMdd", Locale.US).apply {
            timeZone = TimeZone.getDefault()
        }
        val date = formatter.format(Date(trigger))
        val id = "${date}_slot_$slot"
        val alarmIntent = Intent(context, DailyNotificationReceiver::class.java).apply {
            action = DailyNotificationReceiver.ACTION_DELIVER_NOTIFICATION
            putExtra(NotificationExtras.NOTIFICATION_ID, id)
            putExtra(NotificationExtras.SLOT_INDEX, slot)
            putExtra(NotificationExtras.MINUTE_OF_DAY, minute)
            putExtra(NotificationExtras.SCHEDULED_AT_MILLIS, trigger)
            putExtra(NotificationExtras.SCHEDULE_VERSION, SCHEDULE_VERSION)
        }
        val pending = PendingIntent.getBroadcast(
            context,
            ALARM_REQUEST_CODE_BASE + slot,
            alarmIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, trigger, pending)

        context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)
            .edit()
            .putLong(triggerKey(slot), trigger)
            .apply()
        val day = contentDay(context, trigger)
        NotificationAnalyticsTracker.logScheduled(context, id, slot, minute, trigger, reason, day)
    }

    /** Khóa trigger / Trigger key. */
    private fun triggerKey(slot: Int) = "scheduled_at_slot_$slot"
    /** Khóa lần đã xử lý / Processed-occurrence key. */
    private fun attemptKey(slot: Int) = "last_attempt_v2_slot_$slot"
}

/** Extra nội bộ dùng chung / Shared internal Intent extras. */
internal object NotificationExtras {
    const val NOTIFICATION_ID = "notification_id"
    const val SLOT_INDEX = "notification_slot"
    const val MINUTE_OF_DAY = "minute_of_day"
    const val SCHEDULED_AT_MILLIS = "scheduled_at_millis"
    const val DISPLAY_NOTIFICATION_ID = "display_notification_id"
    const val SCHEDULE_VERSION = "notification_schedule_version"
    const val CONTENT_DAY = "notification_content_day"
    const val GAME_NAME = "notification_game_name"
}
