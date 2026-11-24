package com.nextai.gameoffline.presentation.gamelist

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

/**
 * Kiểm thử chuẩn hóa & lọc PII cho từ khóa tìm kiếm `game_search` trước khi gửi lên GA4.
 * Unit tests verifying query sanitization and PII filtering for `game_search` telemetry.
 */
class SearchAnalyticsDebouncerTest {

    @Test
    fun rejectsBlankAndSingleCharQueries() {
        assertNull(SearchAnalyticsDebouncer.sanitizeQuery(""))
        assertNull(SearchAnalyticsDebouncer.sanitizeQuery("   "))
        assertNull(SearchAnalyticsDebouncer.sanitizeQuery("a"))
        assertNull(SearchAnalyticsDebouncer.sanitizeQuery("  x \n"))
    }

    @Test
    fun normalizesWhitespaceLowercaseAndCapsAt40Chars() {
        assertEquals(
            "block blast",
            SearchAnalyticsDebouncer.sanitizeQuery("  Block   BLAST \t ")
        )
        val longInput = "super mega ultra hyper galaxy offline puzzle adventure game"
        val sanitized = SearchAnalyticsDebouncer.sanitizeQuery(longInput)
        assertEquals(SearchAnalyticsDebouncer.MAX_QUERY_LENGTH, sanitized?.length)
        assertEquals(longInput.take(40), sanitized)
    }

    @Test
    fun dropsEmailAndLongPhoneNumberPatternsAsPii() {
        assertNull(SearchAnalyticsDebouncer.sanitizeQuery("player@example.com"))
        assertNull(SearchAnalyticsDebouncer.sanitizeQuery("call 0912345678"))
        assertEquals("2048", SearchAnalyticsDebouncer.sanitizeQuery("2048"))
        assertEquals("8 ball pool", SearchAnalyticsDebouncer.sanitizeQuery("8 Ball Pool"))
    }
}
