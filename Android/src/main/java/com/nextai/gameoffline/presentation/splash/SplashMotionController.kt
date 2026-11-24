package com.nextai.gameoffline.presentation.splash

import android.animation.Animator
import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.graphics.LinearGradient
import android.graphics.Shader
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.LinearInterpolator
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.nextai.gameoffline.R

/**
 * Điều phối toàn bộ chuyển động mượt 60fps và hiệu ứng chữ tiêu đề sắc nét cho màn hình Splash/Ads Loading:
 * - Tô gradient vàng kim sắc nét cho tiêu đề `GALAXY GAME` trên TextView native (không nén JPEG mờ).
 * - Hiệu ứng hít thở nhẹ trên nền vũ trụ để màn hình luôn sống động, không bị cảm giác "đơ".
 * - Vòng xoay neon-cyan 2 tầng ngược chiều + ánh sáng thở + thanh tiến trình trượt + dấu chấm động.
 * Coordinates crisp native typography, cosmic breathing motion, and 60fps dual-ring spinner on Splash.
 */
internal class SplashMotionController(
    private val activity: AppCompatActivity
) {

    private val handler = Handler(Looper.getMainLooper())
    private val animators = mutableListOf<Animator>()
    private var dotStep = 0
    private var statusView: TextView? = null
    private var statusBaseText: String = ""
    private var isRunning = false

    private val statusDotTicker = object : Runnable {
        override fun run() {
            if (!isRunning) {
                return
            }
            dotStep = (dotStep + 1) % 4
            val suffix = ".".repeat(if (dotStep == 0) 3 else dotStep)
            statusView?.text = "$statusBaseText$suffix"
            handler.postDelayed(this, STATUS_DOT_INTERVAL_MS)
        }
    }

    /** Gắn xử lý lề hệ thống và khởi chạy toàn bộ chuyển động mượt 60fps của màn Splash. */
    fun start() {
        val rootView = activity.findViewById<View>(R.id.rootSplashLayout) ?: return
        val artwork = activity.findViewById<ImageView>(R.id.splashArtwork)
        val headerGroup = activity.findViewById<View>(R.id.splashHeaderGroup)
        val titleView = activity.findViewById<TextView>(R.id.tvSplashTitle)
        val loadingGroup = activity.findViewById<View>(R.id.splashLoadingGroup)
        val outerRing = activity.findViewById<ImageView>(R.id.ivSplashOuterRing)
        val innerArc = activity.findViewById<ImageView>(R.id.ivSplashInnerArc)
        val centerStar = activity.findViewById<ImageView>(R.id.ivSplashCenterStar)
        val spinnerGlow = activity.findViewById<View>(R.id.splashSpinnerGlow)
        val progressTrack = activity.findViewById<View>(R.id.splashProgressTrack)
        val progressFill = activity.findViewById<View>(R.id.splashProgressFill)
        statusView = activity.findViewById(R.id.tvSplashStatus)
        statusBaseText = activity.getString(R.string.ad_splash_loading_base)

        applySafeInsets(rootView, headerGroup, loadingGroup)
        applyTitleGoldGradient(titleView)
        playEntranceMotion(headerGroup, loadingGroup)
        startCosmicBackdropBreath(artwork)
        startDualRingSpinner(outerRing, innerArc, centerStar, spinnerGlow)
        startProgressSweep(progressTrack, progressFill)

        isRunning = true
        handler.removeCallbacks(statusDotTicker)
        handler.postDelayed(statusDotTicker, STATUS_DOT_INTERVAL_MS)
    }

    /** Tạm dừng animation khi Activity đi vào nền để tiết kiệm pin và CPU. */
    fun pause() {
        isRunning = false
        handler.removeCallbacks(statusDotTicker)
        animators.forEach(Animator::pause)
    }

    /** Tiếp tục animation mượt khi Activity trở lại tiền cảnh. */
    fun resume() {
        if (animators.isEmpty()) {
            return
        }
        isRunning = true
        animators.forEach(Animator::resume)
        handler.removeCallbacks(statusDotTicker)
        handler.postDelayed(statusDotTicker, STATUS_DOT_INTERVAL_MS)
    }

    /** Hủy sạch mọi Animator và callback khi Activity đóng để tránh rò rỉ bộ nhớ. */
    fun stop() {
        isRunning = false
        handler.removeCallbacksAndMessages(null)
        animators.forEach(Animator::cancel)
        animators.clear()
        statusView = null
    }

    private fun applySafeInsets(rootView: View, headerGroup: View, loadingGroup: View) {
        val density = activity.resources.displayMetrics.density
        val baseTopPx = (BASE_TOP_MARGIN_DP * density).toInt()
        val baseBottomPx = (BASE_BOTTOM_MARGIN_DP * density).toInt()

        ViewCompat.setOnApplyWindowInsetsListener(rootView) { _, insets ->
            val mask = WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout()
            val bars = insets.getInsets(mask)
            headerGroup.setPadding(
                headerGroup.paddingLeft,
                bars.top + baseTopPx,
                headerGroup.paddingRight,
                headerGroup.paddingBottom
            )
            loadingGroup.setPadding(
                loadingGroup.paddingLeft,
                loadingGroup.paddingTop,
                loadingGroup.paddingRight,
                bars.bottom + baseBottomPx
            )
            insets
        }
        ViewCompat.requestApplyInsets(rootView)
    }

    private fun applyTitleGoldGradient(titleView: TextView) {
        titleView.post {
            val height = titleView.height.toFloat().coerceAtLeast(1f)
            val startColor = ContextCompat.getColor(activity, R.color.splash_title_gold_start)
            val midColor = ContextCompat.getColor(activity, R.color.splash_title_gold_mid)
            val endColor = ContextCompat.getColor(activity, R.color.splash_title_gold_end)
            titleView.paint.shader = LinearGradient(
                0f,
                0f,
                0f,
                height,
                intArrayOf(startColor, midColor, endColor),
                floatArrayOf(0f, 0.52f, 1f),
                Shader.TileMode.CLAMP
            )
            titleView.invalidate()
        }
    }

    private fun playEntranceMotion(headerGroup: View, loadingGroup: View) {
        headerGroup.alpha = 0f
        headerGroup.translationY = -18f
        headerGroup.animate()
            .alpha(1f)
            .translationY(0f)
            .setDuration(420L)
            .setInterpolator(AccelerateDecelerateInterpolator())
            .start()

        loadingGroup.alpha = 0f
        loadingGroup.translationY = 18f
        loadingGroup.animate()
            .alpha(1f)
            .translationY(0f)
            .setDuration(420L)
            .setInterpolator(AccelerateDecelerateInterpolator())
            .start()
    }

    private fun startCosmicBackdropBreath(artwork: ImageView) {
        registerAnimator(
            ObjectAnimator.ofFloat(artwork, View.SCALE_X, 1f, 1.05f).apply {
                duration = BACKDROP_BREATH_MS
                repeatCount = ValueAnimator.INFINITE
                repeatMode = ValueAnimator.REVERSE
                interpolator = AccelerateDecelerateInterpolator()
            }
        )
        registerAnimator(
            ObjectAnimator.ofFloat(artwork, View.SCALE_Y, 1f, 1.05f).apply {
                duration = BACKDROP_BREATH_MS
                repeatCount = ValueAnimator.INFINITE
                repeatMode = ValueAnimator.REVERSE
                interpolator = AccelerateDecelerateInterpolator()
            }
        )
    }

    private fun startDualRingSpinner(
        outerRing: ImageView,
        innerArc: ImageView,
        centerStar: ImageView,
        spinnerGlow: View
    ) {
        registerAnimator(
            ObjectAnimator.ofFloat(outerRing, View.ROTATION, 0f, 360f).apply {
                duration = OUTER_RING_ROTATION_MS
                repeatCount = ValueAnimator.INFINITE
                interpolator = LinearInterpolator()
            }
        )
        registerAnimator(
            ObjectAnimator.ofFloat(innerArc, View.ROTATION, 360f, 0f).apply {
                duration = INNER_ARC_ROTATION_MS
                repeatCount = ValueAnimator.INFINITE
                interpolator = LinearInterpolator()
            }
        )
        registerAnimator(
            ObjectAnimator.ofFloat(spinnerGlow, View.ALPHA, 0.45f, 0.95f).apply {
                duration = GLOW_PULSE_MS
                repeatCount = ValueAnimator.INFINITE
                repeatMode = ValueAnimator.REVERSE
                interpolator = AccelerateDecelerateInterpolator()
            }
        )
        registerAnimator(
            ObjectAnimator.ofFloat(centerStar, View.SCALE_X, 0.85f, 1.18f).apply {
                duration = STAR_PULSE_MS
                repeatCount = ValueAnimator.INFINITE
                repeatMode = ValueAnimator.REVERSE
                interpolator = AccelerateDecelerateInterpolator()
            }
        )
        registerAnimator(
            ObjectAnimator.ofFloat(centerStar, View.SCALE_Y, 0.85f, 1.18f).apply {
                duration = STAR_PULSE_MS
                repeatCount = ValueAnimator.INFINITE
                repeatMode = ValueAnimator.REVERSE
                interpolator = AccelerateDecelerateInterpolator()
            }
        )
    }

    private fun startProgressSweep(progressTrack: View, progressFill: View) {
        progressTrack.post {
            val travelPx = (progressTrack.width - progressFill.width).coerceAtLeast(1).toFloat()
            val sweepAnimator = ObjectAnimator.ofFloat(
                progressFill,
                View.TRANSLATION_X,
                0f,
                travelPx
            ).apply {
                duration = PROGRESS_SWEEP_MS
                repeatCount = ValueAnimator.INFINITE
                repeatMode = ValueAnimator.REVERSE
                interpolator = AccelerateDecelerateInterpolator()
            }
            registerAnimator(sweepAnimator)
        }
    }

    private fun registerAnimator(animator: Animator) {
        animators.add(animator)
        animator.start()
    }

    private companion object {
        const val BASE_TOP_MARGIN_DP = 16
        const val BASE_BOTTOM_MARGIN_DP = 16
        const val BACKDROP_BREATH_MS = 4_800L
        const val OUTER_RING_ROTATION_MS = 1_800L
        const val INNER_ARC_ROTATION_MS = 1_250L
        const val GLOW_PULSE_MS = 1_100L
        const val STAR_PULSE_MS = 950L
        const val PROGRESS_SWEEP_MS = 1_150L
        const val STATUS_DOT_INTERVAL_MS = 380L
    }
}
