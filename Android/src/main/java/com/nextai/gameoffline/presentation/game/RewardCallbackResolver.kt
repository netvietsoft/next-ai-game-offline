package com.nextai.gameoffline.presentation.game

/**
 * Chỉ ánh xạ các callback Rewarded Video đã kiểm chứng tĩnh trong mã nguồn game (allowlist cố định),
 * tuyệt đối không thực thi mã JavaScript tùy ý từ WebView.
 * Maps statically audited rewarded callbacks via a strict allowlist; never executes arbitrary JS.
 */
internal object RewardCallbackResolver {

    /**
     * 49 game Construct 3 (10 bundled + 39 R2) dùng chuẩn hàm `c3_callFunction("RewardedComplete")`.
     * Verified Construct 3 games invoking a non-empty `RewardedComplete` reward function.
     */
    private val STANDARD_C3_REWARDED_COMPLETE_GAMES = setOf(
        // 10 game Bundled (đóng gói sẵn trong APK)
        "apple_worm",
        "ball_escape",
        "block_connect",
        "block_tetris",
        "knife_hit",
        "knife_hit_2",
        "nuts_and_bolts_sort",
        "shooting_balls",
        "solitaire_associations",
        "trap_path",
        // 39 game R2 đã xác minh thân hàm RewardedComplete trong data.json
        "arcane_blocks",
        "archers_random",
        "block_builder",
        "block_matcher",
        "bus_jam_escape",
        "car_traffic_puzzle",
        "coin_sort",
        "color_nuts",
        "doge_blocks",
        "doge_love",
        "draw_to_pee",
        "draw_to_smash",
        "food_jam",
        "fruits_match_2",
        "juice_merge",
        "kingdom_survivor",
        "knit_bear",
        "knit_rescue",
        "marble_legends",
        "match_emoji",
        "meow_merge",
        "mr_bullet",
        "nuts_and_bolts",
        "onet_fish_2",
        "save_the_doge",
        "screw_pin",
        "sheep_and_sheep",
        "sleeping_animal",
        "slice_it_up",
        "slide_block_puzzle",
        "summer_maze",
        "switch_off",
        "tap_arrow_away",
        "tap_away",
        "ten_master",
        "theos_time_puzzle",
        "tower_war",
        "traffic_parking",
        "zig_zag_warp"
    )

    /** 6 game C3 gốc dùng `GiveRewarded` / Legacy Construct 3 games using `GiveRewarded`. */
    private val C3_GIVE_REWARDED_GAMES = setOf(
        "bee",
        "yellow_dot",
        "golf_pin",
        "cowboy_shoot",
        "jacko_gunner",
        "tile_master_match"
    )

    /** 3 game Merge dùng hàm nhận thưởng `ShowRewardedVideo` đã xác minh thân hàm lưu/thưởng. */
    private val C3_MERGE_REWARDED_GAMES = setOf(
        "brainrot_merge",
        "labubu_merge",
        "merge_fruits"
    )

    /** Các game C3 có nhiều nút Rewarded hoặc tên hàm riêng biệt / Custom multi-button C3 games. */
    private val CUSTOM_C3_FUNCTIONS: Map<String, Set<String>> = mapOf(
        "water_sort" to setOf("watchAdsAdsGlassComplete"),
        "solitaire_tripeaks" to setOf("Rewarded_Completed_Money", "Rewarded_Completed_SpinWheel"),
        "candy_match_saga_2" to setOf("RewardedComplete", "RewardedComplete2"),
        "unpuzzle_master" to setOf("RewardedComplete", "RewardedComplete2"),
        "mahjong_solitaire" to setOf(
            "RewardedCompleteMagnet",
            "RewardedCompleteFire",
            "RewardedCompleteFlash",
            "RewardedCompleteShuffle"
        ),
        "sandy_balls" to setOf(
            "RewardedCompleteSkip",
            "RewardedDoubleCoin",
            "RewardedAddCoin",
            "RewardedClaimCar",
            "RewardedClaimKey"
        )
    )

    private const val GAME_IMPOSTOR_RED = "impostor_red"
    private const val GAME_PAO_PAO = "pao_pao"
    private const val GAME_COLOR_BY_NUMBER = "color_by_number"
    private const val GAME_BUILD_LAND = "build_land"

    private val WINDOW_REWARDED_GAMES = setOf("cryptogram", "jigsaw_puzzle", "coloring_book")
    private val PAO_PAO_METHODS = listOf("add_hint", "add_shuffle", "shuffle_popup")
    private val COLOR_BY_NUMBER_REGEX = Regex("window\\.RewardedComplete\\(([0-9])\\)")
    private val BUILD_LAND_REGEX = Regex(
        "window\\.__rewardedCallbacks && window\\.__rewardedCallbacks\\['(cb_[0-9]+_[0-9]+)'\\]" +
            " && window\\.__rewardedCallbacks\\['\\1'\\]\\(\\);"
    )

