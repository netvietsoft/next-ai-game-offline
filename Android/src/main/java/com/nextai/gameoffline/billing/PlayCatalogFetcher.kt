package com.nextai.gameoffline.billing

import android.os.SystemClock
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.QueryProductDetailsParams
import com.nextai.gameoffline.domain.repository.BillingCatalogStatus

/**
 * Truy vấn bảng giá Subscription từ Google Play kèm guard chống callback cũ ghi đè kết quả mới.
 * Fetches localized Play subscription offers with generation guards against stale callbacks.
 */
internal class PlayCatalogFetcher(
    private val packageName: String,
    private val client: BillingClient,
    private val onMain: (() -> Unit) -> Unit
) {

    data class CatalogResult(
        val plans: List<PlayCatalogMapper.ResolvedPlan>,
        val status: BillingCatalogStatus,
        val fetchedAtMs: Long
    )

    private var queryGeneration = 0L

    /** Vô hiệu mọi truy vấn bảng giá đang bay khi mất kết nối Play. */
    fun invalidatePendingQueries() {
        queryGeneration++
    }

    /** Gửi truy vấn SUBS lên Google Play và trả [CatalogResult] về Main Thread. */
    fun fetch(onCompleted: (CatalogResult) -> Unit) {
        val generation = ++queryGeneration
        val productList = BillingConstants.SUBSCRIPTIONS.map { definition ->
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(definition.productId)
                .setProductType(BillingClient.ProductType.SUBS)
                .build()
        }
        val params = QueryProductDetailsParams.newBuilder().setProductList(productList).build()

        client.queryProductDetailsAsync(params) { result, products ->
            onMain {
                if (generation != queryGeneration) {
                    return@onMain
                }
                val plans = if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                    PlayCatalogMapper.mapEligiblePlans(products.productDetailsList)
                } else {
                    emptyList()
                }
                PlayCatalogMapper.logDebugDiagnostics(
                    packageName,
                    result.responseCode,
                    products,
                    plans
                )
                val status = PlayCatalogMapper.resolveCatalogStatus(result.responseCode, plans)
                onCompleted(
                    CatalogResult(
                        plans = plans,
                        status = status,
                        fetchedAtMs = SystemClock.elapsedRealtime()
                    )
                )
            }
        }
    }
}
