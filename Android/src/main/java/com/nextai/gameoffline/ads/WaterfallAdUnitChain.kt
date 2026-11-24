package com.nextai.gameoffline.ads

/**
 * Bộ nạp tuần tự theo thác nước 3 tầng eCPM (`High Floor -> Medium Floor -> All Prices`):
 * chỉ chuyển xuống tầng thấp hơn khi gặp lỗi No Fill (`ERROR_CODE_NO_FILL = 3` hoặc
 * `ERROR_CODE_MEDIATION_NO_FILL = 9`), và dừng sớm ngay khi gặp lỗi mạng (`2`) hoặc
 * request không hợp lệ (`1`) để không bắn request vô ích làm giảm hiệu năng & tỷ lệ fill.
 * Pure Kotlin 3-tier eCPM waterfall loader with smart early-stop on network/invalid errors.
 */
internal class WaterfallAdUnitChain(
    private val adUnitIdsProvider: () -> List<String>
) {

    /**
     * Quảng cáo đã nạp thành công kèm đúng `adUnitId` thắng thầu và chỉ số tầng (`0 = High`).
     * Successfully loaded ad paired with its winning `adUnitId` and 0-based tier index.
     */
    data class LoadedUnit<T : Any>(
        val ad: T,
        val adUnitId: String,
        val tierIndex: Int
    )

    /**
     * Nạp tuần tự từng tầng cho tới khi có tầng thắng thầu, gặp lỗi cứng, hoặc hết tầng.
     * Sequentially attempts each configured ad unit until one fills, a hard error occurs, or all fail.
     */
    fun <T : Any> loadSequentially(
        loadSingleUnit: (
            adUnitId: String,
            tierIndex: Int,
            onSuccess: (T) -> Unit,
            onFailure: (errorCode: Int) -> Unit
        ) -> Unit,
        onLoaded: (LoadedUnit<T>) -> Unit,
        onAllFailed: (lastErrorCode: Int) -> Unit
    ) {
        val units = adUnitIdsProvider()
            .map(String::trim)
            .filter(String::isNotBlank)
            .distinct()
        if (units.isEmpty()) {
            onAllFailed(ERROR_CODE_INVALID_REQUEST)
            return
        }
        attemptTier(units, tierIndex = 0, loadSingleUnit, onLoaded, onAllFailed)
    }

    private fun <T : Any> attemptTier(
        units: List<String>,
        tierIndex: Int,
        loadSingleUnit: (
            adUnitId: String,
            tierIndex: Int,
            onSuccess: (T) -> Unit,
            onFailure: (errorCode: Int) -> Unit
        ) -> Unit,
        onLoaded: (LoadedUnit<T>) -> Unit,
        onAllFailed: (lastErrorCode: Int) -> Unit
    ) {
        val adUnitId = units[tierIndex]
        loadSingleUnit(
            adUnitId,
            tierIndex,
            { ad ->
                onLoaded(LoadedUnit(ad = ad, adUnitId = adUnitId, tierIndex = tierIndex))
            },
            { errorCode ->
                val hasNextTier = tierIndex + 1 < units.size
                if (hasNextTier && shouldCascadeToNextTier(errorCode)) {
                    attemptTier(units, tierIndex + 1, loadSingleUnit, onLoaded, onAllFailed)
                } else {
                    onAllFailed(errorCode)
                }
            }
        )
    }

    companion object {
        const val ERROR_CODE_INTERNAL = 0
        const val ERROR_CODE_INVALID_REQUEST = 1
        const val ERROR_CODE_NETWORK_ERROR = 2
        const val ERROR_CODE_NO_FILL = 3
        const val ERROR_CODE_MEDIATION_NO_FILL = 9

        /**
         * Chỉ rơi xuống tầng giá sàn thấp hơn khi tầng hiện tại không có quảng cáo (No Fill).
         * Dừng ngay nếu mất mạng (`2`) hoặc cấu hình sai (`1`) để tiết kiệm tài nguyên.
         * Cascades only on no-fill codes; aborts immediately on network or invalid-request errors.
         */
        fun shouldCascadeToNextTier(errorCode: Int): Boolean =
            errorCode == ERROR_CODE_NO_FILL || errorCode == ERROR_CODE_MEDIATION_NO_FILL
    }
}
