package com.nextai.gameoffline.presentation.game

/**
 * Danh mục mã mở khóa tĩnh tách riêng khỏi [GameUnlockHelper] theo chuẩn SRP để giữ mỗi tệp gọn
 * nhẹ, dễ tra cứu và đối chiếu trực tiếp với bảng cấu hình gốc `O0.a`.
 * Dedicated static unlock catalog extracted from [GameUnlockHelper] for SRP maintainability.
 *
 * Lý do dùng cờ `__nextaiUnlocked` cho các game PixiJS/custom dùng `window.clearLocalStorage`:
 * `GameActivity` gọi `unlockGame` ở cả `onPageFinished` (0ms, 500ms, 1500ms) và `Android.gameLoaded()`.
 * Hàm `clearLocalStorage` của các game như `jigsaw_puzzle` gọi thẳng `startLoading()`, nên nếu chạy
 * lặp nhiều lần sẽ nạp trùng asset/canvas; cờ một lần đảm bảo chỉ gọi đúng một lần khi hàm sẵn sàng.
 */
internal object GameUnlockCatalog {

    /**
     * Trả về script JS mở khóa chuyên biệt cho từng game, hoặc `null` nếu dùng cơ chế động C3/C2.
     * Returns the dedicated JS unlock script for [gameName], or `null` to fall back to dynamic unlock.
     */
    fun scriptFor(gameName: String): String? = SPECIFIC_GAME_UNLOCKS[gameName]

    /**
     * Kiểm tra game có cấu hình mở khóa riêng trong danh mục tĩnh hay không.
     * Returns whether [gameName] has a dedicated static unlock entry.
     */
    fun contains(gameName: String): Boolean = SPECIFIC_GAME_UNLOCKS.containsKey(gameName)

    /**
     * Kiểm tra xem `window.clearLocalStorage()` không tham số của game có phải là hàm xóa tiến trình
     * lưu người chơi (thay vì cổng mở khóa) hay không để tránh xóa nhầm dữ liệu mỗi lần mở game.
     * Returns true when the game's argument-less `window.clearLocalStorage()` wipes user save data.
     */
    fun shouldSkipEmptyClearLocalStorage(gameName: String): Boolean {
        return gameName in SAVE_WIPE_CLEAR_LOCAL_STORAGE_GAMES
    }

    private val SAVE_WIPE_CLEAR_LOCAL_STORAGE_GAMES: Set<String> = setOf(
        "mahjong_deluxe",
        "wordly",
        "nonogram"
    )

    private fun c3Unlock(projectKey: String): String {
        return "window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\"$projectKey\"]);"
    }

    private fun onceWindowUnlock(argumentsJs: String): String {
        return """
            (function() {
                if (!window.__nextaiUnlocked && typeof window.clearLocalStorage === 'function') {
                    window.__nextaiUnlocked = true;
                    window.clearLocalStorage($argumentsJs);
                }
            })();
        """.trimIndent()
    }

    /**
     * Dựng payload cấu hình 42 màn ghép hình cho `jigsaw_puzzle` (#123) khớp 100% `O0.a`:
     * `bundle.min.js` yêu cầu đúng `y === 1100 && x === 1900` và bản đồ `height` 42 màn trước khi
     * gọi `qg.startLoading()`. Thiếu payload này game sẽ kẹt vĩnh viễn ở màn hình `0%`.
     */
    private fun buildJigsawPuzzleUnlock(): String {
        val pieceCounts = intArrayOf(
            6, 8, 6, 8, 8, 10, 10, 8, 8, 10, 10, 8, 10, 14,
            10, 8, 8, 10, 14, 8, 14, 10, 14, 8, 8, 10, 14, 10,
            14, 10, 14, 10, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14
        )
        val heightEntries = pieceCounts.indices.joinToString(",") { index ->
            "${index + 1}:{count:${pieceCounts[index]}}"
        }
        return onceWindowUnlock("{y:1100,x:1900,height:{$heightEntries}}")
    }

    private val SOLITAIRE_CLASSIC_SCRIPT = onceWindowUnlock(
        """
            {
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
              y: 0
            }
        """.trimIndent()
    )

