package com.nextai.gameoffline.ads

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

/**
 * Kiểm thử chính sách backoff để ngăn hồi quy gây bắn request liên tục.
 * Tests backoff behavior to prevent regressions that spam ad requests.
 */
class AdRetryPolicyTest {

    /** Lỗi cấu hình không được retry tự động / Configuration errors are never retried automatically. */
    @Test
    fun invalidRequestDoesNotRetry() {
        assertNull(AdRetryPolicy.nextDelayMillis(errorCode = 1, consecutiveFailures = 1, jitterRatio = 0.0))
    }

    /** Lỗi mạng tăng backoff theo cấp số nhân / Network errors use exponential backoff. */
    @Test
    fun networkErrorUsesExponentialBackoff() {
        assertEquals(15_000L, AdRetryPolicy.nextDelayMillis(2, 1, 0.0))
        assertEquals(30_000L, AdRetryPolicy.nextDelayMillis(2, 2, 0.0))
        assertEquals(60_000L, AdRetryPolicy.nextDelayMillis(2, 3, 0.0))
    }

    /** No-fill chờ lâu hơn lỗi mạng / No-fill waits longer than a network error. */
    @Test
    fun noFillUsesLongCooldown() {
        assertEquals(120_000L, AdRetryPolicy.nextDelayMillis(3, 1, 0.0))
        assertEquals(240_000L, AdRetryPolicy.nextDelayMillis(3, 2, 0.0))
    }

    /** Jitter bị chặn ở 25 phần trăm / Jitter is capped at 25 percent. */
    @Test
    fun jitterIsCapped() {
        assertEquals(18_750L, AdRetryPolicy.nextDelayMillis(2, 1, 1.0))
    }
}
