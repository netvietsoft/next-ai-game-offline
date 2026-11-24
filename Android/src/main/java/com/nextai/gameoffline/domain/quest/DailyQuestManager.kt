package com.nextai.gameoffline.domain.quest

import android.content.Context
import com.nextai.gameoffline.analytics.GameAnalyticsManager
import com.nextai.gameoffline.billing.AdFreePassManager
import java.util.Calendar
import java.util.TimeZone

/**
 * Giao diện lưu trữ cho bộ Nhiệm vụ ngày để kiểm thử thuần JVM (không phụ thuộc Android Runtime).
 * Persistence abstraction enabling pure JVM unit tests for Daily Quest and Streak calculations.
 */
internal interface DailyQuestStore {
    fun getStoredDayKey(): Int
    fun getSlotProgress(slotIndex: Int): Int
    fun isRewardClaimedToday(): Boolean
    fun getStreakDays(): Int
    fun getLastCompletedDayKey(): Int
    fun saveDayState(
        dayKey: Int,
        slot0Progress: Int,
        slot1Progress: Int,
        slot2Progress: Int,
        rewardClaimedToday: Boolean,
        streakDays: Int,
        lastCompletedDayKey: Int
    )
}

/**
 * Bộ máy thuần Kotlin sinh 3 nhiệm vụ tất định theo ngày local (`Calendar`, tương thích `minSdk 24`),
 * theo dõi tiến độ hoàn thành và tính chuỗi Streak liên tiếp (tự đặt lại nếu đứt quá 1 ngày lịch).
 * Pure Kotlin deterministic 3-game daily quest & streak engine using `Calendar` (minSdk 24 safe).
 */