    private val SPADES_SCRIPT = onceWindowUnlock(
        """
            {y: 940, x: 1750},
            {deltaPlayers: 0.6, deltaAfterUser: 0.6},
            {
              maxCount: 300,
              trickReward: 10,
              trickPunishment: 10,
              overTrickReward: 1,
              overTrickPunishment: 100,
              nullReward: 100,
              nullPunishment: 100,
              nullDarkReward: 200,
              nullDarkPunishment: 200
            },
            '1.0.0'
        """.trimIndent()
    )

    private val SOLITAIRE_SPIDER_SCRIPT = onceWindowUnlock(
        "{y:1100, x:1900}, " +
            "{dealCards:1.3, openCard:0.1, closeCard:0.1, wrongCard:0.24, " +
            "magnet:0.3, hintDelay:10, winTime:40000}"
    )

    private val COLORING_BOOK_SCRIPT = onceWindowUnlock(
        "{y: 1100, x: 1900, colorButtonDiameter: 150, colorBarHeight: 225, headerHeight: 150}"
    )

    private val SPECIFIC_GAME_UNLOCKS: Map<String, String> = mapOf(
        "solitaire_classic" to SOLITAIRE_CLASSIC_SCRIPT,
        "spades" to SPADES_SCRIPT,
        "solitaire_spider" to SOLITAIRE_SPIDER_SCRIPT,
        "jigsaw_puzzle" to buildJigsawPuzzleUnlock(),
        "color_by_number" to onceWindowUnlock("{y: 940, x: 1750}, { picCount: 48 }"),
        "coloring_book" to COLORING_BOOK_SCRIPT,
        "cryptogram" to onceWindowUnlock("{y:1080, x:1920, value:4294967296}"),
        // Game #40 (Goods Puzzle) và 3 game C3 không có `_localRuntime` cần khóa tĩnh trực tiếp.
        // Game #40 (Goods Puzzle) plus 3 C3 games lacking `_localRuntime` unlocked deterministically.
        "goods_puzzle" to c3Unlock("goods_puzzle1000019201080"),
        "geometry_rash" to c3Unlock("roblo_dash110307201280"),
        "pinball_rush" to c3Unlock("Pinball Rush1.0.0.019201080"),
        "stone_merge" to c3Unlock("Stone Merge1.0.0.11280720"),
        "merge_cards" to c3Unlock("MergeCard140011280720"),
        "zombie_tower_defence" to c3Unlock("ZombieTowerDefense1220110801920"),
        "tiny_crash_fighters" to c3Unlock("tiny_crash_fighters122217201280"),
        "word_search_hidden_2" to c3Unlock("WordSearchHidden2113011280720"),
        "merge_shooter" to c3Unlock("merge_shooter201011280720"),
        "collect_em_all" to c3Unlock("CollectEmAll115011280720"),
        "tanks_battle" to c3Unlock("tanksBattle11401270480"),
        "onet_fish" to c3Unlock("OnetFish112021280720"),
        "block_merge" to c3Unlock("BlockBlast112011280720"),
        "blocks_target" to c3Unlock("blocks_target1000019201080"),
        "block_colors_sort" to c3Unlock("block_colors_sort1000019201080"),
        "color_block" to c3Unlock("color_block100001280720"),
        "farm_mahjong" to c3Unlock("farm_mahjong1000019201080"),
        "knife_hit" to c3Unlock("KnifeHit114011280720"),
        "knife_hit_2" to c3Unlock("KnifeHit114011280720"),
        "find_number" to c3Unlock("FindTheNumber110001280768"),
        "number_tiles" to c3Unlock("NumberTiles131011280720"),
        "merge_bubble" to c3Unlock("MergeBubbleNumber140011280720"),
        "merge_fruits" to c3Unlock("merge_fruits1501419201080"),
        "knife_hit_2pg" to c3Unlock("knife_hit114021280720"),
        "spin_wars_2pg" to c3Unlock("spin_wars113041280720"),
        "memory_cards_2pg" to c3Unlock("memory_cards113021280720"),
        "pool_2pg" to c3Unlock("pool113041280720"),
        "football_2pg" to c3Unlock("foot_ball113021280720"),
        "air_hockey_2pg" to c3Unlock("air_hockey114011280720"),
        "ping_pong_2pg" to c3Unlock("ping_pong115021280720"),
        "traffic_jam_2pg" to c3Unlock("traffic_jam111047201280"),
        "sea_battle_2pg" to c3Unlock("Battle112011280720"),
        "nuts_and_bolts_sort" to c3Unlock("NutsAndBoltsSort116131280720"),
        "shooting_balls" to c3Unlock("Shooting Balls11103854480"),
        "how_to_loot" to c3Unlock("How to loot12101854480"),
        "house_painter" to c3Unlock("house_painter111011280720"),
        "balloons_creator" to c3Unlock("Balloons Creator1.0.0.019201080"),
        "link_2248" to c3Unlock("Link2248132101280715"),
        "block_tetris" to c3Unlock("block_tetris200031280720"),
        "merge_numbers" to c3Unlock("NumberMergePlus121001280720"),
        "dice_merge" to c3Unlock("DiceMerge110111280720"),
        "nuts_and_bolts" to c3Unlock("NutsAndBolts112021280720"),
        "hexadice" to c3Unlock("Hexadice111031280720"),
        "color_maze" to c3Unlock("ColorMaze110011280720"),
        "brick_breaker_retro" to c3Unlock("brick_breaker_retro10003854580"),
        "crazy_fishing" to c3Unlock("crazy_fishing100031280720"),
        "head_soccer" to c3Unlock("head_soccer200017201280"),
        "cap_sort" to c3Unlock("cap_sort1000219201080"),
        "brainrot_merge" to c3Unlock("brainrot_merge1510819201080"),
        "coin_sort" to c3Unlock("coin_sort1121319201080"),
        "relaxing_games" to c3Unlock("relaxing_games100201280720"),
        "sheep_and_sheep" to c3Unlock("sheep_and_sheep1310119201080"),
        "thread_match" to c3Unlock("thread_match1002019201080"),
        "royal_blast" to c3Unlock("royal_blast100201000600"),
        "acro_ball" to c3Unlock("acro_ball114027201280"),
        "balloon" to c3Unlock("balloon113027201280"),
        "tank_battle_2" to c3Unlock("battle113021280720"),
        "billiards" to c3Unlock("billiards112017201280"),
        "box_tower" to c3Unlock("box_tower113027201280"),
        "bubble" to c3Unlock("bubble113017201280"),
        "collide" to c3Unlock("collide113027201280"),
        "correct_football" to c3Unlock("correct_football111027201280"),
        "disc_destroy" to c3Unlock("disc_destroy111017201280"),
        "find_gold" to c3Unlock("find_gold113027201280"),
        "giro_football" to c3Unlock("giro_football113027201280"),
        "golf" to c3Unlock("golf113027201280"),
        "gravity_box" to c3Unlock("gravity_box116027201280"),
        "hat_hands" to c3Unlock("hat_hands113017201280"),
        "jump_jump" to c3Unlock("jump_jump114017201280"),
        "lancerot" to c3Unlock("lancerot113017201280"),
        "pin" to c3Unlock("pin113017201280"),
        "race_rotate" to c3Unlock("race_rotate114027201280"),
        "roll_ball" to c3Unlock("roll_ball113027201280"),
        "top_speed" to c3Unlock("top_speed117027201280"),
        "tube" to c3Unlock("tube113017201280"),
        "volcano" to c3Unlock("volcano113017201280"),
        "clock" to c3Unlock("clock113027201280"),
        "ludo_super" to c3Unlock("ludo105001280720"),
        "physics_boxing" to c3Unlock("physics_boxing102019001600"),
        "pink_and_blue" to c3Unlock("pink_and_blue10101180320"),
        "ragdoll_boxing" to c3Unlock("ragdoll_boxing1020116002600"),
        "head_ball_2026" to c3Unlock("head_ball_2026102017201280"),
        "screw_pin" to c3Unlock("screw_pin1610119201080"),
        "color_cannon" to c3Unlock("color_cannon1010119201080"),
        "solitaire_associations" to c3Unlock("solitaire_associations103411280720"),
        "mr_bullet" to c3Unlock("mr_bullet10031854480"),
        "save_the_doge" to c3Unlock("save_the_doge111031280720"),
        "apple_worm" to c3Unlock("apple_worm150111280720"),
        "trap_path" to c3Unlock("trap_path101017201280"),
        "fruits_match_2" to c3Unlock("fruits_match_2100211600900"),
        "archers_random" to c3Unlock("archers_random100217201280")
    )
}
