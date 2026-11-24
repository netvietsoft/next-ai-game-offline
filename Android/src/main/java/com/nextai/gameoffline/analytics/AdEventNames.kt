package com.nextai.gameoffline.analytics

/** Tên sự kiện cố định theo loại và vòng đời quảng cáo / Fixed event names for each ad format and lifecycle stage. */
internal object AdEventNames {
    /** Không tạo sự kiện cho loại hoặc giai đoạn không hỗ trợ / Do not invent events for unsupported types or stages. */
    fun forStage(adType: String, stage: String): String? {
        val prefix = when (adType) {
            "BANNER" -> "banner"
            "INTERSTITIAL" -> "interstitial"
            "APP_OPEN" -> "app_open"
            "REWARDED" -> "reward"
            "NATIVE" -> "native"
            else -> return null
        }
        if (stage !in setOf("load", "loaded", "load_fail", "showed", "click")) return null
        return "${prefix}_${stage}"
    }
}
