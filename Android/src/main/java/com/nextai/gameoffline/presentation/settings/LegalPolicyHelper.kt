package com.nextai.gameoffline.presentation.settings

import android.app.Dialog
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.net.Uri
import android.view.ViewGroup
import android.view.Window
import android.widget.Button
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import com.nextai.gameoffline.R

/**
 * Trợ lý hiển thị Chính sách Quyền riêng tư, Điều khoản Dịch vụ và Đánh giá Game.
 * Helper utility displaying Privacy Policy, Terms of Service and Rate Game dialogs.
 */
object LegalPolicyHelper {

    const val URL_PRIVACY_POLICY = "https://nextai.technology/privacy-policy"
    const val URL_TERMS_OF_SERVICE = "https://nextai.technology/terms-of-service"

    /**
     * Mở màn hình Đánh giá 5 sao trên Google Play Store.
     * Open Google Play Store page to rate the game.
     */
    fun rateGame(context: Context) {
        val packageName = context.packageName
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$packageName")).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (_: ActivityNotFoundException) {
            try {
                val webIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=$packageName")).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(webIntent)
            } catch (_: Exception) {
                Toast.makeText(context, context.getString(R.string.settings_rate_thank_you), Toast.LENGTH_LONG).show()
            }
        }
    }

    /**
     * Hiển thị bảng Chính sách Quyền riêng tư (Hỗ trợ đọc Offline và mở Web).
     * Show Privacy Policy dialog (supports offline reading and opening browser).
     */
    fun showPrivacyPolicyDialog(context: Context) {
        val dialog = Dialog(context, R.style.Theme_NextAIGameOffline_Dialog)
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialog.setContentView(R.layout.dialog_legal_doc)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.window?.setLayout(
            (context.resources.displayMetrics.widthPixels * 0.92).toInt(),
            ViewGroup.LayoutParams.WRAP_CONTENT
        )

        val tvTitle = dialog.findViewById<TextView>(R.id.tvLegalTitle)
        val tvContent = dialog.findViewById<TextView>(R.id.tvLegalContent)
        val btnOpenWeb = dialog.findViewById<Button>(R.id.btnOpenWeb)
        val btnClose = dialog.findViewById<ImageButton>(R.id.btnCloseLegal)

        tvTitle.text = context.getString(R.string.settings_privacy_policy)
        tvContent.text = """
            PRIVACY POLICY
            Application: Game Gate Offline
            Developer: Game Gate
            Last Updated: 2026
            
            1. DATA COLLECTION & USAGE:
            - Game Gate Offline respects your privacy. The application DOES NOT collect, store, or share any Personally Identifiable Information (PII) such as your name, email, phone number, contacts, or precise physical location.
            - All high scores, favorite game lists, and audio settings are stored 100% locally on your device using encrypted Room SQLite database storage.
            
            2. ADVERTISING & GOOGLE PLAY BILLING:
            - The free version uses Google AdMob to display banner, interstitial, and rewarded ads to support ongoing development. Google Mobile Ads SDK may collect an anonymous Advertising ID in compliance with Google Play Developer Policies.
            - In-App Purchase transactions (VIP Lifetime Pass) are securely processed through Google Play Billing. Game Gate does not process or retain any payment card details.
            
            3. CHILDREN & FAMILY PRIVACY (COPPA & GDPR):
            - Our application strictly adheres to the Children's Online Privacy Protection Act (COPPA) and General Data Protection Regulation (GDPR). 100% of game content is family-friendly and safe for all ages.
            
            4. CONTACT US:
            - For inquiries or support, please reach out to: support@gamegate.app
        """.trimIndent()

        btnOpenWeb.text = context.getString(R.string.btn_open_web_browser)
        btnOpenWeb.setOnClickListener {
            openWebUrl(context, URL_PRIVACY_POLICY)
        }

        btnClose.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    /**
     * Hiển thị bảng Điều khoản Dịch vụ (Hỗ trợ đọc Offline và mở Web).
     * Show Terms of Service dialog (supports offline reading and opening browser).
     */
    fun showTermsOfServiceDialog(context: Context) {
        val dialog = Dialog(context, R.style.Theme_NextAIGameOffline_Dialog)
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)
        dialog.setContentView(R.layout.dialog_legal_doc)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.window?.setLayout(
            (context.resources.displayMetrics.widthPixels * 0.92).toInt(),
            ViewGroup.LayoutParams.WRAP_CONTENT
        )

        val tvTitle = dialog.findViewById<TextView>(R.id.tvLegalTitle)
        val tvContent = dialog.findViewById<TextView>(R.id.tvLegalContent)
        val btnOpenWeb = dialog.findViewById<Button>(R.id.btnOpenWeb)
        val btnClose = dialog.findViewById<ImageButton>(R.id.btnCloseLegal)

        tvTitle.text = context.getString(R.string.settings_terms_of_service)
        tvContent.text = """
            TERMS OF SERVICE
            Application: Game Gate Offline
            Copyright: © 2026 Game Gate. All Rights Reserved.
            
            1. ACCEPTANCE OF TERMS:
            - By downloading, installing, or playing Game Gate Offline, you agree to comply with and be bound by all terms and conditions set forth herein.
            
            2. INTELLECTUAL PROPERTY:
            - All user interfaces, Android Kotlin code architecture, brand identity, and Game Gate assets are the exclusive intellectual property of Game Gate.
            - The integrated HTML5/WASM mini-games library is provided for personal, non-commercial offline entertainment.
            
            3. VIP PASS & IN-APP PURCHASES:
            - The "VIP Lifetime Pass" (Remove Ads) is a Non-Consumable product (one-time purchase, keep forever). Once unlocked, ads are permanently removed and purchases can be restored across any device signed into your Google account.
            
            4. DISCLAIMER & WARRANTY:
            - The games are provided on an "as-is" basis. Game Gate strives to deliver optimized 60 FPS performance across all supported Android hardware.
        """.trimIndent()

        btnOpenWeb.text = context.getString(R.string.btn_open_web_browser)
        btnOpenWeb.setOnClickListener {
            openWebUrl(context, URL_TERMS_OF_SERVICE)
        }

        btnClose.setOnClickListener { dialog.dismiss() }
        dialog.show()
    }

    private fun openWebUrl(context: Context, url: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (_: Exception) {
            Toast.makeText(context, "Unable to open browser: $url", Toast.LENGTH_SHORT).show()
        }
    }
}
