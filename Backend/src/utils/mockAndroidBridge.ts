import { escapeHtml, serializeForInlineScript } from './gamePathSecurity';

/**
 * Tạo đoạn script Mock Android Bridge dùng chung giữa `server.ts` và `gameTester.ts`.
 * Shared Mock Android Bridge HTML injector eliminating duplication between server and tester routes.
 */
export function buildMockAndroidBridgeScript(
    gameName: string,
    options: { includeBaseHref?: boolean; logPrefix?: string } = {}
): string {
    const safeGameLiteral = serializeForInlineScript(gameName);
    const safePrefix = serializeForInlineScript(options.logPrefix || 'AndroidBridge');
    const baseHrefTag = options.includeBaseHref
        ? `<base href="/games/${escapeHtml(gameName)}/">\n        `
        : '';

    return `
        <!-- NextAI Mock Android Bridge for Web Playtest -->
        ${baseHrefTag}<script>
        (function() {
            var GAME_NAME = ${safeGameLiteral};
            var LOG_PREFIX = ${safePrefix};

            function postToParent(eventType, data) {
                try {
                    window.parent.postMessage({
                        type: 'NEXTAI_BRIDGE_EVENT',
                        eventType: eventType,
                        game: GAME_NAME,
                        payload: data || {},
                        timestamp: new Date().toLocaleTimeString()
                    }, '*');
                } catch (e) {}
            }

            function emit(name, payload) {
                console.log('[' + LOG_PREFIX + '] ' + name, payload || '');
                postToParent(name, payload || {});
            }

            var mockBridge = {
                gameLoaded: function() { emit('gameLoaded'); },
                onGameReady: function() { emit('onGameReady'); },
                levelStartInGame: function(lvl) { emit('levelStartInGame', { level: lvl }); },
                levelCompleteInGame: function(lvl, extra) {
                    emit('levelCompleteInGame', { level: lvl, extra: extra });
                },
                levelLoseInGame: function(lvl, extra) {
                    emit('levelLoseInGame', { level: lvl, extra: extra });
                },
                levelRestartInGame: function(lvl) { emit('levelRestartInGame', { level: lvl }); },
                levelClick: function(lvl) { emit('levelClick', { level: lvl }); },
                scoreInGame: function(score) { emit('scoreInGame', { score: score }); },
                submitScore: function(score) { emit('submitScore', { score: score }); },
                showInterstitialInGame: function(place) {
                    emit('showInterstitialInGame', { place: place });
                },
                requestInterstitialAd: function() { emit('requestInterstitialAd'); },
                showRewardedInGame: function(place) {
                    emit('showRewardedInGame', { place: place });
                },
                showRewardedVideo: function(type) { emit('showRewardedVideo', { type: type }); },
                requestRewardedVideo: function() { emit('requestRewardedVideo'); },
                vibrate: function(ms) {
                    if (navigator.vibrate) {
                        navigator.vibrate(ms || 50);
                    }
                    emit('vibrate', { ms: ms });
                },
                gameOpenLink: function() { emit('gameOpenLink'); },
                gameCloseRedirectWindow: function() {},
                gameOpenRedirectWindow: function() {},
                gameProgressEvent: function(str) { emit('gameProgressEvent', { progress: str }); }
            };

            window.Android = mockBridge;
            window.AndroidBridge = mockBridge;
            window.LoadingCompleted = function() { emit('gameLoaded'); };

            // Tự động phát sự kiện deviceready cho các game Cordova & Construct 2.
            // Auto-dispatch deviceready for Cordova and Construct 2 games.
            setTimeout(function() {
                try {
                    var evt = document.createEvent('Events');
                    evt.initEvent('deviceready', false, false);
                    document.dispatchEvent(evt);
                } catch (e) {}
            }, 50);

            window.addEventListener('error', function(e) {
                console.error('[Game Error]:', e.message, e.filename, e.lineno);
                postToParent('error', {
                    message: e.message || 'Script Error',
                    filename: e.filename || '',
                    lineno: e.lineno || 0
                });
            });
        })();
        </script>
    `;
}

/**
 * Chèn đoạn script vào ngay sau thẻ `<head>` (hoặc đầu tài liệu nếu thiếu `<head>`).
 * Injects a snippet right after `<head>` (or prepends it if `<head>` is absent).
 */
export function injectIntoHtmlHead(html: string, snippet: string): string {
    if (html.includes('<head>')) {
        return html.replace('<head>', `<head>${snippet}`);
    }
    if (html.includes('<HEAD>')) {
        return html.replace('<HEAD>', `<HEAD>${snippet}`);
    }
    return snippet + html;
}
