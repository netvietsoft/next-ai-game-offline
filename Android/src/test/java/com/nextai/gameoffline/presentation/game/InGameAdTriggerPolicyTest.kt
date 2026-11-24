package com.nextai.gameoffline.presentation.game

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Kiểm thử chính sách kích hoạt Interstitial trong màn chơi và bộ đếm [LevelBreakAdCounter]
 * đảm bảo không xóa oan bộ đếm khi quảng cáo bị chặn bởi cooldown hoặc cache rỗng.
 * JVM unit tests for [InGameAdTriggerPolicy] and [LevelBreakAdCounter].
 */
class InGameAdTriggerPolicyTest {

    @Test
    fun normalizesInvalidAndNullThresholdsSafely() {
        assertEquals(2, InGameAdTriggerPolicy.normalizeBreakThreshold(null))
        assertEquals(1, InGameAdTriggerPolicy.normalizeBreakThreshold(0))
        assertEquals(1, InGameAdTriggerPolicy.normalizeBreakThreshold(-5))
        assertEquals(4, InGameAdTriggerPolicy.normalizeBreakThreshold(4))
    }

    @Test
    fun triggersLevelBreakAtConfiguredThreshold() {
        assertFalse(InGameAdTriggerPolicy.shouldTriggerOnLevelBreak(1, 2))
        assertTrue(InGameAdTriggerPolicy.shouldTriggerOnLevelBreak(2, 2))
        assertFalse(InGameAdTriggerPolicy.shouldTriggerOnLevelBreak(2, 3))
        assertTrue(InGameAdTriggerPolicy.shouldTriggerOnLevelBreak(3, 3))
        assertTrue(InGameAdTriggerPolicy.shouldTriggerOnLevelBreak(1, 1))
    }

    @Test
    fun requiresAtLeastFortyFiveSecondsForExitGameInterstitial() {
        assertFalse(InGameAdTriggerPolicy.shouldTriggerExitInterstitial(0L))
        assertFalse(InGameAdTriggerPolicy.shouldTriggerExitInterstitial(44L))
        assertTrue(InGameAdTriggerPolicy.shouldTriggerExitInterstitial(45L))
        assertTrue(InGameAdTriggerPolicy.shouldTriggerExitInterstitial(420L))
    }

    @Test
    fun validatesLevelClickAndScoreOnGameOverRules() {
        assertFalse(InGameAdTriggerPolicy.shouldTriggerOnLevelClick(0))
        assertFalse(InGameAdTriggerPolicy.shouldTriggerOnLevelClick(1))
        assertTrue(InGameAdTriggerPolicy.shouldTriggerOnLevelClick(2))

        assertTrue(InGameAdTriggerPolicy.shouldTriggerOnSubmitScore("lines98"))
        assertTrue(InGameAdTriggerPolicy.shouldTriggerOnSubmitScore("twenty48"))
        assertFalse(InGameAdTriggerPolicy.shouldTriggerOnSubmitScore("block_blast"))
        assertFalse(InGameAdTriggerPolicy.shouldTriggerOnSubmitScore("ludo"))
    }

    /**
     * Xác minh sửa bug P0: khi Interstitial bị chặn cooldown (`shown == false`), `breakCount`
     * KHÔNG bị reset về 0 để ngay màn kế tiếp hết cooldown là hiển thị tức thì.
     * Verifies P0 fix: `breakCount` is preserved on `shown == false` and resets only on `shown == true`.
     */
    @Test
    fun levelBreakCounter_preservesCountWhenAdSuppressedAndResetsOnlyWhenShown() {
        val counter = LevelBreakAdCounter()

        // Màn 1: chưa đạt ngưỡng 2
        assertFalse(counter.recordBreakAndShouldRequestAd(2))
        assertEquals(1, counter.breakCount)

        // Màn 2: đạt ngưỡng 2, nhưng quảng cáo bị chặn do cooldown 60s -> KHÔNG reset
        assertTrue(counter.recordBreakAndShouldRequestAd(2))
        counter.onAdAttemptCompleted(shown = false)
        assertEquals(2, counter.breakCount)

        // Màn 3: hết cooldown -> lập tức yêu cầu hiện và reset về 0 khi shown == true
        assertTrue(counter.recordBreakAndShouldRequestAd(2))
        counter.onAdAttemptCompleted(shown = true)
        assertEquals(0, counter.breakCount)

        // Màn 4: bắt đầu đếm lại từ 1
        assertFalse(counter.recordBreakAndShouldRequestAd(2))
        assertEquals(1, counter.breakCount)
    }
}
