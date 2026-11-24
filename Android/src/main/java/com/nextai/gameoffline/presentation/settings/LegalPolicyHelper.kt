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
        try {
            // Luôn trỏ tới ứng dụng phát hành, kể cả khi chạy bản QA riêng.
            // Always target the published app, including from a separate QA build.
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=com.nextai.game.offline")).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (_: ActivityNotFoundException) {
            Toast.makeText(context, context.getString(R.string.settings_rate_unavailable), Toast.LENGTH_LONG).show()
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
            Application: Galaxy Game
            Developer: Game Gate
            Last Updated: November 22, 2026
            
            1. LOCAL APP DATA:
            - High scores, favorites, settings, downloaded game files, daily quests, and local notification counters are stored in the app's Android sandbox using Room, SharedPreferences, and internal storage.
            - This local database is not advertised as independently encrypted. Android app sandbox and device security protect it at rest.
            
            2. ANALYTICS & CRASH DIAGNOSTICS:
            - Firebase Analytics records app/game usage, sanitized search terms, ad lifecycle, purchase status, game download status, and notification delivery/open events. Firebase may process app-instance, device, app-version, approximate region, and interaction data under Google's terms.
            - Firebase Crashlytics receives production crash, ANR, stack trace, device, OS, and app-version diagnostics. We do not attach names, email addresses, or purchase tokens to crash reports.
            
            3. ADVERTISING & CONSENT:
            - The free version uses Google AdMob with Real-Time Bidding mediation partners: Meta Audience Network, Mintegral, AppLovin, Unity Ads, and Pangle. Depending on consent, region, and account settings, these providers may process Advertising ID, IP address, device information, consent choices, and ad interactions to deliver, measure, secure, and limit ads.
            - Where required, Google's User Messaging Platform asks for consent before any ad request, propagates GDPR/US-State privacy signals to all mediation partners, and provides privacy choices in Settings. VIP users do not receive ad requests.

            4. GOOGLE PLAY BILLING:
            - VIP purchases are processed by Google Play. Game Gate does not receive payment-card details. The app records product-level success/failure analytics without sending order IDs or purchase tokens to Firebase Analytics.

            5. YOUR CHOICES:
            - You can deny notifications, change ad privacy choices when available, purchase the ad-free VIP option, clear local app data, or uninstall the app. Provider policies and the current online policy explain retention and deletion options.
            
            6. CONTACT US:
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
            Application: Galaxy Game
            Copyright: © 2026 Game Gate. All Rights Reserved.
            
            1. ACCEPTANCE OF TERMS:
            - By downloading, installing, or playing Galaxy Game, you agree to comply with and be bound by all terms and conditions set forth herein.
            
            2. INTELLECTUAL PROPERTY:
            - All user interfaces, Android Kotlin code architecture, brand identity, and Game Gate assets are the exclusive intellectual property of Game Gate.
            - The integrated HTML5/WASM mini-games library is provided for personal, non-commercial offline entertainment.
            
            3. VIP PASS & IN-APP PURCHASES:
            - Game Premium subscriptions renew automatically until canceled in Google Play. Prices, billing periods and any eligible trial are supplied by Google Play. Premium removes banner, interstitial and app-open ads while active; optional rewarded ads remain available. Existing one-time Remove Ads purchases remain supported and can be restored using the original Google account.
            
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
