package com.nextai.gameoffline.ads

import android.app.Activity
import android.content.Context
import android.graphics.Color
import android.os.Build
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import com.nextai.gameoffline.analytics.GameAnalyticsManager

/**
 * Singleton quản lý toàn bộ vòng đời tải và hiển thị quảng cáo AdMob trong ứng dụng.
 * Tích hợp Anchored Adaptive Banner full chiều ngang, vạch ngăn cách màu xanh chống click nhầm,
 * và theo dõi chi tiết toàn bộ sự kiện qua Firebase Analytics.
 *
 * Singleton managing Google AdMob ad lifecycles.
 * Implements full-width Anchored Adaptive Banner, protective blue divider line against accidental clicks,
 * and comprehensive Firebase Analytics tracking.
 */
object AdManager {

    private var interstitialAd: InterstitialAd? = null
    private var rewardedAd: RewardedAd? = null
    private var appOpenAd: com.google.android.gms.ads.appopen.AppOpenAd? = null
    private var isAppOpenAdLoading = false

    /**
     * Tính toán kích thước Adaptive Banner tự động lấp đầy 100% chiều ngang màn hình.
     * Computes Anchored Adaptive Banner size dynamically filling 100% screen width.
     */
    fun getAdaptiveBannerAdSize(context: Context): AdSize {
        val displayMetrics = context.resources.displayMetrics
        val adWidthPixels = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && context is Activity) {
            val windowMetrics = context.windowManager.currentWindowMetrics
            windowMetrics.bounds.width()
        } else {
            @Suppress("DEPRECATION")
            displayMetrics.widthPixels
        }
        val density = displayMetrics.density
        val adWidth = (adWidthPixels / density).toInt()
        return AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(context, adWidth)
    }

    /**
     * Khởi tạo và gắn Adaptive Banner vào container ở đáy màn hình.
     * Tự động thêm đường kẻ ngang màu xanh (#3B82F6) phía trên banner để ngăn cách hoàn toàn
     * với các nút bấm của game, chống click nhầm theo chính sách Google AdMob.
     *
     * Initializes and attaches Anchored Adaptive Banner to container ViewGroup.
     * Automatically adds a top blue divider line to separate ads from game controls (Google policy compliant).
     */
    fun initBannerAd(
        context: Context,
        container: ViewGroup,
        gameName: String? = null,
        onLoaded: (() -> Unit)? = null,
        onFailed: ((String) -> Unit)? = null
    ): AdView {
        container.removeAllViews()

        // Đường kẻ ngang màu xanh nổi bật ngăn banner và nút game / Protective blue separator line
        val density = context.resources.displayMetrics.density
        val dividerHeightPx = (3 * density).toInt()
        val blueDivider = View(context).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                dividerHeightPx
            )
            setBackgroundColor(Color.parseColor("#3B82F6")) // Màu xanh công nghệ chuẩn Material Blue
            visibility = View.GONE
        }

        val adView = AdView(context).apply {
            setAdSize(getAdaptiveBannerAdSize(context))
            adUnitId = AdConstants.BANNER_AD_UNIT_ID
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        }

        // Wrapper dạng dọc bảo đảm đường kẻ xanh luôn nằm ngay mép trên của Banner trên mọi loại Container
        // Vertical wrapper ensuring blue divider line is strictly placed directly above the Banner view
        val bannerWrapper = LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
            setBackgroundColor(Color.TRANSPARENT)
        }

        bannerWrapper.addView(blueDivider)
        bannerWrapper.addView(adView)
        container.addView(bannerWrapper)

        val startTime = System.currentTimeMillis()
        GameAnalyticsManager.logAdRequest("BANNER", AdConstants.BANNER_AD_UNIT_ID)

        adView.adListener = object : com.google.android.gms.ads.AdListener() {
            override fun onAdLoaded() {
                val durationMs = System.currentTimeMillis() - startTime
                blueDivider.visibility = View.VISIBLE
                bannerWrapper.visibility = View.VISIBLE
                container.visibility = View.VISIBLE
                GameAnalyticsManager.logAdLoaded("BANNER", AdConstants.BANNER_AD_UNIT_ID, durationMs)
                GameAnalyticsManager.logAdImpression("BANNER", AdConstants.BANNER_AD_UNIT_ID, context.javaClass.simpleName, gameName)
                onLoaded?.invoke()
            }

            override fun onAdFailedToLoad(error: LoadAdError) {
                blueDivider.visibility = View.GONE
                bannerWrapper.visibility = View.GONE
                container.visibility = View.GONE
                GameAnalyticsManager.logAdFailedToLoad("BANNER", AdConstants.BANNER_AD_UNIT_ID, error.code, error.message)
                onFailed?.invoke(error.message)
            }

            override fun onAdClicked() {
                GameAnalyticsManager.logAdClicked("BANNER", AdConstants.BANNER_AD_UNIT_ID, gameName)
            }

            override fun onAdImpression() {
                GameAnalyticsManager.logAdImpression("BANNER", AdConstants.BANNER_AD_UNIT_ID, context.javaClass.simpleName, gameName)
            }
        }

        val adRequest = AdRequest.Builder().build()
        adView.loadAd(adRequest)
        return adView
    }

    /**
     * Tải trước quảng cáo Interstitial chuyển cảnh.
     * Pre-load interstitial ad.
     */
    fun loadInterstitialAd(context: Context) {
        val startTime = System.currentTimeMillis()
        GameAnalyticsManager.logAdRequest("INTERSTITIAL", AdConstants.INTERSTITIAL_AD_UNIT_ID)

        val adRequest = AdRequest.Builder().build()
        InterstitialAd.load(
            context,
            AdConstants.INTERSTITIAL_AD_UNIT_ID,
            adRequest,
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    interstitialAd = ad
                    val durationMs = System.currentTimeMillis() - startTime
                    GameAnalyticsManager.logAdLoaded("INTERSTITIAL", AdConstants.INTERSTITIAL_AD_UNIT_ID, durationMs)
                }

                override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                    interstitialAd = null
                    GameAnalyticsManager.logAdFailedToLoad("INTERSTITIAL", AdConstants.INTERSTITIAL_AD_UNIT_ID, loadAdError.code, loadAdError.message)
                }
            }
        )
    }

    /**
     * Hiển thị quảng cáo xen kẽ nếu đã sẵn sàng.
     * Show interstitial ad if available.
     */
    fun showInterstitialAd(activity: Activity, gameName: String? = null) {
        interstitialAd?.let { ad ->
            ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdShowedFullScreenContent() {
                    GameAnalyticsManager.logAdImpression("INTERSTITIAL", AdConstants.INTERSTITIAL_AD_UNIT_ID, activity.javaClass.simpleName, gameName)
                }

                override fun onAdClicked() {
                    GameAnalyticsManager.logAdClicked("INTERSTITIAL", AdConstants.INTERSTITIAL_AD_UNIT_ID, gameName)
                }

                override fun onAdDismissedFullScreenContent() {
                    GameAnalyticsManager.logAdDismissed("INTERSTITIAL", AdConstants.INTERSTITIAL_AD_UNIT_ID)
                    interstitialAd = null
                    loadInterstitialAd(activity)
                }

                override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                    GameAnalyticsManager.logAdFailedToShow("INTERSTITIAL", AdConstants.INTERSTITIAL_AD_UNIT_ID, adError.code, adError.message)
                    interstitialAd = null
                    loadInterstitialAd(activity)
                }
            }
            ad.show(activity)
        } ?: run {
            // Nạp lại nếu chưa có sẵn / Pre-fetch for next time
            loadInterstitialAd(activity)
        }
    }

    /**
     * Tải trước quảng cáo video nhận thưởng.
     * Pre-load rewarded video ad.
     */
    fun loadRewardedAd(context: Context) {
        val startTime = System.currentTimeMillis()
        GameAnalyticsManager.logAdRequest("REWARDED", AdConstants.REWARDED_AD_UNIT_ID)

        val adRequest = AdRequest.Builder().build()
        RewardedAd.load(
            context,
            AdConstants.REWARDED_AD_UNIT_ID,
            adRequest,
            object : RewardedAdLoadCallback() {
                override fun onAdLoaded(ad: RewardedAd) {
                    rewardedAd = ad
                    val durationMs = System.currentTimeMillis() - startTime
                    GameAnalyticsManager.logAdLoaded("REWARDED", AdConstants.REWARDED_AD_UNIT_ID, durationMs)
                }

                override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                    rewardedAd = null
                    GameAnalyticsManager.logAdFailedToLoad("REWARDED", AdConstants.REWARDED_AD_UNIT_ID, loadAdError.code, loadAdError.message)
                }
            }
        )
    }

    /**
     * Hiển thị quảng cáo video nhận thưởng và kích hoạt callback khi hoàn thành.
     * Show rewarded ad and trigger onRewardGranted callback upon completion.
     */
    fun showRewardedAd(activity: Activity, gameName: String? = null, onRewardGranted: () -> Unit) {
        rewardedAd?.let { ad ->
            ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdShowedFullScreenContent() {
                    GameAnalyticsManager.logAdImpression("REWARDED", AdConstants.REWARDED_AD_UNIT_ID, activity.javaClass.simpleName, gameName)
                }

                override fun onAdClicked() {
                    GameAnalyticsManager.logAdClicked("REWARDED", AdConstants.REWARDED_AD_UNIT_ID, gameName)
                }

                override fun onAdDismissedFullScreenContent() {
                    GameAnalyticsManager.logAdDismissed("REWARDED", AdConstants.REWARDED_AD_UNIT_ID)
                    rewardedAd = null
                    loadRewardedAd(activity)
                }

                override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                    GameAnalyticsManager.logAdFailedToShow("REWARDED", AdConstants.REWARDED_AD_UNIT_ID, adError.code, adError.message)
                    rewardedAd = null
                    loadRewardedAd(activity)
                }
            }

            ad.show(activity) { rewardItem ->
                GameAnalyticsManager.logAdRewardEarned(gameName, rewardItem.type, rewardItem.amount)
                onRewardGranted()
            }
        } ?: run {
            loadRewardedAd(activity)
        }
    }

    /**
     * Tải trước quảng cáo mở màn hình ứng dụng (App Open Ad).
     * Pre-load App Open Ad.
     */
    fun loadAppOpenAd(context: Context, onLoaded: (() -> Unit)? = null) {
        if (appOpenAd != null || isAppOpenAdLoading) return
        isAppOpenAdLoading = true
        val startTime = System.currentTimeMillis()
        GameAnalyticsManager.logAdRequest("APP_OPEN", AdConstants.APP_OPEN_AD_UNIT_ID)

        val adRequest = AdRequest.Builder().build()
        com.google.android.gms.ads.appopen.AppOpenAd.load(
            context,
            AdConstants.APP_OPEN_AD_UNIT_ID,
            adRequest,
            object : com.google.android.gms.ads.appopen.AppOpenAd.AppOpenAdLoadCallback() {
                override fun onAdLoaded(ad: com.google.android.gms.ads.appopen.AppOpenAd) {
                    appOpenAd = ad
                    isAppOpenAdLoading = false
                    val durationMs = System.currentTimeMillis() - startTime
                    GameAnalyticsManager.logAdLoaded("APP_OPEN", AdConstants.APP_OPEN_AD_UNIT_ID, durationMs)
                    onLoaded?.invoke()
                }

                override fun onAdFailedToLoad(loadAdError: LoadAdError) {
                    appOpenAd = null
                    isAppOpenAdLoading = false
                    GameAnalyticsManager.logAdFailedToLoad("APP_OPEN", AdConstants.APP_OPEN_AD_UNIT_ID, loadAdError.code, loadAdError.message)
                }
            }
        )
    }

    /**
     * Hiển thị quảng cáo mở màn hình ứng dụng nếu đã sẵn sàng.
     * Show App Open Ad if available.
     */
    fun showAppOpenAd(activity: Activity, onDismissed: (() -> Unit)? = null) {
        appOpenAd?.let { ad ->
            ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdShowedFullScreenContent() {
                    GameAnalyticsManager.logAdImpression("APP_OPEN", AdConstants.APP_OPEN_AD_UNIT_ID, activity.javaClass.simpleName)
                }

                override fun onAdClicked() {
                    GameAnalyticsManager.logAdClicked("APP_OPEN", AdConstants.APP_OPEN_AD_UNIT_ID)
                }

                override fun onAdDismissedFullScreenContent() {
                    GameAnalyticsManager.logAdDismissed("APP_OPEN", AdConstants.APP_OPEN_AD_UNIT_ID)
                    appOpenAd = null
                    loadAppOpenAd(activity)
                    onDismissed?.invoke()
                }

                override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                    GameAnalyticsManager.logAdFailedToShow("APP_OPEN", AdConstants.APP_OPEN_AD_UNIT_ID, adError.code, adError.message)
                    appOpenAd = null
                    loadAppOpenAd(activity)
                    onDismissed?.invoke()
                }
            }
            ad.show(activity)
        } ?: run {
            onDismissed?.invoke()
            loadAppOpenAd(activity)
        }
    }
}
