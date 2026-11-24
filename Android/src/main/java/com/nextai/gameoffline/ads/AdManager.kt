package com.nextai.gameoffline.ads

import android.app.Activity
import android.content.Context
import android.view.ViewGroup
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.nativead.NativeAd
import com.nextai.gameoffline.billing.BillingEntitlements
import java.util.concurrent.atomic.AtomicInteger

/**
 * Facade mỏng điều phối hệ thống Google Mobile Ads (AdMob + Meta Audience Network Mediation).
 * Toàn bộ nghiệp vụ đã được tách thành các thành phần đơn trách nhiệm (SRP):
 * - [MobileAdsInitializer]: khởi tạo SDK an toàn đồng thời.
 * - [BannerAdController]: banner thích ứng thu gọn đáy (`collapsible = "bottom"`).
 * - [InterstitialAdCoordinator], [RewardedAdCoordinator], [AppOpenAdCoordinator]: dùng chung [FullScreenAdSlot].
 * - [NativeAdCoordinator]: pool cache có TTL cho Native Ad tại Trang chủ, hộp thoại tải R2 và thoát app.
 *
 * Thin facade preserving backward-compatible APIs while delegating to SRP coordinators.
 */
object AdManager {

    private val initializer = MobileAdsInitializer()
    private val fullScreenGate = FullScreenAdGate()
    private val bannerController = BannerAdController(initializer)
    private val interstitialCoordinator = InterstitialAdCoordinator(initializer, fullScreenGate)
    private val rewardedCoordinator = RewardedAdCoordinator(initializer, fullScreenGate)
    private val appOpenCoordinator = AppOpenAdCoordinator(initializer, fullScreenGate)
    private val nativeCoordinator = NativeAdCoordinator(initializer)

    /** Ghi nhận thao tác người dùng thực để mở khóa ngưỡng tần suất Interstitial. */
    fun recordInterstitialUserAction() {
        fullScreenGate.recordUserAction()
    }

    /** Khởi tạo Google Mobile Ads SDK một lần sau khi đã có consent. */
    fun initialize(context: Context, onReady: (() -> Unit)? = null) {
        initializer.initialize(context) { _ ->
            onReady?.invoke()
        }
    }

    /**
     * Nạp trước quảng cáo sau consent cho màn khởi động theo cơ chế lazy-preload:
     * - Không nạp `reward_load` tại Splash (chỉ nạp khi mở game thuộc 71 game có Rewarded).
     * - Chỉ nạp `app_open_load` khi [preloadAppOpen] = true (từ lần mở thứ 3 trở đi).
     * Warms launch ad caches lazily: never preloads Rewarded on Splash and skips App Open
     * when [preloadAppOpen] is false (first 2 launches).
     */
    fun preloadForLaunch(
        context: Context,
        preloadAppOpen: Boolean,
        onFinished: () -> Unit
    ) {
        val appContext = context.applicationContext
        if (BillingEntitlements.shouldSuppressAutomaticAds(appContext)) {
            onFinished()
            return
        }
        initializer.initialize(appContext) { initialized ->
            if (!initialized) {
                onFinished()
                return@initialize
            }
            clearExpiredAds()
            val expectedLoads = if (preloadAppOpen) 2 else 1
            val remaining = AtomicInteger(expectedLoads)
            val onSingleCompleted: (Boolean) -> Unit = {
                if (remaining.decrementAndGet() == 0) {
                    onFinished()
                }
            }
            interstitialCoordinator.load(appContext, onSingleCompleted)
            if (preloadAppOpen) {
                appOpenCoordinator.load(appContext, onSingleCompleted)
            }
            nativeCoordinator.preload(appContext)
        }
    }

    /**
     * Làm ấm cache toàn màn hình theo ngữ cảnh thực tế để tối ưu AdMob Show Rate:
     * - `App Open` chỉ nạp khi vượt qua 2 lần mở đầu ([LaunchAdEligibility.canPreloadAppOpenInSession]).
     * - `Rewarded` chỉ nạp khi [preloadRewarded] = true (người chơi đang mở 1 trong 71 game có Rewarded).
     * Context-aware lazy preload preserving AdMob Show Rate for App Open and Rewarded formats.
     */
    fun preloadFullScreenAds(context: Context, preloadRewarded: Boolean = false) {
        val appContext = context.applicationContext
        if (!AdsConsentManager.canRequestAds(appContext)) {
            return
        }
        val suppressAutomaticAds = BillingEntitlements.shouldSuppressAutomaticAds(appContext)
        if (suppressAutomaticAds && !preloadRewarded) {
            return
        }
        initializer.initialize(appContext) { initialized ->
            if (!initialized) {
                return@initialize
            }
            clearExpiredAds()
            if (!suppressAutomaticAds) {
                interstitialCoordinator.load(appContext)
                if (LaunchAdEligibility.canPreloadAppOpenInSession(appContext)) {
                    appOpenCoordinator.load(appContext)
                }
                nativeCoordinator.preload(appContext)
            }
            if (preloadRewarded) {
                rewardedCoordinator.load(appContext)
            }
        }
    }

    /** Tạo AdRequest chuẩn Anchored Adaptive Banner (mặc định tắt `collapsible = "bottom"`). */
    internal fun buildBannerAdRequest(collapsibleBottom: Boolean = false): AdRequest {
        return bannerController.buildBannerAdRequest(collapsibleBottom)
    }

