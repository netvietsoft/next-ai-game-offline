package com.nextai.gameoffline.billing

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.nextai.gameoffline.domain.repository.BillingCatalogStatus
import com.nextai.gameoffline.domain.repository.BillingEvent
import com.nextai.gameoffline.domain.repository.BillingOwnershipStatus
import com.nextai.gameoffline.domain.repository.BillingPlanModel
import com.nextai.gameoffline.domain.repository.BillingRepository
import com.nextai.gameoffline.domain.repository.BillingSnapshot
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/** Loại bảng trạng thái hiển thị trên Paywall / Paywall status panel mode. */
enum class PaywallStatusKind {
    ACTIVE,
    PENDING,
    OWNERSHIP_ERROR,
    LOADING,
    CONNECTION_ERROR,
    UNAVAILABLE
}

/** Loại nhãn nút CTA chính trên Paywall / Primary CTA button label mode. */
enum class PaywallCtaKind {
    MANAGE,
    PENDING,
    CHECKING,
    UNVERIFIED,
    TRIAL,
    CONTINUE,
    LOADING,
    RETRY
}

/**
 * Trạng thái UI bất biến của màn hình Paywall, tính toán hoàn toàn trong [PaywallViewModel].
 * Immutable UI state rendered by [BillingActivity].
 */
data class PaywallUiState(
    val plans: List<BillingPlanModel> = emptyList(),
    val selectedProductId: String? = null,
    val isPremium: Boolean = false,
    val isPendingPurchase: Boolean = false,
    val isSelectionInteractive: Boolean = true,
    val showPlans: Boolean = false,
    val showStatePanel: Boolean = true,
    val showProgress: Boolean = true,
    val showRetryOwnership: Boolean = false,
    val statusKind: PaywallStatusKind = PaywallStatusKind.LOADING,
    val ctaEnabled: Boolean = false,
    val ctaKind: PaywallCtaKind = PaywallCtaKind.LOADING
) {
    val selectedPlan: BillingPlanModel?
        get() = plans.firstOrNull { it.productId == selectedProductId }
}

/** Hành động một lần từ [PaywallViewModel] gửi tới [BillingActivity]. */
sealed interface PaywallEffect {
    data object CloseWithSuccess : PaywallEffect
    data object OpenSubscriptionManagement : PaywallEffect
    data class LaunchPlayPurchase(val productId: String) : PaywallEffect
    data class ShowFeedbackMessage(val message: String, val isRestoreSuccess: Boolean = false) : PaywallEffect
}

/**
 * ViewModel quản lý toàn bộ trạng thái chọn gói, CTA và sự kiện Paywall dựa trên [BillingRepository].
 * Không giữ tham chiếu Activity hay Google Play SDK classes nên unit-test được 100% trên JVM.
 * JVM-testable ViewModel owning Paywall selection, CTA rules, and one-shot billing effects.
 */
