package com.nextai.gameoffline

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import com.google.android.gms.ads.MobileAds
import com.nextai.gameoffline.data.local.AppDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * Lớp khởi tạo toàn cục của ứng dụng Game Gate Offline.
 * Global Application class for Game Gate Offline.
 *
 * Nhiệm vụ / Responsibilities:
 * - Khởi tạo SQLite Room Database với dữ liệu 423 mini-game ban đầu.
 * - Khởi tạo kênh thông báo Notification Channels trên Android 8.0+.
 * - Khởi tạo SDK Quảng cáo Google Mobile Ads (AdMob).
 * - Khởi tạo Firebase Analytics đo lường chuyên sâu (Game, Ads, IAP).
 * - Cung cấp Coroutine Scope cho các tác vụ chạy nền toàn cục.
 */
class GameApplication : Application() {

    // Scope coroutine toàn cục cho ứng dụng / Global application coroutine scope
    val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    // Khởi tạo lười cơ sở dữ liệu Room / Lazy initialized Room Database
    val database: AppDatabase by lazy { AppDatabase.getDatabase(this, applicationScope) }

    override fun onCreate() {
        super.onCreate()
        instance = this

        // 1. Khởi tạo Kênh Thông Báo / Initialize Notification Channels
        createNotificationChannels()

        // 2. Khởi tạo Firebase Analytics toàn diện / Initialize Firebase Analytics
        com.nextai.gameoffline.analytics.GameAnalyticsManager.init(this)

        // 3. Khởi tạo SDK Quảng cáo AdMob chạy nền / Initialize Mobile Ads SDK asynchronously
        applicationScope.launch(Dispatchers.IO) {
            // Khởi tạo AdMob nạp quảng cáo thật từ tài khoản Production
            // Initialize AdMob to load real production ads
            MobileAds.initialize(this@GameApplication) {}
        }
    }

    /**
     * Tạo kênh thông báo cho hệ thống thông báo đẩy và dịch vụ nền.
     * Create notification channels for push notifications and foreground services.
     */
    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelName = getString(R.string.notification_channel_name)
            val channelDesc = getString(R.string.notification_channel_description)
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val channel = NotificationChannel(CHANNEL_ID_DEFAULT, channelName, importance).apply {
                description = channelDesc
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    companion object {
        const val CHANNEL_ID_DEFAULT = "nextai_game_offline_channel"
        lateinit var instance: GameApplication
            private set
    }
}