    /**
     * Tập hợp duy nhất gồm đủ 71 game đã kiểm chứng tĩnh có hỗ trợ Rewarded Video, dùng chung cho
     * cả xác thực callback lẫn chính sách lazy-preload `reward_load` nhằm tăng Show Rate AdMob.
     * Single source of truth of all 71 statically audited Rewarded Video games used for both
     * callback validation and lazy `reward_load` preloading.
     */
    val SUPPORTED_REWARDED_GAMES: Set<String> = buildSet {
        addAll(STANDARD_C3_REWARDED_COMPLETE_GAMES)
        addAll(C3_GIVE_REWARDED_GAMES)
        addAll(C3_MERGE_REWARDED_GAMES)
        addAll(CUSTOM_C3_FUNCTIONS.keys)
        addAll(WINDOW_REWARDED_GAMES)
        add(GAME_IMPOSTOR_RED)
        add(GAME_PAO_PAO)
        add(GAME_COLOR_BY_NUMBER)
        add(GAME_BUILD_LAND)
    }

    /**
     * Kiểm tra game hiện tại có thuộc danh sách 71 game có Rewarded Video hay không.
     * Checks whether the given game belongs to the 71-game Rewarded Video allowlist.
     */
    fun supportsRewarded(game: String): Boolean = game in SUPPORTED_REWARDED_GAMES

    /**
     * Trả về đoạn JS cố định sau khi người chơi thực sự nhận thưởng từ SDK AdMob; trả `null` nếu không hợp lệ.
     * Returns a fixed JS grant snippet only for allowlisted game callbacks; returns `null` otherwise.
     */
    fun resolve(game: String, requested: String?): String? {
        if (requested == null) {
            return "window.onRewardGranted && window.onRewardGranted();"
        }
        val value = requested.trim()

        resolveConstruct3Callback(game, value)?.let { return it }
        resolvePaoPaoCallback(game, value)?.let { return it }
        resolveWindowRewardedCallback(game, value)?.let { return it }
        resolveColorByNumberCallback(game, value)?.let { return it }
        return resolveBuildLandCallback(game, value)
    }

    private fun resolveConstruct3Callback(game: String, value: String): String? {
        // `impostor_red` gửi "RewardedComplete" nhưng thân hàm thưởng thật trong data.json tên "RewardedCompleted".
        // `impostor_red` passes "RewardedComplete" while its actual C3 grant function is "RewardedCompleted".
        if (game == GAME_IMPOSTOR_RED && value == "c3_callFunction(\"RewardedComplete\")") {
            return "window.c3_callFunction && window.c3_callFunction('RewardedCompleted');"
        }

        val allowedFunctions = when {
            game in STANDARD_C3_REWARDED_COMPLETE_GAMES -> setOf("RewardedComplete")
            game in C3_GIVE_REWARDED_GAMES -> setOf("GiveRewarded")
            game in C3_MERGE_REWARDED_GAMES -> setOf("ShowRewardedVideo")
            else -> CUSTOM_C3_FUNCTIONS[game].orEmpty()
        }
        for (functionName in allowedFunctions) {
            if (value == "c3_callFunction(\"$functionName\")") {
                return "window.c3_callFunction && window.c3_callFunction('$functionName');"
            }
        }
        return null
    }

    private fun resolvePaoPaoCallback(game: String, value: String): String? {
        if (game != GAME_PAO_PAO) {
            return null
        }
        for (method in PAO_PAO_METHODS) {
            if (value == "game.scene.getScene('game').$method();") {
                return "game.scene.getScene('game').$method();"
            }
        }
        return null
    }

    private fun resolveWindowRewardedCallback(game: String, value: String): String? {
        if (game !in WINDOW_REWARDED_GAMES) {
            return null
        }
        if (value == "window.RewardedComplete()") {
            return "window.RewardedComplete && window.RewardedComplete();"
        }
        if (game == "cryptogram" && value == "window.RewardedComplete(true)") {
            return "window.RewardedComplete && window.RewardedComplete(true);"
        }
        return null
    }

    private fun resolveColorByNumberCallback(game: String, value: String): String? {
        if (game != GAME_COLOR_BY_NUMBER) {
            return null
        }
        val match = COLOR_BY_NUMBER_REGEX.matchEntire(value) ?: return null
        val rewardIndex = match.groupValues[1]
        return "window.RewardedComplete && window.RewardedComplete($rewardIndex);"
    }

    private fun resolveBuildLandCallback(game: String, value: String): String? {
        if (game != GAME_BUILD_LAND) {
            return null
        }
        val match = BUILD_LAND_REGEX.matchEntire(value) ?: return null
        val id = match.groupValues[1]
        return "window.__rewardedCallbacks && window.__rewardedCallbacks['$id'] && " +
            "window.__rewardedCallbacks['$id']();"
    }
}
