package com.nextai.gameoffline.billing

import android.content.Context

/**
 * Lưu trữ tách biệt quyền Lifetime (gói INAPP cũ) với bộ đệm quyền Subscription có thời hạn grace 24h.
 * Separates legacy lifetime ownership from bounded 24-hour subscription offline grace cache.
 */
object BillingEntitlements {

    private const val PREFS_NAME = "nextai_billing_prefs"
    private const val KEY_MIGRATED = "entitlement_v2_migrated"
    private const val KEY_LIFETIME = "owned_lifetime"
    private const val KEY_SUBSCRIPTION = "owned_subscription"
    private const val KEY_LAST_CHECK = "subscription_checked_at"

    private var generation = 0L

    /** Phiên bản đồng bộ chống truy vấn cũ ghi đè giao dịch mới. */
    @Synchronized
    fun version(): Long = generation

    /** Giao dịch PENDING vô hiệu các truy vấn cũ mà không cấp quyền sớm. */
    @Synchronized
    fun invalidatePendingQueries() {
        generation++
    }

    /**
     * Trả về trạng thái Premium hiện hành; thời hạn 24 giờ chỉ là grace offline,
     * không thay thế trạng thái gia hạn thực tế từ Google Play.
     * Evaluates active entitlement with a 24-hour offline subscription grace window.
     */
    @Synchronized
    fun isPremium(context: Context): Boolean {
        val prefs = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        if (!prefs.getBoolean(KEY_MIGRATED, false)) {
            val legacyFlag = prefs.getBoolean(BillingConstants.PREF_IS_PREMIUM_USER, false)
            prefs.edit()
                .putBoolean(KEY_LIFETIME, legacyFlag)
                .putBoolean(KEY_MIGRATED, true)
                .apply()
        }

        val active = PremiumCachePolicy.isActive(
            lifetime = prefs.getBoolean(KEY_LIFETIME, false),
            subscription = prefs.getBoolean(KEY_SUBSCRIPTION, false),
            checkedAt = prefs.getLong(KEY_LAST_CHECK, 0L),
            now = System.currentTimeMillis()
        )
        if (prefs.getBoolean(BillingConstants.PREF_IS_PREMIUM_USER, false) != active) {
            prefs.edit().putBoolean(BillingConstants.PREF_IS_PREMIUM_USER, active).apply()
        }
        return active
    }

    /**
     * Trả `true` khi cần tạm ẩn các định dạng quảng cáo tự động (Banner, Interstitial, App Open, Native),
     * bao gồm cả VIP trả phí lẫn Vé Sạch Quảng Cáo tạm thời (20 phút / thưởng Daily Quest).
     * TUYỆT ĐỐI KHÔNG dùng hàm này thay cho [isPremium] ở luồng thanh toán Google Play!
     * Returns `true` when automatic ads should be suppressed via VIP OR temporary Ad-Free Pass.
     */
    fun shouldSuppressAutomaticAds(context: Context): Boolean {
        return isPremium(context) || AdFreePassManager.isPassActive(context)
    }

    /** Chỉ áp snapshot khi cả hai truy vấn INAPP và SUBS đều thành công. */
    @Synchronized
    fun applySnapshot(
        context: Context,
        expectedVersion: Long,
        lifetime: Boolean,
        subscription: Boolean
    ): Boolean {
        if (expectedVersion != generation) {
            return false
        }
        isPremium(context)
        generation++
        context.applicationContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_LIFETIME, lifetime)
            .putBoolean(KEY_SUBSCRIPTION, subscription)
            .putLong(KEY_LAST_CHECK, System.currentTimeMillis())
            .putBoolean(BillingConstants.PREF_IS_PREMIUM_USER, lifetime || subscription)
            .apply()
        return true
    }

    /** Ghi nhận quyền sau khi giao dịch PURCHASED đã được Google Play acknowledge thành công. */
    @Synchronized
    fun recordPurchase(context: Context, subscription: Boolean) {
        isPremium(context)
        generation++
        val editor = context.applicationContext
            .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
        if (subscription) {
            editor.putBoolean(KEY_SUBSCRIPTION, true)
                .putLong(KEY_LAST_CHECK, System.currentTimeMillis())
        } else {
            editor.putBoolean(KEY_LIFETIME, true)
        }
        editor.putBoolean(BillingConstants.PREF_IS_PREMIUM_USER, true).apply()
    }
}