internal class DailyQuestEngine(
    private val store: DailyQuestStore,
    private val calendarProvider: () -> Calendar = { Calendar.getInstance(TimeZone.getDefault()) }
) {

    /** Lấy ảnh chụp nhiệm vụ hôm nay (tự xoay bộ mới khi bước sang ngày lịch mới). */
    fun currentSnapshot(): DailyQuestSnapshot {
        val today = calendarProvider()
        val todayKey = toDayKey(today)
        val yesterdayKey = toYesterdayKey(today)
        val storedDay = store.getStoredDayKey()
        val lastCompleted = store.getLastCompletedDayKey()
        val rawStreak = store.getStreakDays().coerceAtLeast(0)
        val effectiveStreak = if (lastCompleted == todayKey || lastCompleted == yesterdayKey) {
            rawStreak
        } else {
            0
        }

        val p0 = if (storedDay == todayKey) store.getSlotProgress(0) else 0
        val p1 = if (storedDay == todayKey) store.getSlotProgress(1) else 0
        val p2 = if (storedDay == todayKey) store.getSlotProgress(2) else 0
        val claimed = storedDay == todayKey && store.isRewardClaimedToday()

        val templates = questsForDay(todayKey)
        val items = listOf(
            templates[0].copy(progress = p0.coerceIn(0, templates[0].target)),
            templates[1].copy(progress = p1.coerceIn(0, templates[1].target)),
            templates[2].copy(progress = p2.coerceIn(0, templates[2].target))
        )
        val completedCount = items.count { it.isCompleted }
        return DailyQuestSnapshot(
            dayKey = todayKey,
            quests = items,
            completedCount = completedCount,
            allCompleted = completedCount == items.size,
            rewardClaimedToday = claimed,
            streakDays = effectiveStreak
        )
    }

    /** Ghi nhận sự kiện người chơi mở một game (hoàn thành nhiệm vụ Nhóm 1 & Nhóm 3). */
    fun recordGameOpened(gameName: String): DailyQuestUpdateResult =
        applyProgress(gameName, isLevelComplete = false)

    /** Ghi nhận sự kiện vượt 1 màn chơi (tăng tiến độ 2 màn cho nhiệm vụ Giải đố Nhóm 2). */
    fun recordLevelCompleted(gameName: String): DailyQuestUpdateResult =
        applyProgress(gameName, isLevelComplete = true)

    /** Kiểm tra có nên nhắc giữ chuỗi Streak ở khung thông báo 12:00 trưa hay không. */
    fun shouldRemindStreakAtNoon(): Boolean {
        val snap = currentSnapshot()
        return snap.streakDays >= 1 && !snap.allCompleted
    }

    private fun applyProgress(gameName: String, isLevelComplete: Boolean): DailyQuestUpdateResult {
        val today = calendarProvider()
        val todayKey = toDayKey(today)
        val yesterdayKey = toYesterdayKey(today)
        val before = currentSnapshot()

        val updatedProgress = before.quests.map { quest ->
            val matchesGame = quest.gameName.equals(gameName, ignoreCase = true)
            val shouldIncrement = when (quest.type) {
                DailyQuestType.PUZZLE_TWO_LEVELS -> matchesGame && isLevelComplete
                DailyQuestType.BOARD_OR_TWO_PLAYERS,
                DailyQuestType.ARCADE_REFLEX -> matchesGame && !isLevelComplete
            }
            if (shouldIncrement) {
                (quest.progress + 1).coerceAtMost(quest.target)
            } else {
                quest.progress
            }
        }

        val allDoneNow = before.quests.indices.all { i -> updatedProgress[i] >= before.quests[i].target }
        val newlyCompletedAll = allDoneNow && !before.rewardClaimedToday
        val nextClaimed = before.rewardClaimedToday || newlyCompletedAll
        val nextStreak = if (newlyCompletedAll) {
            if (store.getLastCompletedDayKey() == yesterdayKey) {
                store.getStreakDays().coerceAtLeast(0) + 1
            } else {
                1
            }
        } else {
            before.streakDays
        }
        val nextLastCompleted = if (newlyCompletedAll) todayKey else store.getLastCompletedDayKey()

        store.saveDayState(
            dayKey = todayKey,
            slot0Progress = updatedProgress[0],
            slot1Progress = updatedProgress[1],
            slot2Progress = updatedProgress[2],
            rewardClaimedToday = nextClaimed,
            streakDays = nextStreak,
            lastCompletedDayKey = nextLastCompleted
        )
        return DailyQuestUpdateResult(
            snapshot = currentSnapshot(),
            newlyCompletedAll = newlyCompletedAll
        )
    }

    companion object {
        const val DAILY_COMPLETION_BONUS_MINUTES = 15

        private val BOARD_POOL = listOf(
            "ludo" to "Ludo",
            "pool_8_pro" to "Pool 8 Pro",
            "tic_tac_toe" to "Tic Tac Toe",
            "checkers" to "Checkers",
            "chess" to "Chess",
            "sea_battle" to "Sea Battle",
            "uno_vertical" to "UNO"
        )
        private val PUZZLE_POOL = listOf(
            "amaze_ball_quest" to "Amaze Ball",
            "apple_worm" to "Apple Worm",
            "block_fit_puzzle" to "Block Fit",
            "find_number" to "Find Number",
            "ball_escape" to "Ball Escape",
            "draw_parking" to "Draw Parking"
        )
        private val ARCADE_POOL = listOf(
            "block_blast" to "Block Blast",
            "burger_run" to "Burger Run",
            "block_tetris" to "Block Tetris",
            "knife_hit" to "Knife Hit",
            "pipe_rush" to "Pipe Rush"
        )

        /** Sinh tất định 3 nhiệm vụ theo khóa ngày lịch `yyyyMMdd`. */
        fun questsForDay(dayKey: Int): List<DailyQuestItem> {
            val seed = dayKey.coerceAtLeast(1)
            val board = BOARD_POOL[seed % BOARD_POOL.size]
            val puzzle = PUZZLE_POOL[(seed / 3 + seed) % PUZZLE_POOL.size]
            val arcade = ARCADE_POOL[(seed / 7 + seed) % ARCADE_POOL.size]
            return listOf(
                DailyQuestItem(0, DailyQuestType.BOARD_OR_TWO_PLAYERS, board.first, board.second, 0, 1),
                DailyQuestItem(1, DailyQuestType.PUZZLE_TWO_LEVELS, puzzle.first, puzzle.second, 0, 2),
                DailyQuestItem(2, DailyQuestType.ARCADE_REFLEX, arcade.first, arcade.second, 0, 1)
            )
        }

        fun toDayKey(calendar: Calendar): Int {
            val year = calendar.get(Calendar.YEAR)
            val month = calendar.get(Calendar.MONTH) + 1
            val day = calendar.get(Calendar.DAY_OF_MONTH)
            return year * 10_000 + month * 100 + day
        }

        fun toYesterdayKey(calendar: Calendar): Int {
            val copy = calendar.clone() as Calendar
            copy.add(Calendar.DAY_OF_YEAR, -1)
            return toDayKey(copy)
        }
    }
}

