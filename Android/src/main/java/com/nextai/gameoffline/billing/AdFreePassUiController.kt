package com.nextai.gameoffline.billing

import android.app.Activity
import android.app.Dialog
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import com.nextai.gameoffline.R
import com.nextai.gameoffline.ads.AdManager
import java.util.Locale

/**
 * Điều khiển giao diện thẻ và hộp thoại Vé Sạch Quảng Cáo ("Xem 2 Video = 20 Phút Không Quảng Cáo")
 * tách riêng khỏi [BillingActivity] để giữ Activity mỏng dưới 350 dòng theo chuẩn SRP.
 * SRP UI controller managing the Paywall Ad-Free Pass card, countdown ticker, and rewarded dialog.
 */
internal class AdFreePassUiController(
    private val activity: Activity
) {

    private val handler = Handler(Looper.getMainLooper())
    private var cardContainer: View? = null
    private var cardStatusText: TextView? = null
    private var activeDialog: Dialog? = null
    private var isPaidPremium = false
    private val countdownTicker = object : Runnable {
        override fun run() {
            if (activity.isFinishing || activity.isDestroyed) {
                return
            }
            refresh()
            if (AdFreePassManager.isPassActive(activity)) {
                handler.postDelayed(this, TICK_INTERVAL_MS)
            }
        }
    }

    /** Gắn controller vào thẻ `cardAdFreePass` trong `activity_billing.xml` và preload Rewarded Ad. */
    fun bindPaywallCard(cardView: View, statusView: TextView) {
        cardContainer = cardView
        cardStatusText = statusView
        cardView.setOnClickListener { showPassDialog() }
        AdManager.loadRewardedAd(activity.applicationContext)
        refresh()
    }

    /** Ẩn thẻ đổi vé nếu người chơi đã sở hữu gói VIP thật; vẫn hiện khi chỉ đang dùng vé tạm. */
    fun updatePaidPremiumStatus(isPremium: Boolean) {
        isPaidPremium = isPremium
        refresh()
    }

    fun onResume() {
        refresh()
        if (AdFreePassManager.isPassActive(activity)) {
            handler.removeCallbacks(countdownTicker)
            handler.postDelayed(countdownTicker, TICK_INTERVAL_MS)
        }
    }

    fun onPause() {
        handler.removeCallbacks(countdownTicker)
    }

    fun onDestroy() {
        handler.removeCallbacks(countdownTicker)
        activeDialog?.dismiss()
        activeDialog = null
    }

    /** Hiển thị hộp thoại `dialog_rewarded_ad_free_pass.xml` với tiến độ 0/2 -> 1/2 -> 2/2. */
    fun showPassDialog() {
        if (activity.isFinishing || activity.isDestroyed || isPaidPremium) {
            return
        }
        activeDialog?.dismiss()
        val dialog = Dialog(activity, R.style.Theme_NextAIGameOffline_Dialog)
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialog.setContentView(R.layout.dialog_rewarded_ad_free_pass)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.window?.setLayout(
            (activity.resources.displayMetrics.widthPixels * 0.90).toInt(),
            ViewGroup.LayoutParams.WRAP_CONTENT
        )

        val pbSteps = dialog.findViewById<ProgressBar>(R.id.pbAdFreeSteps)
        val tvStatus = dialog.findViewById<TextView>(R.id.tvDialogAdFreeStatus)
        val btnWatch = dialog.findViewById<Button>(R.id.btnDialogWatchAdFree)
        val btnDismiss = dialog.findViewById<View>(R.id.btnDialogDismissAdFree)

        bindDialogState(pbSteps, tvStatus, btnWatch)
        btnWatch.setOnClickListener {
            launchRewardedVideo(dialog, pbSteps, tvStatus, btnWatch)
        }
        btnDismiss.setOnClickListener { dialog.dismiss() }
        dialog.setOnDismissListener {
            if (activeDialog === dialog) {
                activeDialog = null
            }
        }
        activeDialog = dialog
        dialog.show()
    }

    private fun launchRewardedVideo(
        dialog: Dialog,
        pbSteps: ProgressBar,
        tvStatus: TextView,
        btnWatch: Button
    ) {
        AdManager.showRewardedAd(
            activity = activity,
            gameName = "ad_free_pass",
            onNotEarned = {
                if (!activity.isFinishing && !activity.isDestroyed) {
                    Toast.makeText(
                        activity,
                        R.string.ad_free_pass_video_unavailable,
                        Toast.LENGTH_SHORT
                    ).show()
                    AdManager.loadRewardedAd(activity.applicationContext)
                }
            },
            onRewardGranted = {
                val result = AdFreePassManager.recordRewardedVideoWatched(activity)
                if (activity.isFinishing || activity.isDestroyed) {
                    return@showRewardedAd
                }
                val toastRes = if (result.passActivated) {
                    R.string.ad_free_pass_unlocked
                } else {
                    R.string.ad_free_pass_step_recorded
                }
                Toast.makeText(activity, toastRes, Toast.LENGTH_LONG).show()
                refresh()
                if (dialog.isShowing) {
                    bindDialogState(pbSteps, tvStatus, btnWatch)
                }
                if (result.passActivated) {
                    handler.removeCallbacks(countdownTicker)
                    handler.postDelayed(countdownTicker, TICK_INTERVAL_MS)
                }
            }
        )
    }

    private fun refresh() {
        val container = cardContainer ?: return
        val statusView = cardStatusText ?: return
        if (isPaidPremium) {
            container.visibility = View.GONE
            return
        }
        container.visibility = View.VISIBLE
        val remainingMs = AdFreePassManager.remainingPassMs(activity)
        val steps = AdFreePassManager.watchedSteps(activity)
        statusView.text = if (remainingMs > 0L) {
            activity.getString(R.string.ad_free_pass_active_countdown, formatMmSs(remainingMs))
        } else if (steps > 0) {
            activity.getString(R.string.ad_free_pass_progress, steps, AdFreePassManager.REQUIRED_VIDEOS)
        } else {
            activity.getString(R.string.ad_free_pass_subtitle)
        }
    }

    private fun bindDialogState(
        pbSteps: ProgressBar,
        tvStatus: TextView,
        btnWatch: Button
    ) {
        val steps = AdFreePassManager.watchedSteps(activity)
        val required = AdFreePassManager.REQUIRED_VIDEOS
        val remainingMs = AdFreePassManager.remainingPassMs(activity)
        pbSteps.max = required
        pbSteps.progress = if (remainingMs > 0L && steps == 0) required else steps
        if (remainingMs > 0L) {
            tvStatus.text = activity.getString(
                R.string.ad_free_pass_active_countdown,
                formatMmSs(remainingMs)
            )
            btnWatch.text = activity.getString(R.string.ad_free_pass_cta_extend, steps, required)
        } else {
            tvStatus.text = activity.getString(R.string.ad_free_pass_progress, steps, required)
            btnWatch.text = activity.getString(R.string.ad_free_pass_cta_watch, steps, required)
        }
    }

    companion object {
        private const val TICK_INTERVAL_MS = 1_000L

        /** Định dạng mili-giây còn lại sang `MM:SS` gọn rõ / Formats remaining ms as `MM:SS`. */
        fun formatMmSs(remainingMs: Long): String {
            val totalSeconds = (remainingMs.coerceAtLeast(0L) + 999L) / 1_000L
            val minutes = totalSeconds / 60L
            val seconds = totalSeconds % 60L
            return String.format(Locale.US, "%02d:%02d", minutes, seconds)
        }
    }
}
