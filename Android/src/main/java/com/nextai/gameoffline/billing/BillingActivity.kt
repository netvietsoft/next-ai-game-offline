package com.nextai.gameoffline.billing

import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.res.Configuration
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.nextai.gameoffline.R
import com.nextai.gameoffline.analytics.GameAnalyticsManager
import com.nextai.gameoffline.di.appContainer
import com.nextai.gameoffline.domain.repository.BillingPlanModel
import com.nextai.gameoffline.presentation.settings.LegalPolicyHelper
import kotlinx.coroutines.launch

/**
 * Màn hình Paywall mỏng (Clean MVVM): chỉ render [PaywallUiState] và chuyển sự kiện người dùng
 * sang [PaywallViewModel] gắn với [com.nextai.gameoffline.domain.repository.BillingRepository] duy nhất.
 * Thin MVVM Paywall Activity rendering [PaywallUiState] from [PaywallViewModel].
 */
class BillingActivity : AppCompatActivity() {

    private lateinit var viewModel: PaywallViewModel
    private lateinit var adFreePassController: AdFreePassUiController
    private var footerInScroll = false
    private var renderedPlanIds: List<String> = emptyList()
    private val planViews = linkedMapOf<String, View>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_billing)

        viewModel = ViewModelProvider(
            this,
            appContainer.paywallViewModelFactory()
        )[PaywallViewModel::class.java]
        viewModel.restoreSelectedProduct(savedInstanceState?.getString(SELECTED_PLAN_KEY))

        val source = intent.getStringExtra("source") ?: "launcher"
        GameAnalyticsManager.logPaywallViewed(source)

        adFreePassController = AdFreePassUiController(this).apply {
            bindPaywallCard(
                findViewById(R.id.cardAdFreePass),
                findViewById(R.id.tvPaywallAdFreeStatus)
            )
        }
        adaptFooterForAccessibility()
        setupInsets()
        bindButtons()
        observeViewModel()
    }

    private fun bindButtons() {
        findViewById<ImageButton>(R.id.btnClose).setOnClickListener { finish() }
        findViewById<TextView>(R.id.tvPaywallPrivacy).setOnClickListener {
            LegalPolicyHelper.showPrivacyPolicyDialog(this)
        }
        findViewById<TextView>(R.id.tvPaywallTerms).setOnClickListener {
            LegalPolicyHelper.showTermsOfServiceDialog(this)
        }
        findViewById<TextView>(R.id.btnRetryOwnership).setOnClickListener {
            viewModel.onRetryClicked()
        }
        findViewById<Button>(R.id.btnContinueSubscription).setOnClickListener {
            viewModel.onPrimaryActionClicked()
        }
    }

    private fun observeViewModel() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch {
                    viewModel.uiState.collect(::renderUiState)
                }
                launch {
                    viewModel.effects.collect(::handleEffect)
                }
            }
        }
    }

    private fun handleEffect(effect: PaywallEffect) {
        if (isFinishing || isDestroyed) {
            return
        }
        when (effect) {
            PaywallEffect.CloseWithSuccess -> {
                showMessage(getString(R.string.paywall_active_confirmation))
                finish()
            }
            PaywallEffect.OpenSubscriptionManagement -> openManagement()
            is PaywallEffect.LaunchPlayPurchase -> {
                appContainer.billingRepository.launchPurchase(this, effect.productId)
            }
            is PaywallEffect.ShowFeedbackMessage -> {
                val text = if (effect.isRestoreSuccess) {
                    getString(R.string.paywall_restore_success)
                } else {
                    effect.message
                }
                showMessage(text)
            }
        }
    }

    private fun renderUiState(state: PaywallUiState) {
        val incomingIds = state.plans.map { it.productId }
        if (incomingIds != renderedPlanIds) {
            renderedPlanIds = incomingIds
            renderPlanRows(state.plans)
        }

        findViewById<View>(R.id.subscriptionPlans).visibility =
            if (state.showPlans) View.VISIBLE else View.GONE
        findViewById<View>(R.id.planSectionTitle).visibility =
            if (state.showPlans) View.VISIBLE else View.GONE

        planViews.forEach { (productId, row) ->
            val chosen = productId == state.selectedProductId
            row.isSelected = chosen
            row.findViewById<View>(R.id.planRadio).isSelected = chosen
            row.isEnabled = state.isSelectionInteractive
            val stateDesc = getString(
                if (chosen) {
                    R.string.paywall_subscription_selected
                } else {
                    R.string.paywall_subscription_unselected
                }
            )
            ViewCompat.setStateDescription(row, stateDesc)
        }

        bindStatusPanel(state)
        bindPrimaryCta(state)
        if (::adFreePassController.isInitialized) {
            adFreePassController.updatePaidPremiumStatus(state.isPremium)
        }
    }

    private fun renderPlanRows(plans: List<BillingPlanModel>) {
        val container = findViewById<LinearLayout>(R.id.subscriptionPlans)
        container.removeAllViews()
        planViews.clear()

        plans.forEach { plan ->
            val row = layoutInflater.inflate(R.layout.item_subscription_plan, container, false)
            val period = requireNotNull(SubscriptionOfferPolicy.periodLabel(plan.recurringPeriodIso))
            val title = planTitle(plan.basePlanId)
            val trial = plan.trialPeriodIso?.let(SubscriptionOfferPolicy::periodLabel)

            row.findViewById<TextView>(R.id.planName).text = title
            // Giữ nguyên chuỗi giá bản địa hóa từ Google Play, không tách hoặc đổi tiền tệ.
            // Preserve Play's exact localized formatted price without splitting or converting.
            row.findViewById<TextView>(R.id.planPrice).text = plan.formattedPrice
            PaywallAccessibilityHelper.adaptPriceLayout(this, row, plan.formattedPrice)
            row.findViewById<TextView>(R.id.planPeriod).text =
                getString(R.string.paywall_price_period, period)
            row.findViewById<TextView>(R.id.planTrial).text =
                trial?.let { getString(R.string.paywall_trial_days, it) }
                    ?: getString(R.string.paywall_billed_period, period)

            val baseA11y = getString(
                R.string.paywall_plan_accessibility,
                title,
                plan.formattedPrice,
                period
            )
            val trialSuffix = trial?.let { " " + getString(R.string.paywall_trial_days, it) }.orEmpty()
            row.contentDescription = baseA11y + trialSuffix
            row.setOnClickListener { viewModel.selectPlan(plan.productId) }

            planViews[plan.productId] = row
            container.addView(row)
        }
    }

    private fun bindStatusPanel(state: PaywallUiState) {
        findViewById<View>(R.id.billingStatePanel).visibility =
            if (state.showStatePanel) View.VISIBLE else View.GONE
        findViewById<View>(R.id.billingProgress).visibility =
            if (state.showProgress) View.VISIBLE else View.GONE
        findViewById<View>(R.id.btnRetryOwnership).visibility =
            if (state.showRetryOwnership) View.VISIBLE else View.GONE

        val (titleRes, bodyRes) = when (state.statusKind) {
            PaywallStatusKind.ACTIVE -> R.string.paywall_active_title to R.string.paywall_active_body
            PaywallStatusKind.PENDING -> R.string.paywall_pending_title to R.string.paywall_pending_body
            PaywallStatusKind.OWNERSHIP_ERROR ->
                R.string.paywall_ownership_error_title to R.string.paywall_ownership_error_body
            PaywallStatusKind.LOADING -> R.string.paywall_loading_title to R.string.paywall_loading_body
            PaywallStatusKind.CONNECTION_ERROR ->
                R.string.paywall_connection_title to R.string.paywall_connection_body
            PaywallStatusKind.UNAVAILABLE ->
                R.string.paywall_unavailable_title to R.string.paywall_unavailable_body
        }
        findViewById<TextView>(R.id.billingStateTitle).setText(titleRes)
        findViewById<TextView>(R.id.tvBillingStatus).setText(bodyRes)
    }

    private fun bindPrimaryCta(state: PaywallUiState) {
        val selected = state.selectedPlan
        findViewById<TextView>(R.id.selectedOfferTerms).text = when {
            state.isPremium -> getString(R.string.paywall_active_body)
            state.isPendingPurchase -> getString(R.string.paywall_pending_body)
            selected != null -> renewalText(selected)
            else -> getString(R.string.paywall_account_pricing)
        }

        val ctaTextRes = when (state.ctaKind) {
            PaywallCtaKind.MANAGE -> R.string.paywall_cta_manage
            PaywallCtaKind.PENDING -> R.string.paywall_cta_pending
            PaywallCtaKind.CHECKING -> R.string.paywall_cta_checking
            PaywallCtaKind.UNVERIFIED -> R.string.paywall_cta_unverified
            PaywallCtaKind.TRIAL -> R.string.paywall_cta_trial
            PaywallCtaKind.CONTINUE -> R.string.paywall_cta_continue
            PaywallCtaKind.LOADING -> R.string.paywall_cta_loading
            PaywallCtaKind.RETRY -> R.string.paywall_cta_retry
        }
        findViewById<Button>(R.id.btnContinueSubscription).apply {
            isEnabled = state.ctaEnabled
            setText(ctaTextRes)
        }
    }

    private fun renewalText(plan: BillingPlanModel): String {
        val period = requireNotNull(SubscriptionOfferPolicy.periodLabel(plan.recurringPeriodIso))
        val trial = plan.trialPeriodIso?.let(SubscriptionOfferPolicy::periodLabel)
        return if (trial != null) {
            getString(R.string.paywall_renewal_after_trial, trial, plan.formattedPrice, period)
        } else {
            getString(R.string.paywall_renewal_regular, plan.formattedPrice, period)
        }
    }

    private fun planTitle(basePlanId: String): String {
        val resId = when (basePlanId) {
            "weekly" -> R.string.paywall_weekly
            "monthly" -> R.string.paywall_monthly
            else -> R.string.paywall_yearly
        }
        return getString(resId)
    }

    private fun adaptFooterForAccessibility() {
        footerInScroll = PaywallAccessibilityHelper.moveFooterIntoScrollIfNeeded(this, footerInScroll)
    }

    private fun openManagement() {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(PLAY_SUBSCRIPTIONS_URL)))
        } catch (_: ActivityNotFoundException) {
            showMessage(getString(R.string.paywall_cannot_open_play))
        }
    }

    private fun setupInsets() {
        val root = findViewById<View>(R.id.rootBillingLayout)
        ViewCompat.setOnApplyWindowInsetsListener(root) { _, insets ->
            val mask = WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()
            val bars = insets.getInsets(mask)
            val dp24 = PaywallAccessibilityHelper.dp(this, 24)
            findViewById<View>(R.id.topBar)
                .setPadding(dp24, bars.top, PaywallAccessibilityHelper.dp(this, 10), 0)
            val footerH = if (footerInScroll) 0 else dp24
            findViewById<View>(R.id.purchaseFooter).setPadding(
                footerH,
                PaywallAccessibilityHelper.dp(this, 14),
                footerH,
                bars.bottom + PaywallAccessibilityHelper.dp(this, 8)
            )
            insets
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        outState.putString(SELECTED_PLAN_KEY, viewModel.uiState.value.selectedProductId)
        super.onSaveInstanceState(outState)
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        adaptFooterForAccessibility()
        renderedPlanIds = emptyList()
        renderUiState(viewModel.uiState.value)
        ViewCompat.requestApplyInsets(findViewById(R.id.rootBillingLayout))
    }

    override fun onResume() {
        super.onResume()
        viewModel.onScreenResumed()
        if (::adFreePassController.isInitialized) {
            adFreePassController.onResume()
        }
    }

    override fun onPause() {
        if (::adFreePassController.isInitialized) {
            adFreePassController.onPause()
        }
        super.onPause()
    }

    override fun onDestroy() {
        if (::adFreePassController.isInitialized) {
            adFreePassController.onDestroy()
        }
        super.onDestroy()
    }

    private fun showMessage(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }

    private companion object {
        const val SELECTED_PLAN_KEY = "selected_subscription_product"
        const val PLAY_SUBSCRIPTIONS_URL =
            "https://play.google.com/store/account/subscriptions?package=com.nextai.game.offline"
    }
}
