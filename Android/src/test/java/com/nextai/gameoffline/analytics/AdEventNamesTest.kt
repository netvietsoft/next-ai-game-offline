package com.nextai.gameoffline.analytics

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** Kiểm tra tên GA4 ổn định cho đủ năm định dạng / Check stable GA4 names for all five formats. */
class AdEventNamesTest {
    @Test fun returnsTwentyFiveUniqueValidGa4Names() {
        val types = listOf("BANNER", "INTERSTITIAL", "APP_OPEN", "REWARDED", "NATIVE")
        val stages = listOf("load", "loaded", "load_fail", "showed", "click")
        val names = types.flatMap { type -> stages.map { AdEventNames.forStage(type, it)!! } }
        assertEquals(25, names.toSet().size)
        assertTrue(names.all { it.length <= 40 && it.matches(Regex("[a-z][a-z0-9_]*")) })
        assertEquals("app_open_showed", AdEventNames.forStage("APP_OPEN", "showed"))
        assertEquals("reward_load_fail", AdEventNames.forStage("REWARDED", "load_fail"))
        assertEquals("native_load", AdEventNames.forStage("NATIVE", "load"))
        assertEquals("native_loaded", AdEventNames.forStage("NATIVE", "loaded"))
        assertEquals("native_load_fail", AdEventNames.forStage("NATIVE", "load_fail"))
        assertEquals("native_showed", AdEventNames.forStage("NATIVE", "showed"))
        assertEquals("native_click", AdEventNames.forStage("NATIVE", "click"))
    }

    @Test fun rejectsUnknownFormatAndStage() {
        assertNull(AdEventNames.forStage("MREC", "load"))
        assertNull(AdEventNames.forStage("BANNER", "rewarded"))
        assertNull(AdEventNames.forStage("NATIVE", "rewarded"))
    }
}
