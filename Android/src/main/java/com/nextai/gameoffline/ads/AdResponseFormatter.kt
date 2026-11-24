package com.nextai.gameoffline.ads

import com.google.android.gms.ads.ResponseInfo

/**
 * Chuẩn hóa thông tin adapter mediation từ `ResponseInfo` phục vụ chẩn đoán waterfall,
 * đảm bảo không bao giờ ghi dữ liệu người dùng (PII).
 * Normalizes mediation adapter metadata from `ResponseInfo` for waterfall diagnostics
 * without ever emitting user PII.
 */
internal object AdResponseFormatter {

    private const val MAX_FIELD_LENGTH = 100
    private const val MAX_WATERFALL_ADAPTERS = 5

    /** Trả về tên adapter thắng đấu giá / Returns the normalized winning adapter class name. */
    fun adapterName(responseInfo: ResponseInfo?): String {
        return responseInfo?.mediationAdapterClassName?.takeLast(MAX_FIELD_LENGTH) ?: "unknown"
    }

    /**
     * Tóm tắt chuỗi adapter trong waterfall để phân biệt no-fill từ Google hay Meta.
     * Summarizes adapter waterfall codes to distinguish Google versus Meta no-fill outcomes.
     */
    fun responseSummary(responseInfo: ResponseInfo?): String {
        return responseInfo
            ?.adapterResponses
            ?.take(MAX_WATERFALL_ADAPTERS)
            ?.joinToString(separator = "|") { response ->
                val simpleName = response.adapterClassName.substringAfterLast('.')
                val errorCode = response.adError?.code ?: 0
                "$simpleName:$errorCode"
            }
            ?.take(MAX_FIELD_LENGTH)
            ?: "no_response_info"
    }
}
