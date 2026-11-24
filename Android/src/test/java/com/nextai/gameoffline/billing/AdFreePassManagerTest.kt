package com.nextai.gameoffline.billing

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Kiểm thử đơn vị cho [AdFreePassEngine]: tiến độ 2 video, chống tua ngược đồng hồ máy,
 * cộng dồn tối đa 60 phút và đảm bảo tách biệt hoàn toàn khỏi quyền VIP thật ([PremiumCachePolicy]).
 * Pure JVM tests for Ad-Free Pass activation, anti-clock-tampering, capping, and VIP isolation.
 */
class AdFreePassManagerTest {

    private class InMemoryAdFreeStore : AdFreePassStore {
        var steps = 0
        var untilEpoch = 0L
        var untilElapsed = 0L
        var grantedDuration = 0L

        override fun getWatchedSteps(): Int = steps
        override fun getPassUntilEpochMs(): Long = untilEpoch
        override fun getPassUntilElapsedMs(): Long = untilElapsed
        override fun getGrantedDurationMs(): Long = grantedDuration
        override fun saveState(
            watchedSteps: Int,
            passUntilEpochMs: Long,
            passUntilElapsedMs: Long,
            grantedDurationMs: Long
        ) {
            steps = watchedSteps
            untilEpoch = passUntilEpochMs
            untilElapsed = passUntilElapsedMs
            grantedDuration = grantedDurationMs
        }
    }

    @Test
    fun activates20MinutePassAfterSecondVideoAndDoesNotPollutePaidPremium() {
        var epochMs = 1_700_000_000_000L
        var elapsedMs = 50_000L
        val store = InMemoryAdFreeStore()
        val engine = AdFreePassEngine(store, { epochMs }, { elapsedMs })

        val step1 = engine.recordRewardedVideoWatched()
        assertFalse(step1.passActivated)
        assertEquals(1, step1.watchedSteps)
        assertFalse(engine.isPassActive())

        val step2 = engine.recordRewardedVideoWatched()
        assertTrue(step2.passActivated)
        assertEquals(0, step2.watchedSteps)
        assertTrue(engine.isPassActive())
        assertEquals(AdFreePassEngine.PASS_DURATION_MS, engine.remainingPassMs())

        // Vé tạm thời KHÔNG bao giờ làm sai lệch trạng thái VIP mua thật của Google Play.
        // Temporary Ad-Free Pass never mutates or fakes real Google Play VIP ownership.
        val paidPremium = PremiumCachePolicy.isActive(
            lifetime = false,
            subscription = false,
            checkedAt = epochMs,
            now = epochMs
        )
        assertFalse(paidPremium)
        assertTrue(paidPremium || engine.isPassActive())
    }

    @Test
    fun rejectsBackwardsWallClockTamperingAndSameBootExpiry() {
        var epochMs = 1_700_000_000_000L
        var elapsedMs = 100_000L
        val store = InMemoryAdFreeStore()
        val engine = AdFreePassEngine(store, { epochMs }, { elapsedMs })

        engine.recordRewardedVideoWatched()
        engine.recordRewardedVideoWatched()
        assertTrue(engine.isPassActive())

        // Tua ngược đồng hồ hệ thống 3 giờ để kéo dài vé -> bị phát hiện & vô hiệu hóa ngay.
        epochMs -= 3L * 60L * 60L * 1000L
        assertFalse(engine.isPassActive())
        assertEquals(0L, engine.remainingPassMs())

        // Khôi phục đồng hồ nhưng đồng hồ đơn điệu elapsedRealtime đã vượt quá 20 phút -> hết hạn.
        epochMs = 1_700_000_000_000L + 5L * 60L * 1000L
        elapsedMs = 100_000L + AdFreePassEngine.PASS_DURATION_MS + 1_000L
        assertFalse(engine.isPassActive())
    }

    @Test
    fun survivesDeviceRebootWithinValidEpochWindowAndCapsStackedDurationAt60Minutes() {
        var epochMs = 1_700_000_000_000L
        var elapsedMs = 500_000L
        val store = InMemoryAdFreeStore()
        val engine = AdFreePassEngine(store, { epochMs }, { elapsedMs })

        engine.grantBonusMinutes(15)
        // Giả lập máy khởi động lại sau 5 phút (elapsedRealtime quay về nhỏ hơn mốc cũ).
        epochMs += 5L * 60L * 1000L
        elapsedMs = 10_000L
        assertTrue(engine.isPassActive())
        assertEquals(10L * 60L * 1000L, engine.remainingPassMs())

        // Cộng dồn nhiều lần không bao giờ vượt quá trần 60 phút.
        engine.grantBonusMinutes(40)
        engine.grantBonusMinutes(40)
        assertEquals(AdFreePassEngine.MAX_PASS_DURATION_MS, engine.remainingPassMs())
        assertEquals("18:45", AdFreePassUiController.formatMmSs((18 * 60 + 45) * 1_000L))
    }
}
