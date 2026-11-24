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
import {
    isValidGameName,
    isValidSingleFileName,
    resolveSafeChildPath,
    resolveSafeGameIndexPath
} from './utils/gamePathSecurity';
import { buildMockAndroidBridgeScript, injectIntoHtmlHead } from './utils/mockAndroidBridge';

const app = express();
const PORT = Number(process.env.PORT) || 6033;

/**
 * Xây dựng danh sách origin hợp lệ cho CORS (khóa chặt thay vì mở wildcard toàn cầu).
 * Builds the CORS allowlist from `ALLOWED_ORIGINS` (defaulting to local port 6033 origins).
 */
function buildCorsOrigins(): Set<string> {
    const configured = process.env.ALLOWED_ORIGINS
        ?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    if (configured && configured.length > 0) {
        return new Set(configured);
    }
    return new Set([`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`]);
}

const allowedCorsOrigins = buildCorsOrigins();

// Middleware bảo mật & parse JSON / Security and JSON body parsing middleware
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedCorsOrigins.has(origin)) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        }
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// Khởi tạo Database SQLite / Initialize SQLite database
initDatabase();

// Đường dẫn tài nguyên tĩnh của kho Game Android / Static paths to Android game assets
const ASSETS_ROOT = path.resolve(__dirname, '../../Android/src/main/assets');
const GAMES_PATH = path.join(ASSETS_ROOT, 'games');
const ICONS_PATH = path.join(ASSETS_ROOT, 'icons');

/**
 * Intercept `index.html` để nhúng Mock Android Bridge an toàn sau khi kiểm tra tên game.
 * Intercepts game `index.html` to inject the mock Android bridge after strict path validation.
 */
app.get(
    ['/games/:gameName', '/games/:gameName/', '/games/:gameName/index.html'],
    (req, res, next) => {
        const gameName = req.params.gameName;
        if (!isValidGameName(gameName)) {
            return res.status(400).json({ error: 'Invalid game identifier' });
        }
        const indexPath = resolveSafeGameIndexPath(GAMES_PATH, gameName);
        if (!indexPath || !fs.existsSync(indexPath)) {
            return next();
        }
        try {
            const rawHtml = fs.readFileSync(indexPath, 'utf8');
            const bridgeScript = buildMockAndroidBridgeScript(gameName);
            const html = injectIntoHtmlHead(rawHtml, bridgeScript);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.send(html);
        } catch {
            return next();
        }
    }
);

// Fallback: loading-logo.png và icon games (có kiểm tra đường dẫn an toàn)
app.get(
    [
        '/games/:gameName/loading-logo.png',
        '/games/:gameName/icons/loading-logo.png',
        '/loading-logo.png',
        '/icons/loading-logo.png'
    ],
    (req, res, next) => {
        const gameName = req.params.gameName;
        if (gameName) {
            if (!isValidGameName(gameName)) {
                return res.status(400).json({ error: 'Invalid game identifier' });
            }
            const gameLogo = resolveSafeChildPath(GAMES_PATH, gameName, 'loading-logo.png');
            if (gameLogo && fs.existsSync(gameLogo)) {
                return res.sendFile(gameLogo);
            }
            const gameIconLogo = resolveSafeChildPath(
                GAMES_PATH,
                gameName,
                'icons',
                'loading-logo.png'
            );
            if (gameIconLogo && fs.existsSync(gameIconLogo)) {
                return res.sendFile(gameIconLogo);
            }
        }
        const defaultLogo = path.join(ASSETS_ROOT, 'loading-logo.png');
        if (fs.existsSync(defaultLogo)) {
            res.setHeader('Content-Type', 'image/png');
            return res.sendFile(defaultLogo);
        }
        return next();
    }
);

app.get('/games/:gameName/icons/:iconFile', (req, res, next) => {
    const { gameName, iconFile } = req.params;
    if (!isValidGameName(gameName) || !isValidSingleFileName(iconFile)) {
        return res.status(400).json({ error: 'Invalid icon path' });
    }
    const localIcon = resolveSafeChildPath(GAMES_PATH, gameName, 'icons', iconFile);
    if (localIcon && fs.existsSync(localIcon)) {
        return res.sendFile(localIcon);
    }
    const catalogIcon = resolveSafeChildPath(ICONS_PATH, `${gameName}.png`);
    if (catalogIcon && fs.existsSync(catalogIcon)) {
        return res.sendFile(catalogIcon);
    }
    const defaultLogo = path.join(ASSETS_ROOT, 'loading-logo.png');
    if (fs.existsSync(defaultLogo)) {
        return res.sendFile(defaultLogo);
    }
    return next();
});

// Mock Cordova runtime & plugins cho các game HTML5 C2/Cordova
app.get(['/cordova.js', '/games/:gameName/cordova.js'], (_req, res) => {
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
            } catch (e) {}
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

app.get(['/cordova_plugins.js', '/games/:gameName/cordova_plugins.js'], (_req, res) => {
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

// Fallback phục vụ các file thư viện dùng chung ở assets root (có kiểm tra an toàn đường dẫn)
app.get('/games/:sharedFile', (req, res, next) => {
    const sharedFile = req.params.sharedFile;
    if (!isValidSingleFileName(sharedFile)) {
        return res.status(400).json({ error: 'Invalid shared asset filename' });
    }
    const assetPath = resolveSafeChildPath(ASSETS_ROOT, sharedFile);
    if (assetPath && fs.existsSync(assetPath) && !fs.statSync(assetPath).isDirectory()) {
        if (sharedFile.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (sharedFile.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        } else if (sharedFile.endsWith('.wasm')) {
            res.setHeader('Content-Type', 'application/wasm');
        }
        return res.sendFile(assetPath);
    }
    return next();
});

// Phục vụ Static Files cho kho Mini-Games HTML5 kèm MIME chuẩn cho WASM/JSON/JS
app.use(
    '/games',
    express.static(GAMES_PATH, {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.wasm')) {
                res.setHeader('Content-Type', 'application/wasm');
            } else if (filePath.endsWith('.json')) {
                res.setHeader('Content-Type', 'application/json');
            } else if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
                res.setHeader('Content-Type', 'application/javascript');
            }
        }
    })
);

app.use('/icons', express.static(ICONS_PATH));
app.use('/assets', express.static(ASSETS_ROOT));
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

// Web Game Testing Studio & AdMob Inspector (Port 6033)
app.use('/tester', gameTesterRouter);

// Shortcut chơi game trực tiếp (có validate gameName chống Open Redirect / XSS)
app.get('/play/:gameName', (req, res) => {
    const gameName = req.params.gameName;
    if (!isValidGameName(gameName)) {
        return res.status(400).json({ error: 'Invalid game identifier' });
    }
    return res.redirect(`/tester/play/${encodeURIComponent(gameName)}`);
});

// Web Admin CMS Dashboard (Port 6033)
app.use('/admin', adminCmsRouter);

app.get('/', (_req, res) => {
    res.redirect('/tester');
});

app.get('/health', (_req, res) => {
    res.json({
        status: 'UP',
        service: 'NextAI Game Offline Platform',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log('=======================================================');
        console.log(`NextAI Game Offline Server is running on Port: ${PORT}`);
        console.log(`Game Testing Studio: http://localhost:${PORT}/tester`);
        console.log(`Admin CMS Dashboard: http://localhost:${PORT}/admin`);
        console.log(`Swagger API Docs:    http://localhost:${PORT}/api-docs`);
        console.log('=======================================================');
    });
}

export default app;
