package com.nextai.gameoffline.notifications

/** Một nội dung tiếng Anh và thời điểm của kịch bản / One English content entry and its scripted slot. */
data class NotificationMessage(val day: Int, val minuteOfDay: Int, val title: String, val body: String, val cta: String)

/** Parser thuần Kotlin để kiểm chứng đầy đủ1095 nội dung / Pure Kotlin parser validating all1095 entries. */
object NotificationScript {
    /** Đọc đúng DAY/TIME/TITLE/BODY/CTA, từ chối thiếu hoặc trùng / Read exact fields; reject missing or duplicate entries. */
    fun parse(text: String): List<NotificationMessage> {
        val entries = mutableListOf<NotificationMessage>()
        var day = 0
        var minute: Int? = null
        var title: String? = null
        var body: String? = null
        var cta: String? = null
        fun finish() {
            val time = minute ?: return
            require(day in 1..365 && time in NotificationSchedulePolicy.minutesOfDay())
            entries.add(
                NotificationMessage(
                    day = day,
                    minuteOfDay = time,
                    title = requireNotNull(title).also { require(it.isNotBlank()) },
                    body = requireNotNull(body).also { require(it.isNotBlank()) },
                    cta = requireNotNull(cta).also { require(it == "Play Now") }
                )
            )
            minute = null
            title = null
            body = null
            cta = null
        }
        for (line in text.lineSequence()) {
            when {
                line.startsWith("========== DAY ") -> {
                    finish()
                    day = Regex("^========== DAY ([0-9]{3}) ").find(line)?.groupValues?.get(1)?.toInt()
                        ?: error("Invalid notification day")
                }
                line.startsWith("TIME: ") -> {
                    finish()
                    val parts = line.removePrefix("TIME: ").trim().split(':')
                    require(parts.size == 2)
                    minute = parts[0].toInt() * 60 + parts[1].toInt()
                }
                line.startsWith("TITLE: ") -> {
                    require(title == null)
                    title = line.removePrefix("TITLE: ")
                }
                line.startsWith("BODY: ") -> {
                    require(body == null)
                    body = line.removePrefix("BODY: ")
                }
                line.startsWith("CTA: ") -> {
                    require(cta == null)
                    cta = line.removePrefix("CTA: ")
                }
            }
        }
        finish()
        val expected = (1..365).flatMap { d -> NotificationSchedulePolicy.minutesOfDay().map { d to it } }
        require(entries.map { it.day to it.minuteOfDay } == expected) {
            "Expected 365 ordered days with 08:00, 12:00, 20:00 entries"
        }
        return entries
    }

    /**
     * Cá nhân hóa thông báo khung 12:00 trưa (khung Open Rate cao nhất 2.79% trên GA4)
     * nhắc người chơi giữ chuỗi Streak nếu đang có `streakDays >= 1` và chưa hoàn thành nhiệm vụ hôm nay.
     * Personalizes the 12:00 noon reminder with a streak nudge when an active streak is unfinished today.
     */
    fun personalizeNoonStreakMessage(
        base: NotificationMessage,
        streakDays: Int,
        hasCompletedTodayQuests: Boolean,
        streakTitle: String,
        streakBody: String
    ): NotificationMessage {
        if (base.minuteOfDay != NOON_MINUTE_OF_DAY || streakDays < 1 || hasCompletedTodayQuests) {
            return base
        }
        return base.copy(title = streakTitle, body = streakBody)
    }

    const val NOON_MINUTE_OF_DAY = 12 * 60
}
