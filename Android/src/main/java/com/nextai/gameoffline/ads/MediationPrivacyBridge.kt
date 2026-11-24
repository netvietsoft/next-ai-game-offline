package com.nextai.gameoffline.ads

import android.content.Context
import android.util.Log
import com.applovin.sdk.AppLovinPrivacySettings
import com.bytedance.sdk.openadsdk.api.PAGConstant
import com.bytedance.sdk.openadsdk.api.init.PAGConfig
import com.mbridge.msdk.MBridgeConstans
import com.mbridge.msdk.out.MBridgeSDKFactory
import com.nextai.gameoffline.BuildConfig
import com.unity3d.ads.metadata.MetaData

/**
 * Cầu nối đồng bộ trạng thái đồng thuận UMP (GDPR / US-State CCPA) xuống toàn bộ các mạng
 * quảng cáo Real-Time Bidding Mediation trước khi khởi tạo SDK và mỗi khi người dùng đổi lựa chọn.
 * Propagates Google UMP GDPR/CCPA consent signals to all mediated bidding SDKs prior to initialization.
 */
internal object MediationPrivacyBridge {

    private const val TAG = "MediationPrivacyBridge"

    /**
     * Đồng bộ cờ quyền riêng tư dựa trên kết quả UMP hiện hành (`AdsConsentManager.canRequestAds`).
     * Syncs privacy flags across AppLovin, Mintegral, Unity Ads, and Pangle from current UMP state.
     */
    fun syncFromUmpConsent(context: Context) {
        val appContext = context.applicationContext
        val hasConsent = AdsConsentManager.canRequestAds(appContext)
        applyConsent(appContext, hasConsent)
    }

    /**
     * Áp dụng cờ đồng thuận GDPR / không bán dữ liệu CCPA xuống từng SDK đối tác an toàn lỗi.
     * Applies GDPR and CCPA Do-Not-Sell flags defensively to every integrated mediation network.
     */
    fun applyConsent(context: Context, hasConsent: Boolean) {
        val appContext = context.applicationContext
        syncAppLovin(appContext, hasConsent)
        syncMintegral(appContext, hasConsent)
        syncUnityAds(appContext, hasConsent)
        syncPangle(hasConsent)
    }

    private fun syncAppLovin(appContext: Context, hasConsent: Boolean) {
        runCatching {
            AppLovinPrivacySettings.setHasUserConsent(hasConsent, appContext)
            AppLovinPrivacySettings.setDoNotSell(!hasConsent, appContext)
        }.onFailure { error ->
            logSyncWarning("AppLovin", error)
        }
    }

    private fun syncMintegral(appContext: Context, hasConsent: Boolean) {
        runCatching {
            val sdk = MBridgeSDKFactory.getMBridgeSDK()
            val status = if (hasConsent) MBridgeConstans.IS_SWITCH_ON else MBridgeConstans.IS_SWITCH_OFF
            sdk.setConsentStatus(appContext, status)
            sdk.setDoNotTrackStatus(appContext, !hasConsent)
        }.onFailure { error ->
            logSyncWarning("Mintegral", error)
        }
    }

    private fun syncUnityAds(appContext: Context, hasConsent: Boolean) {
        runCatching {
            MetaData(appContext).apply {
                set("gdpr.consent", hasConsent)
                set("privacy.consent", hasConsent)
                commit()
            }
        }.onFailure { error ->
            logSyncWarning("UnityAds", error)
        }
    }

    private fun syncPangle(hasConsent: Boolean) {
        runCatching {
            val paConsent = if (hasConsent) {
                PAGConstant.PAGPAConsentType.PAG_PA_CONSENT_TYPE_CONSENT
            } else {
                PAGConstant.PAGPAConsentType.PAG_PA_CONSENT_TYPE_NO_CONSENT
            }
            PAGConfig.setPAConsent(paConsent)
        }.onFailure { error ->
            logSyncWarning("Pangle", error)
        }
    }

    private fun logSyncWarning(network: String, error: Throwable) {
        if (BuildConfig.DEBUG) {
            Log.w(TAG, "Unable to sync privacy flags for $network", error)
        }
    }
}
