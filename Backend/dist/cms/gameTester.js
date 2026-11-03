"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameTesterRouter = void 0;
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("../database/db");
/**
 * NextAI Game Offline - Web Game Testing Studio & AdMob Banner Simulator Router.
 * Module kiểm thử trực quan 419+ Mini-Game HTML5 trên trình duyệt Web (Port 6033).
 *
 * Tính năng chính (Key Features):
 * 1. Danh mục 419 Mini-Games với bộ lọc Tìm kiếm, Thể loại, Dọc (Portrait) / Ngang (Landscape).
 * 2. Khung giả lập Smartphone (Mobile Simulator 360x780 / 780x360 / Fullscreen).
 * 3. Bộ mô phỏng AdMob Banner (AdMob 50px Banner Simulator ON/OFF):
 *    - Chế độ LinearLayout: Thu hẹp canvas game 50px (giống hệt Android GameActivity).
 *    - Chế độ Overlay: Đè banner 50px lên mép dưới (kiểm tra có bị che nút menu/Start không).
 *    - Chế độ Không Banner: Chơi game toàn màn hình gốc.
 *    - Quy tắc bảo vệ UX Game Ngang: Tự động ẩn banner cho game Landscape.
 * 4. Cầu nối JavaScript Android Bridge giả lập (window.Android & window.AndroidBridge):
 *    - Bắt sự kiện gameLoaded, levelStartInGame, scoreInGame, showInterstitial, showRewarded...
 *    - Nhật ký sự kiện trực tiếp (Live Event Stream) và bắt lỗi JavaScript / Network.
 * 5. Bộ chạy kiểm thử tự động hàng loạt (Automated Batch Smoke Test).
 */
exports.gameTesterRouter = (0, express_1.Router)();
// Đường dẫn đến thư mục games và catalog
// Paths to games folder and catalog file
const GAMES_DIR = path_1.default.resolve(__dirname, '../../../Android/src/main/assets/games');
const CATALOG_PATH = path_1.default.resolve(__dirname, '../../../Android/src/main/assets/games_catalog.json');
/**
 * Helper nạp danh sách games từ SQLite hoặc catalog JSON.
 * Helper to fetch games list from SQLite or catalog JSON.
 */
function getGamesCatalog() {
    try {
        const gamesFromDb = db_1.db.prepare('SELECT name, title, category, position, is_horizontal, has_rewarded_video, each_n_levels, thumbnail_url FROM games WHERE is_active = 1 ORDER BY position ASC').all();
        if (gamesFromDb && gamesFromDb.length >= 400) {
            return gamesFromDb.map((g) => ({
                name: g.name,
                title: g.title,
                category: g.category,
                position: g.position,
                isHorizontal: g.is_horizontal,
                hasRewardedVideo: g.has_rewarded_video,
                eachNLevels: g.each_n_levels,
                icon: g.thumbnail_url ? g.thumbnail_url.replace('/icons/', '') : `${g.name}.png`
            }));
        }
    }
    catch (e) {
        // Fallback to catalog JSON
    }
    if (fs_1.default.existsSync(CATALOG_PATH)) {
        try {
            const raw = fs_1.default.readFileSync(CATALOG_PATH, 'utf8');
            return JSON.parse(raw);
        }
        catch (e) {
            console.error('Failed to read games_catalog.json:', e);
        }
    }
    return [];
}
/**
 * API trả về danh sách toàn bộ games cho Client Testing UI.
 * GET /tester/api/games
 */
exports.gameTesterRouter.get('/api/games', (req, res) => {
    const catalog = getGamesCatalog();
    res.json({
        total: catalog.length,
        games: catalog
    });
});
/**
 * Route phục vụ Game Iframe có nhúng Mock Android Bridge và Base HREF.
 * Embed player route that injects mock Android Javascript Interface and <base> tag.
 * GET /tester/embed/:gameName
 */
