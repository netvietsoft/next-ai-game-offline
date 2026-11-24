package com.nextai.gameoffline.ads

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Kiểm thử chính sách App Open Ad khi quay lại ứng dụng từ nền (Foreground Resume).
 * JVM unit tests for [AppOpenResumePolicy].
 */
class AppOpenResumePolicyTest {

    @Test
    fun blocksInitialLaunchBeforeAppEverBackgrounded() {
        assertFalse(
            AppOpenResumePolicy.shouldShowOnResume(
                hasLeftForeground = false,
                backgroundDurationMs = 120_000L,
                msSinceLastResumeAd = 300_000L,
                activitySimpleName = "GameListActivity"
            )
        )
    }

    @Test
    fun blocksQuickAppSwitchUnderThirtySeconds() {
        assertFalse(
            AppOpenResumePolicy.shouldShowOnResume(
                hasLeftForeground = true,
                backgroundDurationMs = 29_999L,
                msSinceLastResumeAd = 300_000L,
                activitySimpleName = "GameListActivity"
            )
        )
    }

    @Test
    fun blocksExcludedScreensSplashPaywallAndAdActivity() {
        for (screen in listOf("SplashAdActivity", "BillingActivity", "AdActivity")) {
            assertTrue(AppOpenResumePolicy.isExcludedActivity(screen))
            assertFalse(
                AppOpenResumePolicy.shouldShowOnResume(
                    hasLeftForeground = true,
                    backgroundDurationMs = 60_000L,
                    msSinceLastResumeAd = 300_000L,
                    activitySimpleName = screen
                )
            )
        }
    }

    @Test
    fun blocksRepeatResumeWithinCooldownInterval() {
        assertFalse(
            AppOpenResumePolicy.shouldShowOnResume(
                hasLeftForeground = true,
                backgroundDurationMs = 45_000L,
                msSinceLastResumeAd = 119_999L,
                activitySimpleName = "GameActivity"
            )
        )
    }

    @Test
    fun allowsResumeOnLauncherAndGameAfterThresholdsMet() {
        assertTrue(
            AppOpenResumePolicy.shouldShowOnResume(
                hasLeftForeground = true,
                backgroundDurationMs = 30_000L,
                msSinceLastResumeAd = 120_000L,
                activitySimpleName = "GameListActivity"
            )
        )
        assertTrue(
            AppOpenResumePolicy.shouldShowOnResume(
                hasLeftForeground = true,
                backgroundDurationMs = 90_000L,
                msSinceLastResumeAd = 240_000L,
                activitySimpleName = "GameActivity"
            )
        )
    }
}