    /** Tính kích thước Anchored Adaptive Banner theo chiều rộng hiện tại. */
    fun getAdaptiveBannerAdSize(context: Context): AdSize {
        return bannerController.getAdaptiveBannerAdSize(context)
    }

    /** Khởi tạo và nạp Anchored Adaptive Banner kèm dải phân cách chống click nhầm và retry backoff. */
    fun initBannerAd(
        context: Context,
        container: ViewGroup,
        gameName: String? = null,
        collapsibleBottom: Boolean = false,
        onLoaded: (() -> Unit)? = null,
        onFailed: ((String) -> Unit)? = null,
        onAdViewUpdated: ((AdView?) -> Unit)? = null
    ): AdView {
        return bannerController.initBannerAd(
            context = context,
            container = container,
            gameName = gameName,
            collapsibleBottom = collapsibleBottom,
            onLoaded = onLoaded,
            onFailed = onFailed,
            onAdViewUpdated = onAdViewUpdated
        )
    }

    /** Hủy mọi retry Banner đang chờ và giải phóng hoàn toàn `AdView` trong [container]. */
    fun destroyBannerAd(container: ViewGroup) {
        bannerController.destroyBanner(container)
    }

    /** Nạp trước quảng cáo Interstitial. */
    fun loadInterstitialAd(context: Context, onResult: ((Boolean) -> Unit)? = null) {
        interstitialCoordinator.load(context, onResult)
    }

    /**
     * Hiển thị màn hình đệm 700ms chặn chạm rồi bật Interstitial; tự preload sau 3s khi đóng.
     * Callback [onFinished] trả về `true` CHỈ KHI quảng cáo thực sự hiển thị toàn màn hình.
     */
    fun showInterstitialAd(
        activity: Activity,
        gameName: String? = null,
        onFinished: ((shown: Boolean) -> Unit)? = null
    ) {
        interstitialCoordinator.show(activity, gameName, onFinished)
    }

    /** Nạp trước quảng cáo Rewarded Video. */
    fun loadRewardedAd(context: Context, onResult: ((Boolean) -> Unit)? = null) {
        rewardedCoordinator.load(context, onResult)
    }

    /** Hiển thị quảng cáo Rewarded Video đã cache và trao thưởng qua callback chính thức. */
    fun showRewardedAd(
        activity: Activity,
        gameName: String? = null,
        onNotEarned: () -> Unit = {},
        onRewardGranted: () -> Unit
    ) {
        rewardedCoordinator.show(activity, gameName, onNotEarned, onRewardGranted)
    }

    /** Nạp trước App Open Ad. */
    fun loadAppOpenAd(context: Context, onResult: ((Boolean) -> Unit)? = null) {
        appOpenCoordinator.load(context, onResult)
    }

    /** Hiển thị App Open Ad đã sẵn sàng mà không chặn điều hướng khi cache rỗng. */
    fun showAppOpenAd(
        activity: Activity,
        respectCooldown: Boolean = false,
        onDismissed: (() -> Unit)? = null
    ) {
        appOpenCoordinator.show(activity, respectCooldown, onDismissed)
    }

    /** Chủ động nạp trước Native Ad vào pool để cuộn lưới hoặc mở hộp thoại hiển thị tức thì. */
    fun preloadNativeAds(context: Context) {
        nativeCoordinator.preload(context)
    }

    /** Lấy một Native Ad từ pool hoặc nạp mới; caller cần gọi [releaseNativeAd] khi hủy view. */
    fun acquireNativeAd(context: Context, onReady: (NativeAd?) -> Unit) {
        nativeCoordinator.acquire(context, onReady)
    }

    /** Giải phóng bộ nhớ của một [NativeAd] khi ViewHolder hoặc hộp thoại bị đóng. */
    fun releaseNativeAd(nativeAd: NativeAd?) {
        nativeCoordinator.release(nativeAd)
    }

    /** Hủy toàn bộ retry và tác vụ preload hẹn giờ đang chờ. */
    fun cancelScheduledRetries() {
        interstitialCoordinator.cancelScheduledWork()
        rewardedCoordinator.cancelScheduledWork()
        appOpenCoordinator.cancelScheduledWork()
        nativeCoordinator.cancelScheduledWork()
    }

    /** Xóa sạch cache và retry ngay lập tức khi người dùng rút consent. */
    fun onConsentChanged(context: Context) {
        if (AdsConsentManager.canRequestAds(context)) {
            return
        }
        interstitialCoordinator.clearCacheAndWork()
        rewardedCoordinator.clearCacheAndWork()
        appOpenCoordinator.clearCacheAndWork()
        nativeCoordinator.clearCacheAndWork()
    }

    /** Xóa quảng cáo tự động khi kích hoạt VIP hoặc Vé Sạch Quảng Cáo; vẫn giữ Rewarded tự nguyện. */
    fun onEntitlementChanged(context: Context) {
        if (!BillingEntitlements.shouldSuppressAutomaticAds(context)) {
            return
        }
        interstitialCoordinator.clearCacheAndWork()
        appOpenCoordinator.clearCacheAndWork()
        nativeCoordinator.clearCacheAndWork()
    }

    private fun clearExpiredAds() {
        interstitialCoordinator.clearExpired()
        rewardedCoordinator.clearExpired()
        appOpenCoordinator.clearExpired()
        nativeCoordinator.clearExpired()
    }
}