/**
 * Facade Android cho Hệ thống Nhiệm vụ 3 Game/Ngày + Chuỗi Streak 7 Ngày.
 * Tự động thưởng +15 phút Vé Không Quảng Cáo và log `daily_quest_completed` khi đạt 3/3.
 * Android singleton facade awarding +15 min Ad-Free Pass and GA4 telemetry on 3/3 completion.
 */
object DailyQuestManager {

    private const val PREFS_NAME = "nextai_daily_quest_prefs"
    private const val KEY_DAY = "quest_day_key"
    private const val KEY_SLOT_0 = "quest_slot_0"
    private const val KEY_SLOT_1 = "quest_slot_1"
    private const val KEY_SLOT_2 = "quest_slot_2"
    private const val KEY_CLAIMED = "quest_reward_claimed"
    private const val KEY_STREAK = "current_streak_days"
    private const val KEY_LAST_DONE_DAY = "last_completed_day_key"

    private fun engine(context: Context): DailyQuestEngine {
        val prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val store = object : DailyQuestStore {
            override fun getStoredDayKey(): Int = prefs.getInt(KEY_DAY, 0)
            override fun getSlotProgress(slotIndex: Int): Int = when (slotIndex) {
                0 -> prefs.getInt(KEY_SLOT_0, 0)
                1 -> prefs.getInt(KEY_SLOT_1, 0)
                else -> prefs.getInt(KEY_SLOT_2, 0)
            }
            override fun isRewardClaimedToday(): Boolean = prefs.getBoolean(KEY_CLAIMED, false)
            override fun getStreakDays(): Int = prefs.getInt(KEY_STREAK, 0)
            override fun getLastCompletedDayKey(): Int = prefs.getInt(KEY_LAST_DONE_DAY, 0)
            override fun saveDayState(
                dayKey: Int,
                slot0Progress: Int,
                slot1Progress: Int,
                slot2Progress: Int,
                rewardClaimedToday: Boolean,
                streakDays: Int,
                lastCompletedDayKey: Int
            ) {
                prefs.edit()
                    .putInt(KEY_DAY, dayKey)
                    .putInt(KEY_SLOT_0, slot0Progress)
                    .putInt(KEY_SLOT_1, slot1Progress)
                    .putInt(KEY_SLOT_2, slot2Progress)
                    .putBoolean(KEY_CLAIMED, rewardClaimedToday)
                    .putInt(KEY_STREAK, streakDays)
                    .putInt(KEY_LAST_DONE_DAY, lastCompletedDayKey)
                    .apply()
            }
        }
        return DailyQuestEngine(store)
    }

    @Synchronized
    fun currentSnapshot(context: Context): DailyQuestSnapshot = engine(context).currentSnapshot()

    @Synchronized
    fun shouldRemindStreakAtNoon(context: Context): Boolean =
        engine(context).shouldRemindStreakAtNoon()

    @Synchronized
    fun recordGameOpened(context: Context, gameName: String): DailyQuestUpdateResult {
        val result = engine(context).recordGameOpened(gameName)
        handleCompletionReward(context, result)
        return result
    }

    @Synchronized
    fun recordLevelCompleted(context: Context, gameName: String): DailyQuestUpdateResult {
        val result = engine(context).recordLevelCompleted(gameName)
        handleCompletionReward(context, result)
        return result
    }

    private fun handleCompletionReward(context: Context, result: DailyQuestUpdateResult) {
        if (!result.newlyCompletedAll) {
            return
        }
        AdFreePassManager.grantBonusMinutes(
            context = context.applicationContext,
            minutes = DailyQuestEngine.DAILY_COMPLETION_BONUS_MINUTES,
            source = "daily_quest"
        )
        GameAnalyticsManager.logDailyQuestCompleted(result.snapshot.streakDays)
    }
}
