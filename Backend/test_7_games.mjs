import express from 'express';
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 6035;
const ASSETS_ROOT = path.resolve(__dirname, '../Android/src/main/assets');
const GAMES_PATH = path.join(ASSETS_ROOT, 'games');

// Serve games
app.use('/assets/games', express.static(GAMES_PATH));
app.use('/assets', express.static(ASSETS_ROOT));
app.use('/games', express.static(GAMES_PATH));

// Also simulate root-relative fallbacks like GameWebViewClient
app.use((req, res, next) => {
    // If request is root-relative, try to find in current referer game
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

        try {
            const url = `http://localhost:${PORT}/games/${name}/index.html`;
            await page.goto(url, { waitUntil: 'load', timeout: 10000 });
            await page.waitForTimeout(4000);

            const result = await page.evaluate(() => {
                const canvas = document.querySelector('canvas');
                let canvasInfo = null;
                if (canvas) {
                    // Check if canvas is rendered or black
                    const ctx = canvas.getContext('2d');
                    let isBlank = false;
                    let samplePixel = null;
                    if (ctx) {
                        try {
                            const imgData = ctx.getImageData(0, 0, Math.min(canvas.width, 100), Math.min(canvas.height, 100));
                            samplePixel = [imgData.data[0], imgData.data[1], imgData.data[2], imgData.data[3]];
                        } catch (e) {
                            samplePixel = 'CORS/WebGL';
                        }
                    }
                    canvasInfo = {
                        width: canvas.width,
                        height: canvas.height,
                        offsetWidth: canvas.offsetWidth,
                        offsetHeight: canvas.offsetHeight,
                        style: canvas.getAttribute('style'),
                        samplePixel
                    };
                }
                return {
                    title: document.title,
                    bodyChildrenCount: document.body ? document.body.children.length : 0,
                    canvas: canvasInfo,
                    visibleText: document.body ? document.body.innerText.trim().substring(0, 200) : ''
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
    console.log('\nDone testing all 7 games.');
});
