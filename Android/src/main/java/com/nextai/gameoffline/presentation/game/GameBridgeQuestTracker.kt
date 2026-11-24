package com.nextai.gameoffline.presentation.game

import android.content.Context
import android.widget.Toast
import com.nextai.gameoffline.R
import com.nextai.gameoffline.domain.quest.DailyQuestManager
import com.nextai.gameoffline.domain.quest.DailyQuestUpdateResult

/**
 * Cầu nối mỏng ghi nhận tiến độ Nhiệm vụ ngày từ [GameActivity] mà không làm phình
 * [AndroidGameBridge] (đang ở ngưỡng 341 dòng).
 * Thin SRP tracker feeding gameplay milestones into [DailyQuestManager] without bloating the bridge.
 */
internal class GameBridgeQuestTracker(
    private val context: Context,
    private val gameName: String
) {

    private var hasRecordedOpen = false

    /** Ghi nhận lượt mở game 1 lần mỗi phiên chơi và thông báo nếu vừa hoàn thành 3/3 nhiệm vụ. */
    fun onGameOpened() {
        if (hasRecordedOpen) {
            return
        }
        hasRecordedOpen = true
        notifyIfCompletedAll(DailyQuestManager.recordGameOpened(context, gameName))
    }

    /** Ghi nhận hoàn thành 1 màn chơi cho nhiệm vụ Giải đố 2 màn. */
    fun onLevelCompleted() {
        notifyIfCompletedAll(DailyQuestManager.recordLevelCompleted(context, gameName))
    }

    private fun notifyIfCompletedAll(result: DailyQuestUpdateResult) {
        if (result.newlyCompletedAll) {
            Toast.makeText(context, R.string.daily_quest_all_done, Toast.LENGTH_LONG).show()
        }
    }
}
