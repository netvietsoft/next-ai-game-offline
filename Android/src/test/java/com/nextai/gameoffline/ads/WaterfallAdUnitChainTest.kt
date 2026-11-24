package com.nextai.gameoffline.ads

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Kiểm thử đơn vị cho chuỗi thác nước 3 tầng eCPM ([WaterfallAdUnitChain]) và bộ lọc ID ([AdConstants]).
 * JVM unit tests verifying 3-tier waterfall cascading, network-error early-stop, and unit resolution.
 */
class WaterfallAdUnitChainTest {

    @Test
    fun cascadesThroughTiersOnNoFillAndReportsWinningUnit() {
        val chain = WaterfallAdUnitChain { listOf("high_id", "med_id", "all_id") }
        val attempted = mutableListOf<String>()
        var loaded: WaterfallAdUnitChain.LoadedUnit<String>? = null
        var failedCode: Int? = null

        chain.loadSequentially(
            loadSingleUnit = { unitId, _, onSuccess, onFailure ->
                attempted.add(unitId)
                when (unitId) {
                    "high_id" -> onFailure(WaterfallAdUnitChain.ERROR_CODE_NO_FILL)
                    "med_id" -> onFailure(WaterfallAdUnitChain.ERROR_CODE_MEDIATION_NO_FILL)
                    "all_id" -> onSuccess("ad_payload")
                }
            },
            onLoaded = { loaded = it },
            onAllFailed = { failedCode = it }
        )

        assertEquals(listOf("high_id", "med_id", "all_id"), attempted)
        assertEquals("all_id", loaded?.adUnitId)
        assertEquals(2, loaded?.tierIndex)
        assertEquals("ad_payload", loaded?.ad)
        assertEquals(null, failedCode)
    }

    @Test
    fun stopsImmediatelyOnNetworkOrInvalidRequestErrors() {
        for (hardError in listOf(
            WaterfallAdUnitChain.ERROR_CODE_NETWORK_ERROR,
            WaterfallAdUnitChain.ERROR_CODE_INVALID_REQUEST
        )) {
            val chain = WaterfallAdUnitChain { listOf("high_id", "med_id", "all_id") }
            val attempted = mutableListOf<String>()
            var failedCode: Int? = null

            chain.loadSequentially<String>(
                loadSingleUnit = { unitId, _, _, onFailure ->
                    attempted.add(unitId)
                    onFailure(hardError)
                },
                onLoaded = { error("Should not succeed on hard error") },
                onAllFailed = { failedCode = it }
            )

            assertEquals(listOf("high_id"), attempted)
            assertEquals(hardError, failedCode)
        }
    }

    @Test
    fun reportsAllFailedWhenEveryTierReturnsNoFill() {
        val chain = WaterfallAdUnitChain { listOf("high_id", "med_id") }
        var failedCode: Int? = null

        chain.loadSequentially<String>(
            loadSingleUnit = { _, _, _, onFailure ->
                onFailure(WaterfallAdUnitChain.ERROR_CODE_NO_FILL)
            },
            onLoaded = { error("Should not succeed") },
            onAllFailed = { failedCode = it }
        )

        assertEquals(WaterfallAdUnitChain.ERROR_CODE_NO_FILL, failedCode)
        assertTrue(WaterfallAdUnitChain.shouldCascadeToNextTier(WaterfallAdUnitChain.ERROR_CODE_NO_FILL))
        assertFalse(WaterfallAdUnitChain.shouldCascadeToNextTier(WaterfallAdUnitChain.ERROR_CODE_NETWORK_ERROR))
    }

    @Test
    fun resolveWaterfallUnitsDropsBlanksAndDuplicates() {
        assertEquals(
            listOf("all_id"),
            AdConstants.resolveWaterfallUnits("", "   ", "all_id")
        )
        assertEquals(
            listOf("high_id", "med_id", "all_id"),
            AdConstants.resolveWaterfallUnits(" high_id ", "med_id", "high_id", "all_id")
        )
    }
}
