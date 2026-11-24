package com.nextai.gameoffline.ads

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Kiểm thử chính sách đệm 700ms, preload lại sau 3 giây và cấu hình banner thu gọn AdMob.
 * Tests the 700ms interstitial buffer, 3-second post-dismiss preload, and collapsible banner policy.
 */
class AdOptimizationPolicyTest {

    /** Kiểm tra hằng số thời gian đệm, preload và extra banner thu gọn.
     * Verifies buffer delay, post-dismiss preload delay, and collapsible banner extras. */
    @Test
    fun constants_matchAdMobOptimizationRequirements() {
        assertEquals(700L, AdOptimizationPolicy.INTERSTITIAL_LOADING_BUFFER_MS)
        assertEquals(3_000L, AdOptimizationPolicy.INTERSTITIAL_PRELOAD_DELAY_MS)
        assertEquals("collapsible", AdOptimizationPolicy.COLLAPSIBLE_BANNER_EXTRA_KEY)
        assertEquals("bottom", AdOptimizationPolicy.COLLAPSIBLE_BANNER_BOTTOM)
    }

    /** Kiểm tra cửa sổ chờ preload 3 giây hoạt động đúng tại các mốc biên.
     * Verifies the 3-second deferred preload window at boundary timestamps. */
    @Test
    fun deferredPreloadWindow_behavesCorrectlyAtBoundaries() {
        val dismissedAt = 10_000L
        val notBefore = dismissedAt + AdOptimizationPolicy.INTERSTITIAL_PRELOAD_DELAY_MS

        assertTrue(AdOptimizationPolicy.isPreloadDeferred(10_500L, notBefore))
        assertEquals(2_500L, AdOptimizationPolicy.remainingPreloadDelayMs(10_500L, notBefore))

        assertFalse(AdOptimizationPolicy.isPreloadDeferred(notBefore, notBefore))
        assertEquals(0L, AdOptimizationPolicy.remainingPreloadDelayMs(notBefore, notBefore))
        assertEquals(0L, AdOptimizationPolicy.remainingPreloadDelayMs(15_000L, notBefore))
    }

    /**
     * Xác minh tắt hoàn toàn collapsible = "bottom" ở cả màn chơi và Trang chủ để bảo vệ CTR AdMob,
     * đồng thời xác minh delay nạp Banner 800ms và chuỗi backoff retry 15s -> 30s -> 60s.
     * Verifies collapsible banner is disabled everywhere, 800ms delay, and 15s/30s/60s retries.
     */
    @Test
    fun bannerPolicy_disablesCollapsibleEverywhereAndDefinesBackoffRetry() {
        assertFalse(AdOptimizationPolicy.shouldUseCollapsibleBanner(isGameplayScreen = true))
        assertFalse(AdOptimizationPolicy.shouldUseCollapsibleBanner(isGameplayScreen = false))
        assertEquals(800L, AdOptimizationPolicy.GAMEPLAY_BANNER_INITIAL_DELAY_MS)

        assertEquals(listOf(15_000L, 30_000L, 60_000L), AdOptimizationPolicy.BANNER_RETRY_DELAYS_MS)
        assertEquals(null, AdOptimizationPolicy.nextBannerRetryDelayMs(0))
        assertEquals(15_000L, AdOptimizationPolicy.nextBannerRetryDelayMs(1))
        assertEquals(30_000L, AdOptimizationPolicy.nextBannerRetryDelayMs(2))
        assertEquals(60_000L, AdOptimizationPolicy.nextBannerRetryDelayMs(3))
        assertEquals(null, AdOptimizationPolicy.nextBannerRetryDelayMs(4))
    }

    /**
     * Xác minh App Open Ad bỏ qua 2 lần mở đầu tiên (không gọi `app_open_load` lãng phí)
     * và chỉ bắt đầu mở khóa từ lần mở thứ 3 trở đi.
     * Verifies App Open lazy-preload skips the first 2 launches and activates on launch 3+.
     */
    @Test
    fun appOpenLazyPreload_skipsFirstTwoLaunchesAndActivatesOnThird() {
        assertEquals(2, AdOptimizationPolicy.MIN_PRIOR_OPENS_FOR_APP_OPEN)

        // Tại Splash trước khi tăng bộ đếm (priorOpens: 0 -> lần 1, 1 -> lần 2, 2 -> lần 3)
        assertFalse(AdOptimizationPolicy.shouldPreloadAppOpenOnLaunch(priorOpens = 0))
        assertFalse(AdOptimizationPolicy.shouldPreloadAppOpenOnLaunch(priorOpens = 1))
        assertTrue(AdOptimizationPolicy.shouldPreloadAppOpenOnLaunch(priorOpens = 2))
        assertTrue(AdOptimizationPolicy.shouldPreloadAppOpenOnLaunch(priorOpens = 5))

        // Trong phiên sau khi Splash đã tăng completed_launches (1 -> lần 1, 2 -> lần 2, 3 -> lần 3)
        assertFalse(AdOptimizationPolicy.shouldPreloadAppOpenInSession(completedLaunches = 0))
        assertFalse(AdOptimizationPolicy.shouldPreloadAppOpenInSession(completedLaunches = 1))
        assertFalse(AdOptimizationPolicy.shouldPreloadAppOpenInSession(completedLaunches = 2))
        assertTrue(AdOptimizationPolicy.shouldPreloadAppOpenInSession(completedLaunches = 3))
        assertTrue(AdOptimizationPolicy.shouldPreloadAppOpenInSession(completedLaunches = 10))
    }
}
