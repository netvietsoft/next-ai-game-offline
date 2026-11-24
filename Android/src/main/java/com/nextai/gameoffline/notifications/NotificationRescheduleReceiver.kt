package com.nextai.gameoffline.notifications

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Khôi phục lịch sau reboot, cập nhật app hoặc thay đổi thời gian/múi giờ.
 * Restores notification alarms after reboot, app update, or clock/time-zone changes.
 */
class NotificationRescheduleReceiver : BroadcastReceiver() {

    /**
     * Lập lại toàn bộ alarm vì AlarmManager không giữ alarm qua reboot.
     * Force-reschedule every alarm because AlarmManager does not retain alarms after reboot.
     */
    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        if (action !in SUPPORTED_ACTIONS) return
        NotificationScheduler.ensureScheduled(
            context = context,
            force = true,
            reason = action.substringAfterLast('.').lowercase()
        )
    }

    companion object {
        private val SUPPORTED_ACTIONS = setOf(
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_MY_PACKAGE_REPLACED,
            Intent.ACTION_TIME_CHANGED,
            Intent.ACTION_TIMEZONE_CHANGED
        )
    }
}
