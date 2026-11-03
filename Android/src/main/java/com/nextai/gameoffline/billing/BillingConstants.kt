package com.nextai.gameoffline.billing

/**
 * Định nghĩa các hằng số thanh toán Google Play In-App Billing v9.x (Play Billing Library 9.1.0).
 * In-App Billing constants for Google Play Billing Client 9.x.
 */
object BillingConstants {
    // Mã SKU gói mua vĩnh viễn xóa toàn bộ quảng cáo / Permanent Remove Ads SKU
    const val SKU_REMOVE_ADS = "com.nextai.game.offline.remove_ads"
    const val SKU_REMOVE_ADS_LEGACY = "com.nextai.gameoffline.remove_ads"

    // Tên key lưu trạng thái VIP trong SharedPreferences / Preference key for VIP status
    const val PREF_IS_PREMIUM_USER = "pref_is_premium_user_key"
}
