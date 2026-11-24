package com.nextai.gameoffline.presentation.gamelist

import android.util.Log
import android.view.ViewConfiguration
import androidx.recyclerview.widget.RecyclerView
import androidx.viewpager2.widget.ViewPager2
import com.nextai.gameoffline.BuildConfig

/**
 * Helper cô lập việc giảm ngưỡng `mTouchSlop` của ViewPager2 để vuốt chuyển danh mục nhạy hơn
 * (theo yêu cầu UX của TASK-021).
 * Isolated helper lowering ViewPager2's internal `mTouchSlop` for responsive category swiping
 * (UX requirement from TASK-021).
 *
 * ADR Note:
 * AndroidX ViewPager2 chưa cung cấp API công khai để tùy chỉnh độ nhạy vuốt ngang.
 * Reflection được cô lập tại một nơi duy nhất với fallback an toàn: nếu AndroidX thay đổi tên
 * trường nội bộ hoặc R8 tối ưu, ứng dụng vẫn chạy bình thường với độ nhạy mặc định.
 */
internal object ViewPagerDragSensitivityHelper {

    private const val TAG = "ViewPagerDragHelper"
    private const val TOUCH_SLOP_SCALE = 0.5f

    /**
     * Giảm ngưỡng kéo ngang của ViewPager2 xuống 50% một cách an toàn.
     * Safely reduces horizontal drag threshold of ViewPager2 by 50%.
     */
    fun applyResponsiveSwipeSensitivity(viewPager: ViewPager2) {
        try {
            val recyclerViewField = ViewPager2::class.java.getDeclaredField("mRecyclerView")
            recyclerViewField.isAccessible = true
            val recyclerView = recyclerViewField.get(viewPager) as? RecyclerView ?: return

            val touchSlopField = RecyclerView::class.java.getDeclaredField("mTouchSlop")
            touchSlopField.isAccessible = true
            val standardTouchSlop = ViewConfiguration.get(viewPager.context).scaledTouchSlop
            val adjustedTouchSlop = (standardTouchSlop * TOUCH_SLOP_SCALE).toInt().coerceAtLeast(1)
            touchSlopField.set(recyclerView, adjustedTouchSlop)
        } catch (error: Exception) {
            if (BuildConfig.DEBUG) {
                Log.w(TAG, "Falling back to default ViewPager2 drag sensitivity", error)
            }
        }
    }
}
