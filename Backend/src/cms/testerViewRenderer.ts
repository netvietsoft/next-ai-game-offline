import fs from 'fs';
import path from 'path';
import { escapeHtml, serializeForInlineScript } from '../utils/gamePathSecurity';
import { TesterGameItem } from './testerCatalogService';

/**
 * Thư mục tài nguyên tĩnh cho Tester Studio (hoạt động đồng nhất ở cả `src/` lẫn `dist/`).
 * Static template/asset directory resolved identically from both `src/` and compiled `dist/`.
 */
export const TESTER_PUBLIC_DIR = path.resolve(__dirname, '../../public/tester');

const DEFAULT_FALLBACK_GAME: TesterGameItem = {
    name: 'abalone',
    title: 'Abalone',
    category: 'Casual',
    position: 1,
    isHorizontal: 0,
    hasRewardedVideo: 1,
    eachNLevels: 3,
    icon: 'abalone.png'
};

/**
 * Nạp nội dung template HTML từ `Backend/public/tester/` và thay thế các token an toàn.
 * Loads an HTML template from `Backend/public/tester/` and applies escaped token replacements.
 */
function renderTemplate(fileName: string, replacements: Record<string, string>): string {
    const templatePath = path.join(TESTER_PUBLIC_DIR, fileName);
    let html = fs.readFileSync(templatePath, 'utf8');
    for (const [token, value] of Object.entries(replacements)) {
        html = html.split(token).join(value);
    }
    return html;
}

/**
 * Dựng trang chơi toàn màn hình `/tester/play/:gameName` với toàn bộ chuỗi đã escape XSS.
 * Renders the standalone `/tester/play/:gameName` page with strict HTML escaping.
 */
export function renderStandalonePlayerHtml(game: TesterGameItem): string {
    const isHorizontal = game.isHorizontal === 1;
    return renderTemplate('player.html', {
        '{{GAME_TITLE}}': escapeHtml(game.title),
        '{{BADGE_CLASS}}': isHorizontal ? 'badge-landscape' : 'badge-portrait',
        '{{BADGE_LABEL}}': isHorizontal ? '🎮 Ngang' : '📱 Dọc',
        '{{IFRAME_SRC}}': `/games/${encodeURIComponent(game.name)}/index.html`,
        '{{IS_HORIZONTAL_BOOL}}': isHorizontal ? 'true' : 'false'
    });
}

/**
 * Dựng giao diện chính Web Game Testing Studio (`/tester`) với payload bootstrap đã serialize an toàn.
 * Renders the main Web Game Testing Studio (`/tester`) using safely serialized bootstrap JSON.
 */
export function renderTesterStudioHtml(
    catalog: TesterGameItem[],
    targetGameName?: string
): string {
    const totalCount = catalog.length;
    const portraitCount = catalog.filter((item) => item.isHorizontal === 0).length;
    const landscapeCount = catalog.filter((item) => item.isHorizontal === 1).length;

    let initialGame: TesterGameItem = catalog[0] || DEFAULT_FALLBACK_GAME;
    if (targetGameName) {
        const normalized = targetGameName.toLowerCase();
        const matched = catalog.find(
            (item) =>
                item.name.toLowerCase() === normalized ||
                item.title.toLowerCase() === normalized
        );
        if (matched) {
            initialGame = matched;
        }
    }

    const iconFile = initialGame.icon || `${initialGame.name}.png`;
    const bootstrapJson = serializeForInlineScript({
        allGames: catalog,
        initialGameName: initialGame.name
    });

    return renderTemplate('studio.html', {
        '{{TOTAL_COUNT}}': String(totalCount),
        '{{PORTRAIT_COUNT}}': String(portraitCount),
        '{{LANDSCAPE_COUNT}}': String(landscapeCount),
        '{{INITIAL_TITLE}}': escapeHtml(initialGame.title),
        '{{INITIAL_NAME}}': escapeHtml(initialGame.name),
        '{{INITIAL_CATEGORY}}': escapeHtml(initialGame.category || 'Casual'),
        '{{INITIAL_ORIENTATION_LABEL}}': initialGame.isHorizontal ? '🎮 Game Ngang' : '📱 Game Dọc',
        '{{INITIAL_ICON_SRC}}': `/icons/${encodeURIComponent(iconFile)}`,
        '{{INITIAL_IFRAME_SRC}}': `/games/${encodeURIComponent(initialGame.name)}/index.html`,
        '{{BOOTSTRAP_JSON}}': bootstrapJson
    });
}
