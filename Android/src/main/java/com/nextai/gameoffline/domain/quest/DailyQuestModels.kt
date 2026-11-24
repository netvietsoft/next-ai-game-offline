package com.nextai.gameoffline.domain.quest

/**
 * Loại nhiệm vụ hàng ngày sinh tất định từ 3 nhóm game Bundled giữ chân cao nhất.
 * Category of each daily quest slot selected deterministically from top bundled games.
 */
enum class DailyQuestType {
    BOARD_OR_TWO_PLAYERS,
    PUZZLE_TWO_LEVELS,
    ARCADE_REFLEX
}

/**
 * Một nhiệm vụ trong bộ 3 nhiệm vụ hàng ngày kèm tiến độ hiện tại.
 * A single item in the 3-quest daily set with its current progress and target.
 */
data class DailyQuestItem(
    val slotIndex: Int,
    val type: DailyQuestType,
    val gameName: String,
    val gameTitle: String,
    val progress: Int,
    val target: Int
) {
    val isCompleted: Boolean
        get() = progress >= target
}

/**
 * Trạng thái tổng hợp bộ Nhiệm vụ ngày và chuỗi Streak hiện tại để hiển thị trên Trang chủ.
 * Aggregated snapshot of today's 3 quests, completion state, and consecutive streak days.
 */
data class DailyQuestSnapshot(
    val dayKey: Int,
    val quests: List<DailyQuestItem>,
    val completedCount: Int,
    val allCompleted: Boolean,
    val rewardClaimedToday: Boolean,
    val streakDays: Int
)

/**
 * Kết quả sau khi ghi nhận một hành động chơi game vào hệ thống Nhiệm vụ ngày.
 * Outcome returned after applying a gameplay event to today's daily quests.
 */
data class DailyQuestUpdateResult(
    val snapshot: DailyQuestSnapshot,
    val newlyCompletedAll: Boolean
)
