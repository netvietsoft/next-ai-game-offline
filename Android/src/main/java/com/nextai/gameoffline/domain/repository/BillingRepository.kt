package com.nextai.gameoffline.domain.repository

import android.app.Activity
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow

/** Trạng thái tải bảng giá Subscription từ Google Play / Play price catalog loading status. */
enum class BillingCatalogStatus {
    LOADING,
    READY,
    UNAVAILABLE,
    SERVICE_ERROR
}

/** Trạng thái đồng bộ quyền sở hữu từ Google Play / Play ownership synchronization status. */
enum class BillingOwnershipStatus {
    LOADING,
    READY,
    PENDING,
    ERROR
}

/**
 * Mô hình gói đăng ký thuần tầng domain (không phụ thuộc trực tiếp vào `ProductDetails` của Play),
 * giúp [com.nextai.gameoffline.billing.PaywallViewModel] unit-test 100% trên JVM.
 * Pure domain subscription plan model decoupled from Play SDK classes for JVM unit testing.
 */
data class BillingPlanModel(
    val productId: String,
    val basePlanId: String,
    val formattedPrice: String,
    val recurringPeriodIso: String,
    val trialPeriodIso: String?,
    val offerToken: String
)

/**
 * Ảnh chụp trạng thái Billing thống nhất toàn ứng dụng (Single Source of Truth).
 * Unified application-wide Google Play Billing snapshot.
 */
data class BillingSnapshot(
    val plans: List<BillingPlanModel> = emptyList(),
    val catalogStatus: BillingCatalogStatus = BillingCatalogStatus.LOADING,
    val ownershipStatus: BillingOwnershipStatus = BillingOwnershipStatus.LOADING,
    val isPremium: Boolean = false,
    val isOwnershipReady: Boolean = false,
    val isPurchaseInFlight: Boolean = false,
    val isPendingPurchase: Boolean = false
)

/** Sự kiện một lần từ luồng Billing / One-shot user-facing billing events. */
sealed interface BillingEvent {
    data object PurchaseSucceeded : BillingEvent
    data class PurchaseFailed(val message: String) : BillingEvent
    data object PurchasePending : BillingEvent
    data class RestoreCompleted(val restored: Boolean, val message: String) : BillingEvent
}

/**
 * Giao diện nguồn chân lý duy nhất cho Google Play Billing v9.1.0 toàn ứng dụng.
 * Single source of truth repository contract for Google Play Billing across the entire app.
 */
interface BillingRepository {

    /** Trạng thái hiện hành gồm bảng giá, quyền sở hữu và tiến trình mua. */
    val state: StateFlow<BillingSnapshot>

    /** Dòng trạng thái Premium dùng trực tiếp cho Ads & UI mà không nghe `SharedPreferences` thô. */
    val isPremiumFlow: StateFlow<Boolean>

    /** Các sự kiện một lần (mua thành công/lỗi/khôi phục) cho Paywall UI. */
    val events: SharedFlow<BillingEvent>

    /** Làm mới kết nối Play, quyền sở hữu và tùy chọn tải bảng giá. */
    fun refresh(loadProducts: Boolean = false)

    /** Đồng bộ nhanh trạng thái Premium từ cache grace 24 giờ khi quay lại tiền cảnh. */
    fun refreshCachedEntitlement(): Boolean

    /** Mở luồng thanh toán Google Play cho gói `productId` đang chọn. */
    fun launchPurchase(activity: Activity, productId: String)

    /** Khôi phục cả gói INAPP cũ lẫn gói Subscription hiện hành. */
    fun restorePurchases()
}
