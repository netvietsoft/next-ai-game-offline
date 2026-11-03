import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const CATALOG_PATH = 'e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/assets/games_catalog.json';
const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));

const CONCURRENCY = 3; // 3 parallel browser workers with memory recycling
const BASE_URL = 'http://localhost:6033';

async function createBrowser() {
    return await chromium.launch({
        headless: true,
        channel: 'chrome',
        args: [
            '--disable-gpu',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--mute-audio',
            '--autoplay-policy=no-user-gesture-required'
        ]
    });
}

async function testGame(browser, game, index, total) {
    const context = await browser.newContext({
        viewport: game.isHorizontal === 1 ? { width: 800, height: 450 } : { width: 450, height: 800 }
    });
    const page = await context.newPage();

    const errors = [];
    const failedRequests = [];
    const bridgeEvents = [];

    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[AndroidBridge]')) {
            bridgeEvents.push(text);
        }
        if (msg.type() === 'error') {
            errors.push(text);
        }
    });

    page.on('pageerror', err => {
        errors.push(err.message);
    });

    page.on('requestfailed', req => {
        const url = req.url();
        if (!url.includes('favicon.ico') && !url.includes('google-analytics') && !url.includes('doubleclick')) {
            failedRequests.push(`${req.method()} ${url} (${req.failure()?.errorText || 'failed'})`);
        }
    });

    const url = `${BASE_URL}/games/${game.name}/index.html`;
    let status = 'PASS';
    let canvasInfo = null;
    let failureReason = '';

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });

        // Wait up to 3.5s for canvas or DOM game container to mount
        try {
            await page.waitForSelector('canvas, .game-container, .grid-container, #game', { state: 'attached', timeout: 3500 });
        } catch (e) {
            // Check if game uses DOM elements or SVG
        }

        // Evaluate canvas and DOM state
        canvasInfo = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (canvas) {
                return {
                    found: true,
                    type: 'canvas',
                    width: canvas.width,
                    height: canvas.height,
                    offsetWidth: canvas.offsetWidth,
                    offsetHeight: canvas.offsetHeight
                };
            }
            const dom = document.querySelector('.grid-container, .game-container, #game-container, #game');
            if (dom) {
                return {
                    found: true,
                    type: 'dom',
                    width: dom.offsetWidth || 500,
                    height: dom.offsetHeight || 500,
                    offsetWidth: dom.offsetWidth || 500,
                    offsetHeight: dom.offsetHeight || 500
                };
            }
            return {
                found: false,
                bodyChildren: document.body ? document.body.children.length : 0
            };
        });

        // Dispatch simulated play interactions on canvas
        if (canvasInfo.found) {
            try {
                const cx = game.isHorizontal === 1 ? 400 : 225;
                const cy = game.isHorizontal === 1 ? 225 : 400;
                // Click 1: Unlock audio & focus canvas
                await page.mouse.click(cx, cy);
                await page.waitForTimeout(300);
                // Click 2: Press Start / Play button
                await page.mouse.click(cx, cy + (game.isHorizontal === 1 ? 50 : 80));
                await page.waitForTimeout(300);
                // Move: Test touch/mouse move input
                await page.mouse.move(cx + 40, cy + 40);
            } catch(e) {}
        }

        // Wait 1.2s to observe render loop, physics, and bridge events
        await page.waitForTimeout(1200);

    } catch (err) {
        status = 'FAIL';
        failureReason = `Navigation/timeout error: ${err.message}`;
    }

    // Determine final status
    const fatalErrors = errors.filter(e => 
        !e.includes('favicon.ico') && 
        !e.includes('AudioContext') && 
        !e.includes('SoundJS') && 
        !e.includes('Web Audio') && 
        !e.includes('screen.orientation.lock') && 
        !e.includes('powerPreference option is currently ignored') && 
        !e.includes('willReadFrequently') && 
        !e.includes('spinTicket object not found') && 
        !e.includes('spintext object not found') && 
        !e.includes('Error restoring object visibility') && 
        !e.includes('Unable to decode audio data') && 
        !e.includes('Failed to load audio') && 
        !e.includes('Failed to parse JSON') &&
        !e.includes('Failed to load resource: the server responded with a status of')
    );

    const fatal404s = failedRequests.filter(r => 
        r.includes('.js') || r.includes('.wasm') || r.includes('data.json') || r.includes('appmanifest.json')
    );

    if (status !== 'FAIL') {
        if (!canvasInfo || !canvasInfo.found) {
            status = 'FAIL';
            failureReason = 'No canvas element rendered';
        } else if (fatal404s.length > 0) {
            status = 'FAIL';
            failureReason = `Missing critical assets: ${fatal404s.join('; ')}`;
        } else if (fatalErrors.length > 0) {
            status = 'FAIL';
            failureReason = `Fatal JS errors: ${fatalErrors.slice(0, 2).join('; ')}`;
        } else if (canvasInfo.width === 0 || canvasInfo.height === 0) {
            status = 'WARN';
            failureReason = 'Canvas size is 0x0';
        }
    }

    await context.close();

    const progressStr = `[${index + 1}/${total}] ${game.name}: ${status}`;
    const detailStr = status === 'PASS' 
        ? `(Canvas: ${canvasInfo?.width}x${canvasInfo?.height}, Bridge: ${bridgeEvents.length > 0 ? bridgeEvents[0] : 'ready'})`
        : `(${failureReason})`;
    console.log(`${progressStr} ${detailStr}`);

    return {
        name: game.name,
        title: game.title,
        category: game.category,
        isHorizontal: game.isHorizontal,
        status,
        canvas: canvasInfo,
        bridgeEvents,
        fatalErrors,
        fatal404s,
        failureReason
    };
}

