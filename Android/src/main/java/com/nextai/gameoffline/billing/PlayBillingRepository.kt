package com.nextai.gameoffline.billing

import android.app.Activity
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.util.Log
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.PendingPurchasesParams
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.nextai.gameoffline.BuildConfig
import com.nextai.gameoffline.analytics.GameAnalyticsManager
import com.nextai.gameoffline.domain.repository.BillingCatalogStatus
import com.nextai.gameoffline.domain.repository.BillingEvent
import com.nextai.gameoffline.domain.repository.BillingOwnershipStatus
import com.nextai.gameoffline.domain.repository.BillingRepository
import com.nextai.gameoffline.domain.repository.BillingSnapshot
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Nguồn chân lý duy nhất quản lý MỘT `BillingClient` toàn ứng dụng (thay thế 2 client song song
 * trước đây giữa `BillingEntitlementMonitor` và `BillingActivity`).
 * Phát trạng thái qua [StateFlow] để Paywall, Settings và Ads đồng bộ tức thời.
 * Single application-wide Google Play Billing repository backed by one shared `BillingClient`.
 */
class PlayBillingRepository(context: Context) : BillingRepository, PurchasesUpdatedListener {

    private val appContext = context.applicationContext
    private val mainHandler = Handler(Looper.getMainLooper())
    private val client: BillingClient = BillingClient.newBuilder(appContext)
        .setListener(this)
        .enablePendingPurchases(
            PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()
        )
        .build()

    private val initialPremium = BillingEntitlements.isPremium(appContext)
    private val _state = MutableStateFlow(BillingSnapshot(isPremium = initialPremium))
    override val state: StateFlow<BillingSnapshot> = _state.asStateFlow()

    private val _isPremiumFlow = MutableStateFlow(initialPremium)
    override val isPremiumFlow: StateFlow<Boolean> = _isPremiumFlow.asStateFlow()

    private val _events = MutableSharedFlow<BillingEvent>(extraBufferCapacity = 16)
    override val events: SharedFlow<BillingEvent> = _events.asSharedFlow()

    private val synchronizer = PlayOwnershipSynchronizer(
        appContext = appContext,
        client = client,
        mainHandler = mainHandler,
        onMain = ::onMain,
        onStateUpdated = { publishState() },
        onEvent = ::emitEvent
    )

    private val catalogFetcher = PlayCatalogFetcher(
        packageName = appContext.packageName,
        client = client,
        onMain = ::onMain
    )

    private var connecting = false
    private var pendingLoadProducts = false
    private var resolvedPlans = emptyList<PlayCatalogMapper.ResolvedPlan>()
    private var catalogStatus = BillingCatalogStatus.LOADING
    private var lastProductQueryMs = 0L
    private var launchProductId: String? = null
    private var purchaseInFlight = false
    private val completedTokens = mutableSetOf<String>()

    override fun refreshCachedEntitlement(): Boolean {
        val active = BillingEntitlements.isPremium(appContext)
        _isPremiumFlow.value = active
        if (_state.value.isPremium != active) {
            publishState()
        }
        return active
    }

