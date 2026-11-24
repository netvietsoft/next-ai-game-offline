package com.nextai.gameoffline.presentation.game

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Kiểm thử [GameResourcePatcher] đảm bảo chỉ vá đúng `js/plugins.js` của 5 game R2 bị khóa hạn
 * dùng `cerify_key` và giữ nguyên toàn bộ các game/tệp khác.
 * Unit tests for [GameResourcePatcher] verifying targeted expiry-check bypass on `js/plugins.js`.
 */
class GameResourcePatcherTest {

    @Test
    fun needsTimebombBypass_matchesOnlyFiveExpiredPluginGames() {
        val affectedGames = listOf(
            "memory_chess",
            "color_link",
            "dig_dig_clicker",
            "one_stroke",
            "slide_roll"
        )
        for (game in affectedGames) {
            assertTrue(
                "Expected bypass for $game",
                GameResourcePatcher.needsTimebombBypass(game, "downloaded_games/$game/js/plugins.js")
            )
            assertTrue(
                "Expected root-relative bypass for $game",
                GameResourcePatcher.needsTimebombBypass(game, "js/plugins.js")
            )
            assertFalse(
                "Must not patch non-plugins JS for $game",
                GameResourcePatcher.needsTimebombBypass(game, "downloaded_games/$game/js/game.js")
            )
        }
    }

    @Test
    fun needsTimebombBypass_ignoresUnaffectedGames() {
        assertFalse(GameResourcePatcher.needsTimebombBypass("knife_hit", "assets/games/knife_hit/js/plugins.js"))
        assertFalse(GameResourcePatcher.needsTimebombBypass("speed_racer", "downloaded_games/speed_racer/js/plugins.js"))
        assertFalse(GameResourcePatcher.needsTimebombBypass("sudoku", "js/plugins.js"))
    }

    @Test
    fun patchPluginsScript_preservesOriginalCodeAndOverridesCheckVerifyData() {
        val original = "function checkVerifyData(){return true;}function addCommas(v){return v;}"
        val patched = GameResourcePatcher.patchPluginsScript(original)
        assertTrue(patched.startsWith(original))
        assertTrue(patched.contains("function checkVerifyData(){return false;}"))
    }
}
