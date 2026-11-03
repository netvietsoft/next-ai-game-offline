package com.nextai.gameoffline.ads

/**
 * Định nghĩa các hằng số và Ad Unit ID cho hệ thống quảng cáo AdMob chính thức của Game Gate Offline.
 * Ad Constants and Ad Unit IDs for Google Mobile Ads Production.
 */
object AdConstants {
    // Khóa ứng dụng Google AdMob App ID / Google AdMob Application ID
    const val ADMOB_APP_ID = "ca-app-pub-4108090245719282~4299594158"

    // Khối quảng cáo Banner ở đáy màn hình / Bottom Banner Ad Unit ID
    const val BANNER_AD_UNIT_ID = "ca-app-pub-4108090245719282/4579664323"

    // Khối quảng cáo Toàn màn hình xen kẽ (Trung gian full screen) / Interstitial Ad Unit ID
    const val INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-4108090245719282/3500572281"

    // Khối quảng cáo xen kẽ có tặng thưởng / Rewarded Interstitial Ad Unit ID
    const val REWARDED_INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-4108090245719282/5743592246"

    // Khối quảng cáo Video nhận thưởng / Rewarded Video Ad Unit ID
    const val REWARDED_AD_UNIT_ID = "ca-app-pub-4108090245719282/7458098782"

    // Khối quảng cáo Tự nhiên / Native Ad Unit ID
    const val NATIVE_AD_UNIT_ID = "ca-app-pub-4108090245719282/8178183893"

    // Khối quảng cáo Mở ứng dụng / App Open Ad Unit ID
    const val APP_OPEN_AD_UNIT_ID = "ca-app-pub-4108090245719282/3518853778"

    // Tương thích ngược với các vị trí gọi hằng số cũ / Aliases for backward compatibility
    const val TEST_BANNER_AD_UNIT_ID = BANNER_AD_UNIT_ID
    const val TEST_INTERSTITIAL_AD_UNIT_ID = INTERSTITIAL_AD_UNIT_ID
    const val TEST_REWARDED_AD_UNIT_ID = REWARDED_AD_UNIT_ID
}
