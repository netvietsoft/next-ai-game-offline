package com.nextai.gameoffline

import com.nextai.gameoffline.data.remote.GamePackageSecurityPolicy
import java.io.File
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Kiểm tra catalog hybrid luôn khớp 100 game cục bộ và 319 gói R2.
 * Verifies that the hybrid catalog retains 100 bundled games and 319 R2 packages.
 */
class GameCatalogIntegrityTest {

    /**
     * Xác thực số lượng và URL tải theo tên game để tránh phát hành catalog không thể tải.
     * Validate counts and name-derived URLs to prevent shipping an unusable download catalog.
     */
    @Test
    fun releaseCatalog_hasExpectedBundledAndRemoteGames() {
        val catalog = File("src/main/assets/games_catalog_full_419_r2.json").readText()
        val gameObjects = Regex("\\{[^{}]*}", RegexOption.DOT_MATCHES_ALL)
            .findAll(catalog)
            .map { it.value }
            .toList()

        val bundled = gameObjects.filter { extractInt(it, "isDownloaded") == 1 }
        val remote = gameObjects.filter { extractInt(it, "isDownloaded") == 0 }

        assertEquals(419, gameObjects.size)
        assertEquals(100, bundled.size)
        assertEquals(319, remote.size)
        val positions = gameObjects.map { extractInt(it, "position") }
        assertEquals((1..419).toList(), positions)
        gameObjects.take(30).forEach { topGameJson ->
            val name = extractString(topGameJson, "name")
            assertEquals("Top 30 game must be bundled offline-ready: $name", 1, extractInt(topGameJson, "isDownloaded"))
        }
        assertEquals("ludo", extractString(gameObjects.first(), "name"))
        gameObjects.forEach { gameJson ->
            val name = extractString(gameJson, "name")
            assertEquals("Catalog eachNLevels should be 2 for $name", 2, extractInt(gameJson, "eachNLevels"))
            assertTrue(
                "Every catalog game ID (including tap_away_3D) must pass security policy: $name",
                GamePackageSecurityPolicy.isValidGameName(name)
            )
        }
        remote.forEach { gameJson ->
            val name = extractString(gameJson, "name")
            val remoteUrl = extractString(gameJson, "remoteUrl")
            assertEquals("https://pub-087272be70054d98a65246778849e2d0.r2.dev/games/$name.zip", remoteUrl)
            assertTrue("Remote game must declare a positive size: $name", extractDouble(gameJson, "sizeMb") > 0.0)
        }
    }

    /**
     * Xác thực mọi game remote có đúng một hash SHA-256 đóng sẵn trong APK.
     * Verify that every remote game has exactly one SHA-256 allowlist record in the APK.
     */
    @Test
    fun integrityManifest_coversEveryRemoteGame() {
        val catalog = File("src/main/assets/games_catalog_full_419_r2.json").readText()
        val remoteNames = Regex("\\{[^{}]*}", RegexOption.DOT_MATCHES_ALL)
            .findAll(catalog)
            .map { it.value }
            .filter { extractInt(it, "isDownloaded") == 0 }
            .map { extractString(it, "name") }
            .toSet()
        val integrityJson = File("src/main/assets/r2_game_integrity.json").readText()
        val integrityNames = Regex("\\\"name\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"")
            .findAll(integrityJson)
            .map { it.groupValues[1] }
            .toList()
        val hashes = Regex("\\\"sha256\\\"\\s*:\\s*\\\"([a-f0-9]{64})\\\"")
            .findAll(integrityJson)
            .map { it.groupValues[1] }
            .toList()

        assertEquals(319, integrityNames.size)
        assertEquals(319, integrityNames.distinct().size)
        assertEquals(remoteNames, integrityNames.toSet())
        assertEquals(319, hashes.size)
    }

    /** Đọc chuỗi JSON phẳng theo khóa / Read a flat JSON string value by key. */
    private fun extractString(json: String, key: String): String =
        Regex("\\\"$key\\\"\\s*:\\s*\\\"([^\\\"]*)\\\"")
            .find(json)
            ?.groupValues
            ?.get(1)
            ?: error("Missing string key: $key")

    /** Đọc số nguyên JSON phẳng theo khóa / Read a flat JSON integer value by key. */
    private fun extractInt(json: String, key: String): Int =
        Regex("\\\"$key\\\"\\s*:\\s*(\\d+)")
            .find(json)
            ?.groupValues
            ?.get(1)
            ?.toInt()
            ?: error("Missing integer key: $key")

    /** Đọc số thực JSON phẳng theo khóa / Read a flat JSON decimal value by key. */
    private fun extractDouble(json: String, key: String): Double =
        Regex("\\\"$key\\\"\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)")
            .find(json)
            ?.groupValues
            ?.get(1)
            ?.toDouble()
            ?: error("Missing decimal key: $key")
}
