package com.nextai.gameoffline.ads

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Bộ Unit Test JVM cho [FullScreenAdSlot] và [FullScreenAdGate]: kiểm chứng dedupe request,
 * TTL cache, retry backoff, trì hoãn preload 3 giây, hoàn trả cache khi rời tiền cảnh và xóa VIP.
 * JVM unit tests for [FullScreenAdSlot] and [FullScreenAdGate] covering dedupe, TTL, backoff,
 * 3-second deferred preload, foreground-loss cache restoration, and entitlement cleanup.
 */
class FullScreenAdSlotTest {

    /** Fake scheduler chạy đồng bộ và cho phép tua đồng hồ xác định trên JVM. */
    private class FakeAdScheduler(private var currentTimeMs: Long = 10_000L) : AdScheduler {
        private data class ScheduledTask(val runAtMs: Long, val task: Runnable)
        private val scheduled = mutableListOf<ScheduledTask>()

        fun nowMs(): Long = currentTimeMs

        fun advanceBy(deltaMs: Long) {
            currentTimeMs += deltaMs
            while (true) {
                val due = scheduled
                    .filter { it.runAtMs <= currentTimeMs }
                    .minByOrNull { it.runAtMs }
                    ?: break
                scheduled.remove(due)
                due.task.run()
            }
        }

        override fun runOnMain(action: () -> Unit) {
            action()
        }

        override fun postDelayed(delayMs: Long, task: Runnable) {
            scheduled.add(ScheduledTask(currentTimeMs + delayMs.coerceAtLeast(0L), task))
        }

        override fun cancel(task: Runnable) {
            scheduled.removeAll { it.task === task }
        }
    }

    @Test
    fun requestLoad_deduplicatesInFlightRequestsAndNotifiesAllSubscribers() {
        val scheduler = FakeAdScheduler()
        val slot = FullScreenAdSlot<String>(
            cacheTtlMs = 60_000L,
            scheduler = scheduler,
            clockMs = scheduler::nowMs
        )
        var networkCalls = 0
        var completeNetwork: ((String) -> Unit)? = null
        val results = mutableListOf<Boolean>()

        slot.requestLoad(
            canRequest = { true },
            onSuppressed = {},
            onResult = { results.add(it) },
            startLoad = { _, onLoaded, _ ->
                networkCalls++
                completeNetwork = onLoaded
            }
        )
        slot.requestLoad(
            canRequest = { true },
            onSuppressed = {},
            onResult = { results.add(it) },
            startLoad = { _, _, _ -> networkCalls++ }
        )

        assertEquals(1, networkCalls)
        completeNetwork?.invoke("ad_1")
        assertEquals(listOf(true, true), results)
        assertEquals("ad_1", slot.takeValidAd()?.ad)
    }

    @Test
    fun takeValidAd_dropsExpiredEntryAndRestoreRespectsTtl() {
        val scheduler = FakeAdScheduler(currentTimeMs = 1_000L)
        val slot = FullScreenAdSlot<String>(
            cacheTtlMs = 5_000L,
            scheduler = scheduler,
            clockMs = scheduler::nowMs
        )

        slot.requestLoad(
            canRequest = { true },
            onSuppressed = {},
            startLoad = { _, onLoaded, _ -> onLoaded("ad_fresh") }
        )

        val popped = slot.takeValidAd()
        assertNotNull(popped)
        assertNull(slot.takeValidAd())

        // Hoàn trả khi còn hạn (mô phỏng user bấm Home trong lúc đệm 700ms).
        // Restore while still within TTL (simulating user backgrounding during 700ms buffer).
        scheduler.advanceBy(700L)
        slot.restoreAdIfEmpty(requireNotNull(popped))
        assertEquals("ad_fresh", slot.takeValidAd()?.ad)

        // Sau khi quá TTL, hoàn trả không được phép lưu lại quảng cáo hết hạn.
        // After TTL expires, restore must ignore the stale ad.
        scheduler.advanceBy(5_000L)
        slot.restoreAdIfEmpty(popped)
        assertNull(slot.takeValidAd())
    }

