package com.nextai.gameoffline.ads

import android.content.Context
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.lifecycleScope
import com.nextai.gameoffline.di.appContainer
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

/**
 * Quan sát dòng trạng thái Premium từ [com.nextai.gameoffline.domain.repository.BillingRepository]
 * chỉ khi màn hình đang hiển thị (`onStart` → `onStop`), thay thế việc hardcode nghe
 * `SharedPreferences("nextai_billing_prefs")` trước đây (khắc phục B-11).
 * Observes `BillingRepository.isPremiumFlow` while started instead of raw `SharedPreferences`.
 */
class EntitlementAdObserver(
    context: Context,
    private val onChanged: () -> Unit
) : DefaultLifecycleObserver {

    private val appContext = context.applicationContext
    private var observeJob: Job? = null
    private var previousPremium: Boolean? = null

    override fun onStart(owner: LifecycleOwner) {
        previousPremium = null
        val billingRepository = appContext.appContainer.billingRepository
        billingRepository.refreshCachedEntitlement()
        observeJob?.cancel()
        observeJob = owner.lifecycleScope.launch {
            billingRepository.isPremiumFlow.collect { premium ->
                if (previousPremium == premium) {
                    return@collect
                }
                previousPremium = premium
                AdManager.onEntitlementChanged(appContext)
                onChanged()
            }
        }
    }

    override fun onStop(owner: LifecycleOwner) = stopObserving()

    override fun onDestroy(owner: LifecycleOwner) = stopObserving()

    private fun stopObserving() {
        observeJob?.cancel()
        observeJob = null
        previousPremium = null
    }
}
