package com.nextai.gameoffline.ads

import android.content.Context
import android.util.Log
import com.google.android.gms.ads.MobileAds
import com.nextai.gameoffline.BuildConfig

/**
 * Quản lý khởi tạo Google Mobile Ads SDK một lần an toàn đồng thời kèm hàng đợi callback.
 * Manages thread-safe one-time Google Mobile Ads SDK initialization and subscriber queueing.
 *
 * Khắc phục B-13: Nếu `MobileAds.initialize` ném ngoại lệ, giải phóng toàn bộ callback để
 * không treo màn hình Splash nhưng KHÔNG đánh dấu `isReady = true` vĩnh viễn, cho phép
 * thử khởi tạo lại ở lần request quảng cáo kế tiếp.
 * Fix for B-13: On initialization exception, drains waiting callbacks so the splash never hangs
 * without permanently marking `isReady = true`, allowing future ad requests to retry safely.
 */
internal class MobileAdsInitializer(
    private val scheduler: AdScheduler = MainHandlerAdScheduler
) {

    private val lock = Any()
    private val waitingCallbacks = mutableListOf<(Boolean) -> Unit>()

    @Volatile
    var isReady: Boolean = false
        private set

    @Volatile
    private var isInitializing: Boolean = false

    /**
     * Khởi tạo SDK trên Main Thread và gọi `onReady(success)` khi hoàn tất.
     * Initializes MobileAds on the main thread and invokes `onReady(success)` upon completion.
     */
    fun initialize(context: Context, onReady: ((Boolean) -> Unit)? = null) {
        if (isReady) {
            onReady?.let { callback -> scheduler.runOnMain { callback(true) } }
            return
        }

        var shouldStart = false
        synchronized(lock) {
            if (isReady) {
                onReady?.let { callback -> scheduler.runOnMain { callback(true) } }
                return
            }
            onReady?.let(waitingCallbacks::add)
            if (!isInitializing) {
                isInitializing = true
                shouldStart = true
            }
        }
        if (!shouldStart) {
            return
        }

        val appContext = context.applicationContext
        scheduler.runOnMain {
            try {
                // Đồng bộ quyền riêng tư GDPR/CCPA cho các SDK mediation trước khi khởi chạy MobileAds.
                // Propagate UMP GDPR/CCPA privacy signals to mediation SDKs before MobileAds initializes.
                MediationPrivacyBridge.syncFromUmpConsent(appContext)
                MobileAds.initialize(appContext) { status ->
                    val callbacks = synchronized(lock) {
                        isReady = true
                        isInitializing = false
                        waitingCallbacks.toList().also { waitingCallbacks.clear() }
                    }
                    if (BuildConfig.DEBUG) {
                        status.adapterStatusMap.forEach { (adapter, adapterStatus) ->
                            Log.i(
                                TAG,
                                "Adapter=$adapter state=${adapterStatus.initializationState} " +
                                    "latencyMs=${adapterStatus.latency}"
                            )
                        }
                    }
                    callbacks.forEach { it.invoke(true) }
                }
            } catch (error: Exception) {
                val callbacks = synchronized(lock) {
                    isInitializing = false
                    waitingCallbacks.toList().also { waitingCallbacks.clear() }
                }
                if (BuildConfig.DEBUG) {
                    Log.e(TAG, "Mobile Ads initialization failed", error)
                }
                AdMediationAnalytics.logSuppressed(appContext, "SDK", "initialization_exception")
                callbacks.forEach { it.invoke(false) }
            }
        }
    }

    private companion object {
        const val TAG = "MobileAdsInitializer"
    }
}
