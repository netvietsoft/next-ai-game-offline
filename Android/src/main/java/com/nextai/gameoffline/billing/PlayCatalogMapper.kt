package com.nextai.gameoffline.billing

import android.util.Log
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.QueryProductDetailsResult
import com.nextai.gameoffline.BuildConfig
import com.nextai.gameoffline.domain.repository.BillingCatalogStatus
import com.nextai.gameoffline.domain.repository.BillingPlanModel

/**
 * Chuyển đổi danh sách `ProductDetails` từ Google Play sang mô hình domain [BillingPlanModel]
 * đã qua kiểm định bởi [SubscriptionOfferPolicy], đồng thời giữ lại ánh xạ để mở luồng mua.
 * Maps Play `ProductDetails` into verified domain [BillingPlanModel] records and launch entries.
 */
internal object PlayCatalogMapper {

    /** Gói nội bộ kết hợp mô hình domain thuần với `ProductDetails` cần cho `launchBillingFlow`. */
    data class ResolvedPlan(
        val model: BillingPlanModel,
        val details: ProductDetails
    )

    /**
     * Lọc và ánh xạ đúng các gói Subscription đủ điều kiện từ phản hồi Google Play.
     * Filters and maps eligible subscription offers returned by Google Play.
     */
    fun mapEligiblePlans(productDetailsList: List<ProductDetails>): List<ResolvedPlan> {
        return BillingConstants.SUBSCRIPTIONS.mapNotNull { definition ->
            val product = productDetailsList.firstOrNull { it.productId == definition.productId }
                ?: return@mapNotNull null
            val offers = product.subscriptionOfferDetails.orEmpty().map { offer ->
                val phases = offer.pricingPhases.pricingPhaseList.map { phase ->
                    SubscriptionOfferPolicy.Phase(
                        formattedPrice = phase.formattedPrice,
                        currency = phase.priceCurrencyCode,
                        micros = phase.priceAmountMicros,
                        period = phase.billingPeriod,
                        cycles = phase.billingCycleCount,
                        recurrence = phase.recurrenceMode
                    )
                }
                SubscriptionOfferPolicy.Offer(
                    basePlanId = offer.basePlanId,
                    offerId = offer.offerId,
                    token = offer.offerToken,
                    phases = phases
                )
            }

            val selectedOffer = SubscriptionOfferPolicy.select(definition, offers)
                ?: return@mapNotNull null
            val recurring = selectedOffer.phases.last()
            val introTrialPeriod = selectedOffer.phases
                .firstOrNull()
                ?.takeIf { selectedOffer.phases.size > 1 && it.micros == 0L }
                ?.period

            val model = BillingPlanModel(
                productId = definition.productId,
                basePlanId = definition.basePlanId,
                formattedPrice = recurring.formattedPrice,
                recurringPeriodIso = recurring.period,
                trialPeriodIso = introTrialPeriod,
                offerToken = selectedOffer.token
            )
            ResolvedPlan(model = model, details = product)
        }
    }

    /** Chuyển mã phản hồi Play sang trạng thái catalog cho tầng UI. */
    fun resolveCatalogStatus(responseCode: Int, loadedPlans: List<ResolvedPlan>): BillingCatalogStatus {
        return when {
            responseCode == BillingClient.BillingResponseCode.ITEM_UNAVAILABLE -> {
                BillingCatalogStatus.UNAVAILABLE
            }
            responseCode != BillingClient.BillingResponseCode.OK -> {
                BillingCatalogStatus.SERVICE_ERROR
            }
            loadedPlans.isEmpty() -> BillingCatalogStatus.UNAVAILABLE
            else -> BillingCatalogStatus.READY
        }
    }

    /**
     * Ghi chẩn đoán catalog ở bản debug; không bao giờ ghi token hay dữ liệu tài khoản.
     * Emits debug-only catalog diagnostics containing only response codes and public IDs.
     */
    fun logDebugDiagnostics(
        packageName: String,
        responseCode: Int,
        result: QueryProductDetailsResult,
        resolvedPlans: List<ResolvedPlan>
    ) {
        if (!BuildConfig.DEBUG) {
            return
        }
        val knownIds = BillingConstants.SUBSCRIPTIONS.map { it.productId }.toSet()
        val unfetched = result.unfetchedProductList
            .filter { it.productId in knownIds }
            .joinToString(",") { "${it.productId}:${it.statusCode}" }
        val filteredOut = result.productDetailsList
            .map { it.productId }
            .filter { id -> id in knownIds && resolvedPlans.none { it.model.productId == id } }
        Log.d(
            "PlayCatalog",
            "package=$packageName response=$responseCode " +
                "fetched=${result.productDetailsList.size} available=${resolvedPlans.size} " +
                "unfetched=[$unfetched] unsupported_offer=$filteredOut"
        )
    }
}
