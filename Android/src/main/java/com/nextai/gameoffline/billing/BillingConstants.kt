package com.nextai.gameoffline.billing

/**
 * Định nghĩa các hằng số thanh toán Google Play In-App Billing v9.x (Play Billing Library 9.1.0).
 * In-App Billing constants for Google Play Billing Client 9.x.
 */
object BillingConstants {
    /** Product/base-plan IDs; prices and eligibility always come from Google Play.
     * Mã sản phẩm/base plan; giá và điều kiện luôn lấy từ Google Play. */
    val SUBSCRIPTIONS = listOf(
        SubscriptionDefinition("game_premium", "weekly", "Game Premium Weekly", "P1W", "weekly-premium"),
        SubscriptionDefinition("game_premium_monthly", "monthly", "Game Premium Monthly", "P1M", "monthly-premium"),
        SubscriptionDefinition("game_premium_yearly", "yearly", "Game Premium Yearly", "P1Y", "yearly-premium")
    )
    // Mã SKU gói mua vĩnh viễn xóa toàn bộ quảng cáo / Permanent Remove Ads SKU
    const val SKU_REMOVE_ADS = "com.nextai.game.offline.remove_ads"
    const val SKU_REMOVE_ADS_LEGACY = "com.nextai.gameoffline.remove_ads"

    // Tên key lưu trạng thái VIP trong SharedPreferences / Preference key for VIP status
    const val PREF_IS_PREMIUM_USER = "pref_is_premium_user_key"
}

/** Cấu hình định danh, không chứa giá / Identifiers only, with no hardcoded prices. */
data class SubscriptionDefinition(
    val productId: String,
    val basePlanId: String,
    val name: String,
    val billingPeriod: String,
    val trialOfferId: String
)
