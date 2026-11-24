package com.nextai.gameoffline.billing

import android.app.Activity
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.constraintlayout.widget.ConstraintSet
import com.nextai.gameoffline.R

/**
 * Helper điều chỉnh bố cục Paywall cho màn hình nhỏ hoặc cỡ chữ lớn (Accessibility reflow).
 * Accessibility layout reflow helper keeping long localized prices and CTA readable on small screens.
 */
internal object PaywallAccessibilityHelper {

    /**
     * Xếp cột giá xuống dòng riêng khi giá dài, màn hình hẹp (<= 320dp) hoặc fontScale >= 1.3.
     * Stacks the price column vertically when price text would otherwise wrap or truncate.
     */
    fun adaptPriceLayout(activity: Activity, row: View, formattedPrice: String) {
        val resources = activity.resources
        val priceView = row.findViewById<TextView>(R.id.planPrice)
        val innerWidthDp = (resources.configuration.screenWidthDp - 110).coerceAtLeast(1)
        val availableColumnPx = dp(activity, innerWidthDp) * (1.15f / 2.15f)
        val shouldStack = resources.configuration.screenWidthDp <= 320 ||
            resources.configuration.fontScale >= 1.3f ||
            priceView.paint.measureText(formattedPrice) > availableColumnPx
        if (!shouldStack) {
            return
        }

        row.findViewById<LinearLayout>(R.id.planColumns).orientation = LinearLayout.VERTICAL
        row.findViewById<View>(R.id.planNameColumn).layoutParams = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
        row.findViewById<View>(R.id.planPriceColumn).layoutParams = LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ).apply {
            topMargin = dp(activity, 8)
        }
        priceView.gravity = Gravity.START or Gravity.CENTER_VERTICAL
        row.findViewById<TextView>(R.id.planPeriod).gravity = Gravity.START
    }

    /**
     * Khi màn hình thấp (< 640dp) hoặc chữ rất lớn (>= 1.4x), đưa footer vào vùng cuộn
     * để danh sách chọn gói không bị che kín.
     * Moves footer into the scroll container on compact or large-font displays; returns true if moved.
     */
    fun moveFooterIntoScrollIfNeeded(activity: Activity, alreadyMoved: Boolean): Boolean {
        if (alreadyMoved) {
            return true
        }
        val config = activity.resources.configuration
        if (config.fontScale < 1.4f && config.screenHeightDp >= 640) {
            return false
        }
        val root = activity.findViewById<ConstraintLayout>(R.id.rootBillingLayout)
        val footer = activity.findViewById<View>(R.id.purchaseFooter)
        root.removeView(footer)
        activity.findViewById<LinearLayout>(R.id.paywallBody).addView(
            footer,
            LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            )
        )
        ConstraintSet().apply {
            clone(root)
            clear(R.id.nestedScrollView, ConstraintSet.BOTTOM)
            connect(
                R.id.nestedScrollView,
                ConstraintSet.BOTTOM,
                ConstraintSet.PARENT_ID,
                ConstraintSet.BOTTOM
            )
            applyTo(root)
        }
        return true
    }

    fun dp(activity: Activity, value: Int): Int {
        return (value * activity.resources.displayMetrics.density).toInt()
    }
}
