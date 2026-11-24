package com.nextai.gameoffline.presentation.gamelist

import android.annotation.SuppressLint
import android.content.Context
import android.view.GestureDetector
import android.view.MotionEvent
import androidx.viewpager2.widget.ViewPager2
import com.google.android.material.tabs.TabLayout
import kotlin.math.abs

/**
 * Hỗ trợ vuốt ngang trực tiếp trên thanh [TabLayout] để chuyển danh mục game trên [ViewPager2].
 * Attaches horizontal fling detection directly onto [TabLayout] for quick category switching.
 */
internal object TabSwipeGestureHelper {

    private const val MIN_SWIPE_DISTANCE = 50
    private const val MIN_SWIPE_VELOCITY = 80

    @SuppressLint("ClickableViewAccessibility")
    fun attach(
        context: Context,
        tabLayout: TabLayout,
        viewPager: ViewPager2,
        pageCount: Int
    ) {
        val detector = GestureDetector(context, object : GestureDetector.SimpleOnGestureListener() {
            override fun onFling(
                e1: MotionEvent?,
                e2: MotionEvent,
                velocityX: Float,
                velocityY: Float
            ): Boolean {
                if (e1 == null) {
                    return false
                }
                val diffX = e2.x - e1.x
                val diffY = e2.y - e1.y
                val isHorizontalSwipe = abs(diffX) > abs(diffY) &&
                    abs(diffX) > MIN_SWIPE_DISTANCE &&
                    abs(velocityX) > MIN_SWIPE_VELOCITY
                if (!isHorizontalSwipe) {
                    return false
                }
                val targetIndex = if (diffX < 0) {
                    viewPager.currentItem + 1
                } else {
                    viewPager.currentItem - 1
                }
                if (targetIndex in 0 until pageCount) {
                    viewPager.setCurrentItem(targetIndex, true)
                    return true
                }
                return false
            }
        })

        tabLayout.setOnTouchListener { _, event ->
            detector.onTouchEvent(event)
            false
        }
    }
}
