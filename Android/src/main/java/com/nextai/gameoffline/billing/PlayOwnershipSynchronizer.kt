package com.nextai.gameoffline.billing

import android.content.Context
import android.os.Handler
import android.util.Log
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.QueryPurchasesParams
import com.nextai.gameoffline.BuildConfig
import com.nextai.gameoffline.analytics.GameAnalyticsManager
import com.nextai.gameoffline.domain.repository.BillingEvent

/**
 * Điều phối đồng bộ quyền sở hữu từ cả hai loại sản phẩm Google Play (`INAPP` cũ + `SUBS`),
 * quản lý timeout 20 giây và xác nhận (acknowledge) mọi giao dịch PURCHASED trước khi cập nhật cache.
 * Coordinates dual INAPP + SUBS ownership queries, 20s timeout guards, and purchase acknowledgement.
 */
internal class PlayOwnershipSynchronizer(
    private val appContext: Context,
    private val client: BillingClient,
    private val mainHandler: Handler,
    private val onMain: (() -> Unit) -> Unit,
    private val onStateUpdated: (SyncState) -> Unit,
    private val onEvent: (BillingEvent) -> Unit
) {

    /** Trạng thái đồng bộ quyền sở hữu hiện hành cho [PlayBillingRepository]. */
    data class SyncState(
        val checking: Boolean = false,
        val ownershipReady: Boolean = false,
        val ownershipError: Boolean = false,
        val pendingPurchase: Boolean = false
    )

    private var state = SyncState()
    private var queryGeneration = 0L
    private var timeoutRunnable: Runnable? = null

    fun currentState(): SyncState = state

    /** Đặt lại trạng thái khi mất kết nối BillingClient / Reset state on service disconnect. */
    fun onDisconnected() {
        queryGeneration++
        cancelTimeout()
        updateState(
            state.copy(
                checking = false,
                ownershipReady = false,
                ownershipError = true
            )
        )
    }

    /** Cập nhật cờ pending/error từ luồng mua trực tiếp / Apply updates from live purchase flow. */
    fun updateFromPurchaseFlow(
        pendingPurchase: Boolean = state.pendingPurchase,
        ownershipReady: Boolean = state.ownershipReady,
        ownershipError: Boolean = state.ownershipError
    ) {
        updateState(
            state.copy(
                pendingPurchase = pendingPurchase,
                ownershipReady = ownershipReady,
                ownershipError = ownershipError
            )
        )
    }

    /**
     * Đồng bộ cả `INAPP` (gói Remove Ads cũ) và `SUBS`; chỉ áp snapshot khi cả hai query thành công.
     * Queries both legacy INAPP and SUBS purchases and commits snapshot only if both succeed.
     */
    fun sync(emitRestoreFeedback: Boolean) {
        if (state.checking || !client.isReady) {
            if (emitRestoreFeedback) {
                onEvent(
                    BillingEvent.RestoreCompleted(
                        restored = false,
                        message = "Google Play is busy. Please try again."
                    )
                )
            }
            return
        }

        updateState(state.copy(checking = true, ownershipReady = false, ownershipError = false))
        val generation = ++queryGeneration
        armTimeout(generation, emitRestoreFeedback)

        val snapshotVersion = BillingEntitlements.version()
        var remaining = 2
        var queryError: BillingResult? = null
        val collected = mutableListOf<Purchase>()

        val productTypes = listOf(BillingClient.ProductType.INAPP, BillingClient.ProductType.SUBS)
        productTypes.forEach { productType ->
            val params = QueryPurchasesParams.newBuilder().setProductType(productType).build()
            client.queryPurchasesAsync(params) { result, purchases ->
                onMain {
                    if (generation != queryGeneration) {
                        return@onMain
                    }
                    if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                        collected.addAll(purchases)
                    } else {
                        queryError = result
                    }
                    if (--remaining == 0) {
                        finalizeQueries(generation, snapshotVersion, queryError, collected, emitRestoreFeedback)
                    }
                }
            }
        }
    }

    /** Xác nhận giao dịch PURCHASED; không bao giờ acknowledge giao dịch PENDING. */
    fun acknowledge(purchase: Purchase, callback: (Boolean) -> Unit) {
        if (purchase.isAcknowledged) {
            callback(true)
            return
        }
        val params = AcknowledgePurchaseParams.newBuilder()
            .setPurchaseToken(purchase.purchaseToken)
            .build()
        client.acknowledgePurchase(params) { result ->
            onMain {
                callback(result.responseCode == BillingClient.BillingResponseCode.OK)
            }
        }
    }

    private fun armTimeout(generation: Long, emitRestoreFeedback: Boolean) {
        cancelTimeout()
        val runnable = Runnable {
            if (generation == queryGeneration && state.checking) {
                queryGeneration++
                timeoutRunnable = null
                updateState(
                    state.copy(checking = false, ownershipReady = false, ownershipError = true)
                )
                if (emitRestoreFeedback) {
                    onEvent(
                        BillingEvent.RestoreCompleted(
                            restored = false,
                            message = "Google Play took too long to check purchases. Please try again."
                        )
                    )
                }
            }
        }
        timeoutRunnable = runnable
        mainHandler.postDelayed(runnable, OWNERSHIP_TIMEOUT_MS)
    }

    private fun finalizeQueries(
        generation: Long,
        snapshotVersion: Long,
        queryError: BillingResult?,
        collected: List<Purchase>,
        emitRestoreFeedback: Boolean
    ) {
        if (snapshotVersion != BillingEntitlements.version()) {
            cancelTimeout()
            updateState(state.copy(checking = false, ownershipReady = false))
            if (emitRestoreFeedback) {
                onEvent(BillingEvent.RestoreCompleted(false, "Purchase status changed. Please try again."))
            }
            mainHandler.post { sync(emitRestoreFeedback = false) }
            return
        }

        if (queryError != null) {
            cancelTimeout()
            updateState(state.copy(checking = false, ownershipError = true))
            if (BuildConfig.DEBUG) {
                Log.d(
                    "PlayCatalog",
                    "package=${appContext.packageName} stage=ownership response=${queryError.responseCode}"
                )
            }
            if (emitRestoreFeedback) {
                val msg = queryError.debugMessage.ifBlank {
                    "Unable to restore purchases. Please try again."
                }
                onEvent(BillingEvent.RestoreCompleted(false, msg))
            }
            return
        }

        val hasPending = collected.any {
            it.purchaseState == Purchase.PurchaseState.PENDING && it.products.any(::isSupported)
        }
        if (hasPending && !state.pendingPurchase) {
            onEvent(BillingEvent.PurchasePending)
        }
        updateState(state.copy(pendingPurchase = hasPending))

        val owned = collected
            .filter {
                it.purchaseState == Purchase.PurchaseState.PURCHASED && it.products.any(::isSupported)
            }
            .distinctBy { it.purchaseToken }

        if (owned.isEmpty()) {
            applyVerifiedOwnership(generation, snapshotVersion, owned, ackFailed = false, emitRestoreFeedback)
            return
        }

        var remainingAcks = owned.size
        var ackFailed = false
        owned.forEach { purchase ->
            acknowledge(purchase) { ok ->
                if (!ok) {
                    ackFailed = true
                }
                if (--remainingAcks == 0) {
                    applyVerifiedOwnership(generation, snapshotVersion, owned, ackFailed, emitRestoreFeedback)
                }
            }
        }
    }

    private fun applyVerifiedOwnership(
        generation: Long,
        snapshotVersion: Long,
        owned: List<Purchase>,
        ackFailed: Boolean,
        emitRestoreFeedback: Boolean
    ) {
        if (generation != queryGeneration) {
            return
        }
        cancelTimeout()

        if (ackFailed) {
            updateState(state.copy(checking = false, ownershipReady = false, ownershipError = true))
            if (emitRestoreFeedback) {
                onEvent(
                    BillingEvent.RestoreCompleted(
                        restored = false,
                        message = "Purchase confirmation is pending. Please try restoring again."
                    )
                )
            }
            return
        }

        val hasLifetime = owned.any { purchase -> purchase.products.any(::isLifetime) }
        val hasSub = owned.any { purchase -> purchase.products.any(::isSubscription) }
        val applied = BillingEntitlements.applySnapshot(appContext, snapshotVersion, hasLifetime, hasSub)
        updateState(state.copy(checking = false, ownershipReady = applied))

        if (!applied) {
            if (emitRestoreFeedback) {
                onEvent(BillingEvent.RestoreCompleted(false, "Purchase status changed. Please try again."))
            }
            mainHandler.post { sync(emitRestoreFeedback = false) }
            return
        }

        if (emitRestoreFeedback) {
            val isPremium = BillingEntitlements.isPremium(appContext)
            if (isPremium) {
                GameAnalyticsManager.logRestoreSuccess(owned.first().products.first(::isSupported))
                onEvent(BillingEvent.RestoreCompleted(true, "Premium restored"))
            } else {
                GameAnalyticsManager.logRestoreNotFound()
                val msg = if (state.pendingPurchase) {
                    "Purchase is awaiting Google Play confirmation."
                } else {
                    "No purchase found"
                }
                onEvent(BillingEvent.RestoreCompleted(false, msg))
            }
        }
    }

    private fun updateState(next: SyncState) {
        state = next
        onStateUpdated(next)
    }

    private fun cancelTimeout() {
        timeoutRunnable?.let(mainHandler::removeCallbacks)
        timeoutRunnable = null
    }

    internal fun isSupported(productId: String): Boolean {
        return isLifetime(productId) || isSubscription(productId)
    }

    internal fun isLifetime(productId: String): Boolean {
        return productId == BillingConstants.SKU_REMOVE_ADS ||
            productId == BillingConstants.SKU_REMOVE_ADS_LEGACY
    }

    internal fun isSubscription(productId: String): Boolean {
        return BillingConstants.SUBSCRIPTIONS.any { it.productId == productId }
    }

    private companion object {
        const val OWNERSHIP_TIMEOUT_MS = 20_000L
    }
}
