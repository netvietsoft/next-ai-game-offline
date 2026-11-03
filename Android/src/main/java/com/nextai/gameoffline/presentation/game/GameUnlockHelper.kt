package com.nextai.gameoffline.presentation.game

import android.os.Handler
import android.os.Looper
import android.util.Log
import android.webkit.WebView

/**
 * Trình hỗ trợ mở khóa và kích hoạt trò chơi HTML5 / Construct 2 / Construct 3 / Phaser.
 * Helper to unlock and activate HTML5 / Construct 2 / Construct 3 / Phaser mini-games.
 *
 * Lý do cốt lõi (Root Cause):
 * Các game của 720 Media có cơ chế kiểm tra bản quyền nội bộ thông qua hàm `clearLocalStorage`.
 * Nếu Native Shell không gọi `clearLocalStorage` kèm theo mã khóa dự án, biến `Check` trong game
 * sẽ luôn là `false`, dẫn tới việc game ẩn nút Play, vô hiệu hóa chạm/click, hoặc dừng ở màn hình chờ.
 *
 * 720 Media games enforce internal validation via `clearLocalStorage`.
 * If the Native Shell does not invoke `clearLocalStorage` with the project unlock key,
 * the internal `Check` variable remains `false`, causing the game to hide Play buttons,
 * ignore touches/clicks, or stay frozen on the splash screen.
 */
object GameUnlockHelper {

    private const val TAG = "NextAIGameUnlock"
    private val mainHandler = Handler(Looper.getMainLooper())

