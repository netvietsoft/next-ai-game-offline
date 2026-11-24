package com.nextai.gameoffline.ads

import kotlin.math.pow
import kotlin.random.Random

/**
 * Chính sách retry thuần Kotlin để giảm request lặp khi mạng lỗi hoặc quảng cáo không có fill.
 * Pure Kotlin retry policy that reduces repeated requests on network errors or no-fill.
 */
object AdRetryPolicy {

    private const val ERROR_INTERNAL = 0
    private const val ERROR_INVALID_REQUEST = 1
    private const val ERROR_NETWORK = 2
    private const val ERROR_NO_FILL = 3
    private const val MAX_DELAY_MS = 15L * 60L * 1000L

    /**
     * Tính exponential backoff kèm jitter; trả null cho lỗi cấu hình không thể tự phục hồi.
     * Computes exponential backoff with jitter; returns null for non-recoverable configuration errors.
     *
     * @param errorCode Mã lỗi Google Mobile Ads / Google Mobile Ads error code.
     * @param consecutiveFailures Số lần lỗi liên tiếp / Number of consecutive failures.
     * @param jitterRatio Tỷ lệ jitter 0..0.25, có thể cố định trong test / Jitter ratio, injectable in tests.
     */
    fun nextDelayMillis(
        errorCode: Int,
        consecutiveFailures: Int,
        jitterRatio: Double = Random.nextDouble(0.0, 0.25)
    ): Long? {
        if (errorCode == ERROR_INVALID_REQUEST) return null

        val baseDelayMs = when (errorCode) {
            ERROR_NETWORK -> 15_000L
            ERROR_INTERNAL -> 30_000L
            ERROR_NO_FILL -> 120_000L
            else -> 60_000L
        }
        val exponent = (consecutiveFailures - 1).coerceIn(0, 4)
        val exponentialDelay = (baseDelayMs * 2.0.pow(exponent)).toLong()
            .coerceAtMost(MAX_DELAY_MS)
        val jitterMs = (exponentialDelay * jitterRatio.coerceIn(0.0, 0.25)).toLong()
        return (exponentialDelay + jitterMs).coerceAtMost(MAX_DELAY_MS)
    }
}
