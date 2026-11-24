package com.nextai.gameoffline.data.remote

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Kiểm thử đối kháng policy bảo vệ package R2.
 * Adversarial tests for the R2 package security policy.
 */
class GamePackageSecurityPolicyTest {

    /** Path hợp lệ được nhận và traversal bị chặn / Valid paths pass while traversal is blocked. */
    @Test
    fun zipEntries_blockTraversalAndWindowsSeparators() {
        assertTrue(GamePackageSecurityPolicy.isSafeZipEntry("assets/images/ball.png"))
        assertFalse(GamePackageSecurityPolicy.isSafeZipEntry("../index.html"))
        assertFalse(GamePackageSecurityPolicy.isSafeZipEntry("assets/../index.html"))
        assertFalse(GamePackageSecurityPolicy.isSafeZipEntry("assets\\index.html"))
        assertFalse(GamePackageSecurityPolicy.isSafeZipEntry("/absolute/index.html"))
        assertFalse(GamePackageSecurityPolicy.isSafeZipEntry("assets//index.html"))
    }

    /** Mã Android tải ngoài Play luôn bị chặn / Android executable payloads are always blocked. */
    @Test
    fun executableExtensions_areBlockedCaseInsensitively() {
        assertTrue(GamePackageSecurityPolicy.isBlockedExecutable("payload.dex"))
        assertTrue(GamePackageSecurityPolicy.isBlockedExecutable("lib/engine.SO"))
        assertTrue(GamePackageSecurityPolicy.isBlockedExecutable("update.apk"))
        assertFalse(GamePackageSecurityPolicy.isBlockedExecutable("game.wasm"))
        assertFalse(GamePackageSecurityPolicy.isBlockedExecutable("scripts/main.js"))
    }

    /** Chỉ URL CDN canonical được nhận / Only the canonical CDN URL is accepted. */
    @Test
    fun downloadUrl_rejectsRedirectShapesAndUntrustedHosts() {
        assertTrue(
            GamePackageSecurityPolicy.isTrustedUrl(
                "https://pub-087272be70054d98a65246778849e2d0.r2.dev/games/abalone.zip",
                "abalone"
            )
        )
        assertFalse(GamePackageSecurityPolicy.isTrustedUrl("http://pub-087272be70054d98a65246778849e2d0.r2.dev/games/abalone.zip", "abalone"))
        assertFalse(GamePackageSecurityPolicy.isTrustedUrl("https://evil.example/games/abalone.zip", "abalone"))
        assertFalse(GamePackageSecurityPolicy.isTrustedUrl("https://pub-087272be70054d98a65246778849e2d0.r2.dev/games/abalone.zip?x=1", "abalone"))
        assertFalse(GamePackageSecurityPolicy.isTrustedUrl("https://pub-087272be70054d98a65246778849e2d0.r2.dev/games/other.zip", "abalone"))
    }

    /**
     * ID chứa chữ hoa như `tap_away_3D` phải được chấp nhận, đồng thời vẫn chặn traversal/ký tự lạ.
     * Mixed-case manifest IDs like `tap_away_3D` pass while traversal and special characters fail.
     */
    @Test
    fun gameNameValidation_acceptsTapAway3DAndRejectsUnsafeIds() {
        assertTrue(GamePackageSecurityPolicy.isValidGameName("tap_away_3D"))
        assertTrue(GamePackageSecurityPolicy.isValidGameName("abalone"))
        assertTrue(
            GamePackageSecurityPolicy.isTrustedUrl(
                "https://pub-087272be70054d98a65246778849e2d0.r2.dev/games/tap_away_3D.zip",
                "tap_away_3D"
            )
        )
        assertFalse(GamePackageSecurityPolicy.isValidGameName(""))
        assertFalse(GamePackageSecurityPolicy.isValidGameName("../tap_away_3D"))
        assertFalse(GamePackageSecurityPolicy.isValidGameName("tap_away_3D/index"))
        assertFalse(GamePackageSecurityPolicy.isValidGameName("tap-away-3D"))
        assertFalse(GamePackageSecurityPolicy.isValidGameName("tap away 3D"))
    }
}
