package com.nextai.gameoffline.ads

/**
 * Chính sách thuần Kotlin cho App Open Ad khi người dùng quay lại ứng dụng từ nền (Foreground Resume):
 * - Chỉ kích hoạt nếu ứng dụng đã ở nền tối thiểu 30 giây (tránh làm phiền khi chỉ vuốt thanh thông báo).
 * - Cách lần hiển thị App Open Resume trước tối thiểu 120 giây.
 * - Tuyệt đối bỏ qua Splash, Paywall VIP và chính màn quảng cáo `AdActivity`.
 * Pure Kotlin policy governing foreground-resume App Open Ad eligibility.
 */
object AppOpenResumePolicy {

    /** Thời gian tối thiểu ứng dụng ở nền trước khi xét hiện App Open (30 giây). */
    const val MIN_BACKGROUND_DURATION_MS = 30_000L

    /** Khoảng cách tối thiểu giữa hai lần hiện App Open khi quay lại tiền cảnh (120 giây). */
    const val MIN_RESUME_INTERVAL_MS = 120_000L

    /** Danh sách màn hình không bao giờ được đè App Open Resume lên trên. */
    private val EXCLUDED_ACTIVITY_NAMES = setOf(
        "SplashAdActivity",
        "BillingActivity",
        "AdActivity"
    )

    /**
     * Kiểm tra một Activity có nằm trong danh sách loại trừ App Open Resume hay không.
     * Checks whether the destination Activity is excluded from foreground-resume App Open ads.
     */
    fun isExcludedActivity(activitySimpleName: String): Boolean {
        return activitySimpleName in EXCLUDED_ACTIVITY_NAMES
    }

    /**
     * Quyết định có đủ điều kiện hiển thị App Open Ad khi ứng dụng trở lại tiền cảnh hay không.
     * Evaluates whether foreground resume satisfies background duration, interval, and screen rules.
     */
    fun shouldShowOnResume(
        hasLeftForeground: Boolean,
        backgroundDurationMs: Long,
        msSinceLastResumeAd: Long,
        activitySimpleName: String
    ): Boolean {
        if (!hasLeftForeground) {
            return false
        }
        if (isExcludedActivity(activitySimpleName)) {
            return false
        }
        if (backgroundDurationMs < MIN_BACKGROUND_DURATION_MS) {
            return false
        }
        return msSinceLastResumeAd >= MIN_RESUME_INTERVAL_MS
    }
}