    /**
     * Bảng ánh xạ mã mở khóa cho các game có cấu hình riêng (được trích xuất từ O0.a gốc).
     * Mapping table of unlock scripts for specific games (extracted from original O0.a).
     */
    private val SPECIFIC_GAME_UNLOCKS = mapOf(
        "solitaire_classic" to """
            window.clearLocalStorage && window.clearLocalStorage({
              dealCards: 1.3,
              openCard: 0.1,
              closeCard: 0.1,
              wrongCard: 0.24,
              magnet: 0.3,
              delaySuitEffect: 0.2,
              openCardFromDeck: 0.32,
              showPopup: 0.3,
              hidePopup: 0.3,
              startDelay: 0,
              hintDelay: 10,
              autoCompleteTick: 0.2,
              autoCompleteTickTack: 0.1,
              winTime: 40000,
              x: 0,
              y: 0,
            });
        """.trimIndent(),
        "merge_cards" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"MergeCard134011280720\"]);",
        "zombie_tower_defence" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"ZombieTowerDefense1220110801920\"]);",
        "tiny_crash_fighters" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"tiny_crash_fighters122217201280\"]);",
        "word_search_hidden_2" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"WordSearchHidden2113011280720\"]);",
        "merge_shooter" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"merge_shooter201011280720\"]);",
        "collect_em_all" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"CollectEmAll115011280720\"]);",
        "tanks_battle" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"tanksBattle11401270480\"]);",
        "onet_fish" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"OnetFish112021280720\"]);",
        "block_merge" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"BlockBlast112011280720\"]);",
        "blocks_target" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"blocks_target1000019201080\"]);",
        "block_colors_sort" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"block_colors_sort1000019201080\"]);",
        "color_block" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"color_block100001280720\"]);",
        "farm_mahjong" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"farm_mahjong1000019201080\"]);",
        "knife_hit" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"KnifeHit114011280720\"]);",
        "knife_hit_2" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"KnifeHit114011280720\"]);",
        "find_number" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"FindTheNumber110001280768\"]);",
        "number_tiles" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"NumberTiles1.3.0.21280720\"]);",
        "merge_bubble" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"MergeBubbleNumber140011280720\"]);",
        "merge_fruits" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"merge_fruits1501419201080\"]);",
        "spades" to """
            window.clearLocalStorage && window.clearLocalStorage(
                {y: 940, x: 1750},
                {deltaPlayers: 0.6, deltaAfterUser: 0.6},
                {maxCount: 300, trickReward: 10, trickPunishment: 10, overTrickReward: 1, overTrickPunishment: 100, nullReward: 100, nullPunishment: 100, nullDarkReward: 200, nullDarkPunishment: 200},
                '1.0.0'
            );
        """.trimIndent(),
        "solitaire_spider" to "window.clearLocalStorage && window.clearLocalStorage({y:1100, x:1900}, {dealCards:1.3, openCard:0.1, closeCard:0.1, wrongCard:0.24, magnet:0.3, hintDelay:10, winTime:40000});",
        "knife_hit_2pg" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"KnifeHit111021280720\"]);",
        "spin_wars_2pg" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"SpinWars111031280720\"]);",
        "memory_cards_2pg" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"MemoryCards111021280720\"]);",
        "pool_2pg" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"Pool111031280720\"]);",
        "football_2pg" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"Football111021280720\"]);",
        "air_hockey_2pg" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"AirHockey112021280720\"]);",
        "ping_pong_2pg" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"PingPong111021280720\"]);",
        "traffic_jam_2pg" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"TrafficJam110047201280\"]);",
        "sea_battle_2pg" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"Battle112011280720\"]);",
        "color_by_number" to "window.clearLocalStorage && window.clearLocalStorage({y: 940, x: 1750}, { picCount: 48 });",
        "nuts_and_bolts_sort" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"NutsAndBoltsSort116131280720\"]);",
        "shooting_balls" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"Shooting Balls11103854480\"]);",
        "how_to_loot" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"How to loot12101854480\"]);",
        "house_painter" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"house_painter111011280720\"]);",
        "balloons_creator" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"Balloons Creator1.0.0.019201080\"]);",
        "link_2248" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"Link2248132101280715\"]);",
        "block_tetris" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"block_tetris200031280720\"]);",
        "merge_numbers" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"NumberMergePlus121001280720\"]);",
        "dice_merge" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"DiceMerge110111280720\"]);",
        "nuts_and_bolts" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"NutsAndBolts112021280720\"]);",
        "hexadice" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"Hexadice111031280720\"]);",
        "color_maze" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"ColorMaze110011280720\"]);",
        "brick_breaker_retro" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"brick_breaker_retro10003854580\"]);",
        "crazy_fishing" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"crazy_fishing100031280720\"]);",
        "head_soccer" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"head_soccer200017201280\"]);",
        "coloring_book" to "window.clearLocalStorage && window.clearLocalStorage({y: 1100, x: 1900, colorButtonDiameter: 150, colorBarHeight: 225, headerHeight: 150});",
        "cap_sort" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"cap_sort1000219201080\"]);",
        "brainrot_merge" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"brainrot_merge1510819201080\"]);",
        "cryptogram" to "window.clearLocalStorage && window.clearLocalStorage({y:1080, x:1920, value:4294967296});",
        "coin_sort" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"coin_sort1121319201080\"]);",
        "relaxing_games" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"relaxing_games100201280720\"]);",
        "sheep_and_sheep" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"sheep_and_sheep1310119201080\"]);",
        "thread_match" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"thread_match1002019201080\"]);",
        "royal_blast" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"royal_blast100201000600\"]);",
        "acro_ball" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"acro_ball114027201280\"]);",
        "balloon" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"balloon113027201280\"]);",
        "tank_battle_2" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"battle113021280720\"]);",
        "billiards" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"billiards112017201280\"]);",
        "box_tower" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"box_tower113027201280\"]);",
        "bubble" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"bubble113017201280\"]);",
        "collide" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"collide113027201280\"]);",
        "correct_football" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"correct_football111027201280\"]);",
        "disc_destroy" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"disc_destroy111017201280\"]);",
        "find_gold" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"find_gold113027201280\"]);",
        "giro_football" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"giro_football113027201280\"]);",
        "golf" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"golf113027201280\"]);",
        "gravity_box" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"gravity_box116027201280\"]);",
        "hat_hands" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"hat_hands113017201280\"]);",
        "jump_jump" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"jump_jump114017201280\"]);",
        "lancerot" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"lancerot113017201280\"]);",
        "pin" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"pin113017201280\"]);",
        "race_rotate" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"race_rotate114027201280\"]);",
        "roll_ball" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"roll_ball113027201280\"]);",
        "top_speed" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"top_speed117027201280\"]);",
        "tube" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"tube113017201280\"]);",
        "volcano" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"volcano113017201280\"]);",
        "clock" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"clock113027201280\"]);",
        "ludo_super" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"ludo105001280720\"]);",
        "physics_boxing" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"physics_boxing102019001600\"]);",
        "pink_and_blue" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"pink_and_blue10101180320\"]);",
        "ragdoll_boxing" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"ragdoll_boxing1020116002600\"]);",
        "head_ball_2026" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"head_ball_2026102017201280\"]);",
        "screw_pin" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"screw_pin1610119201080\"]);",
        "color_cannon" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"color_cannon1211119201080\"]);",
        "solitaire_associations" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"solitaire_associations103411280720\"]);",
        "mr_bullet" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"mr_bullet10031854480\"]);",
        "save_the_doge" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"save_the_doge111031280720\"]);",
        "apple_worm" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"apple_worm150111280720\"]);",
        "trap_path" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"trap_path101017201280\"]);",
        "fruits_match_2" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"fruits_match_2100211600900\"]);",
        "archers_random" to "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"archers_random100217201280\"]);"
    )

