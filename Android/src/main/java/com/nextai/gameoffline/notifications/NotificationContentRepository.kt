package com.nextai.gameoffline.notifications

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.nextai.gameoffline.R
import com.nextai.gameoffline.data.remote.GameDownloadManager
import com.nextai.gameoffline.domain.quest.DailyQuestManager
import org.json.JSONArray

/** Nạp kịch bản và chọn cùng game cho icon/đường mở / Load the script and pair each icon with its target game. */
internal object NotificationContentRepository {
    private const val SCRIPT_ASSET = "game_push_notifications_365_days.txt"
    @Volatile private var messages: List<NotificationMessage>? = null

    /** Lấy nội dung theo ngày/slot và ưu tiên nhắc Streak ở khung 12:00 khi nhiệm vụ ngày chưa xong. */
    fun message(context: Context, day: Int, slot: Int): NotificationMessage {
        val all = messages ?: synchronized(this) {
            messages ?: context.assets.open(SCRIPT_ASSET).bufferedReader(Charsets.UTF_8).use {
                NotificationScript.parse(it.readText())
            }.also { messages = it }
        }
        require(day in 1..365 && slot in 0..2)
        val base = all[(day - 1) * 3 + slot]
        val questSnapshot = DailyQuestManager.currentSnapshot(context)
        return NotificationScript.personalizeNoonStreakMessage(
            base = base,
            streakDays = questSnapshot.streakDays,
            hasCompletedTodayQuests = questSnapshot.allCompleted,
            streakTitle = context.getString(
                R.string.daily_quest_streak_notif_title,
                questSnapshot.streakDays
            ),
            streakBody = context.getString(R.string.daily_quest_streak_notif_body)
        )
    }

    /** Game đã cài, icon được giải mã cục bộ / Installed game and its locally decoded icon. */
    data class Game(val name: String, val horizontal: Int, val icon: Bitmap?)

    /** Chỉ chọn game mở được trên máy, không tự tải mạng ở receiver / Only select an installed game; never download in the receiver. */
    fun randomInstalledGame(context: Context): Game? {
        val catalog = context.assets.open("games_catalog_full_419_r2.json")
            .bufferedReader(Charsets.UTF_8)
            .use { JSONArray(it.readText()) }
        val icons = context.assets.list("icons")?.toSet().orEmpty()
        for (index in (0 until catalog.length()).shuffled()) {
            val game = catalog.getJSONObject(index)
            val name = game.getString("name")
            if (!GameDownloadManager.isGameInstalled(context, name)) continue
            val declaredIcon = game.optString("icon")
            val filename = declaredIcon.takeIf { it in icons }
                ?: listOf("$name.webp", "$name.png", "$name.jpg").firstOrNull { it in icons }
            val bitmap = filename?.let { icon ->
                context.assets.open("icons/$icon").use { BitmapFactory.decodeStream(it, null,
                    BitmapFactory.Options().apply { inSampleSize = 2 }) }
            }
            return Game(name, game.optInt("isHorizontal", 0), bitmap)
        }
        return null
    }
}
