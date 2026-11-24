package com.nextai.gameoffline.notifications

import java.util.Calendar
import java.util.TimeZone

/** Ba khung giờ địa phương cố định và chu kỳ365 ngày / Three fixed local slots and a365-day rotation. */
object NotificationSchedulePolicy {
    const val NOTIFICATIONS_PER_DAY = 3
    const val MINUTES_PER_DAY = 24 * 60
    const val ROTATION_DAYS = 365
    const val MAX_DELIVERY_DELAY_MS = 2L * 60 * 60 * 1_000

    /** Lịch người dùng, không cohort ngẫu nhiên / User schedule without a random cohort. */
    fun minutesOfDay(): List<Int> = listOf(8 * 60, 12 * 60, 20 * 60)

    /** Giữ chính tả event người dùng yêu cầu / Preserve the requested event spelling. */
    fun deliveryEventName(minuteOfDay: Int): String? = when (minuteOfDay) {
        8 * 60 -> "notifycation_time_8h"
        12 * 60 -> "notifycation_time_12h"
        20 * 60 -> "notifycation_time_20h"
        else -> null
    }

    /** Tìm lần tiếp theo theo giờ địa phương, kể cả DST / Find the next local occurrence including DST. */
    fun nextTriggerAtMillis(nowMillis: Long, minuteOfDay: Int, timeZone: TimeZone = TimeZone.getDefault()): Long {
        require(minuteOfDay in 0 until MINUTES_PER_DAY)
        return Calendar.getInstance(timeZone).apply {
            timeInMillis = nowMillis
            set(Calendar.HOUR_OF_DAY, minuteOfDay / 60)
            set(Calendar.MINUTE, minuteOfDay % 60)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
            if (timeInMillis <= nowMillis) add(Calendar.DAY_OF_YEAR, 1)
        }.timeInMillis
    }

    /** Ngày dân sự không phụ thuộc độ dài ngày DST / Civil-day index independent of DST day length. */
    fun localDayIndex(atMillis: Long, timeZone: TimeZone = TimeZone.getDefault()): Long {
        val local = Calendar.getInstance(timeZone).apply { timeInMillis = atMillis }
        return Calendar.getInstance(TimeZone.getTimeZone("UTC")).apply {
            clear()
            set(local.get(Calendar.YEAR), local.get(Calendar.MONTH), local.get(Calendar.DAY_OF_MONTH))
        }.timeInMillis / 86_400_000L
    }

    /** Ngày001 là ngày kích hoạt; hết365 quay lại001 / Day001 starts on activation; wrap after365. */
    fun rotationDay(startDay: Long, scheduledAtMillis: Long, timeZone: TimeZone = TimeZone.getDefault()): Int =
        ((localDayIndex(scheduledAtMillis, timeZone) - startDay).coerceAtLeast(0L) % ROTATION_DAYS).toInt() + 1

    /** Không phát dồn alarm cũ sau Doze/đổi giờ / Do not burst stale alarms after Doze/clock changes. */
    fun isTimely(nowMillis: Long, scheduledAtMillis: Long): Boolean =
        nowMillis >= scheduledAtMillis && nowMillis - scheduledAtMillis <= MAX_DELIVERY_DELAY_MS

    /** Khôi phục occurrence trong grace sau force-stop, hoặc lấy slot kế tiếp / Recover a due occurrence after force-stop, otherwise choose the next slot. */
    fun triggerForRecovery(now: Long, minute: Int, stored: Long, lastAttempt: Long,
        reset: Boolean, timeZone: TimeZone = TimeZone.getDefault()): Long =
        if (!reset && isTimely(now, stored) && lastAttempt < stored) stored
        else nextTriggerAtMillis(now, minute, timeZone)
}
