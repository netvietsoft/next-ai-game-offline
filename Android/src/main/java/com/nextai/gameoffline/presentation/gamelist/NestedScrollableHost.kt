package com.nextai.gameoffline.presentation.gamelist

import android.content.Context
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import android.widget.FrameLayout
import androidx.viewpager2.widget.ViewPager2
import kotlin.math.absoluteValue

/**
 * Layout tuỳ chỉnh điều phối cử chỉ vuốt giữa ViewPager2 (chuyển tab ngang) và RecyclerView (cuộn dọc).
 * Custom layout coordinating gestures between ViewPager2 (horizontal tab swipe) and child RecyclerView (vertical scroll).
 *
 * Cho phép người dùng vuốt sang trái/phải mượt mà ở bất kỳ vị trí nào trên màn hình để tự động chuyển danh mục,
 * đồng thời vẫn đảm bảo cuộn dọc xem danh sách game tự nhiên không bị giật lag.
 *
 * Allows users to smoothly swipe left/right anywhere on the screen to automatically switch categories,
 * while ensuring natural, smooth vertical scrolling to browse the game catalog.
 */
class NestedScrollableHost @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : FrameLayout(context, attrs) {

    private val touchSlop: Int = ViewConfiguration.get(context).scaledTouchSlop
    private var initialX = 0f
    private var initialY = 0f
    private var isHorizontalSwipeDetermined = false

    private val parentViewPager: ViewPager2?
        get() {
            var v: View? = parent as? View
            while (v != null && v !is ViewPager2) {
                v = v.parent as? View
            }
            return v as? ViewPager2
        }

    override fun onInterceptTouchEvent(e: MotionEvent): Boolean {
        handleInterceptTouchEvent(e)
        return super.onInterceptTouchEvent(e)
    }

    private fun handleInterceptTouchEvent(e: MotionEvent) {
        val parentVp = parentViewPager ?: return
        if (parentVp.orientation != ViewPager2.ORIENTATION_HORIZONTAL) return

        when (e.actionMasked) {
            MotionEvent.ACTION_DOWN -> {
                initialX = e.x
                initialY = e.y
                isHorizontalSwipeDetermined = false
                // Không disallow ViewPager2 lúc DOWN, để ViewPager2 có thể nhận sự kiện chạm
                // Do NOT disallow ViewPager2 on DOWN so ViewPager2 can register the gesture
                parent.requestDisallowInterceptTouchEvent(false)
            }
            MotionEvent.ACTION_MOVE -> {
                val dx = e.x - initialX
                val dy = e.y - initialY
                val absDx = dx.absoluteValue
                val absDy = dy.absoluteValue

                // Kiểm tra khi vượt ngưỡng chạm / Check when gesture passes touch slop
                if (absDx > touchSlop || absDy > touchSlop) {
                    if (absDx > absDy) {
                        // Người dùng đang vuốt ngang (trái/phải):
                        // Nhường hoàn toàn quyền can thiệp cho ViewPager2 để tự động chuyển tab
                        // User is swiping horizontally (left/right):
                        // Allow ViewPager2 to intercept and switch tabs automatically
                        isHorizontalSwipeDetermined = true
                        parent.requestDisallowInterceptTouchEvent(false)
                    } else if (!isHorizontalSwipeDetermined) {
                        // Người dùng đang cuộn dọc: Khóa ViewPager2 để RecyclerView con cuộn mượt mà
                        // User is scrolling vertically: Lock ViewPager2 so child RecyclerView scrolls smoothly
                        parent.requestDisallowInterceptTouchEvent(true)
                    }
                }
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                isHorizontalSwipeDetermined = false
                parent.requestDisallowInterceptTouchEvent(false)
            }
        }
    }
}
