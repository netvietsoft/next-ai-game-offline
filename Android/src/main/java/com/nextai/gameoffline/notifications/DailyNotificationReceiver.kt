package com.nextai.gameoffline.notifications

import android.Manifest
import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.nextai.gameoffline.GameApplication
import com.nextai.gameoffline.R
import com.nextai.gameoffline.crash.CrashReportingManager
import com.nextai.gameoffline.di.appContainer
import com.nextai.gameoffline.presentation.game.GameActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Phát reminder theo lịch cục bộ; không gọi mạng và không vượt quyền hệ thống.
 * Posts scripted local reminders without network requests or permission bypass.
 */
class DailyNotificationReceiver : BroadcastReceiver() {
    /** Dùng goAsync cho đọc tài nguyên cục bộ, luôn finish / Use goAsync for local asset reads and always finish. */
    @SuppressLint("MissingPermission")
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_DELIVER_NOTIFICATION) return
        val id = intent.getStringExtra(NotificationExtras.NOTIFICATION_ID) ?: return
        val slot = intent.getIntExtra(NotificationExtras.SLOT_INDEX, -1)
        val minute = intent.getIntExtra(NotificationExtras.MINUTE_OF_DAY, -1)
        val scheduledAt = intent.getLongExtra(NotificationExtras.SCHEDULED_AT_MILLIS, 0L)
        if (intent.getIntExtra(NotificationExtras.SCHEDULE_VERSION, 0) != NotificationScheduler.SCHEDULE_VERSION ||
            NotificationSchedulePolicy.minutesOfDay().getOrNull(slot) != minute || scheduledAt <= 0L) {
            NotificationScheduler.ensureScheduled(context, force = true, reason = "invalid_payload")
            return
        }
        val pending = goAsync()
        val app = context.applicationContext
        app.appContainer.applicationScope.launch(Dispatchers.IO) {
            var day = 0
            var gameName: String? = null
            try {
                day = NotificationScheduler.contentDay(app, scheduledAt)
                val now = System.currentTimeMillis()
                var status = when {
                    !NotificationSchedulePolicy.isTimely(now, scheduledAt) -> "expired"
                    !NotificationScheduler.claimOccurrence(app, slot, scheduledAt, id) -> "duplicate"
                    else -> deliveryStatus(app)
                }
                if (status == STATUS_DISPLAYED) {
                    val message = NotificationContentRepository.message(app, day, slot)
                    val game = NotificationContentRepository.randomInstalledGame(app)
                    if (game == null) {
                        status = "no_installed_game"
                    } else {
                        gameName = game.name
                        NotificationManagerCompat.from(app).notify(DISPLAY_ID_BASE + slot,
                            buildNotification(app, id, slot, minute, scheduledAt, message, game))
                    }
                }
                NotificationAnalyticsTracker.logDelivery(app, id, slot, minute, scheduledAt, now, status, day, gameName)
            } catch (error: Exception) {
                NotificationAnalyticsTracker.logDelivery(app, id, slot, minute, scheduledAt,
                    System.currentTimeMillis(), "delivery_error", day, gameName)
                CrashReportingManager.recordNonFatal("daily_notification_delivery", error)
            } finally {
                try {
                    NotificationScheduler.scheduleNextOccurrence(app, slot)
                } catch (error: Exception) {
                    CrashReportingManager.recordNonFatal("daily_notification_reschedule", error)
                } finally {
                    pending.finish()
                }
            }
        }
    }

    /**
     * Icon và PendingIntent cùng trỏ trực tiếp vào game đã cài.
     * Icon and direct Activity PendingIntent reference the same installed game.
     */
    private fun buildNotification(
        context: Context,
        id: String,
        slot: Int,
        minute: Int,
        scheduledAt: Long,
        message: NotificationMessage,
        game: NotificationContentRepository.Game
    ): Notification {
        val open = Intent(context, GameActivity::class.java).apply {
            action = NotificationClickTracker.ACTION_OPEN_NOTIFICATION
            data = Uri.parse("gamegate://notification/slot/$slot")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra(GameActivity.EXTRA_GAME_NAME, game.name)
            putExtra(GameActivity.EXTRA_IS_HORIZONTAL, game.horizontal)
            putExtra(NotificationExtras.NOTIFICATION_ID, id)
            putExtra(NotificationExtras.SLOT_INDEX, slot)
            putExtra(NotificationExtras.MINUTE_OF_DAY, minute)
            putExtra(NotificationExtras.SCHEDULED_AT_MILLIS, scheduledAt)
            putExtra(NotificationExtras.DISPLAY_NOTIFICATION_ID, DISPLAY_ID_BASE + slot)
            putExtra(NotificationExtras.CONTENT_DAY, message.day)
            putExtra(NotificationExtras.GAME_NAME, game.name)
        }
        // Activity trực tiếp, không notification trampoline / Direct Activity launch, no notification trampoline.
        val pending = PendingIntent.getActivity(context, OPEN_REQUEST_CODE_BASE + slot, open,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        return NotificationCompat.Builder(context, GameApplication.CHANNEL_ID_DEFAULT)
            .setSmallIcon(R.drawable.ic_notification_game)
            .setLargeIcon(game.icon)
            .setContentTitle(message.title)
            .setContentText(message.body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message.body))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(NotificationCompat.CATEGORY_RECOMMENDATION)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(pending)
            .addAction(0, message.cta, pending)
            .setAutoCancel(true)
            .setOnlyAlertOnce(true)
            .setWhen(scheduledAt)
            .setShowWhen(true)
            .build()
    }

    /** Tôn trọng runtime permission, app và channel / Respect runtime permission, app and channel blocking. */
    private fun deliveryStatus(context: Context): String {
        val granted = Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        if (!granted) return "runtime_permission_blocked"
        if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) return "app_notifications_blocked"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val channel = manager.getNotificationChannel(GameApplication.CHANNEL_ID_DEFAULT)
            if (channel == null || channel.importance == NotificationManager.IMPORTANCE_NONE) return "channel_blocked"
        }
        return STATUS_DISPLAYED
    }

    companion object {
        const val ACTION_DELIVER_NOTIFICATION = "com.nextai.game.offline.action.DELIVER_NOTIFICATION"
        private const val DISPLAY_ID_BASE = 72_000
        private const val OPEN_REQUEST_CODE_BASE = 73_000
        private const val STATUS_DISPLAYED = "displayed"
    }
}