class PaywallViewModel(
    private val billingRepository: BillingRepository,
    injectedScope: CoroutineScope? = null
) : ViewModel() {

    private val scope: CoroutineScope = injectedScope ?: viewModelScope
    private var selectedProductId: String? = null
    private var purchaseRequested = false

    private val _uiState = MutableStateFlow(buildUiState(billingRepository.state.value))
    val uiState: StateFlow<PaywallUiState> = _uiState.asStateFlow()

    private val _effects = MutableSharedFlow<PaywallEffect>(extraBufferCapacity = 16)
    val effects: SharedFlow<PaywallEffect> = _effects.asSharedFlow()

    init {
        scope.launch {
            billingRepository.state.collect { snapshot ->
                reconcileSelection(snapshot.plans)
                val isTerminal = snapshot.ownershipStatus == BillingOwnershipStatus.READY ||
                    snapshot.ownershipStatus == BillingOwnershipStatus.ERROR ||
                    snapshot.isPendingPurchase
                if (isTerminal) {
                    purchaseRequested = false
                }
                _uiState.value = buildUiState(snapshot)
            }
        }
        scope.launch {
            billingRepository.events.collect { event ->
                handleBillingEvent(event)
            }
        }
    }

    /** Khôi phục gói đang chọn sau khi xoay màn hình / Restore saved plan selection. */
    fun restoreSelectedProduct(productId: String?) {
        if (!productId.isNullOrBlank()) {
            selectedProductId = productId
            _uiState.value = buildUiState(billingRepository.state.value)
        }
    }

    /** Gọi khi màn hình Paywall hiển thị để tải bảng giá và đồng bộ quyền sở hữu. */
    fun onScreenResumed() {
        billingRepository.refresh(loadProducts = true)
    }

    /** Người dùng chọn một dòng gói đăng ký / Handle user tapping a subscription plan row. */
    fun selectPlan(productId: String) {
        val current = _uiState.value
        if (!current.isSelectionInteractive) {
            return
        }
        selectedProductId = productId
        _uiState.value = buildUiState(billingRepository.state.value)
    }

    /** Xử lý bấm nút CTA chính duy nhất / Handle primary CTA click. */
    fun onPrimaryActionClicked() {
        val snapshot = billingRepository.state.value
        val selected = _uiState.value.selectedPlan
        when {
            snapshot.isPremium -> _effects.tryEmit(PaywallEffect.OpenSubscriptionManagement)
            snapshot.plans.isEmpty() -> billingRepository.refresh(loadProducts = true)
            !snapshot.isOwnershipReady || snapshot.isPendingPurchase || purchaseRequested -> Unit
            selected != null -> {
                purchaseRequested = true
                _uiState.value = buildUiState(snapshot)
                _effects.tryEmit(PaywallEffect.LaunchPlayPurchase(selected.productId))
            }
        }
    }

    /** Bắt đầu khôi phục gói mua cũ và subscription / Trigger explicit purchase restoration. */
    fun onRestoreClicked() {
        billingRepository.restorePurchases()
    }

    /** Thử đồng bộ lại Google Play khi có lỗi kết nối hoặc kiểm tra quyền. */
    fun onRetryClicked() {
        billingRepository.refresh(loadProducts = true)
    }

    private fun handleBillingEvent(event: BillingEvent) {
        when (event) {
            BillingEvent.PurchaseSucceeded -> {
                purchaseRequested = false
                _effects.tryEmit(PaywallEffect.CloseWithSuccess)
            }
            is BillingEvent.PurchaseFailed -> {
                purchaseRequested = false
                if (billingRepository.state.value.plans.isNotEmpty()) {
                    _effects.tryEmit(PaywallEffect.ShowFeedbackMessage(event.message))
                }
                _uiState.value = buildUiState(billingRepository.state.value)
            }
            BillingEvent.PurchasePending -> {
                purchaseRequested = false
                _uiState.value = buildUiState(billingRepository.state.value)
            }
            is BillingEvent.RestoreCompleted -> {
                _effects.tryEmit(
                    PaywallEffect.ShowFeedbackMessage(
                        message = event.message,
                        isRestoreSuccess = event.restored
                    )
                )
            }
        }
    }

    private fun reconcileSelection(plans: List<BillingPlanModel>) {
        if (plans.any { it.productId == selectedProductId }) {
            return
        }
        selectedProductId = plans.firstOrNull { it.basePlanId == "monthly" }?.productId
            ?: plans.firstOrNull()?.productId
    }

    private fun buildUiState(snapshot: BillingSnapshot): PaywallUiState {
        val plans = snapshot.plans
        val selected = plans.firstOrNull { it.productId == selectedProductId }
        val loadingCatalog = snapshot.catalogStatus == BillingCatalogStatus.LOADING
        val ownershipError = snapshot.ownershipStatus == BillingOwnershipStatus.ERROR && plans.isNotEmpty()
        val showPlans = plans.isNotEmpty() && !snapshot.isPremium && !snapshot.isPendingPurchase
        val showStatePanel = snapshot.isPremium || snapshot.isPendingPurchase || plans.isEmpty() || ownershipError
        val showProgress = showStatePanel && loadingCatalog &&
            !snapshot.isPremium && !snapshot.isPendingPurchase && !ownershipError

        val statusKind = when {
            snapshot.isPremium -> PaywallStatusKind.ACTIVE
            snapshot.isPendingPurchase -> PaywallStatusKind.PENDING
            ownershipError -> PaywallStatusKind.OWNERSHIP_ERROR
            loadingCatalog -> PaywallStatusKind.LOADING
            snapshot.catalogStatus == BillingCatalogStatus.SERVICE_ERROR -> PaywallStatusKind.CONNECTION_ERROR
            else -> PaywallStatusKind.UNAVAILABLE
        }

        val ctaEnabled = when {
            snapshot.isPremium -> true
            snapshot.isPendingPurchase || purchaseRequested || snapshot.isPurchaseInFlight -> false
            selected != null -> snapshot.isOwnershipReady
            else -> !loadingCatalog
        }

        val ctaKind = when {
            snapshot.isPremium -> PaywallCtaKind.MANAGE
            snapshot.isPendingPurchase -> PaywallCtaKind.PENDING
            purchaseRequested || snapshot.isPurchaseInFlight -> PaywallCtaKind.CHECKING
            selected != null && ownershipError -> PaywallCtaKind.UNVERIFIED
            selected != null && !snapshot.isOwnershipReady -> PaywallCtaKind.CHECKING
            selected != null && selected.trialPeriodIso != null -> PaywallCtaKind.TRIAL
            selected != null -> PaywallCtaKind.CONTINUE
            loadingCatalog -> PaywallCtaKind.LOADING
            else -> PaywallCtaKind.RETRY
        }

        return PaywallUiState(
            plans = plans,
            selectedProductId = selected?.productId ?: selectedProductId,
            isPremium = snapshot.isPremium,
            isPendingPurchase = snapshot.isPendingPurchase,
            isSelectionInteractive = !snapshot.isPremium && !snapshot.isPendingPurchase && !purchaseRequested,
            showPlans = showPlans,
            showStatePanel = showStatePanel,
            showProgress = showProgress,
            showRetryOwnership = ownershipError && !snapshot.isPremium && !snapshot.isPendingPurchase,
            statusKind = statusKind,
            ctaEnabled = ctaEnabled,
            ctaKind = ctaKind
        )
    }
}
