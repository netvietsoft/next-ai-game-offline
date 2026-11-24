package com.nextai.gameoffline.presentation.game

import android.content.Context
import com.nextai.gameoffline.presentation.settings.GameSettingsManager

/**
 * Tạo đoạn JavaScript đồng bộ cài đặt âm thanh (SFX / BGM / Master Mute) vào các engine
 * Howler, Construct 2/3, HTML5 `<audio>/<video>` và Web Audio API.
 * Builds the JS snippet synchronizing audio mute preferences into HTML5/C2/C3/Howler games.
 */
internal object GameAudioScriptHelper {

    /**
     * Dựng chuỗi JS áp dụng trạng thái âm thanh hiện hành từ [GameSettingsManager].
     * Builds an executable JS script reflecting current user audio preferences.
     */
    fun buildSyncScript(context: Context): String {
        val isMuted = GameSettingsManager.isGameAudioMuted(context)
        val soundEnabled = GameSettingsManager.isSoundEnabled(context)
        val musicEnabled = GameSettingsManager.isMusicEnabled(context)
        val shouldMuteAll = isMuted || (!soundEnabled && !musicEnabled)
        return buildSyncScript(shouldMuteAll = shouldMuteAll, musicEnabled = musicEnabled)
    }

    /**
     * Hàm thuần giúp unit-test logic dựng script âm thanh mà không cần Android Context.
     * Pure builder supporting JVM unit tests without an Android Context.
     */
    internal fun buildSyncScript(shouldMuteAll: Boolean, musicEnabled: Boolean): String {
        return buildString {
            append("try { ")
            if (shouldMuteAll) {
                append("if (window.Howler) { try { Howler.mute(true); } catch(e){} } ")
                append(
                    "if (window.c3_callFunction) { " +
                        "try { window.c3_callFunction('SetMasterVolume', [-80]); } catch(e){} } "
                )
                append(
                    "document.querySelectorAll('audio, video').forEach(function(el) { " +
                        "try { el.muted = true; el.pause(); } catch(e){} }); "
                )
                append(
                    "if (window.__gameAudioCtx && window.__gameAudioCtx.state === 'running') { " +
                        "try { window.__gameAudioCtx.suspend(); } catch(e){} } "
                )
            } else {
                append("if (window.Howler) { try { Howler.mute(false); } catch(e){} } ")
                append(
                    "if (window.c3_callFunction) { " +
                        "try { window.c3_callFunction('SetMasterVolume', [0]); } catch(e){} } "
                )
                if (!musicEnabled) {
                    append(
                        "document.querySelectorAll('audio').forEach(function(el) { " +
                            "if (el.src && (el.src.includes('bgm') || el.src.includes('music'))) " +
                            "el.muted = true; }); "
                    )
                } else {
                    append(
                        "document.querySelectorAll('audio, video').forEach(function(el) { " +
                            "try { el.muted = false; } catch(e){} }); "
                    )
                }
                append(
                    "if (window.__gameAudioCtx && window.__gameAudioCtx.state === 'suspended') { " +
                        "try { window.__gameAudioCtx.resume(); } catch(e){} } "
                )
            }
            append("} catch(e) {}")
        }
    }
}
