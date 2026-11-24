package com.nextai.gameoffline.ads

import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import com.google.android.gms.ads.nativead.MediaView
import com.google.android.gms.ads.nativead.NativeAd
import com.google.android.gms.ads.nativead.NativeAdView
import com.nextai.gameoffline.R

/**
 * Gắn dữ liệu [NativeAd] vào các layout XML [NativeAdView] chuẩn AdMob (`layout_native_ad_feed`,
 * `layout_native_ad_compact`, `layout_native_ad_exit`) với nhãn `"Ad"` rõ ràng và ẩn trường rỗng sạch sẽ.
 * Binds Google [NativeAd] assets into XML [NativeAdView] containers cleanly across all placements.
 */
object NativeAdViewBinder {

    /**
     * Gắn toàn bộ thành phần của [nativeAd] vào [adView] và đăng ký các view con theo chuẩn AdMob SDK.
     * Populates and registers headline, body, icon, media, advertiser, and CTA on [adView].
     */
    fun bind(adView: NativeAdView, nativeAd: NativeAd) {
        val headlineView = adView.findViewById<TextView>(R.id.tvNativeAdHeadline)
        val bodyView = adView.findViewById<TextView?>(R.id.tvNativeAdBody)
        val advertiserView = adView.findViewById<TextView?>(R.id.tvNativeAdAdvertiser)
        val iconView = adView.findViewById<ImageView?>(R.id.ivNativeAdIcon)
        val mediaView = adView.findViewById<MediaView?>(R.id.nativeAdMediaView)
        val ctaButton = adView.findViewById<Button>(R.id.btnNativeAdCta)

        adView.headlineView = headlineView
        adView.bodyView = bodyView
        adView.advertiserView = advertiserView
        adView.iconView = iconView
        adView.mediaView = mediaView
        adView.callToActionView = ctaButton

        headlineView.text = nativeAd.headline.orEmpty()

        bindOptionalText(bodyView, nativeAd.body)
        bindOptionalText(advertiserView, nativeAd.advertiser ?: nativeAd.store)
        bindOptionalIcon(iconView, nativeAd)
        bindOptionalMedia(mediaView, nativeAd)

        val ctaText = nativeAd.callToAction
        if (ctaText.isNullOrBlank()) {
            ctaButton.visibility = View.GONE
        } else {
            ctaButton.text = ctaText
            ctaButton.visibility = View.VISIBLE
        }

        adView.setNativeAd(nativeAd)
    }

    private fun bindOptionalText(view: TextView?, value: String?) {
        if (view == null) {
            return
        }
        if (value.isNullOrBlank()) {
            view.visibility = View.GONE
        } else {
            view.text = value
            view.visibility = View.VISIBLE
        }
    }

    private fun bindOptionalIcon(iconView: ImageView?, nativeAd: NativeAd) {
        if (iconView == null) {
            return
        }
        val drawable = nativeAd.icon?.drawable
        if (drawable == null) {
            iconView.visibility = View.GONE
        } else {
            iconView.setImageDrawable(drawable)
            iconView.visibility = View.VISIBLE
        }
    }

    private fun bindOptionalMedia(mediaView: MediaView?, nativeAd: NativeAd) {
        if (mediaView == null) {
            return
        }
        val mediaContent = nativeAd.mediaContent
        if (mediaContent == null) {
            mediaView.visibility = View.GONE
        } else {
            mediaView.mediaContent = mediaContent
            mediaView.visibility = View.VISIBLE
        }
    }
}
