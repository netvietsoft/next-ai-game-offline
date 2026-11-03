import { Router, Request, Response } from 'express';
import { db } from '../database/db';
import { authenticateAdmin } from './auth';

/**
 * Router quản lý danh mục 423 Mini-Games và đồng bộ Client.
 * Games Catalog API Router & Client Sync.
 */
export const gamesRouter = Router();

/**
 * API Lấy danh sách toàn bộ Mini-Game cho App Client và CMS.
 * GET /api/v1/games
 */
gamesRouter.get('/', (req: Request, res: Response) => {
    const { category, search } = req.query;

    let query = 'SELECT * FROM games WHERE is_active = 1';
    const params: any[] = [];

    if (category && category !== 'All') {
        query += ' AND category = ?';
        params.push(category);
    }

    if (search) {
        query += ' AND (title LIKE ? OR name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY position ASC';

    const games = db.prepare(query).all(...params);
    return res.json({
        total: games.length,
        games
    });
});

/**
 * API Lấy chi tiết một Mini-Game theo tên.
 * GET /api/v1/games/:name
 */
gamesRouter.get('/:name', (req: Request, res: Response) => {
    const game = db.prepare('SELECT * FROM games WHERE name = ?').get(req.params.name);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }
    return res.json({ game });
});

/**
 * API Thêm Mini-Game mới (Admin Only).
 * POST /api/v1/games
 */
gamesRouter.post('/', authenticateAdmin, (req: Request, res: Response) => {
    const { name, title, category, position, has_rewarded_video, each_n_levels, is_horizontal, size_mb } = req.body;

    if (!name || !title || !category) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: name, title, category' });
    }

    try {
        db.prepare(`
            INSERT INTO games (name, title, category, position, has_rewarded_video, each_n_levels, is_horizontal, size_mb)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(name, title, category, position || 99, has_rewarded_video || 0, each_n_levels || 3, is_horizontal || 0, size_mb || 1.0);

        return res.status(201).json({ message: 'Tạo game thành công / Game created successfully', name });
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
});

/**
 * API Cập nhật Mini-Game (Admin Only).
 * PUT /api/v1/games/:name
 */
gamesRouter.put('/:name', authenticateAdmin, (req: Request, res: Response) => {
    const { title, category, position, has_rewarded_video, each_n_levels, is_horizontal, is_active } = req.body;

    try {
        db.prepare(`
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
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
});

/**
 * API Xóa Mini-Game (Admin Only).
 * DELETE /api/v1/games/:name
 */
gamesRouter.delete('/:name', authenticateAdmin, (req: Request, res: Response) => {
    db.prepare('DELETE FROM games WHERE name = ?').run(req.params.name);
    return res.json({ message: 'Đã xóa game / Game deleted successfully' });
});