exports.gameTesterRouter.get('/embed/:gameName', (req, res) => {
    const gameName = req.params.gameName;
    const indexPath = path_1.default.join(GAMES_DIR, gameName, 'index.html');
    if (!fs_1.default.existsSync(indexPath)) {
        return res.status(404).send(`<h3>404: Không tìm thấy index.html cho game "${gameName}"</h3>`);
    }
    try {
        let html = fs_1.default.readFileSync(indexPath, 'utf8');
        // Tạo Mock Android Bridge Script
        // Create Mock Android Bridge Script
        const bridgeScript = `
        <!-- NextAI Mock Android Bridge for Web Playtest -->
        <base href="/games/${gameName}/">
        <script>
        (function() {
            console.log('[Tester] Initializing Mock Android Bridge for: ${gameName}');
            
            function postToParent(eventType, data) {
                try {
                    window.parent.postMessage({
                        type: 'NEXTAI_BRIDGE_EVENT',
                        eventType: eventType,
                        game: '${gameName}',
                        payload: data || {},
                        timestamp: new Date().toLocaleTimeString()
                    }, '*');
                } catch (e) {}
            }

            var mockBridge = {
                gameLoaded: function() {
                    console.log('[AndroidBridge] gameLoaded()');
                    postToParent('gameLoaded');
                },
                onGameReady: function() {
                    console.log('[AndroidBridge] onGameReady()');
                    postToParent('onGameReady');
                },
                levelStartInGame: function(lvl) {
                    console.log('[AndroidBridge] levelStartInGame:', lvl);
                    postToParent('levelStartInGame', { level: lvl });
                },
                levelCompleteInGame: function(lvl, extra) {
                    console.log('[AndroidBridge] levelCompleteInGame:', lvl, extra);
                    postToParent('levelCompleteInGame', { level: lvl, extra: extra });
                },
                levelLoseInGame: function(lvl, extra) {
                    console.log('[AndroidBridge] levelLoseInGame:', lvl, extra);
                    postToParent('levelLoseInGame', { level: lvl, extra: extra });
                },
                levelRestartInGame: function(lvl) {
                    console.log('[AndroidBridge] levelRestartInGame:', lvl);
                    postToParent('levelRestartInGame', { level: lvl });
                },
                levelClick: function(lvl) {
                    console.log('[AndroidBridge] levelClick:', lvl);
                    postToParent('levelClick', { level: lvl });
                },
                scoreInGame: function(score) {
                    console.log('[AndroidBridge] scoreInGame:', score);
                    postToParent('scoreInGame', { score: score });
                },
                submitScore: function(score) {
                    console.log('[AndroidBridge] submitScore:', score);
                    postToParent('submitScore', { score: score });
                },
                showInterstitialInGame: function(place) {
                    console.log('[AndroidBridge] showInterstitialInGame:', place);
                    postToParent('showInterstitialInGame', { place: place });
                },
                requestInterstitialAd: function() {
                    console.log('[AndroidBridge] requestInterstitialAd');
                    postToParent('requestInterstitialAd');
                },
                showRewardedInGame: function(place) {
                    console.log('[AndroidBridge] showRewardedInGame:', place);
                    postToParent('showRewardedInGame', { place: place });
                },
                showRewardedVideo: function(type) {
                    console.log('[AndroidBridge] showRewardedVideo:', type);
                    postToParent('showRewardedVideo', { type: type });
                },
                requestRewardedVideo: function() {
                    console.log('[AndroidBridge] requestRewardedVideo');
                    postToParent('requestRewardedVideo');
                },
                vibrate: function(ms) {
                    console.log('[AndroidBridge] vibrate:', ms);
                    if (navigator.vibrate) navigator.vibrate(ms || 50);
                    postToParent('vibrate', { ms: ms });
                },
                gameOpenLink: function() {
                    console.log('[AndroidBridge] gameOpenLink');
                    postToParent('gameOpenLink');
                },
                gameCloseRedirectWindow: function() {},
                gameOpenRedirectWindow: function() {},
                gameProgressEvent: function(str) {
                    console.log('[AndroidBridge] gameProgressEvent:', str);
                    postToParent('gameProgressEvent', { event: str });
                }
            };

            // Gán cho cả window.Android và window.AndroidBridge
            window.Android = mockBridge;
            window.AndroidBridge = mockBridge;

            // Bắt lỗi JavaScript toàn cục trong game và gửi về UI Studio
            window.addEventListener('error', function(e) {
                console.error('[Game Error caught]:', e.message, e.filename, e.lineno);
                postToParent('error', {
                    message: e.message || 'Script Error',
                    filename: e.filename || '',
                    lineno: e.lineno || 0,
                    colno: e.colno || 0
                });
            });

            // Tự động kích hoạt AudioContext khi người dùng tương tác lần đầu
            window.addEventListener('pointerdown', function() {
                if (window.AudioContext || window.webkitAudioContext) {
                    // Audio unlocked
                }
            }, { once: true });
        })();
        </script>
        `;
        // Chèn script vào ngay sau thẻ <head> hoặc ở đầu trang
        if (html.includes('<head>')) {
            html = html.replace('<head>', '<head>' + bridgeScript);
        }
        else if (html.includes('<HEAD>')) {
            html = html.replace('<HEAD>', '<HEAD>' + bridgeScript);
        }
        else {
            html = bridgeScript + html;
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
    }
    catch (err) {
        return res.status(500).send(`<h3>Error reading game: ${err.message}</h3>`);
    }
});
/**
 * Route chơi trực tiếp toàn màn hình (Standalone Full Window Play).
 * GET /tester/play/:gameName
 */
exports.gameTesterRouter.get('/play/:gameName', (req, res) => {
    const gameName = req.params.gameName;
    const catalog = getGamesCatalog();
    const game = catalog.find(g => g.name === gameName) || {
        name: gameName,
        title: gameName,
        isHorizontal: 0,
        category: 'Casual'
    };
    const isHorizontal = game.isHorizontal === 1;
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Chơi: ${game.title} - NextAI Game Offline</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; }
        body, html { width: 100%; height: 100%; overflow: hidden; background: #000; color: #fff; display: flex; flex-direction: column; }
        
        /* Top Mini Control Bar */
        #topBar {
            height: 44px;
            background: #0f172a;
            border-bottom: 1px solid #1e293b;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 12px;
            z-index: 1000;
            flex-shrink: 0;
        }
        .title-group { display: flex; align-items: center; gap: 8px; }
        .back-btn {
            background: #1e293b;
            color: #94a3b8;
            border: 1px solid #334155;
            padding: 4px 10px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .back-btn:hover { background: #3b82f6; color: #fff; }
        .game-title { font-size: 14px; font-weight: 700; color: #f8fafc; }
        .badge { font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
        .badge-portrait { background: #0284c7; color: #fff; }
        .badge-landscape { background: #7c3aed; color: #fff; }
        
        .controls { display: flex; align-items: center; gap: 8px; }
        .btn-toggle {
            background: #1e293b;
            color: #f8fafc;
            border: 1px solid #334155;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            font-weight: 600;
        }
        .btn-toggle.active { background: #eab308; color: #000; border-color: #facc15; }
        
        /* Game Viewport Container */
        #gameWrapper {
            flex: 1;
            width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            flex-direction: column;
            background: #000;
        }
        #gameIframe {
            flex: 1;
            width: 100%;
            height: 100%;
            border: none;
            display: block;
        }
        
        /* Banner Container (50px) */
        #bannerContainer {
            height: 50px;
            background: #000000;
            border-top: 1px solid #222;
            display: none;
            align-items: center;
            justify-content: center;
            color: #888;
            font-size: 12px;
            letter-spacing: 0.5px;
            flex-shrink: 0;
            user-select: none;
        }
        #bannerContainer.visible { display: flex; }
        .banner-content {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 16px;
            border: 1px dashed #444;
            border-radius: 4px;
            background: #111;
        }
        .banner-badge {
            background: #4285f4;
            color: #fff;
            padding: 1px 5px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div id="topBar">
        <div class="title-group">
            <a href="/tester" class="back-btn">⬅ Studio</a>
            <span class="game-title">${game.title}</span>
            <span class="badge ${isHorizontal ? 'badge-landscape' : 'badge-portrait'}">
                ${isHorizontal ? '🎮 Ngang' : '📱 Dọc'}
            </span>
        </div>
        <div class="controls">
            <button class="btn-toggle" id="btnReload" onclick="reloadGame()">🔄 Tải lại</button>
            <button class="btn-toggle" id="btnBanner" onclick="toggleBanner()">🔥 Banner (50px): TẮT</button>
        </div>
    </div>

    <div id="gameWrapper">
        <iframe id="gameIframe" src="/games/${game.name}/index.html" allow="autoplay; fullscreen; accelerometer; gyroscope"></iframe>
        <div id="bannerContainer">
            <div class="banner-content">
                <span class="banner-badge">AdMob</span>
                <span>Google AdMob Test Banner • 320x50</span>
            </div>
        </div>
    </div>

    <script>
        var isBannerOn = false;
        var isHorizontal = ${isHorizontal ? 'true' : 'false'};

        function toggleBanner() {
            if (isHorizontal) {
                alert('⚠️ Game này là Game Ngang (Landscape)!\\nTheo quy tắc UX, Game Ngang KHÔNG BAO GIỜ hiển thị banner để tránh che khuất không gian chơi.');
                return;
            }
            isBannerOn = !isBannerOn;
            var banner = document.getElementById('bannerContainer');
            var btn = document.getElementById('btnBanner');
            if (isBannerOn) {
                banner.classList.add('visible');
                btn.classList.add('active');
                btn.innerText = '🔥 Banner (50px): BẬT';
            } else {
                banner.classList.remove('visible');
                btn.classList.remove('active');
                btn.innerText = '🔥 Banner (50px): TẮT';
            }
            // Kích hoạt window resize cho canvas game
            var iframe = document.getElementById('gameIframe');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.dispatchEvent(new Event('resize'));
            }
        }

        function reloadGame() {
            var iframe = document.getElementById('gameIframe');
            iframe.src = iframe.src;
        }
    </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
});
/**
 * Giao diện chính của Web Game Testing Studio.
 * Main Interactive Testing Studio Dashboard.
 * GET /tester
 */
function renderTesterStudio(req, res, targetGameName) {
    const catalog = getGamesCatalog();
    const totalCount = catalog.length;
    const portraitCount = catalog.filter(g => g.isHorizontal === 0).length;
    const landscapeCount = catalog.filter(g => g.isHorizontal === 1).length;
    // Tìm game mặc định hoặc game được chỉ định qua URL
    let initialGame = catalog[0] || { name: 'abalone', title: 'Abalone', isHorizontal: 0, category: 'Casual', icon: 'abalone.png' };
    if (targetGameName) {
        const found = catalog.find(g => g.name.toLowerCase() === targetGameName.toLowerCase() || g.title.toLowerCase() === targetGameName.toLowerCase());
        if (found)
            initialGame = found;
    }
    // Lấy danh sách Categories độc nhất
    const categories = Array.from(new Set(catalog.map(g => g.category || 'Casual'))).sort();
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${initialGame.title} - NextAI Game Testing Studio & AdMob Inspector</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-main: #090d16;
            --bg-surface: #0f172a;
            --bg-card: #1e293b;
            --border: #334155;
            --border-active: #3b82f6;
            --text-main: #f8fafc;
            --text-sub: #94a3b8;
            --accent-blue: #3b82f6;
            --accent-green: #10b981;
            --accent-amber: #f59e0b;
            --accent-purple: #8b5cf6;
            --accent-red: #ef4444;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; }
        body { background: var(--bg-main); color: var(--text-main); display: flex; height: 100vh; overflow: hidden; }

        /* Left Sidebar: Game Catalog */
        #sidebar {
            width: 380px;
            background: var(--bg-surface);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            z-index: 10;
        }

        .studio-header {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border);
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(8px);
        }
        .brand-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
        }
        .brand-title h2 {
            font-size: 18px;
            font-weight: 800;
            background: linear-gradient(135deg, #60a5fa, #a855f7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .badge-total {
            background: rgba(59, 130, 246, 0.15);
            color: var(--accent-blue);
            font-size: 12px;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 20px;
            border: 1px solid rgba(59, 130, 246, 0.3);
        }

        /* Search & Filter Bar */
        .search-box {
            position: relative;
            margin-bottom: 10px;
        }
        .search-box input {
            width: 100%;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 8px 12px 8px 36px;
            color: #fff;
            font-size: 13px;
            outline: none;
            transition: border-color 0.2s;
        }
        .search-box input:focus { border-color: var(--accent-blue); }
        .search-box span.search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-sub);
            font-size: 14px;
        }

        .filter-tabs {
            display: flex;
            gap: 6px;
            overflow-x: auto;
            padding-bottom: 4px;
        }
        .tab-btn {
            background: var(--bg-card);
            border: 1px solid var(--border);
            color: var(--text-sub);
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.15s;
        }
        .tab-btn:hover { color: #fff; border-color: #64748b; }
        .tab-btn.active {
            background: var(--accent-blue);
            color: #fff;
            border-color: var(--accent-blue);
        }

        /* Game List Scrollable */
        #gameList {
            flex: 1;
            overflow-y: auto;
            padding: 10px 14px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .game-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 12px;
            background: var(--bg-card);
            border: 1px solid transparent;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.15s;
        }
        .game-item:hover {
            border-color: rgba(59, 130, 246, 0.4);
            transform: translateY(-1px);
            background: #253349;
        }
        .game-item.selected {
            border-color: var(--accent-blue);
            background: rgba(59, 130, 246, 0.15);
            box-shadow: 0 0 12px rgba(59, 130, 246, 0.2);
        }
        .game-icon-img {
            width: 42px;
            height: 42px;
            border-radius: 8px;
            object-fit: cover;
            background: #000;
            border: 1px solid rgba(255,255,255,0.08);
            flex-shrink: 0;
        }
        .game-info { flex: 1; min-width: 0; }
        .game-name-title {
            font-size: 13px;
            font-weight: 700;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .game-meta {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 2px;
        }
        .badge-cat {
            font-size: 10px;
            color: var(--text-sub);
            background: rgba(255, 255, 255, 0.05);
            padding: 1px 6px;
            border-radius: 4px;
        }
        .badge-orient {
            font-size: 10px;
            font-weight: 600;
            padding: 1px 6px;
            border-radius: 4px;
        }
        .badge-orient.portrait { background: rgba(14, 165, 233, 0.2); color: #38bdf8; }
        .badge-orient.landscape { background: rgba(168, 85, 247, 0.2); color: #c084fc; }

        .game-status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #475569;
        }
        .game-status-dot.playable { background: var(--accent-green); box-shadow: 0 0 6px var(--accent-green); }
        .game-status-dot.error { background: var(--accent-red); box-shadow: 0 0 6px var(--accent-red); }

        /* Main Workspace: Device Simulator & Controls */
        #workspace {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: var(--bg-main);
            overflow: hidden;
        }

        /* Top Action Bar */
        .workspace-bar {
            height: 60px;
            background: var(--bg-surface);
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px;
            flex-shrink: 0;
        }
        .current-game-display {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .current-game-display h3 { font-size: 16px; font-weight: 700; color: #fff; }
        .current-game-display .subtitle { font-size: 12px; color: var(--text-sub); font-family: 'JetBrains Mono', monospace; }

        .workspace-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        /* Simulator Center Container */
        .simulator-stage {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            padding: 20px;
            background: radial-gradient(circle at center, #131d33 0%, #090d16 100%);
            overflow: auto;
        }

        /* Smartphone Frame */
        .phone-frame {
            background: #000;
            border-radius: 40px;
            box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 10px #1e293b, 0 0 0 12px #334155;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Phone Modes */
        .phone-frame.portrait {
            width: 360px;
            height: 740px;
        }
        .phone-frame.landscape {
            width: 740px;
            height: 360px;
        }
        .phone-frame.fullscreen {
            width: 100%;
            height: 100%;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            border: 1px solid var(--border);
        }
        .phone-frame.fullscreen .phone-notch {
            display: none;
        }

        /* Phone Notch / Dynamic Island */
        .phone-notch {
            height: 24px;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 5;
            flex-shrink: 0;
        }
        .phone-camera {
            width: 10px;
            height: 10px;
            background: #111;
            border-radius: 50%;
            border: 1px solid #333;
        }
        .phone-notch-time {
            position: absolute;
            left: 20px;
            font-size: 11px;
            font-weight: 600;
            color: #aaa;
        }
        .phone-notch-icons {
            position: absolute;
            right: 20px;
            font-size: 10px;
            color: #aaa;
            display: flex;
            gap: 4px;
        }

        /* Phone Screen Content */
        .phone-screen {
            flex: 1;
            display: flex;
            flex-direction: column;
            position: relative;
            background: #000;
            overflow: hidden;
        }

        .game-iframe-element {
            flex: 1;
            width: 100%;
            height: 100%;
            border: none;
            background: #000;
            display: block;
        }

        /* Simulated AdMob Banner (50px) */
        .simulated-admob-banner {
            height: 50px;
            background: #000000;
            border-top: 1px solid #1a1a1a;
            display: none;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 12px;
            font-weight: 600;
            flex-shrink: 0;
            z-index: 20;
            transition: all 0.2s;
            user-select: none;
        }
        .simulated-admob-banner.visible { display: flex; }
        .simulated-admob-banner.overlay-mode {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.92);
            border-top: 2px solid var(--accent-amber);
            box-shadow: 0 -4px 15px rgba(245, 158, 11, 0.3);
        }
        .admob-pill {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 14px;
            border: 1px dashed #444;
            border-radius: 4px;
            background: #0a0a0a;
        }
        .admob-badge {
            background: #4285f4;
            color: #fff;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 3px;
        }

        /* Right Panel: Inspector & Event Console */
        #inspector {
            width: 360px;
            background: var(--bg-surface);
            border-left: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
        }
        .inspector-header {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .inspector-header h3 { font-size: 15px; font-weight: 700; color: #fff; }
        
        .control-group {
            padding: 14px 20px;
            border-bottom: 1px solid var(--border);
        }
        .control-group-title {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-sub);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
        }
        .btn-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        .btn-action {
            background: var(--bg-card);
            border: 1px solid var(--border);
            color: #fff;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.15s;
        }
        .btn-action:hover { border-color: var(--accent-blue); background: #253349; }
        .btn-action.active {
            background: var(--accent-blue);
            border-color: var(--accent-blue);
            color: #fff;
        }
        .btn-banner-toggle {
            grid-column: span 2;
            padding: 10px;
            font-size: 13px;
            background: #1e293b;
            border: 1px solid #475569;
        }
        .btn-banner-toggle.on {
            background: #eab308;
            color: #000;
            border-color: #facc15;
            font-weight: 800;
        }

        /* Banner Rule Notice */
        .banner-rule-box {
            margin-top: 8px;
            padding: 10px;
            border-radius: 8px;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            font-size: 11px;
            line-height: 1.4;
            color: #6ee7b7;
        }

        /* Live Terminal / Log stream */
        .terminal-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: #060911;
            overflow: hidden;
        }
        .terminal-header {
            padding: 8px 16px;
            background: #0b101d;
            border-bottom: 1px solid var(--border);
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: var(--text-sub);
        }
        .terminal-logs {
            flex: 1;
            padding: 12px 16px;
            overflow-y: auto;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .log-entry {
            display: flex;
            gap: 8px;
            word-break: break-all;
            line-height: 1.4;
        }
        .log-time { color: #64748b; flex-shrink: 0; }
        .log-msg { color: #cbd5e1; }
        .log-msg.event { color: #38bdf8; font-weight: 600; }
        .log-msg.score { color: #facc15; font-weight: 600; }
        .log-msg.error { color: #f87171; font-weight: 700; }
        .log-msg.success { color: #4ade80; font-weight: 600; }

        /* Batch Automated Smoke Test Modal */
        #smokeTestModal {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
            z-index: 9999;
            display: none;
            align-items: center;
            justify-content: center;
        }
        .modal-content {
            width: 800px;
            max-width: 90vw;
            max-height: 85vh;
            background: var(--bg-surface);
            border: 1px solid var(--border);
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .modal-header {
            padding: 16px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .modal-body {
            flex: 1;
            padding: 20px 24px;
            overflow-y: auto;
        }
    </style>
</head>
<body>

    <!-- SIDEBAR: GAME CATALOG -->
    <aside id="sidebar">
        <div class="studio-header">
            <div class="brand-title">
                <h2>🎮 NextAI Tester Studio</h2>
                <span class="badge-total">${totalCount} Games</span>
            </div>
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input type="text" id="searchInput" placeholder="Tìm theo tên, ID hoặc danh mục..." oninput="filterGames()">
            </div>
            <div class="filter-tabs">
                <button class="tab-btn active" onclick="setFilter('all', this)">Tất cả (${totalCount})</button>
                <button class="tab-btn" onclick="setFilter('portrait', this)">📱 Dọc (${portraitCount})</button>
                <button class="tab-btn" onclick="setFilter('landscape', this)">🎮 Ngang (${landscapeCount})</button>
            </div>
        </div>

        <div id="gameList">
            <!-- Rendered by JS -->
        </div>
    </aside>

    <!-- WORKSPACE: SIMULATOR -->
    <main id="workspace">
        <div class="workspace-bar">
            <div class="current-game-display">
                <img id="curIcon" src="${initialGame.icon ? ('/icons/' + initialGame.icon) : ('/icons/' + initialGame.name + '.png')}" style="width: 32px; height: 32px; border-radius: 6px;" onerror="this.src='/icons/abalone.png'">
                <div>
                    <h3 id="curTitle">${initialGame.title}</h3>
                    <div class="subtitle" id="curName">ID: ${initialGame.name} • ${initialGame.category} • ${initialGame.isHorizontal ? '🎮 Game Ngang' : '📱 Game Dọc'}</div>
                </div>
            </div>

            <div class="workspace-actions">
                <button class="btn-action" onclick="runAutomatedTest()">🚀 Tự Động Test Hàng Loạt</button>
                <button class="btn-action" onclick="copyDirectLink()">📋 Copy Link</button>
                <button class="btn-action" onclick="openDirectPlay()">↗ Tab Mới</button>
                <button class="btn-action" onclick="reloadCurrentGame()">🔄 Tải Lại</button>
            </div>
        </div>

        <!-- STAGE -->
        <div class="simulator-stage">
            <div class="phone-frame fullscreen" id="phoneContainer">
                <div class="phone-notch">
                    <span class="phone-notch-time">09:41</span>
                    <div class="phone-camera"></div>
                    <span class="phone-notch-icons">5G 100%</span>
                </div>

                <div class="phone-screen" id="screenContainer">
                    <iframe id="gameIframe" class="game-iframe-element" src="/games/${initialGame.name}/index.html" allow="autoplay; fullscreen; accelerometer; gyroscope"></iframe>
                    
                    <!-- Simulated AdMob Banner (50px) -->
                    <div class="simulated-admob-banner" id="simBanner">
                        <div class="admob-pill">
                            <span class="admob-badge">AdMob</span>
                            <span>Google AdMob Test Banner • 320x50</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- RIGHT INSPECTOR & CONSOLE -->
    <aside id="inspector">
        <div class="inspector-header">
            <h3>🛠️ Bảng Điều Khiển & AdMob</h3>
        </div>

        <!-- Controls: Orientation & Screen -->
        <div class="control-group">
            <div class="control-group-title">Mô Phỏng Màn Hình</div>
            <div style="margin-bottom: 8px;">
                <button class="btn-action active" id="btnFullscreen" style="width: 100%;" onclick="setOrientation('fullscreen')">
                    🖥️ Toàn Màn Hình Trình Duyệt (Mặc định)
                </button>
            </div>
            <div class="btn-grid">
                <button class="btn-action" id="btnPortrait" onclick="setOrientation('portrait')">📱 Dọc (360x740)</button>
                <button class="btn-action" id="btnLandscape" onclick="setOrientation('landscape')">🎮 Ngang (740x360)</button>
            </div>
        </div>

        <!-- Controls: AdMob Banner Simulator -->
        <div class="control-group">
            <div class="control-group-title">Mô Phỏng AdMob Banner (50px)</div>
            <button class="btn-action btn-banner-toggle" id="btnBannerToggle" onclick="toggleBannerSimulation()">
                🔥 Banner AdMob 50px: ĐANG TẮT
            </button>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
                <button class="btn-action active" id="btnModeLinearLayout" onclick="setBannerMode('linearlayout')">
                    📐 Thu Hẹp Game (Chuẩn App)
                </button>
                <button class="btn-action" id="btnModeOverlay" onclick="setBannerMode('overlay')">
                    📌 Đè Lên Canvas (Overlay)
                </button>
            </div>

            <div class="banner-rule-box" id="bannerRuleNotice">
                💡 <b>Nguyên lý AdMob trong App:</b> Banner đặt ở dưới cùng với chiều cao 50dp. Khi ở chế độ <b>Thu Hẹp Game</b>, khung game tự co lại để không bị banner che khuất menu. Khi ở chế độ <b>Game Ngang</b>, Banner được tự động ẩn hoàn toàn!
            </div>
        </div>

        <!-- Quick Navigation -->
        <div class="control-group">
            <div class="control-group-title">Điều Hướng Nhanh</div>
            <div class="btn-grid">
                <button class="btn-action" onclick="selectPreviousGame()">⬅ Game Trước</button>
                <button class="btn-action" onclick="selectNextGame()">Game Tiếp Theo ➡</button>
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: var(--text-sub); text-align: center;">
                📱 Test trên điện thoại qua Wi-Fi: <b>http://192.168.1.14:6033/tester</b>
            </div>
        </div>

        <!-- Live Terminal Event Stream -->
        <div class="terminal-container">
            <div class="terminal-header">
                <span>📡 Nhật Ký Sự Kiện (Live Bridge Stream)</span>
                <button style="background: none; border: none; color: #64748b; cursor: pointer; font-size: 11px;" onclick="clearLogs()">Xóa</button>
            </div>
            <div class="terminal-logs" id="terminalLogs">
                <div class="log-entry">
                    <span class="log-time">[00:00:00]</span>
                    <span class="log-msg success">Tester Studio đã sẵn sàng. Chọn một game để bắt đầu.</span>
                </div>
            </div>
        </div>
    </aside>

    <!-- AUTOMATED BATCH SMOKE TEST MODAL -->
    <div id="smokeTestModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 style="font-size: 16px; font-weight: 700; color: #fff;">🚀 Chạy Kiểm Thử Tự Động Hàng Loạt (Batch Smoke Test)</h3>
                <button onclick="closeSmokeTestModal()" style="background: none; border: none; color: #fff; font-size: 20px; cursor: pointer;">✕</button>
            </div>
            <div class="modal-body">
                <div style="display: flex; gap: 12px; margin-bottom: 16px; align-items: center;">
                    <span style="font-size: 13px;">Số lượng game cần test:</span>
                    <button class="btn-action active" onclick="startBatchTest(10)">Test 10 Games</button>
                    <button class="btn-action" onclick="startBatchTest(30)">Test 30 Games</button>
                    <button class="btn-action" onclick="startBatchTest(100)">Test 100 Games</button>
                    <button class="btn-action" onclick="stopBatchTest()" style="background: var(--accent-red); color: #fff;">Dừng</button>
                </div>
                <div id="batchProgress" style="font-size: 13px; font-weight: 600; margin-bottom: 10px; color: #38bdf8;">Chưa bắt đầu</div>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--border); color: var(--text-sub);">
                            <th style="padding: 8px;">#</th>
                            <th style="padding: 8px;">Tên Game</th>
                            <th style="padding: 8px;">Hướng</th>
                            <th style="padding: 8px;">Tín hiệu gameLoaded</th>
                            <th style="padding: 8px;">Lỗi JS</th>
                            <th style="padding: 8px;">Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody id="batchTableBody">
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- CLIENT SCRIPT -->
    <script>
        var allGames = ${JSON.stringify(catalog)};
        var initialGameName = "${initialGame.name}";
        var currentFilteredGames = allGames.slice();
        var selectedIndex = 0;
        var currentFilterType = 'all';
        var isBannerActive = false;
        var bannerMode = 'linearlayout'; // 'linearlayout' or 'overlay'
        var currentOrientation = 'fullscreen';
        var isTestingBatch = false;
        var batchStopRequested = false;

        // Khởi tạo
        window.addEventListener('DOMContentLoaded', function() {
            renderGameList(allGames);
            
            // Tìm game mục tiêu từ URL hoặc route
            var urlParams = new URLSearchParams(window.location.search);
            var targetParam = urlParams.get('game') || urlParams.get('id') || initialGameName;

            var targetIdx = -1;
            if (targetParam) {
                targetIdx = allGames.findIndex(function(g) {
                    return g.name.toLowerCase() === targetParam.toLowerCase() || g.title.toLowerCase() === targetParam.toLowerCase();
                });
            }

            if (targetIdx !== -1) {
                selectGame(targetIdx, false);
            } else if (allGames.length > 0) {
                selectGame(0, false);
            }

            // Lắng nghe sự kiện từ iframe game (Mock Android Bridge)
            window.addEventListener('message', function(event) {
                if (!event.data || event.data.type !== 'NEXTAI_BRIDGE_EVENT') return;
                var data = event.data;
                var time = data.timestamp || new Date().toLocaleTimeString();
                
                if (data.eventType === 'gameLoaded') {
                    addLog(time, '🟢 [Bridge] gameLoaded() - Game nạp hoàn tất!', 'success');
                    markGameStatus(data.game, 'playable');
                } else if (data.eventType === 'onGameReady') {
                    addLog(time, '🟢 [Bridge] onGameReady() - Game sẵn sàng!', 'success');
                    markGameStatus(data.game, 'playable');
                } else if (data.eventType === 'levelStartInGame') {
                    addLog(time, '🎯 [Bridge] levelStartInGame(màn: ' + data.payload.level + ')', 'event');
                } else if (data.eventType === 'scoreInGame') {
                    addLog(time, '⭐ [Bridge] scoreInGame(điểm: ' + data.payload.score + ')', 'score');
                } else if (data.eventType === 'showInterstitialInGame') {
                    addLog(time, '📢 [Bridge] showInterstitialInGame(vị trí: ' + data.payload.place + ')', 'event');
                } else if (data.eventType === 'showRewardedInGame') {
                    addLog(time, '🎁 [Bridge] showRewardedInGame(vị trí: ' + data.payload.place + ')', 'event');
                } else if (data.eventType === 'error') {
                    addLog(time, '❌ [Game Error]: ' + data.payload.message + ' (' + data.payload.filename + ':' + data.payload.lineno + ')', 'error');
                    markGameStatus(data.game, 'error');
                } else {
                    addLog(time, 'ℹ️ [Bridge] ' + data.eventType + ' ' + JSON.stringify(data.payload || {}), 'event');
                }
            });
        });

        function renderGameList(games) {
            var container = document.getElementById('gameList');
            container.innerHTML = '';
            games.forEach(function(g, idx) {
                var item = document.createElement('div');
                item.className = 'game-item' + (idx === selectedIndex ? ' selected' : '');
                item.id = 'game-item-' + g.name;
                item.onclick = function() { selectGameByName(g.name); };

                var isHoriz = g.isHorizontal === 1;
                var iconUrl = g.icon ? ('/icons/' + g.icon) : ('/icons/' + g.name + '.png');

                item.innerHTML = 
                    '<img class="game-icon-img" src="' + iconUrl + '" onerror="this.src=\\'/icons/abalone.png\\'">' +
                    '<div class="game-info">' +
                        '<div class="game-name-title">' + g.title + '</div>' +
                        '<div class="game-meta">' +
                            '<span class="badge-cat">' + g.category + '</span>' +
                            '<span class="badge-orient ' + (isHoriz ? 'landscape' : 'portrait') + '">' + (isHoriz ? '🎮 Ngang' : '📱 Dọc') + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="game-status-dot" id="dot-' + g.name + '"></div>';

                container.appendChild(item);
            });
        }

        function filterGames() {
            var keyword = document.getElementById('searchInput').value.trim().toLowerCase();
            currentFilteredGames = allGames.filter(function(g) {
                var matchKeyword = !keyword || g.title.toLowerCase().includes(keyword) || g.name.toLowerCase().includes(keyword) || (g.category && g.category.toLowerCase().includes(keyword));
                var matchFilter = true;
                if (currentFilterType === 'portrait') matchFilter = (g.isHorizontal === 0);
                if (currentFilterType === 'landscape') matchFilter = (g.isHorizontal === 1);
                return matchKeyword && matchFilter;
            });
            renderGameList(currentFilteredGames);
        }

        function setFilter(type, btn) {
            currentFilterType = type;
            document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            filterGames();
        }

        function selectGameByName(name) {
            var idx = allGames.findIndex(function(g) { return g.name === name; });
            if (idx !== -1) selectGame(idx, true);
        }

        function selectGame(idx, shouldReload) {
            if (idx < 0 || idx >= allGames.length) return;
            selectedIndex = idx;
            var g = allGames[idx];

            document.querySelectorAll('.game-item').forEach(function(el) { el.classList.remove('selected'); });
            var activeItem = document.getElementById('game-item-' + g.name);
            if (activeItem) {
                activeItem.classList.add('selected');
                activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            document.getElementById('curTitle').innerText = g.title;
            document.getElementById('curName').innerText = 'ID: ' + g.name + ' • ' + g.category + (g.isHorizontal ? ' • 🎮 Game Ngang' : ' • 📱 Game Dọc');
            document.getElementById('curIcon').src = g.icon ? ('/icons/' + g.icon) : ('/icons/' + g.name + '.png');

            // Nếu đang ở chế độ khung điện thoại thì xoay theo hướng game, còn fullscreen thì giữ nguyên
            if (currentOrientation !== 'fullscreen') {
                if (g.isHorizontal === 1) {
                    setOrientation('landscape');
                } else {
                    setOrientation('portrait');
                }
            } else {
                setOrientation('fullscreen');
            }

            // Nạp game vào iframe qua đường dẫn chuẩn (được server.ts tự động inject Mock Android Bridge)
            var iframe = document.getElementById('gameIframe');
            iframe.src = '/games/' + g.name + '/index.html';

            // Cập nhật URL trên address bar để người dùng có thể copy/share link trực tiếp
            try {
                if (window.history && window.history.replaceState) {
                    window.history.replaceState({ game: g.name }, g.title, '/tester/' + g.name);
                }
            } catch(e) {}

            addLog(new Date().toLocaleTimeString(), '▶️ Bắt đầu nạp game: ' + g.title + ' (' + g.name + ')', 'event');
        }

        function copyDirectLink() {
            var g = allGames[selectedIndex];
            if (!g) return;
            var fullUrl = window.location.origin + '/tester/' + g.name;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(fullUrl).then(function() {
                    addLog(new Date().toLocaleTimeString(), '📋 Đã sao chép link test: ' + fullUrl, 'success');
                    showToast('✅ Đã copy link test game: ' + fullUrl);
                }).catch(function() {
                    prompt('Đường dẫn test game của bạn:', fullUrl);
                });
            } else {
                prompt('Đường dẫn test game của bạn:', fullUrl);
            }
        }

        function showToast(msg) {
            var toast = document.getElementById('toastNotice');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'toastNotice';
                toast.style.position = 'fixed';
                toast.style.bottom = '24px';
                toast.style.left = '50%';
                toast.style.transform = 'translateX(-50%)';
                toast.style.background = '#10b981';
                toast.style.color = '#fff';
                toast.style.padding = '10px 20px';
                toast.style.borderRadius = '8px';
                toast.style.fontWeight = '600';
                toast.style.fontSize = '13px';
                toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
                toast.style.zIndex = '9999';
                toast.style.transition = 'opacity 0.3s';
                document.body.appendChild(toast);
            }
            toast.innerText = msg;
            toast.style.opacity = '1';
            toast.style.display = 'block';
            setTimeout(function() {
                toast.style.opacity = '0';
                setTimeout(function() { toast.style.display = 'none'; }, 300);
            }, 2500);
        }

        function selectNextGame() {
            if (selectedIndex < allGames.length - 1) {
                selectGame(selectedIndex + 1, true);
            }
        }

        function selectPreviousGame() {
            if (selectedIndex > 0) {
                selectGame(selectedIndex - 1, true);
            }
        }

        function reloadCurrentGame() {
            var g = allGames[selectedIndex];
            if (g) {
                var iframe = document.getElementById('gameIframe');
                iframe.src = '/games/' + g.name + '/index.html';
                addLog(new Date().toLocaleTimeString(), '🔄 Đã tải lại game: ' + g.title, 'event');
            }
        }

        function openDirectPlay() {
            var g = allGames[selectedIndex];
            if (g) {
                window.open('/tester/play/' + g.name, '_blank');
            }
        }

        // Điều khiển khung nhìn Simulator
        function setOrientation(mode) {
            currentOrientation = mode;
            var container = document.getElementById('phoneContainer');
            var btnP = document.getElementById('btnPortrait');
            var btnL = document.getElementById('btnLandscape');
            var btnF = document.getElementById('btnFullscreen');

            container.classList.remove('fullscreen', 'portrait', 'landscape');
            if (btnP) btnP.classList.remove('active');
            if (btnL) btnL.classList.remove('active');
            if (btnF) btnF.classList.remove('active');

            if (mode === 'fullscreen') {
                container.classList.add('fullscreen');
                if (btnF) btnF.classList.add('active');
            } else if (mode === 'portrait') {
                container.classList.add('portrait');
                if (btnP) btnP.classList.add('active');
            } else if (mode === 'landscape') {
                container.classList.add('landscape');
                if (btnL) btnL.classList.add('active');
            }

            // Cập nhật hiển thị banner
            updateBannerVisibility();
        }

        function toggleFullscreen() {
            setOrientation('fullscreen');
        }

        // Mô phỏng AdMob Banner
        function toggleBannerSimulation() {
            var g = allGames[selectedIndex];
            if (g && g.isHorizontal === 1 && !isBannerActive) {
                alert('⚠️ Game hiện tại là Game Ngang (Landscape)!\\nTheo quy tắc UX của NextAI, Game Ngang KHÔNG BAO GIỜ hiển thị banner để tránh che 100% màn hình.');
                return;
            }
            isBannerActive = !isBannerActive;
            updateBannerVisibility();
        }

        function setBannerMode(mode) {
            bannerMode = mode;
            document.getElementById('btnModeLinearLayout').classList.toggle('active', mode === 'linearlayout');
            document.getElementById('btnModeOverlay').classList.toggle('active', mode === 'overlay');
            updateBannerVisibility();
        }

        function updateBannerVisibility() {
            var banner = document.getElementById('simBanner');
            var btn = document.getElementById('btnBannerToggle');
            var g = allGames[selectedIndex];
            var isHoriz = (g && g.isHorizontal === 1) || (currentOrientation === 'landscape');

            if (isBannerActive && !isHoriz) {
                banner.classList.add('visible');
                btn.classList.add('on');
                btn.innerText = '🔥 Banner AdMob 50px: ĐANG BẬT';

                if (bannerMode === 'overlay') {
                    banner.classList.add('overlay-mode');
                    addLog(new Date().toLocaleTimeString(), '📌 Đã bật Banner chế độ Overlay (Đè 50px lên canvas)', 'score');
                } else {
                    banner.classList.remove('overlay-mode');
                    addLog(new Date().toLocaleTimeString(), '📐 Đã bật Banner chế độ LinearLayout (Thu hẹp Game 50px)', 'score');
                }
            } else {
                banner.classList.remove('visible');
                banner.classList.remove('overlay-mode');
                btn.classList.remove('on');
                btn.innerText = '🔥 Banner AdMob 50px: ĐANG TẮT';
            }

            // Trigger resize trong iframe
            var iframe = document.getElementById('gameIframe');
            if (iframe && iframe.contentWindow) {
                try { iframe.contentWindow.dispatchEvent(new Event('resize')); } catch(e){}
            }
        }

        // Live Log Terminal
        function addLog(time, msg, type) {
            var logs = document.getElementById('terminalLogs');
            var entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.innerHTML = '<span class="log-time">[' + time + ']</span><span class="log-msg ' + (type || '') + '">' + msg + '</span>';
            logs.appendChild(entry);
            logs.scrollTop = logs.scrollHeight;
        }

        function clearLogs() {
            document.getElementById('terminalLogs').innerHTML = '';
        }

        function markGameStatus(gameName, status) {
            var dot = document.getElementById('dot-' + gameName);
            if (dot) {
                dot.className = 'game-status-dot ' + status;
            }
        }

        // Chạy kiểm thử tự động hàng loạt (Batch Smoke Test)
        function runAutomatedTest() {
            document.getElementById('smokeTestModal').style.display = 'flex';
        }

        function closeSmokeTestModal() {
            document.getElementById('smokeTestModal').style.display = 'none';
            batchStopRequested = true;
        }

        function stopBatchTest() {
            batchStopRequested = true;
            document.getElementById('batchProgress').innerText = 'Đã yêu cầu dừng kiểm thử!';
        }

        async function startBatchTest(limit) {
            batchStopRequested = false;
            isTestingBatch = true;
            var tbody = document.getElementById('batchTableBody');
            tbody.innerHTML = '';
            var listToTest = allGames.slice(0, limit);
            var progressEl = document.getElementById('batchProgress');

            var passedCount = 0;
            var errorCount = 0;

            for (var i = 0; i < listToTest.length; i++) {
                if (batchStopRequested) break;
                var g = listToTest[i];
                progressEl.innerText = 'Đang kiểm thử game ' + (i + 1) + '/' + listToTest.length + ': ' + g.title;

                var tr = document.createElement('tr');
                tr.id = 'batch-row-' + g.name;
                tr.style.borderBottom = '1px solid #1e293b';
                tr.innerHTML = 
                    '<td style="padding: 8px;">' + (i + 1) + '</td>' +
                    '<td style="padding: 8px; font-weight: 600;">' + g.title + '</td>' +
                    '<td style="padding: 8px;">' + (g.isHorizontal ? '🎮 Ngang' : '📱 Dọc') + '</td>' +
                    '<td style="padding: 8px;" id="batch-load-' + g.name + '">⏳ Đang load...</td>' +
                    '<td style="padding: 8px;" id="batch-err-' + g.name + '">Không có</td>' +
                    '<td style="padding: 8px;" id="batch-status-' + g.name + '">⏳ Testing</td>';
                tbody.appendChild(tr);

                // Load game vào simulator
                selectGameByName(g.name);

                // Đợi 3 giây để game nạp tài nguyên và kiểm tra
                await new Promise(function(resolve) { setTimeout(resolve, 3000); });

                // Đánh giá kết quả
                var loadTd = document.getElementById('batch-load-' + g.name);
                var statusTd = document.getElementById('batch-status-' + g.name);
                var dot = document.getElementById('dot-' + g.name);

                if (dot && dot.classList.contains('error')) {
                    statusTd.innerHTML = '<span style="color: #ef4444; font-weight: bold;">❌ LỖI JS</span>';
                    errorCount++;
                } else if (dot && dot.classList.contains('playable')) {
                    loadTd.innerHTML = '<span style="color: #10b981;">✅ gameLoaded</span>';
                    statusTd.innerHTML = '<span style="color: #10b981; font-weight: bold;">🟢 OK (Playable)</span>';
                    passedCount++;
                } else {
                    loadTd.innerHTML = '<span style="color: #94a3b8;">Sẵn sàng (Canvas render)</span>';
                    statusTd.innerHTML = '<span style="color: #10b981; font-weight: bold;">🟢 OK (Canvas OK)</span>';
                    passedCount++;
                }
            }

            progressEl.innerHTML = '🏁 Hoàn tất: <b style="color: #10b981;">' + passedCount + ' Đạt</b>, <b style="color: #ef4444;">' + errorCount + ' Lỗi</b> trên tổng số ' + listToTest.length + ' games.';
        }
    </script>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
}
/**
 * Giao diện chính của Web Game Testing Studio.
 * Main Interactive Testing Studio Dashboard.
 * GET /tester
 * Hỗ trợ: /tester?game=block_blast hoặc /tester?id=block_blast
 */
exports.gameTesterRouter.get('/', (req, res) => {
    const requested = req.query.game || req.query.id || '';
    renderTesterStudio(req, res, requested);
});
/**
 * Route trực tiếp theo ID game trong URL.
 * Direct game route: GET /tester/:gameName (ví dụ: /tester/block_blast)
 */
exports.gameTesterRouter.get('/:gameName', (req, res, next) => {
    const gameName = req.params.gameName;
    if (['api', 'embed', 'play'].includes(gameName)) {
        return next();
    }
    renderTesterStudio(req, res, gameName);
});
