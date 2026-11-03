import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { initDatabase } from './database/db';
import { authRouter } from './api/auth';
import { gamesRouter } from './api/games';
import { usersRouter } from './api/users';
import { devicesRouter } from './api/devices';
import { mediaRouter } from './api/media';
import { adsRouter } from './api/ads';
import { adminCmsRouter } from './cms/adminView';
import { gameTesterRouter } from './cms/gameTester';
import { swaggerDocument } from './swagger';

const app = express();
const PORT = process.env.PORT || 6033;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Khởi tạo Database SQLite / In-memory data
initDatabase();

// Đường dẫn tài nguyên tĩnh của kho Game Android
// Static paths to Android game assets
const ASSETS_ROOT = path.resolve(__dirname, '../../Android/src/main/assets');
const GAMES_PATH = path.join(ASSETS_ROOT, 'games');
const ICONS_PATH = path.join(ASSETS_ROOT, 'icons');

// Intercept index.html để nhúng Mock Android Bridge trước khi trả về trình duyệt
// Intercept index.html to inject Mock Android Bridge with native relative resolution
app.get(['/games/:gameName', '/games/:gameName/', '/games/:gameName/index.html'], (req, res, next) => {
    const gameName = req.params.gameName;
    const indexPath = path.join(GAMES_PATH, gameName, 'index.html');
    if (fs.existsSync(indexPath)) {
        try {
            let html = fs.readFileSync(indexPath, 'utf8');
            const bridgeScript = `
        <!-- NextAI Mock Android Bridge for Web Playtest -->
        <script>
        (function() {
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
                gameLoaded: function() { console.log('[AndroidBridge] gameLoaded()'); postToParent('gameLoaded'); },
                onGameReady: function() { console.log('[AndroidBridge] onGameReady()'); postToParent('onGameReady'); },
                levelStartInGame: function(lvl) { console.log('[AndroidBridge] levelStartInGame:', lvl); postToParent('levelStartInGame', { level: lvl }); },
                levelCompleteInGame: function(lvl, extra) { console.log('[AndroidBridge] levelCompleteInGame:', lvl, extra); postToParent('levelCompleteInGame', { level: lvl, extra: extra }); },
                levelLoseInGame: function(lvl, extra) { console.log('[AndroidBridge] levelLoseInGame:', lvl, extra); postToParent('levelLoseInGame', { level: lvl, extra: extra }); },
                levelRestartInGame: function(lvl) { console.log('[AndroidBridge] levelRestartInGame:', lvl); postToParent('levelRestartInGame', { level: lvl }); },
                levelClick: function(lvl) { console.log('[AndroidBridge] levelClick:', lvl); postToParent('levelClick', { level: lvl }); },
                scoreInGame: function(score) { console.log('[AndroidBridge] scoreInGame:', score); postToParent('scoreInGame', { score: score }); },
                submitScore: function(score) { console.log('[AndroidBridge] submitScore:', score); postToParent('submitScore', { score: score }); },
                showInterstitialInGame: function(place) { console.log('[AndroidBridge] showInterstitialInGame:', place); postToParent('showInterstitialInGame', { place: place }); },
                requestInterstitialAd: function() { console.log('[AndroidBridge] requestInterstitialAd'); postToParent('requestInterstitialAd'); },
                showRewardedInGame: function(place) { console.log('[AndroidBridge] showRewardedInGame:', place); postToParent('showRewardedInGame', { place: place }); },
                showRewardedVideo: function(type) { console.log('[AndroidBridge] showRewardedVideo:', type); postToParent('showRewardedVideo', { type: type }); },
                requestRewardedVideo: function() { console.log('[AndroidBridge] requestRewardedVideo'); postToParent('requestRewardedVideo'); },
                vibrate: function(ms) { console.log('[AndroidBridge] vibrate:', ms); if (navigator.vibrate) navigator.vibrate(ms || 50); postToParent('vibrate', { ms: ms }); },
                gameOpenLink: function() { console.log('[AndroidBridge] gameOpenLink'); postToParent('gameOpenLink'); },
                gameCloseRedirectWindow: function() {},
                gameOpenRedirectWindow: function() {},
                gameProgressEvent: function(str) { console.log('[AndroidBridge] gameProgressEvent:', str); }
            };

            window.Android = mockBridge;
            window.AndroidBridge = mockBridge;
            window.LoadingCompleted = function() { console.log('[AndroidBridge] LoadingCompleted()'); postToParent('gameLoaded'); };

            // Auto dispatch deviceready for Cordova & Construct 2 games
            setTimeout(function() {
                try {
                    var evt = document.createEvent('Events');
                    evt.initEvent('deviceready', false, false);
                    document.dispatchEvent(evt);
                } catch(e) {}
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
            if (html.includes('<head>')) {
                html = html.replace('<head>', '<head>' + bridgeScript);
            } else if (html.includes('<HEAD>')) {
                html = html.replace('<HEAD>', '<HEAD>' + bridgeScript);
            } else {
                html = bridgeScript + html;
            }
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.send(html);
        } catch (e) {
            // fallback to next
        }
    }
    next();
});

// Fallback: loading-logo.png và icon games
app.get(['/games/:gameName/loading-logo.png', '/games/:gameName/icons/loading-logo.png', '/loading-logo.png', '/icons/loading-logo.png'], (req, res, next) => {
    const gameName = req.params.gameName;
    if (gameName) {
        const gameLogo = path.join(GAMES_PATH, gameName, 'loading-logo.png');
        if (fs.existsSync(gameLogo)) return res.sendFile(gameLogo);
        const gameIconLogo = path.join(GAMES_PATH, gameName, 'icons', 'loading-logo.png');
        if (fs.existsSync(gameIconLogo)) return res.sendFile(gameIconLogo);
    }
    const defaultLogo = path.join(ASSETS_ROOT, 'loading-logo.png');
    if (fs.existsSync(defaultLogo)) {
        res.setHeader('Content-Type', 'image/png');
        return res.sendFile(defaultLogo);
    }
    next();
});

app.get('/games/:gameName/icons/:iconFile', (req, res, next) => {
    const { gameName, iconFile } = req.params;
    const localIcon = path.join(GAMES_PATH, gameName, 'icons', iconFile);
    if (fs.existsSync(localIcon)) return res.sendFile(localIcon);
    const catalogIcon = path.join(ICONS_PATH, `${gameName}.png`);
    if (fs.existsSync(catalogIcon)) return res.sendFile(catalogIcon);
    const defaultLogo = path.join(ASSETS_ROOT, 'loading-logo.png');
    if (fs.existsSync(defaultLogo)) return res.sendFile(defaultLogo);
    next();
});

// Mock Cordova runtime & plugins cho các game HTML5 C2/Cordova
app.get(['/cordova.js', '/games/:gameName/cordova.js'], (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.send(`
    (function() {
        window.cordova = window.cordova || {
            platformId: 'android',
            version: '10.0.0',
            exec: function() {},
            define: function(id, factory) {
                window.cordova.modules = window.cordova.modules || {};
                window.cordova.modules[id] = factory;
            },
            require: function(id) {
                return (window.cordova.modules && window.cordova.modules[id]) || {};
            }
        };
        function triggerReady() {
            try {
                var evt = document.createEvent('Events');
                evt.initEvent('deviceready', false, false);
                document.dispatchEvent(evt);
            } catch(e) {}
        }
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(triggerReady, 30);
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(triggerReady, 30);
            });
        }
    })();
    `);
});

app.get(['/cordova_plugins.js', '/games/:gameName/cordova_plugins.js'], (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.send(`
    if (window.cordova && window.cordova.define) {
        cordova.define('cordova/plugin_list', function(require, exports, module) {
            module.exports = [];
            module.exports.metadata = {};
        });
    }
    `);
});

// Fallback phục vụ các file thư viện dùng chung ở assets root khi game gọi ../file.js hoặc ../file.png
app.get('/games/:sharedFile', (req, res, next) => {
    const sharedFile = req.params.sharedFile;
    const assetPath = path.join(ASSETS_ROOT, sharedFile);
    if (fs.existsSync(assetPath) && !fs.statSync(assetPath).isDirectory()) {
        if (sharedFile.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
        else if (sharedFile.endsWith('.png')) res.setHeader('Content-Type', 'image/png');
        else if (sharedFile.endsWith('.wasm')) res.setHeader('Content-Type', 'application/wasm');
        return res.sendFile(assetPath);
    }
    next();
});

// Phục vụ Static Files cho 419+ HTML5 Mini-Games với WASM và CORS Headers
app.use('/games', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
}, express.static(GAMES_PATH, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.wasm')) {
            res.setHeader('Content-Type', 'application/wasm');
        } else if (filePath.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json');
        } else if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Phục vụ Icons của các games
app.use('/icons', express.static(ICONS_PATH));

// Phục vụ toàn bộ Assets thư mục gốc (nếu game gọi ../cordova.js hoặc script dùng chung)
app.use('/assets', express.static(ASSETS_ROOT));

// Static assets for uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger OpenAPI 3.0 Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/games', gamesRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/devices', devicesRouter);
app.use('/api/v1/media', mediaRouter);
app.use('/api/v1/ads', adsRouter);

// Web Game Testing Studio & AdMob Inspector (Cổng 6033)
app.use('/tester', gameTesterRouter);

// Shortcut chơi game trực tiếp
app.get('/play/:gameName', (req, res) => {
    res.redirect(`/tester/play/${req.params.gameName}`);
});

// Web Admin CMS Dashboard (Port 6033)
app.use('/admin', adminCmsRouter);

// Root redirect to Game Testing Studio (or Admin CMS)
app.get('/', (req, res) => {
    res.redirect('/tester');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'NextAI Game Offline Platform',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 NextAI Game Offline Server is running on Port: ${PORT}`);
    console.log(`🎮 Game Testing Studio: http://localhost:${PORT}/tester`);
    console.log(`📱 Mobile Wi-Fi Access:  http://192.168.1.14:${PORT}/tester`);
    console.log(`📊 Admin CMS Dashboard:  http://localhost:${PORT}/admin`);
    console.log(`📖 Swagger API Docs:     http://localhost:${PORT}/api-docs`);
    console.log(`=======================================================`);
});

export default app;
