import path from 'path';

/**
 * Tiện ích kiểm tra định danh game, ngăn chặn Path Traversal và thoát chuỗi an toàn cho HTML/JS.
 * Utilities for validating game identifiers, preventing path traversal, and escaping HTML/JS output.
 */

const SAFE_GAME_NAME_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;
const SAFE_FILE_NAME_REGEX = /^[a-zA-Z0-9._-]{1,128}$/;

/**
 * Kiểm tra tên game chỉ gồm ký tự an toàn (chữ, số, gạch dưới, gạch ngang).
 * Validates that a game identifier contains only safe alphanumeric/underscore/hyphen characters.
 */
export function isValidGameName(gameName: string): boolean {
    return SAFE_GAME_NAME_REGEX.test(gameName);
}

/**
 * Kiểm tra tên tệp đơn lẻ không chứa ký tự phân tách đường dẫn hoặc `..`.
 * Validates a single filename without directory separators or parent traversal segments.
 */
export function isValidSingleFileName(fileName: string): boolean {
    if (!SAFE_FILE_NAME_REGEX.test(fileName)) {
        return false;
    }
    return fileName !== '.' && fileName !== '..' && !fileName.includes('..');
}

/**
 * Phân giải đường dẫn tệp bên trong thư mục gốc và đảm bảo không thể thoát ra ngoài (canonical prefix check).
 * Resolves a child path inside a trusted base directory and verifies canonical containment.
 */
export function resolveSafeChildPath(baseDir: string, ...segments: string[]): string | null {
    const resolvedBase = path.resolve(baseDir);
    const candidate = path.resolve(resolvedBase, ...segments);
    if (candidate === resolvedBase) {
        return null;
    }
    if (!candidate.startsWith(resolvedBase + path.sep)) {
        return null;
    }
    return candidate;
}

/**
 * Phân giải đường dẫn `index.html` an toàn của một mini-game đã qua kiểm chứng tên.
 * Resolves a validated mini-game's `index.html` path safely inside `gamesBaseDir`.
 */
export function resolveSafeGameIndexPath(gamesBaseDir: string, gameName: string): string | null {
    if (!isValidGameName(gameName)) {
        return null;
    }
    return resolveSafeChildPath(gamesBaseDir, gameName, 'index.html');
}

/**
 * Thoát ký tự đặc biệt HTML để chặn Reflected XSS khi xuất chuỗi ra trang HTML.
 * Escapes HTML special characters to prevent reflected XSS in HTML responses.
 */
export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Chuyển đổi dữ liệu sang literal JSON an toàn để nhúng trực tiếp vào thẻ `<script>`.
 * Serializes a value safely for inline `<script>` embedding while neutralizing `</script>` breakouts.
 */
export function serializeForInlineScript(value: unknown): string {
    return JSON.stringify(value)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
}
