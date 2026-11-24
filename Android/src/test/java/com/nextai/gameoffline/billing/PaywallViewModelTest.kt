package com.nextai.gameoffline.billing

import android.app.Activity
import com.nextai.gameoffline.domain.repository.BillingCatalogStatus
import com.nextai.gameoffline.domain.repository.BillingEvent
import com.nextai.gameoffline.domain.repository.BillingOwnershipStatus
import com.nextai.gameoffline.domain.repository.BillingPlanModel
import com.nextai.gameoffline.domain.repository.BillingRepository
import com.nextai.gameoffline.domain.repository.BillingSnapshot
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Unit Test JVM cho [PaywallViewModel] dùng [FakeBillingRepository] (không cần Android runtime).
 * Pure JVM unit tests for [PaywallViewModel] verifying plan selection, CTA states, and effects.
 */
class PaywallViewModelTest {

    private class FakeBillingRepository(initial: BillingSnapshot = BillingSnapshot()) : BillingRepository {
        val stateFlow = MutableStateFlow(initial)
        val premiumFlow = MutableStateFlow(initial.isPremium)
        val eventFlow = MutableSharedFlow<BillingEvent>(extraBufferCapacity = 16)
        var refreshCalls = 0
        var restoreCalls = 0

        override val state: StateFlow<BillingSnapshot> = stateFlow.asStateFlow()
        override val isPremiumFlow: StateFlow<Boolean> = premiumFlow.asStateFlow()
        override val events: SharedFlow<BillingEvent> = eventFlow.asSharedFlow()

        override fun refresh(loadProducts: Boolean) {
            refreshCalls++
        }

        override fun refreshCachedEntitlement(): Boolean = premiumFlow.value

        override fun launchPurchase(activity: Activity, productId: String) = Unit

        override fun restorePurchases() {
            restoreCalls++
        }
    }

    private fun samplePlans(): List<BillingPlanModel> {
        return listOf(
            BillingPlanModel("game_premium", "weekly", "$9.99", "P1W", "P3D", "tok_w"),
            BillingPlanModel("game_premium_monthly", "monthly", "$29.99", "P1M", "P5D", "tok_m"),
            BillingPlanModel("game_premium_yearly", "yearly", "$99.99", "P1Y", null, "tok_y")
        )
    }

    @Test
    fun selectsMonthlyByDefaultAndUpdatesCtaWhenSelectingNonTrialPlan() {
        val repo = FakeBillingRepository(
            BillingSnapshot(
                plans = samplePlans(),
                catalogStatus = BillingCatalogStatus.READY,
                ownershipStatus = BillingOwnershipStatus.READY,
                isOwnershipReady = true
            )
        )
        val scope = CoroutineScope(SupervisorJob() + Dispatchers.Unconfined)
        val viewModel = PaywallViewModel(repo, injectedScope = scope)

        assertEquals("game_premium_monthly", viewModel.uiState.value.selectedProductId)
        assertEquals(PaywallCtaKind.TRIAL, viewModel.uiState.value.ctaKind)
        assertTrue(viewModel.uiState.value.ctaEnabled)

        viewModel.selectPlan("game_premium_yearly")
        assertEquals("game_premium_yearly", viewModel.uiState.value.selectedProductId)
        assertEquals(PaywallCtaKind.CONTINUE, viewModel.uiState.value.ctaKind)
    }

    @Test
    fun disablesCtaAndShowsRetryWhenOwnershipVerificationFails() {
        val repo = FakeBillingRepository(
            BillingSnapshot(
                plans = samplePlans(),
                catalogStatus = BillingCatalogStatus.READY,
                ownershipStatus = BillingOwnershipStatus.ERROR,
                isOwnershipReady = false
            )
        )
        val scope = CoroutineScope(SupervisorJob() + Dispatchers.Unconfined)
        val viewModel = PaywallViewModel(repo, injectedScope = scope)

        assertFalse(viewModel.uiState.value.ctaEnabled)
        assertTrue(viewModel.uiState.value.showRetryOwnership)
        assertEquals(PaywallStatusKind.OWNERSHIP_ERROR, viewModel.uiState.value.statusKind)
        assertEquals(PaywallCtaKind.UNVERIFIED, viewModel.uiState.value.ctaKind)

        viewModel.onRetryClicked()
        assertEquals(1, repo.refreshCalls)
    }

    @Test
    fun emitsLaunchPurchaseCloseSuccessAndRestoreEffects() {
        val repo = FakeBillingRepository(
            BillingSnapshot(
                plans = samplePlans(),
                catalogStatus = BillingCatalogStatus.READY,
                ownershipStatus = BillingOwnershipStatus.READY,
                isOwnershipReady = true
            )
        )
        val scope = CoroutineScope(SupervisorJob() + Dispatchers.Unconfined)
        val viewModel = PaywallViewModel(repo, injectedScope = scope)
        val capturedEffects = mutableListOf<PaywallEffect>()
        scope.launch {
            viewModel.effects.collect { capturedEffects.add(it) }
        }

        // Bấm CTA chính phải phát LaunchPlayPurchase cho gói monthly đang chọn và tạm khóa nút.
        // Clicking primary CTA launches monthly plan purchase and temporarily disables CTA.
        viewModel.onPrimaryActionClicked()
        assertEquals(
            listOf<PaywallEffect>(PaywallEffect.LaunchPlayPurchase("game_premium_monthly")),
            capturedEffects
        )
        assertFalse(viewModel.uiState.value.ctaEnabled)

        // Khi Play trả PurchaseSucceeded phải phát CloseWithSuccess.
        // Repository PurchaseSucceeded event triggers CloseWithSuccess effect.
        repo.eventFlow.tryEmit(BillingEvent.PurchaseSucceeded)
        assertEquals(PaywallEffect.CloseWithSuccess, capturedEffects.last())

        // Khi đã Premium, bấm CTA chính phải phát OpenSubscriptionManagement.
        // When user is already Premium, primary CTA opens subscription management.
        repo.stateFlow.value = repo.stateFlow.value.copy(isPremium = true)
        assertEquals(PaywallCtaKind.MANAGE, viewModel.uiState.value.ctaKind)
        viewModel.onPrimaryActionClicked()
        assertEquals(PaywallEffect.OpenSubscriptionManagement, capturedEffects.last())

        // Khôi phục mua hàng phát sự kiện phản hồi tương ứng.
        // Restore action delegates to repository and forwards completion message.
        viewModel.onRestoreClicked()
        assertEquals(1, repo.restoreCalls)
        repo.eventFlow.tryEmit(BillingEvent.RestoreCompleted(restored = true, message = "Premium restored"))
        assertEquals(
            PaywallEffect.ShowFeedbackMessage(message = "Premium restored", isRestoreSuccess = true),
            capturedEffects.last()
        )
        scope.cancel()
    }
}
