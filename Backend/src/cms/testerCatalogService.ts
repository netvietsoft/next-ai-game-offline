import fs from 'fs';
import path from 'path';
import { db } from '../database/db';

/**
 * Mô hình danh mục mini-game phục vụ Web Game Testing Studio.
 * Typed mini-game catalog entry used by the Web Game Testing Studio.
 */
export interface TesterGameItem {
    name: string;
    title: string;
    category: string;
    position: number;
    isHorizontal: number;
    hasRewardedVideo: number;
    eachNLevels: number;
    icon: string;
}

interface GameDbRow {
    name: string;
    title: string;
    category: string;
    position: number;
    is_horizontal: number;
    has_rewarded_video: number;
    each_n_levels: number;
    thumbnail_url: string | null;
}

const CATALOG_PATH = path.resolve(
    __dirname,
    '../../../Android/src/main/assets/games_catalog_full_419_r2.json'
);
const LEGACY_CATALOG_PATH = path.resolve(
    __dirname,
    '../../../Android/src/main/assets/games_catalog.json'
);

/**
 * Đọc danh mục game từ SQLite (nếu đã nạp đủ) hoặc fallback sang tệp JSON catalog của Android.
 * Loads the game catalog from SQLite when populated, falling back to the Android catalog JSON.
 */
export function getTesterGamesCatalog(): TesterGameItem[] {
    try {
        const rows = db
            .prepare(
                'SELECT name, title, category, position, is_horizontal, ' +
                    'has_rewarded_video, each_n_levels, thumbnail_url ' +
                    'FROM games WHERE is_active = 1 ORDER BY position ASC'
            )
            .all() as GameDbRow[];
        if (rows && rows.length >= 400) {
            return rows.map((row) => ({
                name: row.name,
                title: row.title,
                category: row.category,
                position: row.position,
                isHorizontal: row.is_horizontal,
                hasRewardedVideo: row.has_rewarded_video,
                eachNLevels: row.each_n_levels,
                icon: row.thumbnail_url
                    ? row.thumbnail_url.replace('/icons/', '')
                    : `${row.name}.png`
            }));
        }
    } catch {
        // Bỏ qua lỗi DB và fallback sang file JSON tĩnh / Fall back to static catalog JSON.
    }

    const candidatePath = fs.existsSync(CATALOG_PATH) ? CATALOG_PATH : LEGACY_CATALOG_PATH;
    if (!fs.existsSync(candidatePath)) {
        return [];
    }
    try {
        const raw = fs.readFileSync(candidatePath, 'utf8');
        return JSON.parse(raw) as TesterGameItem[];
    } catch (error) {
        console.error('[TesterCatalog] Failed to parse catalog JSON:', error);
        return [];
    }
}
