package com.nextai.gameoffline.presentation.gamelist

import android.view.View
import android.widget.FrameLayout
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.ads.nativead.NativeAd
import com.google.android.gms.ads.nativead.NativeAdView
import com.nextai.gameoffline.R
import com.nextai.gameoffline.ads.AdManager
import com.nextai.gameoffline.ads.AdsConsentManager
import com.nextai.gameoffline.ads.NativeAdViewBinder
import com.nextai.gameoffline.billing.BillingEntitlements

/**
 * Điều khiển hộp thoại xác nhận thoát ứng dụng tại Trang chủ kèm thẻ Native Ad (không dùng Interstitial
 * để tuân thủ tuyệt đối chính sách AdMob *Ads on App Exit*).
 * Controls the home-screen Exit confirmation dialog with an optional lifecycle-safe Native Ad.
 */
internal class ExitAppDialogController(
    private val activity: AppCompatActivity
) {

    private var activeDialog: AlertDialog? = null
    private var activeNativeAd: NativeAd? = null

    /**
     * Gắn xử lý nút Back hệ thống: ưu tiên xóa ô tìm kiếm trước, sau đó mở hộp thoại xác nhận thoát.
     * Registers system Back handling: clears active search first, then prompts exit confirmation.
     */
    fun registerBackPressHandler(
        shouldClearSearch: () -> Boolean,
        clearSearch: () -> Unit,
        onConfirmExit: () -> Unit
    ) {
        activity.onBackPressedDispatcher.addCallback(activity, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (shouldClearSearch()) {
                    clearSearch()
                    return
                }
                show(onConfirmExit)
            }
        })
    }

    /**
     * Hiển thị hộp thoại xác nhận thoát ứng dụng; tự ẩn vùng quảng cáo nếu là VIP hoặc no-fill.
     * Displays the Exit confirmation dialog with an optional Native Ad above Stay/Exit actions.
     */
    fun show(onConfirmExit: () -> Unit) {
        if (activity.isFinishing || activity.isDestroyed) {
            return
        }
        if (activeDialog?.isShowing == true) {
            return
        }

        val contentView = activity.layoutInflater.inflate(R.layout.dialog_exit_app, null)
        val adContainer = contentView.findViewById<FrameLayout>(R.id.exitNativeAdContainer)

        val dialog = AlertDialog.Builder(activity)
            .setTitle(R.string.exit_dialog_title)
            .setView(contentView)
            .setPositiveButton(R.string.exit_dialog_stay, null)
            .setNegativeButton(R.string.exit_dialog_confirm) { _, _ ->
                onConfirmExit()
            }
            .create()

        var dismissed = false
        dialog.setOnDismissListener {
            dismissed = true
            releaseActiveAd()
            if (activeDialog === dialog) {
                activeDialog = null
            }
        }

        activeDialog = dialog
        dialog.show()

        val canShowAd = !BillingEntitlements.shouldSuppressAutomaticAds(activity) &&
            AdsConsentManager.canRequestAds(activity)
        if (!canShowAd) {
            return
        }

        AdManager.acquireNativeAd(activity) { nativeAd ->
            if (nativeAd == null) {
                return@acquireNativeAd
            }
            if (dismissed || !dialog.isShowing || activity.isFinishing || activity.isDestroyed) {
                AdManager.releaseNativeAd(nativeAd)
                return@acquireNativeAd
            }
            releaseActiveAd()
            activeNativeAd = nativeAd

            val adView = activity.layoutInflater.inflate(
                R.layout.layout_native_ad_exit,
                adContainer,
                false
            ) as NativeAdView
            NativeAdViewBinder.bind(adView, nativeAd)
            adContainer.removeAllViews()
            adContainer.addView(adView)
            adContainer.visibility = View.VISIBLE
        }
    }

    /** Đóng hộp thoại và giải phóng Native Ad khi Activity bị hủy. */
    fun dismiss() {
        activeDialog?.dismiss()
        activeDialog = null
        releaseActiveAd()
    }

    private fun releaseActiveAd() {
        AdManager.releaseNativeAd(activeNativeAd)
        activeNativeAd = null
    }
}