    /**
     * Mở khóa trò chơi một cách an toàn và toàn diện.
     * Safely and comprehensively unlock the mini-game.
     */
    fun unlockGame(webView: WebView?, gameName: String) {
        if (webView == null) return

        mainHandler.post {
            try {
                // 1. Nếu game có mã mở khóa riêng biệt trong danh mục O0.a, thực thi ngay
                // If game has a specific unlock script from O0.a, execute it immediately
                val specificScript = SPECIFIC_GAME_UNLOCKS[gameName]
                if (specificScript != null) {
                    Log.i(TAG, "[$gameName] Đang chạy mã mở khóa riêng biệt từ danh mục O0.a...")
                    webView.evaluateJavascript(specificScript, null)
                } else {
                    // 2. Với các game Construct 3 không nằm trong danh mục trên:
                    // Trích xuất khóa động theo đúng giải thuật gốc từ y8/t0.java & y8/r0.java
                    // For Construct 3 games not in specific list:
                    // Extract dynamic key exactly per decompiled y8/t0.java & y8/r0.java
                    val c3KeyExpr = "c3_runtimeInterface._localRuntime._projectName+c3_runtimeInterface._localRuntime._projectVersion+c3_runtimeInterface._localRuntime._originalViewportHeight+c3_runtimeInterface._localRuntime._originalViewportWidth"
                    webView.evaluateJavascript(c3KeyExpr) { result ->
                        val cleanKey = result?.replace("\"", "")?.trim()
                        if (!cleanKey.isNullOrEmpty() && cleanKey != "null" && cleanKey != "undefined") {
                            Log.i(TAG, "[$gameName] Đã trích xuất Construct 3 dynamic key: $cleanKey")
                            webView.evaluateJavascript("c3_callFunction(\"clearLocalStorage\", [\"$cleanKey\"]);", null)
                        }
                    }
                }

                // 3. Fallback mở khóa cho Construct 2 & các game HTML5 khác
                // Fallback unlock for Construct 2 & other HTML5 engines
                val generalUnlockJs = """
                    (function() {
                        try {
                            if (typeof c2_callFunction === 'function') {
                                var c2Key = (window.cr_getC2Runtime && window.cr_getC2Runtime().projectName) || "";
                                if (c2Key) {
                                    c2_callFunction("clearLocalStorage", [c2Key]);
                                }
                                c2_callFunction("setAudioEnabled", [true]);
                            }
                            if (typeof window.clearLocalStorage === 'function') {
                                try { window.clearLocalStorage(); } catch(e) {}
                            }
                            if (typeof c3_callFunction === 'function') {
                                try {
                                    c3_callFunction("setAudioEnabled", [true]);
                                    c3_callFunction("setAdsTimer", [90]);
                                    c3_callFunction("setReadyToShowAds");
                                } catch(e) {}
                            }
                            window.focus();
                            if (document.body) {
                                document.body.focus();
                            }
                        } catch(err) {
                            console.warn("[NextAI] Lỗi mở khóa fallback: " + err);
                        }
                    })();
                """.trimIndent()

                webView.evaluateJavascript(generalUnlockJs, null)
            } catch (e: Exception) {
                Log.e(TAG, "[$gameName] Exception in unlockGame", e)
            }
        }
    }
}
