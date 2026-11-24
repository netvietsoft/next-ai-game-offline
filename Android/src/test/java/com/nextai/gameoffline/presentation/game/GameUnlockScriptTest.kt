package com.nextai.gameoffline.presentation.game

import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Kiểm thử logic dựng script mở khóa an toàn trong `GameUnlockHelper`.
 * Verifies safe unlock script generation and JS string escaping in `GameUnlockHelper`.
 */
class GameUnlockScriptTest {

    @Test
    fun generalUnlockScript_omitsEmptyClearLocalStorageWhenSpecificScriptRan() {
        assertTrue(GameUnlockHelper.hasSpecificUnlock("solitaire_classic"))
        assertTrue(GameUnlockHelper.hasSpecificUnlock("spades"))

        val scriptWithSpecific = GameUnlockHelper.buildGeneralUnlockScript(
            includeEmptyClearLocalStorage = false
        )
        assertFalse(scriptWithSpecific.contains("window.clearLocalStorage()"))

        val scriptWithoutSpecific = GameUnlockHelper.buildGeneralUnlockScript(
            includeEmptyClearLocalStorage = true
        )
        assertTrue(scriptWithoutSpecific.contains("window.clearLocalStorage()"))
    }

    @Test
    fun buildDynamicC3UnlockScript_rejectsBlankNullAndUndefined() {
        assertNull(GameUnlockHelper.buildDynamicC3UnlockScript(null))
        assertNull(GameUnlockHelper.buildDynamicC3UnlockScript(""))
        assertNull(GameUnlockHelper.buildDynamicC3UnlockScript("\"null\""))
        assertNull(GameUnlockHelper.buildDynamicC3UnlockScript("\"undefined\""))
    }

    @Test
    fun buildDynamicC3UnlockScript_escapesQuotesAndBackslashesSafely() {
        val raw = "\"Game\\\"Key\\\\123\\nNext\""
        val script = GameUnlockHelper.buildDynamicC3UnlockScript(raw)
        assertNotNull(script)
        val nonNullScript = requireNotNull(script)
        assertTrue(nonNullScript.startsWith("window.c3_callFunction && window.c3_callFunction(\"clearLocalStorage\", [\""))
        assertTrue(nonNullScript.endsWith("\"]);"))
        // Không chứa dấu nháy kép chưa được escape làm thoát chuỗi JS.
        // Must not contain unescaped quotes breaking out of the JS string literal.
        assertFalse(nonNullScript.contains("[\"Game\""))
    }

    @Test
    fun jigsawPuzzleAndGoodsPuzzle_haveDedicatedUnlockScripts() {
        assertTrue(GameUnlockHelper.hasSpecificUnlock("jigsaw_puzzle"))
        val jigsawScript = requireNotNull(GameUnlockHelper.specificUnlockScript("jigsaw_puzzle"))
        assertTrue(jigsawScript.contains("__nextaiUnlocked"))
        assertTrue(jigsawScript.contains("y:1100,x:1900"))
        assertTrue(jigsawScript.contains("1:{count:6}"))
        assertTrue(jigsawScript.contains("42:{count:14}"))

        assertTrue(GameUnlockHelper.hasSpecificUnlock("goods_puzzle"))
        val goodsScript = requireNotNull(GameUnlockHelper.specificUnlockScript("goods_puzzle"))
        assertTrue(goodsScript.contains("goods_puzzle1000019201080"))

        assertTrue(GameUnlockHelper.hasSpecificUnlock("geometry_rash"))
        assertTrue(GameUnlockHelper.hasSpecificUnlock("pinball_rush"))
        assertTrue(GameUnlockHelper.hasSpecificUnlock("stone_merge"))
    }

    @Test
    fun dynamicC3KeyExpression_guardsMissingRuntimeInterface() {
        assertTrue(GameUnlockHelper.DYNAMIC_C3_KEY_EXPR.contains("window.c3_runtimeInterface"))
        assertTrue(GameUnlockHelper.DYNAMIC_C3_KEY_EXPR.contains("return null"))
    }

    @Test
    fun updatedCatalogKeys_matchCurrentGameDataJsonVersions() {
        val colorCannon = requireNotNull(GameUnlockHelper.specificUnlockScript("color_cannon"))
        assertTrue(colorCannon.contains("color_cannon1010119201080"))

        val mergeCards = requireNotNull(GameUnlockHelper.specificUnlockScript("merge_cards"))
        assertTrue(mergeCards.contains("MergeCard140011280720"))

        val numberTiles = requireNotNull(GameUnlockHelper.specificUnlockScript("number_tiles"))
        assertTrue(numberTiles.contains("NumberTiles131011280720"))
    }

    @Test
    fun preBootUnlockScript_omitsC3SignalCallsToPreventNotInASignalCrash() {
        val preBootScript = GameUnlockHelper.buildGeneralUnlockScript(
            includeEmptyClearLocalStorage = false,
            includeC3RuntimeSignals = false
        )
        assertFalse(preBootScript.contains("c3_callFunction(\"setAudioEnabled\""))
        assertFalse(preBootScript.contains("setAdsTimer"))
        assertFalse(preBootScript.contains("setReadyToShowAds"))

        val runtimeReadyMutedScript = GameUnlockHelper.buildGeneralUnlockScript(
            includeEmptyClearLocalStorage = false,
            includeC3RuntimeSignals = true,
            audioEnabled = false
        )
        assertTrue(runtimeReadyMutedScript.contains("__nextaiC3SignalsApplied"))
        assertTrue(runtimeReadyMutedScript.contains("c3_callFunction(\"setAudioEnabled\", [false])"))
        assertTrue(runtimeReadyMutedScript.contains("c3_callFunction(\"setAdsTimer\", [90])"))
    }

    @Test
    fun saveWipingGames_skipArgumentlessClearLocalStorage() {
        assertFalse(GameUnlockHelper.shouldInvokeEmptyClearLocalStorage("mahjong_deluxe"))
        assertFalse(GameUnlockHelper.shouldInvokeEmptyClearLocalStorage("wordly"))
        assertFalse(GameUnlockHelper.shouldInvokeEmptyClearLocalStorage("nonogram"))
        assertTrue(GameUnlockHelper.shouldInvokeEmptyClearLocalStorage("sudoku"))
    }

    @Test
    fun dataJsonFallbackScript_guardsNonC3AndCachesResolvedKey() {
        val script = GameUnlockHelper.DYNAMIC_C3_DATA_JSON_UNLOCK_SCRIPT
        assertTrue(script.contains("typeof window.c3_callFunction !== 'function'"))
        assertTrue(script.contains("fetch('./data.json')"))
        assertTrue(script.contains("window.__nextaiC3Key"))
    }
}
