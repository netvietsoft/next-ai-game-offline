package com.nextai.gameoffline.crash

import android.content.Context
import android.content.pm.ApplicationInfo
import android.os.Build
import com.google.firebase.crashlytics.FirebaseCrashlytics

/**
 * Cấu hình Firebase Crashlytics an toàn, không gắn email, tên hoặc mã người dùng.
 * Configures Firebase Crashlytics safely without attaching email, name, or user IDs.
 */
object CrashReportingManager {

    @Volatile
    private var initialized = false

    /**
     * Bật thu thập cho bản release và tắt ở debug để không làm nhiễu dashboard production.
     * Enable collection for release builds and disable debug collection to keep production clean.
     */
    fun initialize(context: Context) {
        if (initialized) return
        synchronized(this) {
            if (initialized) return
            val appContext = context.applicationContext
            val isDebuggable = appContext.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE != 0
            val crashlytics = FirebaseCrashlytics.getInstance()
            crashlytics.setCrashlyticsCollectionEnabled(!isDebuggable)
            crashlytics.setCustomKey("build_environment", if (isDebuggable) "debug" else "release")
            crashlytics.setCustomKey("android_api", Build.VERSION.SDK_INT)
            crashlytics.setCustomKey("app_package", appContext.packageName)
            crashlytics.log("Crash reporting initialized")
            initialized = true
        }
    }

    /**
     * Gửi lỗi không fatal với tên thành phần đã giới hạn; không gửi message có thể chứa PII.
     * Record a non-fatal with a bounded component name; omit messages that may contain PII.
     */
    fun recordNonFatal(component: String, throwable: Throwable) {
        runCatching {
            val crashlytics = FirebaseCrashlytics.getInstance()
            crashlytics.setCustomKey("last_non_fatal_component", component.take(MAX_COMPONENT_LENGTH))
            crashlytics.log("Non-fatal: ${throwable.javaClass.simpleName}")
            crashlytics.recordException(throwable)
        }
    }

    private const val MAX_COMPONENT_LENGTH = 64
}
