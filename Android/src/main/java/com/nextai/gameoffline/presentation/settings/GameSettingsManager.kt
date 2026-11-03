package com.nextai.gameoffline.presentation.settings

import android.content.Context
import android.content.SharedPreferences
import android.webkit.WebView

/**
 * Quản lý cài đặt toàn cục của ứng dụng và mini-game.
 * Global settings manager for application and mini-game configurations.
 *
 * Lưu trữ trạng thái:
 * - Âm thanh hiệu ứng (Sound SFX)
 * - Nhạc nền (Music BGM)
 * - Rung xúc giác (Haptic Feedback / Vibration)
 * - Xóa bộ nhớ đệm (Clear Game & WebView Cache)
 *
 * Manages state for:
 * - Sound effects (SFX)
 * - Background music (BGM)
 * - Haptic vibration feedback
 * - WebView & Application Cache clearance
 */
object GameSettingsManager {

    private const val PREFS_NAME = "nextai_game_settings"
    private const val KEY_GAME_AUDIO_MUTED = "key_game_audio_muted"
    private const val KEY_SOUND_ENABLED = "key_sound_enabled"
    private const val KEY_MUSIC_ENABLED = "key_music_enabled"
    private const val KEY_HAPTIC_ENABLED = "key_haptic_enabled"

    private fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    /**
     * Kiểm tra xem toàn bộ âm thanh trong trò chơi có đang bị tắt hay không.
     * Check if all game audio is muted.
     */
    fun isGameAudioMuted(context: Context): Boolean {
        return getPrefs(context).getBoolean(KEY_GAME_AUDIO_MUTED, false)
    }

    /**
     * Bật hoặc tắt chế độ im lặng cho âm thanh trò chơi.
     * Enable or disable game audio mute.
     */
    fun setGameAudioMuted(context: Context, muted: Boolean) {
        getPrefs(context).edit().putBoolean(KEY_GAME_AUDIO_MUTED, muted).apply()
    }

    /**
     * Kiểm tra xem âm thanh hiệu ứng có đang bật hay không.
     * Check if sound effects are enabled.
     */
    fun isSoundEnabled(context: Context): Boolean {
        return getPrefs(context).getBoolean(KEY_SOUND_ENABLED, true)
    }

    /**
     * Bật hoặc tắt âm thanh hiệu ứng.
     * Enable or disable sound effects.
     */
    fun setSoundEnabled(context: Context, enabled: Boolean) {
        getPrefs(context).edit().putBoolean(KEY_SOUND_ENABLED, enabled).apply()
    }

    /**
     * Kiểm tra xem nhạc nền có đang bật hay không.
     * Check if background music is enabled.
     */
    fun isMusicEnabled(context: Context): Boolean {
        return getPrefs(context).getBoolean(KEY_MUSIC_ENABLED, true)
    }

    /**
     * Bật hoặc tắt nhạc nền.
     * Enable or disable background music.
     */
    fun setMusicEnabled(context: Context, enabled: Boolean) {
        getPrefs(context).edit().putBoolean(KEY_MUSIC_ENABLED, enabled).apply()
    }

    /**
     * Kiểm tra xem rung xúc giác có đang bật hay không.
     * Check if haptic vibration feedback is enabled.
     */
    fun isHapticEnabled(context: Context): Boolean {
        return getPrefs(context).getBoolean(KEY_HAPTIC_ENABLED, true)
    }

    /**
     * Bật hoặc tắt rung xúc giác.
     * Enable or disable haptic vibration feedback.
     */
    fun setHapticEnabled(context: Context, enabled: Boolean) {
        getPrefs(context).edit().putBoolean(KEY_HAPTIC_ENABLED, enabled).apply()
    }

    /**
     * Dọn dẹp toàn bộ bộ nhớ đệm WebView và file tạm của ứng dụng.
     * Clear all WebView and temporary app cache.
     */
    fun clearCache(context: Context, onComplete: (() -> Unit)? = null) {
        try {
            // Xóa cache WebView / Clear WebView Cache
            val webView = WebView(context)
            webView.clearCache(true)
            webView.destroy()

            // Xóa thư mục cache ứng dụng / Clear app internal cache directory
            context.cacheDir.deleteRecursively()
            context.externalCacheDir?.deleteRecursively()
        } catch (e: Exception) {
            android.util.Log.e("GameSettingsManager", "Error clearing cache: ${e.message}")
        } finally {
            onComplete?.invoke()
        }
    }
}
