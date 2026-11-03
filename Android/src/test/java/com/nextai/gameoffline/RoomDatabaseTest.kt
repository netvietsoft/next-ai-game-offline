package com.nextai.gameoffline

import com.nextai.gameoffline.data.local.entity.GameEntity
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

/**
 * Unit Test kiểm tra tính toàn vẹn của mô hình dữ liệu Room Database.
 * Unit Test verifying Room Database Entity mapping integrity.
 */
class RoomDatabaseTest {

    @Test
    fun gameEntity_initialization_correctValues() {
        val game = GameEntity(
            name = "block_blast",
            title = "Block Blast Puzzle",
            category = "Puzzle",
            position = 1,
            hasRewardedVideo = 1,
            eachNLevels = 3,
            isHorizontal = 0,
            sizeMb = 2.4
        )

        assertEquals("block_blast", game.name)
        assertEquals("Block Blast Puzzle", game.title)
        assertEquals("Puzzle", game.category)
        assertEquals(1, game.hasRewardedVideo)
        assertEquals(3, game.eachNLevels)
        assertEquals(0, game.isHorizontal)
        assertEquals(2.4, game.sizeMb, 0.001)
    }

    @Test
    fun defaultSettings_soundAndViewport() {
        val game = GameEntity(
            name = "chess",
            title = "Chess Master",
            category = "2 Players",
            position = 3
        )

        assertEquals(1, game.soundToggleType)
        assertEquals(1, game.useWideViewPortAndOverviewMode)
        assertEquals(180, game.eachNSeconds)
        assertEquals(30, game.minimumTimePlayedInGameSec)
    }
}
