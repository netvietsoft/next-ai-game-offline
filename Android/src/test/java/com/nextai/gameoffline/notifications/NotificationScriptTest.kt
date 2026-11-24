package com.nextai.gameoffline.notifications

import java.io.File
import org.junit.Assert.*
import org.junit.Test

/** Kiểm chứng kịch bản thật, không sinh nội dung giả / Validate the actual supplied script, not synthetic copy. */
class NotificationScriptTest {
    private fun script() = File("src/main/assets/game_push_notifications_365_days.txt").readText(Charsets.UTF_8)

    /** Có đủ1095 entry với DAY001 và CTA chuẩn / All1095 entries contain the expected DAY001 content and CTA. */
    @Test fun parsesAll365DaysAndThreeSlots() {
        val entries = NotificationScript.parse(script())
        assertEquals(1095, entries.size)
        assertEquals("Good Morning, Gamer! ☀️", entries.first().title)
        assertEquals("Start your morning with a quick puzzle. Your next win could be one tap away!", entries.first().body)
        assertEquals(365, entries.last().day)
        assertEquals(1200, entries.last().minuteOfDay)
        assertTrue(entries.all { it.cta == "Play Now" && it.title.isNotBlank() && it.body.isNotBlank() })
        assertEquals(1095, entries.map { it.day to it.minuteOfDay }.distinct().size)
    }

    /** Dữ liệu thiếu không được âm thầm dùng / Missing entries must fail validation. */
    @Test(expected = IllegalArgumentException::class)
    fun rejectsMissingDay() {
        NotificationScript.parse(script().substringBefore("========== DAY 365"))
    }

    /** Không nhận lịch trùng ngày / Duplicate day records are rejected. */
    @Test(expected = IllegalArgumentException::class)
    fun rejectsDuplicateDay() {
        NotificationScript.parse(script().replace("========== DAY 002", "========== DAY 001"))
    }

    /** Không suy đoán copy khi thiếu body / Never guess copy for a missing body. */
    @Test(expected = IllegalArgumentException::class)
    fun rejectsMissingBody() {
        NotificationScript.parse(script().replaceFirst("BODY: Start your morning with a quick puzzle. Your next win could be one tap away!", ""))
    }
}
