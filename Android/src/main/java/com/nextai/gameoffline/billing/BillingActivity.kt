package com.nextai.gameoffline.billing

import android.os.Bundle
import android.widget.Button
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.nextai.gameoffline.R
import com.nextai.gameoffline.presentation.settings.LegalPolicyHelper

/**
 * Màn hình Paywall / Payment Wall mời người dùng nâng cấp gói "VIP Pass - Remove Ads".
 * High-converting Payment Wall Activity prompting users to purchase or restore the VIP Lifetime Pass.
 */
class BillingActivity : AppCompatActivity() {

    private lateinit var billingManager: BillingManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_billing)

        val source = intent.getStringExtra("source") ?: "launcher"
        com.nextai.gameoffline.analytics.GameAnalyticsManager.logPaywallViewed(source)

        setupWindowInsets()
        initBilling()
        setupListeners()
    }

    /**
     * Cấu hình WindowInsets chuẩn Android 15 (API 35 Edge-to-Edge).
     * Configure WindowInsets for Android 15 (API 35 Edge-to-Edge) so top bar close button
     * and bottom restore/policy links avoid camera cutouts and system navigation bars.
     */
    private fun setupWindowInsets() {
        androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.rootBillingLayout)) { _, insets ->
            val systemBars = insets.getInsets(
                androidx.core.view.WindowInsetsCompat.Type.systemBars() or 
                androidx.core.view.WindowInsetsCompat.Type.displayCutout()
            )
            val topBar = findViewById<android.view.View>(R.id.topBar)
            val scrollView = findViewById<android.view.View>(R.id.nestedScrollView)

            val density = resources.displayMetrics.density
            val padH = (16 * density).toInt()
            val padV = (8 * density).toInt()

            topBar.setPadding(padH, systemBars.top + padV, padH, padV)
            scrollView.setPadding(0, 0, 0, systemBars.bottom)

            insets
        }
    }

    private fun initBilling() {
        billingManager = BillingManager(
            context = this,
            onPurchaseSuccess = {
                runOnUiThread {
                    Toast.makeText(this, "Chúc mừng! Bạn đã mở khóa thành công VIP Pass Trọn Đời.", Toast.LENGTH_LONG).show()
                    finish()
                }
            },
            onPurchaseFailed = { message ->
                runOnUiThread {
                    Toast.makeText(this, "Thanh toán chưa hoàn tất: $message", Toast.LENGTH_SHORT).show()
                }
            }
        )

        // Đồng bộ giá tiền bản địa từ Google Play nếu có
        // Synchronize localized price from Google Play if available
        billingManager.getProductFormattedPrice()?.let { formattedPrice ->
            findViewById<TextView>(R.id.tvPriceLifetime)?.text = formattedPrice
            findViewById<Button>(R.id.btnBuyRemoveAds)?.text = "MỞ KHÓA VIP NGAY ($formattedPrice)"
        }
    }

    private fun setupListeners() {
        // Nút đóng màn hình Paywall / Close button
        findViewById<ImageButton>(R.id.btnClose).setOnClickListener {
            finish()
        }

        // Nút mua gói VIP Trọn Đời / Purchase button
        findViewById<Button>(R.id.btnBuyRemoveAds).setOnClickListener {
            billingManager.launchPurchaseFlow(this)
        }

        // Nút Khôi phục giao dịch đã mua / Restore purchases button
        findViewById<TextView>(R.id.btnRestorePurchases).setOnClickListener {
            Toast.makeText(this, "Đang kiểm tra giao dịch trên Google Play...", Toast.LENGTH_SHORT).show()
            billingManager.restorePurchases { success, _ ->
                runOnUiThread {
                    if (success) {
                        Toast.makeText(this, getString(R.string.paywall_restore_success), Toast.LENGTH_LONG).show()
                        finish()
                    } else {
                        Toast.makeText(this, getString(R.string.paywall_restore_none), Toast.LENGTH_LONG).show()
                    }
                }
            }
        }

        // Liên kết Chính sách quyền riêng tư / Privacy Policy link
        findViewById<TextView>(R.id.tvPaywallPrivacy).setOnClickListener {
            LegalPolicyHelper.showPrivacyPolicyDialog(this)
        }

        // Liên kết Điều khoản dịch vụ / Terms of Service link
        findViewById<TextView>(R.id.tvPaywallTerms).setOnClickListener {
            LegalPolicyHelper.showTermsOfServiceDialog(this)
        }
    }
}
