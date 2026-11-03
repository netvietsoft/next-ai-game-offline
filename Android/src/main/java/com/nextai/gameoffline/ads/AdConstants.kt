package com.nextai.gameoffline.ads

/**
 * Định nghĩa các hằng số và Ad Unit ID cho hệ thống quảng cáo AdMob chính thức.
 * Ad Constants and Ad Unit IDs for Google Mobile Ads Production.
 */
object AdConstants {
    // Khóa ứng dụng Google AdMob App ID / Google AdMob Application ID
    const val ADMOB_APP_ID = "ca-app-pub-4108090245719282~5370179426"

    // Khối quảng cáo Banner ở đáy màn hình / Bottom Banner Ad Unit ID
    const val BANNER_AD_UNIT_ID = "ca-app-pub-4108090245719282/7079433640"

    // Khối quảng cáo Toàn màn hình xen kẽ / Full screen Interstitial Ad Unit ID
    const val INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-4108090245719282/5953445428"

    // Khối quảng cáo Video nhận thưởng / Rewarded Video Ad Unit ID
    const val REWARDED_AD_UNIT_ID = "ca-app-pub-4108090245719282/4004949254"

    // Khối quảng cáo Tự nhiên / Native Ad Unit ID
    const val NATIVE_AD_UNIT_ID = "ca-app-pub-4108090245719282/2014200410"

    // Khối quảng cáo Mở ứng dụng / App Open Ad Unit ID
    const val APP_OPEN_AD_UNIT_ID = "ca-app-pub-4108090245719282/6673530530"

    // Tương thích ngược với các vị trí gọi hằng số cũ / Aliases for backward compatibility
    const val TEST_BANNER_AD_UNIT_ID = BANNER_AD_UNIT_ID
    const val TEST_INTERSTITIAL_AD_UNIT_ID = INTERSTITIAL_AD_UNIT_ID
    const val TEST_REWARDED_AD_UNIT_ID = REWARDED_AD_UNIT_ID
}