    @Test
    fun scheduleDeferredPreload_blocksEarlyLoadAndTriggersAtThreeSeconds() {
        val scheduler = FakeAdScheduler(currentTimeMs = 20_000L)
        val slot = FullScreenAdSlot<String>(
            cacheTtlMs = 60_000L,
            scheduler = scheduler,
            clockMs = scheduler::nowMs
        )
        val suppressedReasons = mutableListOf<String>()
        var triggeredCount = 0

        slot.scheduleDeferredPreload(AdOptimizationPolicy.INTERSTITIAL_PRELOAD_DELAY_MS) {
            triggeredCount++
        }

        scheduler.advanceBy(1_000L)
        slot.requestLoad(
            canRequest = { true },
            onSuppressed = { suppressedReasons.add(it) },
            startLoad = { _, _, _ -> error("Must not start load inside 3s deferred window") }
        )
        assertEquals(listOf("preload_delay_3s"), suppressedReasons)
        assertEquals(0, triggeredCount)

        scheduler.advanceBy(2_000L)
        assertEquals(1, triggeredCount)
    }

    @Test
    fun onLoadFailure_appliesBackoffAndClearCacheCancelsPendingRetries() {
        val scheduler = FakeAdScheduler(currentTimeMs = 50_000L)
        val slot = FullScreenAdSlot<String>(
            cacheTtlMs = 60_000L,
            maxAutomaticRetries = 2,
            scheduler = scheduler,
            clockMs = scheduler::nowMs,
            retryDelayProvider = { _, _ -> 15_000L }
        )
        var retryTriggered = 0
        val suppressed = mutableListOf<String>()

        slot.requestLoad(
            canRequest = { true },
            onSuppressed = { suppressed.add(it) },
            onDeferredPreloadTrigger = { retryTriggered++ },
            startLoad = { _, _, onFailed -> onFailed(2) }
        )

        // Trong thời gian cooldown không được gọi mạng tiếp.
        // Must suppress loads during retry cooldown.
        slot.requestLoad(
            canRequest = { true },
            onSuppressed = { suppressed.add(it) },
            startLoad = { _, _, _ -> error("Must not load during retry cooldown") }
        )
        assertEquals(listOf("retry_cooldown"), suppressed)

        // Hủy sạch khi user kích hoạt VIP: retry hẹn giờ không được chạy nữa.
        // Clearing cache on entitlement change cancels scheduled retries.
        slot.clearCacheAndWork()
        scheduler.advanceBy(20_000L)
        assertEquals(0, retryTriggered)
    }

    @Test
    fun fullScreenAdGate_enforcesExclusivityUserActionsAndNinetySecondCap() {
        val gate = FullScreenAdGate(minInterstitialIntervalMs = 90_000L, minUserActions = 2)

        assertFalse(gate.hasEnoughUserActions())
        gate.recordUserAction()
        assertFalse(gate.hasEnoughUserActions())
        gate.recordUserAction()
        assertTrue(gate.hasEnoughUserActions())

        assertTrue(gate.tryAcquireShowing())
        assertFalse(gate.tryAcquireShowing())
        gate.markFullScreenShown(nowMs = 100_000L)
        gate.releaseShowing()

        assertFalse(gate.hasEnoughUserActions())
        assertTrue(gate.isWithinCooldown(nowMs = 150_000L))
        assertFalse(gate.isWithinCooldown(nowMs = 190_000L))
    }

    @Test
    fun fullScreenAdGate_defaultCooldownIsSixtySeconds() {
        assertEquals(60_000L, FullScreenAdGate.DEFAULT_MIN_INTERSTITIAL_INTERVAL_MS)
        val defaultGate = FullScreenAdGate()
        defaultGate.markFullScreenShown(nowMs = 100_000L)
        assertTrue(defaultGate.isWithinCooldown(nowMs = 159_999L))
        assertFalse(defaultGate.isWithinCooldown(nowMs = 160_000L))
    }
}
