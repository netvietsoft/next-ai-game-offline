package com.nextai.gameoffline.billing

/** Cache grace không là thời hạn thật của thuê bao / Cache grace is not the actual subscription expiry. */
internal object PremiumCachePolicy {
    const val OFFLINE_LEASE_MS = 24L * 60 * 60 * 1000
    /** Lifetime không hết hạn; thuê bao chỉ được cache có giới hạn / Lifetime does not age out; subscription cache is bounded. */
    fun isActive(lifetime: Boolean, subscription: Boolean, checkedAt: Long, now: Long): Boolean =
        lifetime || (subscription && checkedAt > 0 && now - checkedAt in 0 until OFFLINE_LEASE_MS)
}
