package com.nextai.gameoffline.presentation.settings

import android.app.Dialog
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.view.WindowManager
import android.widget.ImageButton
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SwitchCompat
import com.nextai.gameoffline.R
import com.nextai.gameoffline.ads.AdManager
import com.nextai.gameoffline.ads.AdsConsentManager
import com.nextai.gameoffline.billing.BillingActivity
import com.nextai.gameoffline.billing.BillingEntitlements

/**
 * Quản lý hộp thoại Cài đặt (`dialog_settings.xml`): âm thanh, rung, UMP privacy, pháp lý và VIP.
 * Tách toàn bộ UI/listener của hộp thoại Cài đặt ra khỏi [com.nextai.gameoffline.presentation.gamelist.GameListActivity].
 * Owns the Settings modal dialog independently from `GameListActivity`.
 */
internal class SettingsDialogController(
    private val activity: AppCompatActivity,
    private val onConsentUpdated: () -> Unit
) {

    private var activeDialog: Dialog? = null

    /** Hiển thị hộp thoại cài đặt / Show the settings modal dialog. */
    fun show() {
        if (activity.isFinishing || activity.isDestroyed) {
            return
        }
        dismiss()

        val dialog = Dialog(activity, R.style.Theme_NextAIGameOffline_FullWidthDialog).apply {
            requestWindowFeature(Window.FEATURE_NO_TITLE)
            setContentView(R.layout.dialog_settings)
            window?.apply {
                setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
                setLayout(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.MATCH_PARENT
                )
            }
        }

        dialog.findViewById<View>(R.id.settingsDialogBackdrop)?.setOnClickListener {
            dialog.dismiss()
        }
        bindAudioSwitches(dialog)
        bindActionRows(dialog)
        refreshEntitlement(dialog)

        activeDialog = dialog
        dialog.setOnDismissListener {
            if (activeDialog === dialog) {
                activeDialog = null
            }
        }
        dialog.show()
    }

    /** Cập nhật tiêu đề VIP ngay lập tức nếu quyền thay đổi lúc hộp thoại đang mở. */
    fun refreshEntitlementIfShowing() {
        activeDialog?.let(::refreshEntitlement)
    }

    /** Đóng hộp thoại an toàn khi Activity bị hủy / Dismiss dialog on Activity destroy. */
    fun dismiss() {
        activeDialog?.dismiss()
        activeDialog = null
    }

    private fun bindAudioSwitches(dialog: Dialog) {
        val switchMaster = dialog.findViewById<SwitchCompat>(R.id.switchMasterGameSound)
        val switchSound = dialog.findViewById<SwitchCompat>(R.id.switchSound)
        val switchMusic = dialog.findViewById<SwitchCompat>(R.id.switchMusic)
        val switchHaptic = dialog.findViewById<SwitchCompat>(R.id.switchHaptic)

        switchMaster?.isChecked = GameSettingsManager.isGameAudioMuted(activity)
        switchSound?.isChecked = GameSettingsManager.isSoundEnabled(activity)
        switchMusic?.isChecked = GameSettingsManager.isMusicEnabled(activity)
        switchHaptic?.isChecked = GameSettingsManager.isHapticEnabled(activity)

        switchMaster?.setOnCheckedChangeListener { _, isChecked ->
            GameSettingsManager.setGameAudioMuted(activity, isChecked)
        }
        switchSound?.setOnCheckedChangeListener { _, isChecked ->
            GameSettingsManager.setSoundEnabled(activity, isChecked)
        }
        switchMusic?.setOnCheckedChangeListener { _, isChecked ->
            GameSettingsManager.setMusicEnabled(activity, isChecked)
        }
        switchHaptic?.setOnCheckedChangeListener { _, isChecked ->
            GameSettingsManager.setHapticEnabled(activity, isChecked)
        }
    }

    private fun bindActionRows(dialog: Dialog) {
        dialog.findViewById<View>(R.id.layoutRateGame)?.setOnClickListener {
            LegalPolicyHelper.rateGame(activity)
        }
        dialog.findViewById<View>(R.id.layoutPrivacyPolicy)?.setOnClickListener {
            LegalPolicyHelper.showPrivacyPolicyDialog(activity)
        }
        dialog.findViewById<View>(R.id.layoutTermsOfService)?.setOnClickListener {
            LegalPolicyHelper.showTermsOfServiceDialog(activity)
        }

        val adPrivacyRow = dialog.findViewById<View>(R.id.layoutAdPrivacyChoices)
        val privacyRequired = AdsConsentManager.isPrivacyOptionsRequired(activity)
        adPrivacyRow?.visibility = if (privacyRequired) View.VISIBLE else View.GONE
        adPrivacyRow?.setOnClickListener {
            AdsConsentManager.showPrivacyOptions(activity) {
                AdManager.onConsentChanged(activity)
                onConsentUpdated()
            }
        }

        dialog.findViewById<View>(R.id.layoutVipUpgrade)?.setOnClickListener {
            dialog.dismiss()
            activity.startActivity(Intent(activity, BillingActivity::class.java))
        }
        dialog.findViewById<ImageButton>(R.id.btnCloseSettings)?.setOnClickListener {
            dialog.dismiss()
        }
    }

    private fun refreshEntitlement(dialog: Dialog) {
        val isPremium = BillingEntitlements.isPremium(activity)
        val titleRes = if (isPremium) {
            R.string.settings_vip_active
        } else {
            R.string.settings_remove_ads_vip
        }
        dialog.findViewById<TextView>(R.id.tvVipTitle)?.text = activity.getString(titleRes)
        dialog.findViewById<TextView>(R.id.tvVipSubtitle)?.text =
            activity.getString(R.string.premium_benefits)
    }
}
