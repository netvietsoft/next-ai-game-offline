package com.nextai.gameoffline

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import com.nextai.gameoffline.analytics.GameAnalyticsManager
import com.nextai.gameoffline.analytics.MetaAppEventsManager
import com.nextai.gameoffline.crash.CrashReportingManager
import com.nextai.gameoffline.di.AppContainer
import com.nextai.gameoffline.notifications.NotificationFeatureInitializer

/**
 * Lớp khởi tạo ứng dụng Galaxy Game, sở hữu [AppContainer] duy nhất cho toàn tiến trình.
 * Application entry point owning the process-wide [AppContainer] (no static `instance` locator).
 */
class GameApplication : Application() {

    lateinit var appContainer: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        appContainer = AppContainer(this)

        // Đồng bộ quyền INAPP/SUBS khi khởi động và quay lại tiền cảnh qua 1 BillingClient duy nhất.
        // Synchronize INAPP/SUBS entitlements using the single shared BillingClient.
        appContainer.billingEntitlementMonitor.attach(this)

        // Gắn bộ giám sát tiền cảnh cho App Open Ad khi người chơi quay lại app từ nền.
        // Attach process-level lifecycle observer for foreground-resume App Open ads.
        appContainer.appOpenLifecycleObserver.attach(this)

        // Khởi tạo kênh thông báo, phân tích Firebase/Meta, Crashlytics và lịch nhắc nhở cục bộ.
        // Initialize notification channels, analytics, crash reporting, and local reminder schedules.
        createNotificationChannels()
        GameAnalyticsManager.init(this)
        MetaAppEventsManager.initialize(this)
        CrashReportingManager.initialize(this)
        NotificationFeatureInitializer.initialize(this)
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelName = getString(R.string.notification_channel_name)
            val channelDesc = getString(R.string.notification_channel_description)
            val channel = NotificationChannel(
                CHANNEL_ID_DEFAULT,
                channelName,
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = channelDesc
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    companion object {
        const val CHANNEL_ID_DEFAULT = "nextai_game_offline_channel"
    }
}
