package com.nextai.gameoffline.ads

import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.app.Activity
import android.app.Dialog
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.view.View
import android.view.Window
import android.view.WindowManager
import android.view.animation.LinearInterpolator
import com.nextai.gameoffline.R

/**
 * Hộp thoại đệm `Loading Ad…` chặn chạm trong 700ms trước khi hiển thị Interstitial.
 * Sử dụng hoàn toàn layout XML `dialog_ad_loading.xml` kèm vòng xoay neon đồng bộ màn Splash.
 * Touch-blocking 700ms `Loading Ad…` overlay inflated from `dialog_ad_loading.xml`.
 */
internal object AdLoadingOverlayDialog {

    /**
     * Chỉ mở overlay khi Activity đang ở tiền cảnh (`RESUMED`) để tránh rò rỉ cửa sổ.
     * Opens the touch-blocking overlay only while the Activity is actively `RESUMED`.
     */
    fun show(activity: Activity): Dialog? {
        if (!ActivityLifecycleGuard.isForegroundResumed(activity)) {
            return null
        }
        return try {
            Dialog(activity).apply {
                requestWindowFeature(Window.FEATURE_NO_TITLE)
                setContentView(R.layout.dialog_ad_loading)
                setCancelable(false)
                setCanceledOnTouchOutside(false)
                window?.apply {
                    setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                    setLayout(
                        WindowManager.LayoutParams.MATCH_PARENT,
                        WindowManager.LayoutParams.MATCH_PARENT
                    )
                }

                val outerAnimator = startSpin(findViewById(R.id.ivAdLoadingRing), 0f, 360f, 1_400L)
                val innerAnimator = startSpin(findViewById(R.id.ivAdLoadingInnerArc), 360f, 0f, 1_000L)
                setOnDismissListener {
                    outerAnimator?.cancel()
                    innerAnimator?.cancel()
                }
                show()
            }
        } catch (_: Exception) {
            null
        }
    }

    /**
     * Đóng dialog an toàn ngay cả khi Activity vừa xoay màn hình hoặc đã detach cửa sổ.
     * Safely dismisses the dialog even if the host window has already detached.
     */
    fun dismissSafely(dialog: Dialog?) {
        if (dialog == null) {
            return
        }
        try {
            if (dialog.isShowing) {
                dialog.dismiss()
            }
        } catch (_: Exception) {
            // Bỏ qua an toàn nếu WindowManager đã tách dialog / Ignore detached window errors.
        }
    }

    private fun startSpin(view: View?, fromDeg: Float, toDeg: Float, durationMs: Long): ObjectAnimator? {
        if (view == null) {
            return null
        }
        return ObjectAnimator.ofFloat(view, View.ROTATION, fromDeg, toDeg).apply {
            duration = durationMs
            repeatCount = ValueAnimator.INFINITE
            interpolator = LinearInterpolator()
            start()
        }
    }
}
