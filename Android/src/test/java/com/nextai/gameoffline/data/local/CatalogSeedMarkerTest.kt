package com.nextai.gameoffline.data.local

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Kiểm thử chính sách bỏ qua re-seed catalog dư thừa khi bản build hiện tại đã nạp đủ 419 game.
 * Verifies catalog seed skipping vs reseeding decisions across version upgrades and empty DBs.
 */
class CatalogSeedMarkerTest {

    @Test
    fun shouldSeedCatalog_skipsWhenSameVersionAndCompleteCatalog() {
        val result = CatalogSeedMarker.shouldSeedCatalog(
            force = false,
            storedVersionCode = 10,
            currentVersionCode = 10,
            storedCatalogCount = 419,
            databaseGameCount = 419
        )
        assertFalse(result)
    }

    @Test
    fun shouldSeedCatalog_triggersOnVersionUpgrade() {
        val result = CatalogSeedMarker.shouldSeedCatalog(
            force = false,
            storedVersionCode = 9,
            currentVersionCode = 10,
            storedCatalogCount = 419,
            databaseGameCount = 419
        )
        assertTrue(result)
    }

    @Test
    fun shouldSeedCatalog_triggersWhenDatabaseIncompleteOrForced() {
        assertTrue(
            CatalogSeedMarker.shouldSeedCatalog(
                force = false,
                storedVersionCode = 10,
                currentVersionCode = 10,
                storedCatalogCount = 419,
                databaseGameCount = 100
            )
        )
        assertTrue(
            CatalogSeedMarker.shouldSeedCatalog(
                force = true,
                storedVersionCode = 10,
                currentVersionCode = 10,
                storedCatalogCount = 419,
                databaseGameCount = 419
            )
        )
    }
}
