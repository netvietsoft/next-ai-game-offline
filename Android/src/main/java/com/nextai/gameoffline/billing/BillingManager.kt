package com.nextai.gameoffline.billing

import android.app.Activity
import android.content.Context
import android.content.SharedPreferences
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchasesParams
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Trình quản lý thanh toán Google Play In-App Billing v9.x (Play Billing Library 9.1.0).
 * In-App Billing Manager handling purchases and entitlement verification under Play Billing 9.1.0.
 */
class BillingManager(
    private val context: Context,
    private val onPurchaseSuccess: () -> Unit,
    private val onPurchaseFailed: (String) -> Unit
) : PurchasesUpdatedListener {

    private val prefs: SharedPreferences = context.getSharedPreferences("nextai_billing_prefs", Context.MODE_PRIVATE)
    private var billingClient: BillingClient
    private var removeAdsProductDetails: ProductDetails? = null

    init {
        billingClient = BillingClient.newBuilder(context)
            .setListener(this)
            .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
            .build()

        startConnection()
    }

    private fun startConnection() {
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    queryProducts()
                    queryExistingPurchases()
                }
            }

            override fun onBillingServiceDisconnected() {
                // Tự động kết nối lại khi dịch vụ bị ngắt / Reconnect on disconnect
            }
        })
    }

    private fun queryProducts() {
        val productList = listOf(
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(BillingConstants.SKU_REMOVE_ADS)
                .setProductType(BillingClient.ProductType.INAPP)
                .build(),
            QueryProductDetailsParams.Product.newBuilder()
                .setProductId(BillingConstants.SKU_REMOVE_ADS_LEGACY)
                .setProductType(BillingClient.ProductType.INAPP)
                .build()
        )

        val params = QueryProductDetailsParams.newBuilder().setProductList(productList).build()

        billingClient.queryProductDetailsAsync(params) { billingResult, queryProductDetailsResult ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                removeAdsProductDetails = queryProductDetailsResult.productDetailsList.firstOrNull()
            }
        }
    }

    fun launchPurchaseFlow(activity: Activity) {
        val productDetails = removeAdsProductDetails ?: return
        val price = productDetails.oneTimePurchaseOfferDetails?.formattedPrice ?: "$1.99"
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logPurchaseInitiated(productDetails.productId, price)

        val productDetailsParamsList = listOf(
            BillingFlowParams.ProductDetailsParams.newBuilder()
                .setProductDetails(productDetails)
                .build()
        )

        val billingFlowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(productDetailsParamsList)
            .build()

        billingClient.launchBillingFlow(activity, billingFlowParams)
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: List<Purchase>?) {
        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (purchase in purchases) {
                handlePurchase(purchase)
            }
        } else {
            if (billingResult.responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
                com.nextai.gameoffline.analytics.GameAnalyticsManager.logPurchaseCanceled(BillingConstants.SKU_REMOVE_ADS)
            } else {
                com.nextai.gameoffline.analytics.GameAnalyticsManager.logPurchaseFailed(
                    productId = BillingConstants.SKU_REMOVE_ADS,
                    responseCode = billingResult.responseCode,
                    debugMessage = billingResult.debugMessage
                )
            }
            val errorMsg = when (billingResult.responseCode) {
                BillingClient.BillingResponseCode.BILLING_UNAVAILABLE -> {
                    "Google Play Store không khả dụng hoặc bị chặn: ${billingResult.debugMessage}"
                }
                BillingClient.BillingResponseCode.USER_CANCELED -> {
                    "Giao dịch đã được hủy / Purchase canceled"
                }
                else -> billingResult.debugMessage
            }
            onPurchaseFailed(errorMsg)
        }
    }

    private fun handlePurchase(purchase: Purchase) {
        if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
            setPremiumUser(true)
            com.nextai.gameoffline.analytics.GameAnalyticsManager.logPurchaseSuccess(
                productId = purchase.products.firstOrNull() ?: BillingConstants.SKU_REMOVE_ADS,
                orderId = purchase.orderId ?: "",
                purchaseToken = purchase.purchaseToken
            )

            if (!purchase.isAcknowledged) {
                val acknowledgePurchaseParams = AcknowledgePurchaseParams.newBuilder()
                    .setPurchaseToken(purchase.purchaseToken)
                    .build()

                CoroutineScope(Dispatchers.IO).launch {
                    billingClient.acknowledgePurchase(acknowledgePurchaseParams) {
                        onPurchaseSuccess()
                    }
                }
            } else {
                onPurchaseSuccess()
            }
        }
    }

    fun queryExistingPurchases() {
        val params = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.INAPP)
            .build()

        billingClient.queryPurchasesAsync(params) { _, purchasesList ->
            val hasRemoveAds = purchasesList.any { 
                it.products.contains(BillingConstants.SKU_REMOVE_ADS) || 
                it.products.contains(BillingConstants.SKU_REMOVE_ADS_LEGACY) 
            }
            setPremiumUser(hasRemoveAds)
        }
    }

    fun isPremiumUser(): Boolean {
        return prefs.getBoolean(BillingConstants.PREF_IS_PREMIUM_USER, false)
    }

    private fun setPremiumUser(isPremium: Boolean) {
        prefs.edit().putBoolean(BillingConstants.PREF_IS_PREMIUM_USER, isPremium).apply()
    }

    /**
     * Khôi phục các gói mua trước đó của người dùng trên Google Play Store.
     * Restore existing purchases associated with the user's Google Play account.
     */
    fun restorePurchases(onResult: (Boolean, String) -> Unit) {
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logRestoreInitiated()

        val params = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.INAPP)
            .build()

        billingClient.queryPurchasesAsync(params) { billingResult, purchasesList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                val hasRemoveAds = purchasesList.any { 
                    (it.products.contains(BillingConstants.SKU_REMOVE_ADS) || 
                     it.products.contains(BillingConstants.SKU_REMOVE_ADS_LEGACY)) && 
                    it.purchaseState == Purchase.PurchaseState.PURCHASED
                }
                setPremiumUser(hasRemoveAds)
                if (hasRemoveAds) {
                    com.nextai.gameoffline.analytics.GameAnalyticsManager.logRestoreSuccess(BillingConstants.SKU_REMOVE_ADS)
                    onResult(true, "VIP restored")
                } else {
                    com.nextai.gameoffline.analytics.GameAnalyticsManager.logRestoreNotFound()
                    onResult(false, "No purchase found")
                }
            } else {
                com.nextai.gameoffline.analytics.GameAnalyticsManager.logPurchaseFailed(
                    productId = BillingConstants.SKU_REMOVE_ADS,
                    responseCode = billingResult.responseCode,
                    debugMessage = billingResult.debugMessage
                )
                val msg = if (billingResult.responseCode == BillingClient.BillingResponseCode.BILLING_UNAVAILABLE) {
                    "Google Play Billing không khả dụng: ${billingResult.debugMessage}"
                } else {
                    billingResult.debugMessage
                }
                onResult(false, msg)
            }
        }
    }

    /**
     * Lấy giá tiền hiển thị bản địa từ Google Play (vd: 49.000đ hoặc $1.99).
     * Get localized formatted price from Google Play ProductDetails.
     */
    fun getProductFormattedPrice(): String? {
        return removeAdsProductDetails?.oneTimePurchaseOfferDetails?.formattedPrice
    }
}