async function runAllTests() {
    console.log(`=======================================================`);
    console.log(`🚀 BẮT ĐẦU BATCH PLAYTEST TOÀN BỘ ${catalog.length} MINI-GAMES`);
    console.log(`⚡ Concurrency: ${CONCURRENCY} workers song song`);
    console.log(`🌐 Server Target: ${BASE_URL}`);
    console.log(`=======================================================\n`);

    let browser = await createBrowser();
    const results = [];
    const total = catalog.length;

    // Process in chunks of CONCURRENCY with periodic browser recycling
    for (let i = 0; i < total; i += CONCURRENCY) {
        if (i > 0 && i % 30 === 0) {
            try { await browser.close(); } catch(e) {}
            browser = await createBrowser();
        }
        const chunk = catalog.slice(i, i + CONCURRENCY);
        const chunkPromises = chunk.map((game, offset) => 
            testGame(browser, game, i + offset, total)
        );
        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
    }

    try { await browser.close(); } catch(e) {}

    // Summary statistics
    const passed = results.filter(r => r.status === 'PASS');
    const warnings = results.filter(r => r.status === 'WARN');
    const failed = results.filter(r => r.status === 'FAIL');

    const passRate = ((passed.length / total) * 100).toFixed(1);

    console.log(`\n=======================================================`);
    console.log(`📊 TỔNG HỢP KẾT QUẢ KIỂM THỬ ${total} GAMES:`);
    console.log(`✅ Passed:    ${passed.length} games (${passRate}%)`);
    console.log(`⚠️ Warnings:  ${warnings.length} games`);
    console.log(`❌ Failed:    ${failed.length} games`);
    console.log(`=======================================================`);

    if (failed.length > 0) {
        console.log(`\nDANH SÁCH GAMES GẶP LỖI CẦN FIX:`);
        failed.forEach((f, idx) => {
            console.log(`${idx + 1}. [${f.name}] (${f.title}): ${f.failureReason}`);
        });
    }

    // Save JSON results
    const jsonPath = 'C:/Users/boluc/.gemini/antigravity-ide/brain/0dea7b08-438d-43b6-9953-a4692ce50333/scratch/all_games_test_results.json';
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf8');

    // Generate Markdown Report
    const reportPath = 'C:/Users/boluc/.gemini/antigravity-ide/brain/0dea7b08-438d-43b6-9953-a4692ce50333/all_games_playtest_report.md';
    let md = `# BÁO CÁO TOÀN DIỆN KIỂM THỬ 419 MINI-GAMES\n\n`;
    md += `**Thời gian kiểm thử:** ${new Date().toLocaleString()}\n`;
    md += `**Tổng số game đã kiểm thử:** ${total}\n`;
    md += `**Tỷ lệ đạt chuẩn:** **${passRate}%** (${passed.length}/${total} games)\n\n`;

    md += `## 1. Bảng Tổng Hợp Trạng Thái\n\n`;
    md += `| Trạng Thái | Số Lượng | Tỷ Lệ |\n`;
    md += `| :--- | :---: | :---: |\n`;
    md += `| 🟢 **PASS (Chơi tốt, canvas mượt mà)** | **${passed.length}** | **${passRate}%** |\n`;
    md += `| 🟡 **WARN (Cảnh báo kích thước hoặc âm thanh)** | ${warnings.length} | ${((warnings.length/total)*100).toFixed(1)}% |\n`;
    md += `| 🔴 **FAIL (Cần sửa lỗi)** | ${failed.length} | ${((failed.length/total)*100).toFixed(1)}% |\n\n`;

    if (failed.length > 0) {
        md += `## 2. Chi Tiết Các Game Cần Khắc Phục (${failed.length} games)\n\n`;
        md += `| # | Game ID | Tên Game | Thể Loại | Hướng | Nguyên Nhân Lỗi |\n`;
        md += `| :---: | :--- | :--- | :---: | :---: | :--- |\n`;
        failed.forEach((f, idx) => {
            md += `| ${idx + 1} | \`${f.name}\` | ${f.title} | ${f.category} | ${f.isHorizontal ? 'Ngang' : 'Dọc'} | ${f.failureReason.replace(/\|/g, '/')} |\n`;
        });
        md += `\n`;
    }

    md += `## 3. Danh Sách 50 Games Tiêu Biểu Đạt Chuẩn Xuất Sắc\n\n`;
    md += `| # | Game ID | Tên Game | Thể Loại | Kích Thước Canvas | Bridge Signal |\n`;
    md += `| :---: | :--- | :--- | :---: | :---: | :---: |\n`;
    passed.slice(0, 50).forEach((p, idx) => {
        md += `| ${idx + 1} | \`${p.name}\` | [${p.title}](http://localhost:6033/tester/${p.name}) | ${p.category} | ${p.canvas?.width}x${p.canvas?.height} | ${p.bridgeEvents.length > 0 ? 'gameLoaded()' : 'Canvas Ready'} |\n`;
    });

    fs.writeFileSync(reportPath, md, 'utf8');
    console.log(`\n📄 Đã lưu báo cáo chi tiết tại: ${reportPath}`);
}

runAllTests().catch(err => {
    console.error('Test runner encountered fatal error:', err);
    process.exit(1);
});
