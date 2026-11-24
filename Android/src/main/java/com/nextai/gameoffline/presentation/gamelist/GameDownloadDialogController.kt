package com.nextai.gameoffline.presentation.gamelist

import android.text.format.Formatter
import android.view.View
import android.widget.FrameLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.gms.ads.nativead.NativeAd
import com.google.android.gms.ads.nativead.NativeAdView
import com.nextai.gameoffline.R
import com.nextai.gameoffline.ads.AdManager
import com.nextai.gameoffline.ads.AdsConsentManager
import com.nextai.gameoffline.ads.NativeAdViewBinder
import com.nextai.gameoffline.billing.BillingEntitlements
import com.nextai.gameoffline.data.local.entity.GameEntity
import com.nextai.gameoffline.data.remote.GameDownloadCoordinator
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

/**
 * Điều khiển hộp thoại tiến trình tải game từ Cloudflare R2 (dùng layout XML `dialog_game_download.xml`).
 * Tách hoàn toàn logic hộp thoại tải khỏi [GameListActivity].
 * Controls the XML-backed R2 download progress dialog independently from [GameListActivity].
 */
internal class GameDownloadDialogController(
    private val activity: AppCompatActivity,
    private val startDownload: (GameEntity) -> StateFlow<GameDownloadCoordinator.State>,
    private val onPlayReadyGame: (GameEntity) -> Unit
) {

    /**
     * Mở hộp thoại hiển thị tiến trình tải thực; đóng hộp thoại không hủy tiến trình tải nền.
     * Opens the real download progress dialog; dismissing keeps the download running in background.
     */
    fun show(game: GameEntity) {
        if (activity.isFinishing || activity.isDestroyed) {
            return
        }
        val contentView = activity.layoutInflater.inflate(R.layout.dialog_game_download, null)
        val statusView = contentView.findViewById<TextView>(R.id.tvDownloadStatus)
        val progressBar = contentView.findViewById<ProgressBar>(R.id.progressGameDownload)
        val adContainer = contentView.findViewById<FrameLayout>(R.id.downloadNativeAdContainer)

        val dialog = AlertDialog.Builder(activity)
            .setTitle(game.title)
            .setView(contentView)
            .setPositiveButton(R.string.game_download_close, null)
            .setNegativeButton(R.string.game_download_retry, null)
            .create()
        dialog.setCanceledOnTouchOutside(true)
        dialog.show()
        dialog.getButton(AlertDialog.BUTTON_NEGATIVE).visibility = View.GONE

        var dialogDismissed = false
        var boundNativeAd: NativeAd? = null
        attachDownloadNativeAd(
            dialog = dialog,
            adContainer = adContainer,
            isDismissed = { dialogDismissed },
            onBound = { ad -> boundNativeAd = ad }
        )

        val downloadState = startDownload(game)
        val slowHintJob = activity.lifecycleScope.launch {
            delay(SLOW_CONNECT_HINT_DELAY_MS)
            val stillConnecting = downloadState.value is GameDownloadCoordinator.State.Connecting
            if (dialog.isShowing && stillConnecting) {
                statusView.text = activity.getString(R.string.game_download_slow)
            }
        }

        val observerJob = activity.lifecycleScope.launch {
            downloadState.collect { state ->
                bindState(dialog, game, statusView, progressBar, state)
            }
        }

        dialog.setOnDismissListener {
            dialogDismissed = true
            observerJob.cancel()
            slowHintJob.cancel()
            AdManager.releaseNativeAd(boundNativeAd)
            boundNativeAd = null
        }
    }

    private fun attachDownloadNativeAd(
        dialog: AlertDialog,
        adContainer: FrameLayout,
        isDismissed: () -> Boolean,
        onBound: (NativeAd) -> Unit
    ) {
        val canShowAd = !BillingEntitlements.shouldSuppressAutomaticAds(activity) &&
            AdsConsentManager.canRequestAds(activity)
        if (!canShowAd) {
            return
        }
        AdManager.acquireNativeAd(activity) { nativeAd ->
            if (nativeAd == null) {
                return@acquireNativeAd
            }
            if (isDismissed() || !dialog.isShowing || activity.isFinishing || activity.isDestroyed) {
                AdManager.releaseNativeAd(nativeAd)
                return@acquireNativeAd
            }
            val adView = activity.layoutInflater.inflate(
                R.layout.layout_native_ad_compact,
                adContainer,
                false
            ) as NativeAdView
            NativeAdViewBinder.bind(adView, nativeAd)
            adContainer.removeAllViews()
            adContainer.addView(adView)
            adContainer.visibility = View.VISIBLE
            onBound(nativeAd)
        }
    }

    private fun bindState(
        dialog: AlertDialog,
        game: GameEntity,
        statusView: TextView,
        progressBar: ProgressBar,
        state: GameDownloadCoordinator.State
    ) {
        when (state) {
            is GameDownloadCoordinator.State.Preparing -> {
                progressBar.isIndeterminate = true
                statusView.text = activity.getString(R.string.game_download_preparing)
            }
            is GameDownloadCoordinator.State.Connecting -> {
                progressBar.isIndeterminate = true
                statusView.text = activity.getString(R.string.game_download_connecting)
            }
            is GameDownloadCoordinator.State.Downloading -> {
                val downloaded = Formatter.formatShortFileSize(activity, state.bytes)
                val total = Formatter.formatShortFileSize(activity, state.totalBytes)
                progressBar.isIndeterminate = false
                progressBar.progress = state.percent
                statusView.text = activity.getString(
                    R.string.game_download_bytes,
                    state.percent,
                    downloaded,
                    total
                )
            }
            is GameDownloadCoordinator.State.Installing -> {
                progressBar.isIndeterminate = true
                statusView.text = activity.getString(R.string.game_download_installing)
            }
            is GameDownloadCoordinator.State.Complete -> {
                progressBar.isIndeterminate = false
                progressBar.progress = 100
                statusView.text = activity.getString(R.string.game_download_complete)
                val playButton = dialog.getButton(AlertDialog.BUTTON_POSITIVE)
                playButton.text = activity.getString(R.string.game_download_play)
                playButton.setOnClickListener {
                    dialog.dismiss()
                    onPlayReadyGame(game.copy(isDownloaded = 1))
                }
            }
            is GameDownloadCoordinator.State.Failed -> {
                progressBar.visibility = View.GONE
                statusView.text = state.message
                val retryButton = dialog.getButton(AlertDialog.BUTTON_NEGATIVE)
                retryButton.visibility = View.VISIBLE
                retryButton.setOnClickListener {
                    dialog.dismiss()
                    show(game)
                }
            }
        }
    }

    private companion object {
        const val SLOW_CONNECT_HINT_DELAY_MS = 4_000L
    }
}
