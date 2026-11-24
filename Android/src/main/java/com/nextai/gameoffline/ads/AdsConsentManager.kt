package com.nextai.gameoffline.ads

import android.app.Activity
import android.content.Context
import android.util.Log
import android.os.Handler
import android.os.Looper
import com.google.android.ump.ConsentInformation
import com.google.android.ump.ConsentRequestParameters
import com.google.android.ump.UserMessagingPlatform
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Quản lý consent UMP trước mọi request AdMob/Meta mediation.
 * Manages UMP consent before every AdMob/Meta mediation request.
 */
object AdsConsentManager {

    private const val TAG = "AdsConsentManager"
    private const val CONSENT_RETRY_COOLDOWN_MS = 60_000L
    private val readyListeners = mutableSetOf<() -> Unit>()
    private var lastConsentRefreshAttemptMs = 0L
    private var isRefreshingConsent = false

    /** Lắng nghe consent khi màn hình hiển thị / Observe consent while a screen is active. */
    fun addReadyListener(listener: () -> Unit) {
        readyListeners.add(listener)
        listener()
    }

    /** Hủy lắng nghe khi màn hình dừng / Remove the observer when the screen stops. */
    fun removeReadyListener(listener: () -> Unit) {
        readyListeners.remove(listener)
    }

    /** Báo cho UI đang sống khi consent sẵn sàng / Notify active UI when consent becomes ready. */
    private fun notifyReady() {
        readyListeners.toList().forEach { it() }
    }

    /**
     * Làm mới consent khi lần khởi động trước lỗi mạng mà không spam request khi quay lại màn hình.
     * Refreshes consent after an offline startup failure without spamming on every resume.
     */
    fun refreshConsentIfNeeded(activity: Activity) {
        if (canRequestAds(activity) || isRefreshingConsent || activity.isFinishing || activity.isDestroyed) return
        val now = System.currentTimeMillis()
        if (now - lastConsentRefreshAttemptMs < CONSENT_RETRY_COOLDOWN_MS) return
        lastConsentRefreshAttemptMs = now
        isRefreshingConsent = true
        gatherConsent(activity) { allowed ->
            isRefreshingConsent = false
            if (allowed) {
                notifyReady()
            }
        }
    }

    /**
     * Làm mới consent mỗi lần mở app, hiển thị form khi cần và chỉ callback đúng một lần.
     * Refresh consent on every app launch, show a required form, and callback exactly once.
     */
    fun gatherConsent(activity: Activity, onComplete: (Boolean) -> Unit) {
        val consentInformationContext = activity.applicationContext
        val consentInformation = UserMessagingPlatform.getConsentInformation(consentInformationContext)
        val completed = AtomicBoolean(false)
        val finish: () -> Unit = {
            if (completed.compareAndSet(false, true)) {
                val allowed = consentInformation.canRequestAds()
                MediationPrivacyBridge.applyConsent(consentInformationContext, allowed)
                onComplete(allowed)
            }
        }
        // Giới hạn cập nhật mạng, không đóng form đang mở / Bound the network update, never dismiss an active form.
        val handler = Handler(Looper.getMainLooper())
        val updateFinished = AtomicBoolean(false)
        val timeout = Runnable {
            if (updateFinished.compareAndSet(false, true)) finish()
        }
        handler.postDelayed(timeout, 8_000L)
        val requestParameters = ConsentRequestParameters.Builder().build()
        consentInformation.requestConsentInfoUpdate(
            activity,
            requestParameters,
            {
                if (!updateFinished.compareAndSet(false, true)) {
                    // Không mở form trên Activity cũ / Never show a form on the stale Activity.
                    notifyReady()
                    return@requestConsentInfoUpdate
                }
                handler.removeCallbacks(timeout)
                if (activity.isFinishing || activity.isDestroyed) {
                    finish()
                    return@requestConsentInfoUpdate
                }
                UserMessagingPlatform.loadAndShowConsentFormIfRequired(activity) { formError ->
                    if (formError != null) {
                        Log.w(TAG, "Consent form error code=${formError.errorCode}")
                    }
                    finish()
                }
            },
            { requestError ->
                if (!updateFinished.compareAndSet(false, true)) return@requestConsentInfoUpdate
                handler.removeCallbacks(timeout)
                lastConsentRefreshAttemptMs = System.currentTimeMillis()
                // Consent cũ vẫn có thể hợp lệ khi refresh mạng lỗi; canRequestAds là nguồn chuẩn.
                // Cached consent may remain valid after a network error; canRequestAds is authoritative.
                Log.w(TAG, "Consent update error code=${requestError.errorCode}")
                finish()
            }
        )
    }

    /** Cho biết SDK hiện được phép request ads / Whether the SDK may currently request ads. */
    fun canRequestAds(context: Context): Boolean =
        UserMessagingPlatform.getConsentInformation(context).canRequestAds()

    /** Cho biết Settings cần hiện mục lựa chọn riêng tư / Whether Settings must show privacy options. */
    fun isPrivacyOptionsRequired(context: Context): Boolean =
        UserMessagingPlatform.getConsentInformation(context).privacyOptionsRequirementStatus ==
            ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED

    /**
     * Mở form thay đổi lựa chọn riêng tư do Google cung cấp.
     * Opens Google's privacy-options form so the user can change consent.
     */
    fun showPrivacyOptions(activity: Activity, onDismissed: () -> Unit = {}) {
        UserMessagingPlatform.showPrivacyOptionsForm(activity) { formError ->
            if (formError != null) {
                Log.w(TAG, "Privacy options error code=${formError.errorCode}")
            }
            MediationPrivacyBridge.syncFromUmpConsent(activity.applicationContext)
            onDismissed()
        }
    }
}
