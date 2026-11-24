package com.nextai.gameoffline.presentation.gamelist

import android.app.Activity
import android.view.View
import android.view.ViewGroup
import com.google.android.gms.ads.AdView
import com.nextai.gameoffline.ads.AdManager
import com.nextai.gameoffline.ads.AdOptimizationPolicy
import com.nextai.gameoffline.ads.AdsConsentManager
import com.nextai.gameoffline.billing.BillingEntitlements

/**
 * Điều phối vòng đời Banner ở Trang chủ [GameListActivity] theo SRP:
 * đồng bộ retry backoff với [com.nextai.gameoffline.ads.BannerAdController], tắt `collapsible = "bottom"`
 * để giữ CTR Banner an toàn, và tự hủy sạch hẹn giờ retry trong `destroy()`.
 * SRP helper managing the Launcher bottom banner, retry synchronization, and clean disposal.
 */
internal class LauncherBannerHelper(
    private val activity: Activity,
    private val bannerContainer: ViewGroup,
    private val onAdsEligibilityChanged: (Boolean) -> Unit
) {

    private var bannerAdView: AdView? = null

    /** Kiểm tra quyền VIP/consent và nạp (hoặc ẩn) Banner Trang chủ + lưới Native In-Feed. */
    fun refreshBanner() {
        val canShow = !BillingEntitlements.shouldSuppressAutomaticAds(activity) &&
            AdsConsentManager.canRequestAds(activity)
        onAdsEligibilityChanged(canShow)
        if (!canShow) {
            destroy()
            return
        }
        if (bannerAdView == null) {
            bannerContainer.visibility = View.VISIBLE
            val collapsible = AdOptimizationPolicy.shouldUseCollapsibleBanner(
                isGameplayScreen = false
            )
            bannerAdView = AdManager.initBannerAd(
                context = activity,
                container = bannerContainer,
                collapsibleBottom = collapsible,
                onFailed = {
                    bannerAdView = null
                    bannerContainer.visibility = View.GONE
                },
                onAdViewUpdated = { updatedView ->
                    bannerAdView = updatedView
                }
            )
        }
    }

    /** Hủy bản cũ và nạp lại ngay khi người dùng cập nhật lựa chọn quyền riêng tư UMP. */
    fun onConsentUpdated() {
        destroy()
        refreshBanner()
    }

    fun onResume() {
        refreshBanner()
        bannerAdView?.resume()
    }

    fun onPause() {
        bannerAdView?.pause()
    }

    /** Hủy toàn bộ hẹn giờ retry và giải phóng `AdView` hiện có. */
    fun destroy() {
        AdManager.destroyBannerAd(bannerContainer)
        bannerAdView = null
    }
}
