package com.nextai.gameoffline.domain.quest

import com.nextai.gameoffline.notifications.NotificationMessage
import com.nextai.gameoffline.notifications.NotificationScript
import java.util.Calendar
import java.util.TimeZone
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Kiểm thử đơn vị cho [DailyQuestEngine] (sinh 3 nhiệm vụ tất định, tính chuỗi Streak qua ngày mới,
 * tự reset khi đứt quãng > 1 ngày) và cá nhân hóa thông báo nhắc Streak khung 12:00 trưa.
 * JVM unit tests for deterministic daily quests, multi-day streak tracking, and noon reminders.
 */
class DailyQuestManagerTest {

    private class InMemoryQuestStore : DailyQuestStore {
        var dayKey = 0
        val slots = intArrayOf(0, 0, 0)
        var claimed = false
        var streak = 0
        var lastDone = 0

        override fun getStoredDayKey(): Int = dayKey
        override fun getSlotProgress(slotIndex: Int): Int = slots[slotIndex]
        override fun isRewardClaimedToday(): Boolean = claimed
        override fun getStreakDays(): Int = streak
        override fun getLastCompletedDayKey(): Int = lastDone
        override fun saveDayState(
            dayKey: Int,
            slot0Progress: Int,
            slot1Progress: Int,
            slot2Progress: Int,
            rewardClaimedToday: Boolean,
            streakDays: Int,
            lastCompletedDayKey: Int
        ) {
            this.dayKey = dayKey
            slots[0] = slot0Progress
            slots[1] = slot1Progress
            slots[2] = slot2Progress
            claimed = rewardClaimedToday
            streak = streakDays
            lastDone = lastCompletedDayKey
        }
    }

    private fun utcCalendar(year: Int, monthOneBased: Int, day: Int): Calendar {
        return Calendar.getInstance(TimeZone.getTimeZone("UTC")).apply {
            set(year, monthOneBased - 1, day, 10, 0, 0)
            set(Calendar.MILLISECOND, 0)
        }
    }

    @Test
    fun completesThreeQuestsIncrementsStreakAcrossConsecutiveDaysAndResetsAfterGap() {
        var currentDay = utcCalendar(2026, 11, 22)
        val store = InMemoryQuestStore()
        val engine = DailyQuestEngine(store) { currentDay }

        val day1 = engine.currentSnapshot()
        assertEquals(3, day1.quests.size)
        assertEquals(0, day1.streakDays)
        assertFalse(engine.shouldRemindStreakAtNoon())

        // Hoàn thành đủ 3 nhiệm vụ ngày 1 (1 mở bàn cờ + 2 thắng màn giải đố + 1 mở phản xạ).
        engine.recordGameOpened(day1.quests[0].gameName)
        engine.recordLevelCompleted(day1.quests[1].gameName)
        val beforeLast = engine.recordLevelCompleted(day1.quests[1].gameName)
        assertFalse(beforeLast.newlyCompletedAll)
        val completedDay1 = engine.recordGameOpened(day1.quests[2].gameName)
        assertTrue(completedDay1.newlyCompletedAll)
        assertEquals(1, completedDay1.snapshot.streakDays)
        assertTrue(completedDay1.snapshot.allCompleted)

        // Gọi lại lần nữa trong cùng ngày không thưởng trùng.
        val repeatDay1 = engine.recordGameOpened(day1.quests[0].gameName)
        assertFalse(repeatDay1.newlyCompletedAll)
        assertEquals(1, repeatDay1.snapshot.streakDays)

        // Sang ngày liên tiếp 23/11: Streak vẫn giữ 1 và khung 12:00 trưa nhắc giữ chuỗi.
        currentDay = utcCalendar(2026, 11, 23)
        val day2Start = engine.currentSnapshot()
        assertEquals(1, day2Start.streakDays)
        assertEquals(0, day2Start.completedCount)
        assertTrue(engine.shouldRemindStreakAtNoon())

        engine.recordGameOpened(day2Start.quests[0].gameName)
        engine.recordLevelCompleted(day2Start.quests[1].gameName)
        engine.recordLevelCompleted(day2Start.quests[1].gameName)
        val completedDay2 = engine.recordGameOpened(day2Start.quests[2].gameName)
        assertTrue(completedDay2.newlyCompletedAll)
        assertEquals(2, completedDay2.snapshot.streakDays)
        assertFalse(engine.shouldRemindStreakAtNoon())

        // Bỏ lỡ ngày 24/11, quay lại ngày 25/11 -> chuỗi đứt về 0 và hoàn thành lại bắt đầu từ 1.
        currentDay = utcCalendar(2026, 11, 25)
        val day4Start = engine.currentSnapshot()
        assertEquals(0, day4Start.streakDays)
        engine.recordGameOpened(day4Start.quests[0].gameName)
        engine.recordLevelCompleted(day4Start.quests[1].gameName)
        engine.recordLevelCompleted(day4Start.quests[1].gameName)
        val completedDay4 = engine.recordGameOpened(day4Start.quests[2].gameName)
        assertEquals(1, completedDay4.snapshot.streakDays)
    }

    @Test
    fun personalizesOnlyNoonNotificationWhenActiveStreakIsUnfinished() {
        val morning = NotificationMessage(1, 8 * 60, "Morning", "Play now", "Play Now")
        val noon = NotificationMessage(1, 12 * 60, "Noon base", "Noon body", "Play Now")

        val noonPersonalized = NotificationScript.personalizeNoonStreakMessage(
            base = noon,
            streakDays = 3,
            hasCompletedTodayQuests = false,
            streakTitle = "Keep your 3-day streak alive!",
            streakBody = "Finish 3 quests for 15 min ad-free."
        )
        assertEquals("Keep your 3-day streak alive!", noonPersonalized.title)

        val noonAlreadyDone = NotificationScript.personalizeNoonStreakMessage(
            base = noon,
            streakDays = 3,
            hasCompletedTodayQuests = true,
            streakTitle = "Keep your 3-day streak alive!",
            streakBody = "Finish 3 quests for 15 min ad-free."
        )
        assertEquals("Noon base", noonAlreadyDone.title)

        val morningUntouched = NotificationScript.personalizeNoonStreakMessage(
            base = morning,
            streakDays = 3,
            hasCompletedTodayQuests = false,
            streakTitle = "Keep your 3-day streak alive!",
            streakBody = "Finish 3 quests for 15 min ad-free."
        )
        assertEquals("Morning", morningUntouched.title)
    }
}
