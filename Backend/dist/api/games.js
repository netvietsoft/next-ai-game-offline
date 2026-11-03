"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gamesRouter = void 0;
const express_1 = require("express");
const db_1 = require("../database/db");
const auth_1 = require("./auth");
/**
 * Router quản lý danh mục 423 Mini-Games và đồng bộ Client.
 * Games Catalog API Router & Client Sync.
 */
exports.gamesRouter = (0, express_1.Router)();
/**
 * API Lấy danh sách toàn bộ Mini-Game cho App Client và CMS.
 * GET /api/v1/games
 */
exports.gamesRouter.get('/', (req, res) => {
    const { category, search } = req.query;
    let query = 'SELECT * FROM games WHERE is_active = 1';
    const params = [];
    if (category && category !== 'All') {
        query += ' AND category = ?';
        params.push(category);
    }
    if (search) {
        query += ' AND (title LIKE ? OR name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY position ASC';
    const games = db_1.db.prepare(query).all(...params);
    return res.json({
        total: games.length,
        games
    });
});
/**
 * API Lấy chi tiết một Mini-Game theo tên.
 * GET /api/v1/games/:name
 */
exports.gamesRouter.get('/:name', (req, res) => {
    const game = db_1.db.prepare('SELECT * FROM games WHERE name = ?').get(req.params.name);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }
    return res.json({ game });
});
/**
 * API Thêm Mini-Game mới (Admin Only).
 * POST /api/v1/games
 */
exports.gamesRouter.post('/', auth_1.authenticateAdmin, (req, res) => {
    const { name, title, category, position, has_rewarded_video, each_n_levels, is_horizontal, size_mb } = req.body;
    if (!name || !title || !category) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: name, title, category' });
    }
    try {
        db_1.db.prepare(`
            INSERT INTO games (name, title, category, position, has_rewarded_video, each_n_levels, is_horizontal, size_mb)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(name, title, category, position || 99, has_rewarded_video || 0, each_n_levels || 3, is_horizontal || 0, size_mb || 1.0);
        return res.status(201).json({ message: 'Tạo game thành công / Game created successfully', name });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
/**
 * API Cập nhật Mini-Game (Admin Only).
 * PUT /api/v1/games/:name
 */
exports.gamesRouter.put('/:name', auth_1.authenticateAdmin, (req, res) => {
    const { title, category, position, has_rewarded_video, each_n_levels, is_horizontal, is_active } = req.body;
    try {
        db_1.db.prepare(`
            UPDATE games
            SET title = COALESCE(?, title),
                category = COALESCE(?, category),
                position = COALESCE(?, position),
                has_rewarded_video = COALESCE(?, has_rewarded_video),
                each_n_levels = COALESCE(?, each_n_levels),
                is_horizontal = COALESCE(?, is_horizontal),
                is_active = COALESCE(?, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE name = ?
        `).run(title, category, position, has_rewarded_video, each_n_levels, is_horizontal, is_active, req.params.name);
        return res.json({ message: 'Cập nhật game thành công / Game updated successfully' });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
/**
 * API Xóa Mini-Game (Admin Only).
 * DELETE /api/v1/games/:name
 */
exports.gamesRouter.delete('/:name', auth_1.authenticateAdmin, (req, res) => {
    db_1.db.prepare('DELETE FROM games WHERE name = ?').run(req.params.name);
    return res.json({ message: 'Đã xóa game / Game deleted successfully' });
});
