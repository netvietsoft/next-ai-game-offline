import { chromium } from 'playwright';

const testGames = [
    'impulse_ball_2',
    'route_digger',
    'twenty48',
    'plane_shooter',
    'puzzle_legends'
];

async function run() {
    const browser = await chromium.launch({
        channel: 'chrome',
        headless: true,
        args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', '--mute-audio']
    });
    for (const g of testGames) {
        const page = await browser.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('console', m => {
            if (m.type() === 'error' && !m.text().includes('Audio') && !m.text().includes('SoundJS') && !m.text().includes('Failed to parse JSON')) {
                errors.push(m.text());
            }
        });
        try {
            await page.goto(`http://localhost:6033/games/${g}/index.html`, { waitUntil: 'domcontentloaded', timeout: 8000 });
            
            // Check canvas or DOM container
            try {
                await page.waitForSelector('canvas, .game-container, .grid-container', { state: 'attached', timeout: 4000 });
            } catch(e) {}

            const info = await page.evaluate(() => {
                const canvas = document.querySelector('canvas');
                if (canvas) return { type: 'canvas', w: canvas.width, h: canvas.height };
                const dom = document.querySelector('.grid-container, .game-container');
                if (dom) return { type: 'dom', w: dom.offsetWidth || 500, h: dom.offsetHeight || 500 };
                return null;
            });

            if (info) {
                console.log(`[PASS] ${g}: ${info.type} ${info.w}x${info.h}, Errors: ${errors.length} (${errors.join('; ')})`);
            } else {
                console.log(`[FAIL] ${g}: No canvas/dom found, Errors: ${errors.join('; ')}`);
            }
        } catch(err) {
            console.log(`[FAIL] ${g}: ${err.message}, Errors: ${errors.join('; ')}`);
        }
        await page.close();
    }
    await browser.close();
}

run();
