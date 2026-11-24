package com.nextai.gameoffline.ads

import android.os.Handler
import android.os.Looper

/**
 * Giao diện trừu tượng hóa lập lịch trên Main Thread cho tầng quảng cáo,
 * giúp unit-test toàn bộ retry backoff và cửa sổ preload 3 giây ngay trên JVM.
 * Main-thread scheduling abstraction enabling deterministic JVM unit tests for
 * retry backoff and the 3-second deferred preload window.
 */
internal interface AdScheduler {

    /** Thực thi ngay nếu đang ở Main Thread, ngược lại đẩy vào hàng đợi Main. */
    fun runOnMain(action: () -> Unit)

    /** Lập lịch chạy `task` sau `delayMs` mili-giây trên Main Thread. */
    fun postDelayed(delayMs: Long, task: Runnable)

    /** Hủy `task` đang chờ trong hàng đợi. */
    fun cancel(task: Runnable)
}

/**
 * Cài đặt mặc định chạy trên `Looper.getMainLooper()` trong ứng dụng Android.
 * Production `AdScheduler` backed by Android's main thread `Handler`.
 */
internal object MainHandlerAdScheduler : AdScheduler {

    private val mainHandler = Handler(Looper.getMainLooper())

    override fun runOnMain(action: () -> Unit) {
        if (Looper.myLooper() == Looper.getMainLooper()) {
            action()
        } else {
            mainHandler.post { action() }
        }
    }

    override fun postDelayed(delayMs: Long, task: Runnable) {
        mainHandler.postDelayed(task, delayMs.coerceAtLeast(0L))
    }

    override fun cancel(task: Runnable) {
        mainHandler.removeCallbacks(task)
    }
}