    override fun refresh(loadProducts: Boolean) = onMain {
        if (loadProducts) {
            pendingLoadProducts = true
        }
        if (connecting) {
            return@onMain
        }
        if (client.isReady) {
            if (pendingLoadProducts) {
                pendingLoadProducts = false
                queryProducts()
            }
            synchronizer.sync(emitRestoreFeedback = false)
            return@onMain
        }

        connecting = true
        synchronizer.updateFromPurchaseFlow(ownershipReady = false, ownershipError = false)
        if (pendingLoadProducts && resolvedPlans.isEmpty()) {
            catalogStatus = BillingCatalogStatus.LOADING
        }
        publishState()

        client.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) = onMain {
                connecting = false
                if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                    val shouldLoadCatalog = pendingLoadProducts
                    pendingLoadProducts = false
                    if (shouldLoadCatalog) {
                        queryProducts()
                    }
                    synchronizer.sync(emitRestoreFeedback = false)
                } else {
                    handleSetupFailure(result)
                }
            }

            override fun onBillingServiceDisconnected() = onMain {
                connecting = false
                catalogFetcher.invalidatePendingQueries()
                if (resolvedPlans.isEmpty()) {
                    catalogStatus = BillingCatalogStatus.SERVICE_ERROR
                }
                synchronizer.onDisconnected()
            }
        })
    }

    override fun launchPurchase(activity: Activity, productId: String) = onMain {
        val syncState = synchronizer.currentState()
        if (activity.isFinishing || activity.isDestroyed || purchaseInFlight || syncState.pendingPurchase) {
            return@onMain
        }
        if (!syncState.ownershipReady || syncState.checking || !client.isReady) {
            emitPurchaseFailed("Please wait for Google Play to check your purchases, then try again.")
            refresh(loadProducts = true)
            return@onMain
        }
        if (refreshCachedEntitlement()) {
            emitPurchaseFailed("Premium is already active. Manage your existing plan in Google Play.")
            return@onMain
        }

        val plan = resolvedPlans.firstOrNull { it.model.productId == productId }
        val isCatalogStale = SystemClock.elapsedRealtime() - lastProductQueryMs > CATALOG_TTL_MS
        if (plan == null || isCatalogStale) {
            emitPurchaseFailed("Refreshing Google Play prices. Review the updated offer and tap again.")
            queryProducts()
            return@onMain
        }

        val productParams = BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(plan.details)
            .setOfferToken(plan.model.offerToken)
            .build()
        val flowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(listOf(productParams))
            .build()

        launchProductId = productId
        purchaseInFlight = true
        publishState()
        GameAnalyticsManager.logPurchaseInitiated(productId, plan.model.formattedPrice)

        val result = client.launchBillingFlow(activity, flowParams)
        if (result.responseCode != BillingClient.BillingResponseCode.OK) {
            purchaseInFlight = false
            launchProductId = null
            GameAnalyticsManager.logPurchaseFailed(productId, result.responseCode, result.debugMessage)
            emitEvent(
                BillingEvent.PurchaseFailed(
                    result.debugMessage.ifBlank { "Google Play could not open this offer." }
                )
            )
            if (result.responseCode == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
                synchronizer.sync(emitRestoreFeedback = false)
            } else {
                publishState()
            }
        }
    }

    override fun restorePurchases() = onMain {
        GameAnalyticsManager.logRestoreInitiated()
        if (!client.isReady) {
            refresh(loadProducts = pendingLoadProducts)
            emitEvent(
                BillingEvent.RestoreCompleted(
                    restored = false,
                    message = "Connecting to Google Play. Please try again shortly."
                )
            )
        } else {
            synchronizer.sync(emitRestoreFeedback = true)
        }
    }

    override fun onPurchasesUpdated(result: BillingResult, purchases: List<Purchase>?) = onMain {
        purchaseInFlight = false
        if (result.responseCode != BillingClient.BillingResponseCode.OK || purchases == null) {
            handlePurchaseUpdateError(result)
            return@onMain
        }

        val relevant = purchases.filter { p -> p.products.any(synchronizer::isSupported) }
        if (relevant.isNotEmpty()) {
            BillingEntitlements.invalidatePendingQueries()
        }

        val hasPending = relevant.any { it.purchaseState == Purchase.PurchaseState.PENDING }
        synchronizer.updateFromPurchaseFlow(pendingPurchase = hasPending)
        if (hasPending) {
            emitEvent(BillingEvent.PurchasePending)
        }

        val purchased = relevant.filter { it.purchaseState == Purchase.PurchaseState.PURCHASED }
        var remainingAcks = purchased.size
        purchaseInFlight = remainingAcks > 0
        publishState()

        purchased.forEach { purchase ->
            synchronizer.acknowledge(purchase) { acknowledged ->
                if (acknowledged) {
                    val isSub = purchase.products.any(synchronizer::isSubscription)
                    BillingEntitlements.recordPurchase(appContext, isSub)
                    if (launchProductId in purchase.products && completedTokens.add(purchase.purchaseToken)) {
                        GameAnalyticsManager.logPurchaseSuccess(
                            purchase.products.first(synchronizer::isSupported)
                        )
                        launchProductId = null
                        emitEvent(BillingEvent.PurchaseSucceeded)
                    }
                } else {
                    synchronizer.updateFromPurchaseFlow(ownershipReady = false, ownershipError = true)
                    emitEvent(
                        BillingEvent.PurchaseFailed(
                            "Purchase received but confirmation is pending. Please restore shortly."
                        )
                    )
                }
                if (--remainingAcks == 0) {
                    purchaseInFlight = false
                }
                publishState()
            }
        }
    }

    private fun handleSetupFailure(result: BillingResult) {
        resolvedPlans = emptyList()
        if (pendingLoadProducts) {
            pendingLoadProducts = false
            catalogStatus = BillingCatalogStatus.SERVICE_ERROR
            if (BuildConfig.DEBUG) {
                Log.d("PlayCatalog", "package=${appContext.packageName} stage=setup response=${result.responseCode}")
            }
        }
        synchronizer.updateFromPurchaseFlow(ownershipReady = false, ownershipError = true)
        emitEvent(
            BillingEvent.PurchaseFailed(
                result.debugMessage.ifBlank { "Google Play Billing is unavailable." }
            )
        )
    }

    private fun queryProducts() {
        catalogStatus = BillingCatalogStatus.LOADING
        publishState()
        catalogFetcher.fetch { result ->
            resolvedPlans = result.plans
            catalogStatus = result.status
            lastProductQueryMs = result.fetchedAtMs
            publishState()
        }
    }

    private fun handlePurchaseUpdateError(result: BillingResult) {
        val productId = launchProductId ?: return
        launchProductId = null
        if (result.responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
            GameAnalyticsManager.logPurchaseCanceled(productId)
            emitEvent(BillingEvent.PurchaseFailed("Purchase canceled"))
        } else {
            GameAnalyticsManager.logPurchaseFailed(productId, result.responseCode, result.debugMessage)
            emitEvent(
                BillingEvent.PurchaseFailed(
                    result.debugMessage.ifBlank { "Google Play could not complete the purchase." }
                )
            )
        }
        publishState()
    }

    private fun publishState() {
        val syncState = synchronizer.currentState()
        val ownershipStatus = when {
            syncState.ownershipError -> BillingOwnershipStatus.ERROR
            connecting || syncState.checking || purchaseInFlight -> BillingOwnershipStatus.LOADING
            syncState.pendingPurchase -> BillingOwnershipStatus.PENDING
            syncState.ownershipReady && client.isReady -> BillingOwnershipStatus.READY
            else -> BillingOwnershipStatus.ERROR
        }
        val isPremium = BillingEntitlements.isPremium(appContext)
        _isPremiumFlow.value = isPremium
        _state.value = BillingSnapshot(
            plans = resolvedPlans.map { it.model },
            catalogStatus = catalogStatus,
            ownershipStatus = ownershipStatus,
            isPremium = isPremium,
            isOwnershipReady = ownershipStatus == BillingOwnershipStatus.READY,
            isPurchaseInFlight = purchaseInFlight,
            isPendingPurchase = syncState.pendingPurchase
        )
    }

    private fun emitPurchaseFailed(message: String) {
        emitEvent(BillingEvent.PurchaseFailed(message))
    }

    private fun emitEvent(event: BillingEvent) {
        _events.tryEmit(event)
    }

    private fun onMain(action: () -> Unit) {
        if (Looper.myLooper() == Looper.getMainLooper()) {
            action()
        } else {
            mainHandler.post(action)
        }
    }

    private companion object {
        const val CATALOG_TTL_MS = 300_000L
    }
}
