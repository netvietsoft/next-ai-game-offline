import express from 'express';
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 6037;
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
        { name: 'blocks_target', id: 24 },
        { name: 'block_colors_sort', id: 27 },
        { name: 'block_puzzle_solve', id: 36 },
        { name: 'color_block', id: 79 },
        { name: 'farm_mahjong', id: 121 },
        { name: 'knife_hit', id: 202 },
        { name: 'knife_hit_2', id: 203 }
    ];

    const browser = await chromium.launch({
        headless: true,
        channel: 'chrome',
        args: ['--disable-gpu', '--no-sandbox', '--mute-audio']
    });

    const results = [];

    for (const target of targets) {
        const name = target.name;
        console.log(`\n================== TESTING #${target.id}: ${name} ==================`);
        const context = await browser.newContext({ viewport: { width: 450, height: 800 } });
        const page = await context.newPage();
        const logs = [];
        const errors = [];

        page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
        page.on('pageerror', err => errors.push(err.message));

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
            await page.goto(url, { waitUntil: 'load', timeout: 12000 });
            await page.waitForTimeout(4000);

            // Screenshot artifact
            const screenshotPath = path.resolve(__dirname, `../screenshot_${name}.png`);
            await page.screenshot({ path: screenshotPath });

            const evalResult = await page.evaluate(() => {
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
                    bodyChildren: document.body.children.length
                };
            });

            console.log(`Result for ${name}:`, evalResult);
            console.log(`Errors:`, errors);
            results.push({ name, evalResult, errorsCount: errors.length });
        } catch (e) {
            console.error(`Failed testing ${name}:`, e.message);
            results.push({ name, error: e.message });
        } finally {
            await context.close();
        }
    }

    await browser.close();
    server.close();
    console.log('\nFINAL RESULTS:', JSON.stringify(results, null, 2));
    process.exit(0);
});
