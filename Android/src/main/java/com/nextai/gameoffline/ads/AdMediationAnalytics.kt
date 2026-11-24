package com.nextai.gameoffline.ads

import android.content.Context
import android.os.Bundle
import com.google.android.gms.ads.LoadAdError
import com.google.firebase.analytics.FirebaseAnalytics

/**
 * Ghi chẩn đoán mediation không chứa PII để phân tích fill-rate theo nguồn quảng cáo.
 * Logs PII-free mediation diagnostics for fill-rate analysis by ad source.
 */
object AdMediationAnalytics {

    /**
     * Ghi nguồn adapter thắng auction và độ trễ nạp.
     * Logs the winning auction adapter and load latency.
     */
    fun logLoaded(context: Context, adType: String, adapterClassName: String, latencyMs: Long) {
        logEvent(context, "ad_mediation_loaded") {
            putString("ad_type", adType.take(40))
            putString("ad_network", networkName(adapterClassName))
            putString("adapter", adapterClassName.takeLast(100))
            putLong("load_latency_ms", latencyMs.coerceAtLeast(0L))
        }
    }

    /**
     * Ghi mã lỗi, domain và tóm tắt waterfall để tách no-fill khỏi lỗi tích hợp.
     * Logs error code, domain, and a waterfall summary to separate no-fill from integration errors.
     */
    fun logFailed(context: Context, adType: String, error: LoadAdError, waterfallSummary: String) {
        logEvent(context, "ad_mediation_failed") {
            putString("ad_type", adType.take(40))
            putInt("error_code", error.code)
            putString("error_domain", error.domain.take(100))
            putString("error_message", error.message.take(100))
            putString("waterfall", waterfallSummary.take(100))
        }
    }

    /**
     * Ghi lý do request bị chặn bởi dedupe, cooldown hoặc frequency cap.
     * Logs why a request was suppressed by deduplication, cooldown, or frequency capping.
     */
    fun logSuppressed(context: Context, adType: String, reason: String) {
        logEvent(context, "ad_load_suppressed") {
            putString("ad_type", adType.take(40))
            putString("reason", reason.take(100))
        }
    }

    /**
     * Chuẩn hóa tên mạng để báo cáo Firebase dễ lọc.
     * Normalizes the network name for simple Firebase filtering.
     */
    private fun networkName(adapterClassName: String): String = when {
        adapterClassName.contains("facebook", ignoreCase = true) -> "meta"
        adapterClassName.contains("admob", ignoreCase = true) -> "google"
        adapterClassName == "unknown" -> "unknown"
        else -> "mediated"
    }

    /**
     * Gửi event chẩn đoán độc lập với event doanh thu hiện có.
     * Sends a diagnostics event independently from existing monetization events.
     */
    private inline fun logEvent(context: Context, name: String, build: Bundle.() -> Unit) {
        FirebaseAnalytics.getInstance(context.applicationContext).logEvent(name, Bundle().apply(build))
    }
}
