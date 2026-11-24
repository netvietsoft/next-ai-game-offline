package com.nextai.gameoffline.presentation.gamelist

import android.os.Handler
import android.os.Looper
import java.util.Locale

/**
 * Bộ trì hoãn (debounce 800ms) ghi nhận sự kiện tìm kiếm `game_search` lên GA4:
 * chỉ gửi sau khi người chơi ngừng gõ 800ms, độ dài chuỗi >= 2 ký tự, cắt tối đa 40 ký tự,
 * chuẩn hóa chữ thường và loại bỏ chuỗi có dạng email/số điện thoại để không thu thập PII.
 * 800ms search telemetry debouncer sanitizing queries before logging `game_search` to GA4.
 */
internal class SearchAnalyticsDebouncer(
    private val onEmitSearch: (query: String, resultCount: Int) -> Unit,
    private val delayMs: Long = DEBOUNCE_DELAY_MS
) {

    private val handler = Handler(Looper.getMainLooper())
    private var pendingRunnable: Runnable? = null
    private var lastLoggedQuery: String? = null

    /** Lên lịch ghi nhận từ khóa tìm kiếm sau khi người dùng dừng gõ [delayMs]. */
    fun onQueryChanged(rawQuery: String, resultCount: Int) {
        cancel()
        val sanitized = sanitizeQuery(rawQuery) ?: return
        if (sanitized == lastLoggedQuery) {
            return
        }
        val task = Runnable {
            pendingRunnable = null
            lastLoggedQuery = sanitized
            onEmitSearch(sanitized, resultCount)
        }
        pendingRunnable = task
        handler.postDelayed(task, delayMs)
    }

    /** Hủy mọi hẹn giờ đang chờ khi đóng Activity để tránh rò rỉ tham chiếu. */
    fun cancel() {
        pendingRunnable?.let(handler::removeCallbacks)
        pendingRunnable = null
    }

    companion object {
        const val DEBOUNCE_DELAY_MS = 800L
        const val MIN_QUERY_LENGTH = 2
        const val MAX_QUERY_LENGTH = 40
        private val CONTROL_CHARS = Regex("[\\r\\n\\t]+")
        private val MULTI_SPACE = Regex("\\s+")
        private val DIGIT_RUN = Regex("\\d{7,}")

        /**
         * Làm sạch từ khóa tìm kiếm (thuần Kotlin, dễ kiểm thử JVM): trả `null` nếu quá ngắn
         * hoặc có dấu hiệu PII (chứa `@` như email hoặc chuỗi >= 7 chữ số như SĐT).
         * Sanitizes a raw search string; returns `null` if too short or likely PII.
         */
        fun sanitizeQuery(rawQuery: String): String? {
            val cleaned = rawQuery
                .replace(CONTROL_CHARS, " ")
                .replace(MULTI_SPACE, " ")
                .trim()
                .lowercase(Locale.US)
            if (cleaned.length < MIN_QUERY_LENGTH) {
                return null
            }
            if ('@' in cleaned || DIGIT_RUN.containsMatchIn(cleaned)) {
                return null
            }
            return cleaned.take(MAX_QUERY_LENGTH)
        }
    }
}
