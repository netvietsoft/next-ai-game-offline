package com.nextai.gameoffline.ads

import android.app.Activity
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import androidx.core.content.ContextCompat
import com.google.ads.mediation.admob.AdMobAdapter
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.LoadAdError
import com.nextai.gameoffline.R
import com.nextai.gameoffline.analytics.GameAnalyticsManager
import com.nextai.gameoffline.billing.BillingEntitlements
import java.util.IdentityHashMap

/**
 * Điều khiển vòng đời Anchored Adaptive Banner tiêu chuẩn kèm dải ngăn cách chống click nhầm
 * và cơ chế tự động thử lại theo backoff (`15s -> 30s -> 60s`) khi gặp lỗi `No fill` hoặc
 * `Unable to obtain a JavascriptEngine`, tránh mất banner suốt cả phiên chơi.
 * Controls Anchored Adaptive Banners with an anti-misclick divider and lifecycle-safe backoff retries.
 */
internal class BannerAdController(
    private val initializer: MobileAdsInitializer,
    private val scheduler: AdScheduler = MainHandlerAdScheduler
) {

    private data class BannerLoadSpec(
        val context: Context,
        val container: ViewGroup,
        val gameName: String?,
        val collapsibleBottom: Boolean,
        val onLoaded: (() -> Unit)?,
        val onFailed: ((String) -> Unit)?,
        val onAdViewUpdated: ((AdView?) -> Unit)?
    )

    private val pendingRetries = IdentityHashMap<ViewGroup, Runnable>()

    /**
     * Tạo `AdRequest` chuẩn cho Anchored Adaptive Banner; mặc định tắt `collapsible = "bottom"`
     * để đảm bảo CTR luôn ở ngưỡng an toàn chính sách AdMob.
     * Builds an `AdRequest` for standard adaptive banners (collapsible disabled by default).
     */
    fun buildBannerAdRequest(collapsibleBottom: Boolean = false): AdRequest {
        val builder = AdRequest.Builder()
        if (collapsibleBottom) {
            val extras = Bundle().apply {
                putString(
                    AdOptimizationPolicy.COLLAPSIBLE_BANNER_EXTRA_KEY,
                    AdOptimizationPolicy.COLLAPSIBLE_BANNER_BOTTOM
                )
            }
            builder.addNetworkExtrasBundle(AdMobAdapter::class.java, extras)
        }
        return builder.build()
    }

    /**
     * Tính kích thước banner thích ứng theo chiều rộng cửa sổ hiện tại.
     * Computes an anchored adaptive banner size for the current window width.
     */
    @Suppress("DEPRECATION")
    fun getAdaptiveBannerAdSize(context: Context): AdSize {
        val metrics = context.resources.displayMetrics
        val widthPixels = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && context is Activity) {
            context.windowManager.currentWindowMetrics.bounds.width()
        } else {
            metrics.widthPixels
        }
        val widthDp = (widthPixels / metrics.density).toInt().coerceAtLeast(1)
        return AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(context, widthDp)
    }

    /**
     * Khởi tạo banner thích ứng; tự hủy hẹn giờ retry cũ và hỗ trợ backoff 15s -> 30s -> 60s.
     * Initializes an adaptive banner, cancelling stale retries and scheduling backoff on failures.
     */
    fun initBannerAd(
        context: Context,
        container: ViewGroup,
        gameName: String? = null,
        collapsibleBottom: Boolean = false,
        onLoaded: (() -> Unit)? = null,
        onFailed: ((String) -> Unit)? = null,
        onAdViewUpdated: ((AdView?) -> Unit)? = null
    ): AdView {
        cancelPendingRetry(container)
        val spec = BannerLoadSpec(
            context = context,
            container = container,
            gameName = gameName,
            collapsibleBottom = collapsibleBottom,
            onLoaded = onLoaded,
            onFailed = onFailed,
            onAdViewUpdated = onAdViewUpdated
        )
        return loadBannerAttempt(spec, attempt = 0)
    }

    /**
     * Hủy mọi tác vụ retry đang chờ và giải phóng hoàn toàn `AdView` bên trong [container].
     * Cancels any scheduled retry and destroys all nested `AdView` instances inside [container].
     */
    fun destroyBanner(container: ViewGroup) {
        cancelPendingRetry(container)
        destroyNestedAdViews(container)
        container.removeAllViews()
        container.visibility = View.GONE
    }

    private fun loadBannerAttempt(spec: BannerLoadSpec, attempt: Int): AdView {
        destroyNestedAdViews(spec.container)
        spec.container.removeAllViews()

        val divider = buildAntiMisclickDivider(spec.context)
        val adView = AdView(spec.context).apply {
            setAdSize(getAdaptiveBannerAdSize(spec.context))
            adUnitId = AdConstants.BANNER_AD_UNIT_ID
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        }
        val wrapper = LinearLayout(spec.context).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
            visibility = View.GONE
            addView(divider)
            addView(adView)
        }
        spec.container.addView(wrapper)

        if (!canShowBanner(spec.context)) {
            spec.container.visibility = View.GONE
            AdMediationAnalytics.logSuppressed(spec.context, FORMAT_BANNER, "consent_not_ready")
            spec.onAdViewUpdated?.invoke(null)
            spec.onFailed?.invoke("Ads consent is not available")
            return adView
        }

        attachBannerListener(spec, wrapper, divider, adView, attempt)
        startLoadAfterSdkInit(spec, adView)
        return adView
    }

    private fun buildAntiMisclickDivider(context: Context): View {
        val dividerHeightPx = (DIVIDER_HEIGHT_DP * context.resources.displayMetrics.density)
            .toInt()
            .coerceAtLeast(1)
        return View(context).apply {
            layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dividerHeightPx)
            setBackgroundColor(ContextCompat.getColor(context, R.color.accent_primary))
            visibility = View.GONE
        }
    }

    private fun attachBannerListener(
        spec: BannerLoadSpec,
        wrapper: LinearLayout,
        divider: View,
        adView: AdView,
        attempt: Int
    ) {
        adView.adListener = object : AdListener() {
            override fun onAdLoaded() {
                cancelPendingRetry(spec.container)
                if (!canShowBanner(spec.context)) {
                    destroyBanner(spec.container)
                    spec.onAdViewUpdated?.invoke(null)
                    return
                }
                divider.visibility = View.VISIBLE
                wrapper.visibility = View.VISIBLE
                spec.container.visibility = View.VISIBLE
                val startedAtMs = (adView.tag as? Long) ?: System.currentTimeMillis()
                val latencyMs = (System.currentTimeMillis() - startedAtMs).coerceAtLeast(0L)
                GameAnalyticsManager.logAdLoaded(FORMAT_BANNER, AdConstants.BANNER_AD_UNIT_ID, latencyMs)
                AdMediationAnalytics.logLoaded(
                    spec.context,
                    FORMAT_BANNER,
                    AdResponseFormatter.adapterName(adView.responseInfo),
                    latencyMs
                )
                spec.onLoaded?.invoke()
            }

            override fun onAdFailedToLoad(error: LoadAdError) {
                divider.visibility = View.GONE
                wrapper.visibility = View.GONE
                spec.container.visibility = View.GONE
                GameAnalyticsManager.logAdFailedToLoad(
                    FORMAT_BANNER,
                    AdConstants.BANNER_AD_UNIT_ID,
                    error.code,
                    error.message
                )
                AdMediationAnalytics.logFailed(
                    spec.context,
                    FORMAT_BANNER,
                    error,
                    AdResponseFormatter.responseSummary(error.responseInfo)
                )
                handleLoadFailureWithRetry(spec, failedAttempt = attempt + 1, errorMessage = error.message)
            }

            override fun onAdClicked() {
                GameAnalyticsManager.logAdClicked(FORMAT_BANNER, AdConstants.BANNER_AD_UNIT_ID, spec.gameName)
            }

            override fun onAdImpression() {
                // Chỉ ghi callback impression thật, không đếm đôi ở onAdLoaded.
                // Log only the real impression callback; never double count onAdLoaded.
                GameAnalyticsManager.logAdImpression(
                    FORMAT_BANNER,
                    AdConstants.BANNER_AD_UNIT_ID,
                    spec.context.javaClass.simpleName,
                    spec.gameName
                )
            }
        }
    }

    private fun handleLoadFailureWithRetry(
        spec: BannerLoadSpec,
        failedAttempt: Int,
        errorMessage: String
    ) {
        // Giải phóng AdView lỗi ngay để không giữ kẹt WebView/JavascriptEngine cũ.
        // Destroy the failed AdView immediately so Chromium/JavascriptEngine resources are released.
        destroyNestedAdViews(spec.container)
        spec.container.removeAllViews()

        val retryDelayMs = AdOptimizationPolicy.nextBannerRetryDelayMs(failedAttempt)
        val ownerAlive = isOwnerAlive(spec.context, spec.container)
        if (retryDelayMs == null || !ownerAlive || !canShowBanner(spec.context)) {
            spec.onAdViewUpdated?.invoke(null)
            spec.onFailed?.invoke(errorMessage)
            return
        }

        cancelPendingRetry(spec.container)
        val retryTask = Runnable {
            pendingRetries.remove(spec.container)
            val canRetryNow = isOwnerForeground(spec.context, spec.container) &&
                canShowBanner(spec.context)
            if (!canRetryNow) {
                spec.onAdViewUpdated?.invoke(null)
                spec.onFailed?.invoke(errorMessage)
                return@Runnable
            }
            val nextAdView = loadBannerAttempt(spec, attempt = failedAttempt)
            spec.onAdViewUpdated?.invoke(nextAdView)
        }
        pendingRetries[spec.container] = retryTask
        scheduler.postDelayed(retryDelayMs, retryTask)
    }

    private fun startLoadAfterSdkInit(spec: BannerLoadSpec, adView: AdView) {
        initializer.initialize(spec.context) {
            val isOwnerGone = adView.parent == null || !isOwnerAlive(spec.context, spec.container)
            if (!canShowBanner(spec.context) || isOwnerGone) {
                spec.onAdViewUpdated?.invoke(null)
                spec.onFailed?.invoke("Banner owner is no longer active")
                return@initialize
            }
            adView.tag = System.currentTimeMillis()
            GameAnalyticsManager.logAdRequest(FORMAT_BANNER, AdConstants.BANNER_AD_UNIT_ID)
            adView.loadAd(buildBannerAdRequest(spec.collapsibleBottom))
        }
    }

    private fun cancelPendingRetry(container: ViewGroup) {
        pendingRetries.remove(container)?.let(scheduler::cancel)
    }

    private fun isOwnerAlive(context: Context, container: ViewGroup): Boolean {
        val activityAlive = context !is Activity || ActivityLifecycleGuard.isWindowAlive(context)
        return activityAlive && container.isAttachedToWindow
    }

    private fun isOwnerForeground(context: Context, container: ViewGroup): Boolean {
        val activityResumed = context !is Activity ||
            ActivityLifecycleGuard.isForegroundResumed(context)
        return activityResumed && container.isAttachedToWindow
    }

    private fun canShowBanner(context: Context): Boolean {
        return !BillingEntitlements.shouldSuppressAutomaticAds(context) &&
            AdsConsentManager.canRequestAds(context)
    }

    /** Hủy mọi `AdView` con trước khi tái sử dụng container để tránh rò rỉ WebView. */
    private fun destroyNestedAdViews(viewGroup: ViewGroup) {
        for (index in 0 until viewGroup.childCount) {
            when (val child = viewGroup.getChildAt(index)) {
                is AdView -> child.destroy()
                is ViewGroup -> destroyNestedAdViews(child)
            }
        }
    }

    private companion object {
        const val FORMAT_BANNER = "BANNER"
        const val DIVIDER_HEIGHT_DP = 3f
    }
}
