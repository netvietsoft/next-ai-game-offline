package com.nextai.gameoffline.ads

import com.nextai.gameoffline.BuildConfig

/**
 * Định nghĩa các hằng số và chuỗi Ad Unit ID 3 tầng eCPM (High Floor -> Medium Floor -> All Prices)
 * cho hệ thống quảng cáo AdMob Production của Galaxy Game.
 * Ad Constants and 3-tier eCPM waterfall Ad Unit IDs for Google Mobile Ads.
 */
object AdConstants {
    // Khóa ứng dụng Google AdMob App ID / Google AdMob Application ID
    const val ADMOB_APP_ID = "ca-app-pub-4108090245719282~4299594158"

    // Khối quảng cáo Banner ở đáy màn hình / Bottom Banner Ad Unit ID
    val BANNER_AD_UNIT_ID = if (BuildConfig.DEBUG) {
        TEST_BANNER_AD_UNIT_ID
    } else {
        "ca-app-pub-4108090245719282/4579664323"
    }

    // Chuỗi 3 tầng eCPM cho Interstitial (điền ID High/Med sau khi tạo trên AdMob Console).
    // 3-tier eCPM waterfall units for Interstitial (fill High/Med once created in AdMob Console).
    const val INTERSTITIAL_HIGH_FLOOR_ID = ""
    const val INTERSTITIAL_MED_FLOOR_ID = ""

    // Khối quảng cáo Toàn màn hình xen kẽ (tầng All Prices làm lưới vét cuối phễu).
    // Interstitial All Prices fallback unit preserving > 85% fill rate.
    val INTERSTITIAL_AD_UNIT_ID = if (BuildConfig.DEBUG) {
        TEST_INTERSTITIAL_AD_UNIT_ID
    } else {
        "ca-app-pub-4108090245719282/3500572281"
    }

    // Khối quảng cáo xen kẽ có tặng thưởng / Rewarded Interstitial Ad Unit ID
    val REWARDED_INTERSTITIAL_AD_UNIT_ID = if (BuildConfig.DEBUG) {
        "ca-app-pub-3940256099942544/5354046379"
    } else {
        "ca-app-pub-4108090245719282/5743592246"
    }

    // Chuỗi 3 tầng eCPM cho Rewarded Video (điền ID High/Med sau khi tạo trên AdMob Console).
    // 3-tier eCPM waterfall units for Rewarded Video (fill High/Med once created in AdMob Console).
    const val REWARDED_HIGH_FLOOR_ID = ""
    const val REWARDED_MED_FLOOR_ID = ""

    // Khối quảng cáo Video nhận thưởng (tầng All Prices làm lưới vét cuối phễu).
    // Rewarded Video All Prices fallback unit preserving fill rate.
    val REWARDED_AD_UNIT_ID = if (BuildConfig.DEBUG) {
        TEST_REWARDED_AD_UNIT_ID
    } else {
        "ca-app-pub-4108090245719282/7458098782"
    }

    // Khối quảng cáo Tự nhiên / Native Ad Unit ID
    val NATIVE_AD_UNIT_ID = if (BuildConfig.DEBUG) {
        "ca-app-pub-3940256099942544/2247696110"
    } else {
        "ca-app-pub-4108090245719282/8178183893"
    }

    // Khối quảng cáo Mở ứng dụng / App Open Ad Unit ID
    val APP_OPEN_AD_UNIT_ID = if (BuildConfig.DEBUG) {
        TEST_APP_OPEN_AD_UNIT_ID
    } else {
        "ca-app-pub-4108090245719282/3518853778"
    }

    // ID demo chính thức chỉ dùng khi kiểm thử; release dùng ID sản xuất bên trên.
    // Official demo units are for testing only; release uses the production IDs above.
    const val TEST_BANNER_AD_UNIT_ID = "ca-app-pub-3940256099942544/9214589741"
    const val TEST_INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-3940256099942544/1033173712"
    const val TEST_REWARDED_AD_UNIT_ID = "ca-app-pub-3940256099942544/5224354917"
    const val TEST_APP_OPEN_AD_UNIT_ID = "ca-app-pub-3940256099942544/9257395921"

    /**
     * Lọc và khử trùng lặp danh sách Ad Unit theo thứ tự ưu tiên thác nước (thuần Kotlin).
     * Khi chưa cấu hình tầng High/Med, chỉ trả về 1 mã All Prices để không phát sinh request thừa.
     * Filters blank/duplicate IDs in waterfall order so unconfigured tiers never emit extra requests.
     */
    fun resolveWaterfallUnits(vararg rawUnitIds: String): List<String> =
        rawUnitIds.map(String::trim).filter(String::isNotBlank).distinct()

    /** Danh sách mã đơn vị Interstitial theo thứ tự High -> Med -> All Prices. */
    fun interstitialWaterfallUnits(): List<String> = if (BuildConfig.DEBUG) {
        listOf(TEST_INTERSTITIAL_AD_UNIT_ID)
    } else {
        resolveWaterfallUnits(
            INTERSTITIAL_HIGH_FLOOR_ID,
            INTERSTITIAL_MED_FLOOR_ID,
            INTERSTITIAL_AD_UNIT_ID
        )
    }

    /** Danh sách mã đơn vị Rewarded theo thứ tự High -> Med -> All Prices. */
    fun rewardedWaterfallUnits(): List<String> = if (BuildConfig.DEBUG) {
        listOf(TEST_REWARDED_AD_UNIT_ID)
    } else {
        resolveWaterfallUnits(
            REWARDED_HIGH_FLOOR_ID,
            REWARDED_MED_FLOOR_ID,
            REWARDED_AD_UNIT_ID
        )
    }
}
