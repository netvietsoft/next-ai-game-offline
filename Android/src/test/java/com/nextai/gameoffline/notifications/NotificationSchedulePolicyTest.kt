package com.nextai.gameoffline.notifications

import java.util.Calendar
import java.util.TimeZone
import org.junit.Assert.*
import org.junit.Test

/** Kiểm thử lịch mới theo yêu cầu08/12/20 giờ / Tests the requested08/12/20 local schedule. */
class NotificationSchedulePolicyTest {
    /** Mỗi thời điểm đều tới đúng giờ kế tiếp / Every minute resolves to the correct next local slot. */
    @Test fun exactRequestedSlotsAndNextOccurrences() {
        assertEquals(listOf(480, 720, 1200), NotificationSchedulePolicy.minutesOfDay())
        assertEquals(3, NotificationSchedulePolicy.NOTIFICATIONS_PER_DAY)
        val zone = TimeZone.getTimeZone("Asia/Ho_Chi_Minh")
        for (nowMinute in 0 until 1440) {
            val now = Calendar.getInstance(zone).apply {
                set(2026, Calendar.NOVEMBER, 17, nowMinute / 60, nowMinute % 60, 0)
                set(Calendar.MILLISECOND, 0)
            }
            for (minute in NotificationSchedulePolicy.minutesOfDay()) {
                val trigger = Calendar.getInstance(zone).apply {
                    timeInMillis = NotificationSchedulePolicy.nextTriggerAtMillis(now.timeInMillis, minute, zone)
                }
                assertEquals(minute / 60, trigger.get(Calendar.HOUR_OF_DAY))
                assertEquals(0, trigger.get(Calendar.MINUTE))
                assertEquals(if (minute <= nowMinute) 18 else 17, trigger.get(Calendar.DAY_OF_MONTH))
                assertTrue(trigger.timeInMillis > now.timeInMillis)
            }
        }
    }

    /** Thay đổi DST vẫn giữ giờ địa phương / DST transitions retain local clock times. */
    @Test fun nextMorningAcrossDaylightSaving() {
        val zone = TimeZone.getTimeZone("America/New_York")
        val now = Calendar.getInstance(zone).apply { set(2027, Calendar.MARCH, 13, 21, 0, 0); set(Calendar.MILLISECOND, 0) }
        val next = Calendar.getInstance(zone).apply {
            timeInMillis = NotificationSchedulePolicy.nextTriggerAtMillis(now.timeInMillis, 480, zone)
        }
        assertEquals(14, next.get(Calendar.DAY_OF_MONTH))
        assertEquals(8, next.get(Calendar.HOUR_OF_DAY))
        assertEquals(10L * 60 * 60 * 1000, next.timeInMillis - now.timeInMillis)
    }

    /** Rotation không lệch bởi DST, wrap và năm nhuận / Rotation remains correct over DST, wrap and leap years. */
    @Test fun rotationUsesCivilDaysAndWraps365() {
        val zone = TimeZone.getTimeZone("America/New_York")
        val start = Calendar.getInstance(zone).apply { set(2027, Calendar.MARCH, 13, 8, 0, 0); set(Calendar.MILLISECOND, 0) }
        val anchor = NotificationSchedulePolicy.localDayIndex(start.timeInMillis, zone)
        for (day in 0..730) {
            val at = (start.clone() as Calendar).apply { add(Calendar.DAY_OF_YEAR, day) }
            assertEquals(day % 365 + 1, NotificationSchedulePolicy.rotationDay(anchor, at.timeInMillis, zone))
        }
    }

    /** Chặn alarm sớm/quá cũ và event không đúng slot / Reject early/stale occurrences and unknown event slots. */
    @Test fun deliveryWindowAndRequestedEventNames() {
        val due = 10_000_000L
        assertFalse(NotificationSchedulePolicy.isTimely(due - 1, due))
        assertTrue(NotificationSchedulePolicy.isTimely(due, due))
        assertTrue(NotificationSchedulePolicy.isTimely(due + 7_200_000, due))
        assertFalse(NotificationSchedulePolicy.isTimely(due + 7_200_001, due))
        assertEquals("notifycation_time_8h", NotificationSchedulePolicy.deliveryEventName(480))
        assertEquals("notifycation_time_12h", NotificationSchedulePolicy.deliveryEventName(720))
        assertEquals("notifycation_time_20h", NotificationSchedulePolicy.deliveryEventName(1200))
        assertNull(NotificationSchedulePolicy.deliveryEventName(1))
    }

    /** Mở lại sau force-stop giữ due chưa xử lý, không phát lại due đã claim / Recovery keeps an unhandled due slot without repeating a claimed slot. */
    @Test fun recoveryAfterForceStopAndStaleAlarms() {
        val zone = TimeZone.getTimeZone("Asia/Ho_Chi_Minh")
        val now = Calendar.getInstance(zone).apply { set(2026, Calendar.NOVEMBER, 17, 8, 30, 0); set(Calendar.MILLISECOND, 0) }.timeInMillis
        val due = now - 30 * 60 * 1000
        val tomorrow = NotificationSchedulePolicy.nextTriggerAtMillis(now, 480, zone)
        assertEquals(due, NotificationSchedulePolicy.triggerForRecovery(now, 480, due, 0, false, zone))
        assertEquals(tomorrow, NotificationSchedulePolicy.triggerForRecovery(now, 480, due, due, false, zone))
        assertEquals(tomorrow, NotificationSchedulePolicy.triggerForRecovery(now, 480, due, 0, true, zone))
        assertEquals(tomorrow, NotificationSchedulePolicy.triggerForRecovery(now, 480, now - 3 * 60 * 60 * 1000, 0, false, zone))
        val noon = NotificationSchedulePolicy.nextTriggerAtMillis(now, 720, zone)
        assertEquals(noon, NotificationSchedulePolicy.triggerForRecovery(now, 720, noon, 0, false, zone))
    }
}
