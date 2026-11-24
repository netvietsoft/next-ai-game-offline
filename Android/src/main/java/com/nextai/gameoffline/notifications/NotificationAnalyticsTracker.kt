package com.nextai.gameoffline.notifications

import android.content.Context
import android.os.Bundle
import com.google.firebase.analytics.FirebaseAnalytics
import java.util.Locale
import java.util.TimeZone

/** Tracking vòng đời thông báo, không ID cá nhân / Notification lifecycle tracking without personal user identifiers. */
object NotificationAnalyticsTracker {
    /** Ghi lập lịch; không tính là đã nhận / Record scheduling, never count this as delivery. */
    fun logScheduled(context: Context, notificationId: String, slotIndex: Int, minuteOfDay: Int,
        scheduledAtMillis: Long, reason: String, contentDay: Int) {
        val analytics = FirebaseAnalytics.getInstance(context.applicationContext)
        analytics.setUserProperty("notification_cohort_hour", null)
        analytics.logEvent("notification_scheduled", baseBundle(notificationId, slotIndex, minuteOfDay,
            scheduledAtMillis, contentDay, null).apply {
            putString("schedule_reason", reason.take(100))
            putString("notification_phase", "scheduled")
        })
    }

    /** Ghi kết quả notify; posted không chứng minh người dùng đã đọc / Record notify result; posting does not prove the user read it. */
    fun logDelivery(context: Context, notificationId: String, slotIndex: Int, minuteOfDay: Int,
        scheduledAtMillis: Long, actualAtMillis: Long, status: String, contentDay: Int = 0, gameName: String? = null) {
        val bundle = baseBundle(notificationId, slotIndex, minuteOfDay, scheduledAtMillis, contentDay, gameName).apply {
            putString("delivery_status", status.take(100))
            putString("notification_phase", if (status == "displayed") "posted" else "suppressed")
            putLong("delivery_delay_sec", ((actualAtMillis - scheduledAtMillis) / 1_000L).coerceAtLeast(0L))
        }
        val analytics = FirebaseAnalytics.getInstance(context.applicationContext)
        analytics.logEvent("notification_delivery", bundle)
        // Alias theo giờ CHỈ phát khi notify thành công / Hour aliases fire ONLY after successful notify.
        if (status == "displayed") {
            NotificationSchedulePolicy.deliveryEventName(minuteOfDay)?.let {
                analytics.logEvent(it, bundle)
            }
        }
    }

    /** Click có event riêng, không cộng vào delivery alias / Clicks use a separate event, not the delivery aliases. */
    fun logOpened(
        context: Context,
        notificationId: String,
        slotIndex: Int,
        minuteOfDay: Int,
        scheduledAtMillis: Long,
        slotOpenCount: Long,
        hourOpenCount: Long,
        contentDay: Int = 0,
        gameName: String? = null
    ) {
        FirebaseAnalytics.getInstance(context.applicationContext).logEvent("notification_opened",
            baseBundle(notificationId, slotIndex, minuteOfDay, scheduledAtMillis, contentDay, gameName).apply {
                putLong("slot_open_count", slotOpenCount)
                putLong("hour_open_count", hourOpenCount)
                putLong("opened_at", System.currentTimeMillis())
                putString("notification_phase", "opened")
            })
    }

    /** Phân biệt quyền chặn với không tương tác / Distinguish denied permission from no engagement. */
    fun logPermissionStatus(context: Context, status: String) {
        FirebaseAnalytics.getInstance(context.applicationContext).logEvent("notification_permission",
            Bundle().apply { putString("permission_status", status.take(100)) })
    }

    /** Label chữ giúp custom dimension GA4 cho app / Alphanumeric labels support GA4 app custom dimensions. */
    private fun baseBundle(notificationId: String, slotIndex: Int, minuteOfDay: Int, scheduledAtMillis: Long,
        contentDay: Int, gameName: String?) = Bundle().apply {
        putString("notification_id", notificationId.take(100))
        putLong("notification_slot", slotIndex.toLong())
        putLong("scheduled_hour", (minuteOfDay / 60).toLong())
        putString("scheduled_hour_label", String.format(Locale.US, "hour_%02d", minuteOfDay / 60))
        putLong("scheduled_minute", (minuteOfDay % 60).toLong())
        putLong("scheduled_at", scheduledAtMillis)
        putString("device_timezone", TimeZone.getDefault().id.take(100))
        if (contentDay in 1..365) {
            putLong("content_day", contentDay.toLong())
            putString("content_day_label", String.format(Locale.US, "day_%03d", contentDay))
        }
        gameName?.let { putString("game_name", it.take(100)) }
    }
}
