package com.nextai.gameoffline.analytics

import android.app.Application
import android.util.Log
import com.facebook.FacebookSdk
import com.facebook.appevents.AppEventsLogger
import com.nextai.gameoffline.BuildConfig

/**
 * Khởi tạo App Events với cấu hình client rõ ràng; không dùng App Secret trong ứng dụng.
 * Initializes App Events from explicit client configuration, never an application secret.
 */
object MetaAppEventsManager {
    private const val TAG = "MetaAppEvents"
    private var initialized = false

    /**
     * Bỏ qua debug/thiếu Client Token; chỉ ghi activate/deactivate qua API được chọn rõ ràng.
     * Skip debug/missing client token; explicitly enable activation/deactivation events only.
     */
    @Suppress("DEPRECATION")
    fun initialize(application: Application) {
        if (initialized || BuildConfig.DEBUG || !BuildConfig.FACEBOOK_CONFIGURED) return
        try {
            FacebookSdk.setAutoInitEnabled(false)
            FacebookSdk.setAutoLogAppEventsEnabled(false)
            FacebookSdk.setAdvertiserIDCollectionEnabled(false)
            FacebookSdk.sdkInitialize(application)
            FacebookSdk.fullyInitialize()
            AppEventsLogger.activateApp(application)
            initialized = true
        } catch (error: RuntimeException) {
            // Không in message hoặc token vào log / Never log messages that could contain tokens.
            Log.w(TAG, "Meta initialization unavailable: ${error.javaClass.simpleName}")
        }
    }
}
