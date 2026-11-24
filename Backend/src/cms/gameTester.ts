import express, { NextFunction, Request, Response, Router } from 'express';
import fs from 'fs';
import path from 'path';
import {
    escapeHtml,
    isValidGameName,
    resolveSafeGameIndexPath
} from '../utils/gamePathSecurity';
import { buildMockAndroidBridgeScript, injectIntoHtmlHead } from '../utils/mockAndroidBridge';
import { getTesterGamesCatalog, TesterGameItem } from './testerCatalogService';
import {
    renderStandalonePlayerHtml,
    renderTesterStudioHtml,
    TESTER_PUBLIC_DIR
} from './testerViewRenderer';

/**
 * Router mỏng của Web Game Testing Studio & AdMob Banner Simulator (Port 6033).
 * Thin Express router for the Web Game Testing Studio & AdMob Banner Simulator.
 *
 * Toàn bộ HTML/CSS/JS tĩnh đã được tách sang `Backend/public/tester/`, dữ liệu danh mục
 * sang `testerCatalogService.ts` và cơ chế bảo vệ đường dẫn sang `gamePathSecurity.ts`.
 */
export const gameTesterRouter = Router();

const GAMES_DIR = path.resolve(__dirname, '../../../Android/src/main/assets/games');
const RESERVED_SEGMENTS = new Set(['api', 'embed', 'play', 'static']);

// Phục vụ các file CSS/JS tĩnh của Tester Studio / Serve static Studio CSS/JS assets
gameTesterRouter.use('/static', express.static(TESTER_PUBLIC_DIR));

/**
 * Trả về danh sách toàn bộ mini-game cho Client Testing UI.
 * GET /tester/api/games
 */
gameTesterRouter.get('/api/games', (_req: Request, res: Response) => {
    const catalog = getTesterGamesCatalog();
    res.json({
        total: catalog.length,
        games: catalog
    });
});

/**
 * Phục vụ Iframe game có nhúng Mock Android Bridge dùng chung sau khi xác thực `gameName`.
 * GET /tester/embed/:gameName
 */
gameTesterRouter.get('/embed/:gameName', (req: Request, res: Response) => {
    const gameName = req.params.gameName;
    if (!isValidGameName(gameName)) {
        return res.status(400).send('<h3>400: Invalid game identifier</h3>');
    }

    const indexPath = resolveSafeGameIndexPath(GAMES_DIR, gameName);
    if (!indexPath || !fs.existsSync(indexPath)) {
        const safeName = escapeHtml(gameName);
        return res
            .status(404)
            .send(`<h3>404: Không tìm thấy index.html cho game "${safeName}"</h3>`);
    }

    try {
        const rawHtml = fs.readFileSync(indexPath, 'utf8');
        const bridgeScript = buildMockAndroidBridgeScript(gameName, {
            includeBaseHref: true,
            logPrefix: 'Tester'
        });
        const html = injectIntoHtmlHead(rawHtml, bridgeScript);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
    } catch {
        return res.status(500).send('<h3>500: Unable to load game index</h3>');
    }
});

/**
 * Trang chơi trực tiếp toàn màn hình (Standalone Full Window Play).
 * GET /tester/play/:gameName
 */
gameTesterRouter.get('/play/:gameName', (req: Request, res: Response) => {
    const gameName = req.params.gameName;
    if (!isValidGameName(gameName)) {
        return res.status(400).send('<h3>400: Invalid game identifier</h3>');
    }

    const catalog = getTesterGamesCatalog();
    const matched = catalog.find((item) => item.name === gameName);
    const game: TesterGameItem = matched || {
        name: gameName,
        title: gameName,
        category: 'Casual',
        position: 0,
        isHorizontal: 0,
        hasRewardedVideo: 0,
        eachNLevels: 3,
        icon: `${gameName}.png`
    };

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(renderStandalonePlayerHtml(game));
});

/**
 * Giao diện chính của Web Game Testing Studio.
 * GET /tester?game=block_blast
 */
gameTesterRouter.get('/', (req: Request, res: Response) => {
    const requested =
        (typeof req.query.game === 'string' && req.query.game) ||
        (typeof req.query.id === 'string' && req.query.id) ||
        '';
    const html = renderTesterStudioHtml(getTesterGamesCatalog(), requested);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
});

/**
 * Route mở trực tiếp theo ID game trong URL: GET /tester/:gameName.
 */
gameTesterRouter.get('/:gameName', (req: Request, res: Response, next: NextFunction) => {
    const gameName = req.params.gameName;
    if (RESERVED_SEGMENTS.has(gameName)) {
        return next();
    }
    if (!isValidGameName(gameName)) {
        return res.status(400).send('<h3>400: Invalid game identifier</h3>');
    }
    const html = renderTesterStudioHtml(getTesterGamesCatalog(), gameName);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
});
