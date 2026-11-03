import express from 'express';
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 6036;
const ASSETS_ROOT = path.resolve(__dirname, '../Android/src/main/assets');
const GAMES_PATH = path.join(ASSETS_ROOT, 'games');

app.use('/assets/games', express.static(GAMES_PATH));
app.use('/assets', express.static(ASSETS_ROOT));
app.use('/games', express.static(GAMES_PATH));

app.use((req, res, next) => {
    const referer = req.headers.referer || '';
    const match = referer.match(/\/games\/([^\/]+)\//);
    if (match) {
        const gameName = match[1];
        const gameFile = path.join(GAMES_PATH, gameName, req.path);
        if (fs.existsSync(gameFile) && fs.statSync(gameFile).isFile()) {
            return res.sendFile(gameFile);
        }
    }
    const rootFile = path.join(ASSETS_ROOT, req.path);
    if (fs.existsSync(rootFile) && fs.statSync(rootFile).isFile()) {
        return res.sendFile(rootFile);
    }
    next();
});

const server = app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    const targets = [
        'blocks_target',
        'block_colors_sort',
        'block_puzzle_solve',
        'color_block',
        'farm_mahjong',
        'knife_hit',
        'knife_hit_2'
    ];

    const browser = await chromium.launch({
        headless: true,
        channel: 'chrome',
        args: ['--disable-gpu', '--no-sandbox', '--mute-audio']
    });

    for (const name of targets) {
        console.log(`\n================== TESTING: ${name} ==================`);
        const context = await browser.newContext({ viewport: { width: 450, height: 800 } });
        const page = await context.newPage();
        const logs = [];
        const errors = [];
        const failedRequests = [];

        page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
        page.on('pageerror', err => errors.push(err.message));
        page.on('requestfailed', req => failedRequests.push(`${req.method()} ${req.url()} (${req.failure()?.errorText})`));

        // Inject Android interface before any script executes
        await page.addInitScript(() => {
            const mock = {
                gameLoaded: () => console.log('[Android] gameLoaded'),
                onGameReady: () => console.log('[Android] onGameReady'),
                levelStartInGame: (lvl) => console.log('[Android] levelStartInGame', lvl),
                levelCompleteInGame: (lvl, extra) => console.log('[Android] levelCompleteInGame', lvl, extra),
                levelLoseInGame: (lvl, extra) => console.log('[Android] levelLoseInGame', lvl, extra),
                levelRestartInGame: (lvl) => console.log('[Android] levelRestartInGame', lvl),
                levelClick: (lvl) => console.log('[Android] levelClick', lvl),
                scoreInGame: (s) => console.log('[Android] scoreInGame', s),
                submitScore: (s) => console.log('[Android] submitScore', s),
                showInterstitialInGame: (p) => console.log('[Android] showInterstitialInGame', p),
                showRewardedInGame: (p) => console.log('[Android] showRewardedInGame', p),
                showRewardedVideo: (t) => console.log('[Android] showRewardedVideo', t),
                vibrate: (ms) => console.log('[Android] vibrate', ms),
                gameOpenLink: () => console.log('[Android] gameOpenLink'),
                gameProgressEvent: (str) => console.log('[Android] gameProgressEvent', str),
            };
            window.Android = mock;
            window.AndroidBridge = mock;
        });

        try {
            const url = `http://localhost:${PORT}/games/${name}/index.html`;
            await page.goto(url, { waitUntil: 'load', timeout: 10000 });

            // Wait 2s and try unlocking just like GameActivity does
            await page.waitForTimeout(2000);
            await page.evaluate((gName) => {
                try {
                    if (window.c3_callFunction) {
                        const c3Key = (window.c3_runtimeInterface && window.c3_runtimeInterface._localRuntime &&
                            (window.c3_runtimeInterface._localRuntime._projectName +
                             window.c3_runtimeInterface._localRuntime._projectVersion +
                             window.c3_runtimeInterface._localRuntime._originalViewportHeight +
                             window.c3_runtimeInterface._localRuntime._originalViewportWidth)) || "";
                        if (c3Key) {
                            console.log('[TestUnlock] Calling clearLocalStorage with dynamic key:', c3Key);
                            window.c3_callFunction("clearLocalStorage", [c3Key]);
                        }
                    }
                    if (window.clearLocalStorage) {
                        window.clearLocalStorage();
                    }
                } catch (e) {
                    console.error('[TestUnlock] Error:', e);
                }
            }, name);

            await page.waitForTimeout(2000);

            // Take screenshot to see visual state
            await page.screenshot({ path: `../Report/screenshots/diagnose_${name}.png` });

            const result = await page.evaluate(() => {
                const canvas = document.querySelector('canvas');
                let canvasInfo = null;
                if (canvas) {
                    canvasInfo = {
                        width: canvas.width,
                        height: canvas.height,
                        offsetWidth: canvas.offsetWidth,
                        offsetHeight: canvas.offsetHeight,
                        style: canvas.getAttribute('style')
                    };
                }
                return {
                    title: document.title,
                    canvas: canvasInfo,
                    bodyInner: document.body ? document.body.innerHTML.substring(0, 300) : ''
                };
            });

            console.log('Result:', JSON.stringify(result, null, 2));
            if (errors.length > 0) console.log('Page Errors:', errors);
            if (failedRequests.length > 0) console.log('Failed Requests:', failedRequests);
            console.log('Logs (last 10):', logs.slice(-10));
        } catch (e) {
            console.error('Test error:', e.message);
        }
        await context.close();
    }

    await browser.close();
    server.close();
    console.log('\nDone testing all 7 games with Android injected.');
});
