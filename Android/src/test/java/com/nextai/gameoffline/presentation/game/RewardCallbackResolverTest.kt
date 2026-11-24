package com.nextai.gameoffline.presentation.game

import org.junit.Assert.*
import org.junit.Test

/** Kiểm thử callback thưởng được kiểm duyệt / Tests audited rewarded callbacks. */
class RewardCallbackResolverTest {
    @Test fun supportsKnownRewardCallbacks() {
        assertNotNull(RewardCallbackResolver.resolve("bee", "c3_callFunction(\"GiveRewarded\")"))
        assertNotNull(RewardCallbackResolver.resolve("pao_pao", "game.scene.getScene('game').add_hint();"))
        assertNotNull(RewardCallbackResolver.resolve("cryptogram", "window.RewardedComplete(true)"))
        assertNotNull(RewardCallbackResolver.resolve("build_land", "window.__rewardedCallbacks && window.__rewardedCallbacks['cb_123_456'] && window.__rewardedCallbacks['cb_123_456']();"))
    }

    @Test fun rejectsUnexpectedScriptsAndCrossGameCallbacks() {
        assertNull(RewardCallbackResolver.resolve("bee", "c3_callFunction(\"GiveRewarded\");alert(1)"))
        assertNull(RewardCallbackResolver.resolve("pao_pao", "c3_callFunction(\"GiveRewarded\")"))
        assertNull(RewardCallbackResolver.resolve("build_land", "window.__rewardedCallbacks && window.__rewardedCallbacks['cb_123_456'] && window.__rewardedCallbacks['cb_123_457']();"))
    }

    @Test fun supportsUnlockedBundledAndR2Construct3RewardedGames() {
        // 10 game Bundled gửi chuỗi có khoảng trắng đầu ` c3_callFunction("RewardedComplete")`
        val bundledC3Games = listOf(
            "apple_worm", "ball_escape", "block_connect", "block_tetris", "knife_hit",
            "knife_hit_2", "nuts_and_bolts_sort", "shooting_balls", "solitaire_associations", "trap_path"
        )
        for (game in bundledC3Games) {
            val resolved = RewardCallbackResolver.resolve(game, " c3_callFunction(\"RewardedComplete\")")
            assertEquals("window.c3_callFunction && window.c3_callFunction('RewardedComplete');", resolved)
        }

        // Các game R2 nhiều nút Rewarded & biến thể đặc biệt
        assertEquals(
            "window.c3_callFunction && window.c3_callFunction('RewardedDoubleCoin');",
            RewardCallbackResolver.resolve("sandy_balls", " c3_callFunction(\"RewardedDoubleCoin\")")
        )
        assertEquals(
            "window.c3_callFunction && window.c3_callFunction('RewardedCompleteMagnet');",
            RewardCallbackResolver.resolve("mahjong_solitaire", " c3_callFunction(\"RewardedCompleteMagnet\")")
        )
        assertEquals(
            "window.c3_callFunction && window.c3_callFunction('RewardedComplete2');",
            RewardCallbackResolver.resolve("candy_match_saga_2", "c3_callFunction(\"RewardedComplete2\")")
        )
        assertEquals(
            "window.c3_callFunction && window.c3_callFunction('ShowRewardedVideo');",
            RewardCallbackResolver.resolve("brainrot_merge", " c3_callFunction(\"ShowRewardedVideo\")")
        )
        assertEquals(
            "window.c3_callFunction && window.c3_callFunction('RewardedCompleted');",
            RewardCallbackResolver.resolve("impostor_red", " c3_callFunction(\"RewardedComplete\")")
        )

        // Từ chối game chưa kiểm duyệt hoặc tên hàm lạ
        assertNull(RewardCallbackResolver.resolve("ludo", "c3_callFunction(\"RewardedComplete\")"))
        assertNull(RewardCallbackResolver.resolve("sandy_balls", "c3_callFunction(\"UnknownFn\")"))
    }

    /**
     * Xác minh danh sách 71 game hỗ trợ Rewarded dùng cho lazy-preload `reward_load`.
     * Verifies the 71-game Rewarded allowlist used to gate lazy `reward_load` preloading.
     */
    @Test fun supportsRewarded_matchesExact71VerifiedGamesForLazyPreload() {
        assertEquals(71, RewardCallbackResolver.SUPPORTED_REWARDED_GAMES.size)

        val expectedSupported = listOf(
            "apple_worm", "knife_hit", "arcane_blocks", "sandy_balls", "mahjong_solitaire",
            "bee", "brainrot_merge", "impostor_red", "pao_pao", "cryptogram",
            "color_by_number", "build_land"
        )
        for (game in expectedSupported) {
            assertTrue("Expected Rewarded support for $game", RewardCallbackResolver.supportsRewarded(game))
        }

        val expectedUnsupported = listOf(
            "ludo", "pool_8_pro", "dominoes", "block_blast", "tap_away_3D", "abalone"
        )
        for (game in expectedUnsupported) {
            assertFalse("Expected no Rewarded preload for $game", RewardCallbackResolver.supportsRewarded(game))
        }
    }
}
