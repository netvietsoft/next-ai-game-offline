import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { authenticateAdmin } from './auth';

/**
 * Router quản lý tài khoản Quản trị viên và Người dùng hệ thống.
 * Users & Admin Accounts Management Router.
 */
export const usersRouter = Router();

// Toàn bộ các API user đều yêu cầu quyền Admin / All user routes require Admin authentication
usersRouter.use(authenticateAdmin);

/**
 * GET /api/v1/users - Lấy danh sách toàn bộ admin/user
 */
usersRouter.get('/', (req: Request, res: Response) => {
    const users = db.prepare('SELECT id, username, email, role, is_active, created_at FROM admin_users ORDER BY created_at DESC').all();
    return res.json({ total: users.length, users });
});

/**
 * POST /api/v1/users - Tạo user / admin mới
 */
usersRouter.post('/', (req: Request, res: Response) => {
    const { username, password, email, role } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Vui lòng cung cấp username, password và email' });
    }

    try {
        const id = uuidv4();
        const passwordHash = bcrypt.hashSync(password, 10);
        db.prepare(`
            INSERT INTO admin_users (id, username, password_hash, email, role, is_active)
            VALUES (?, ?, ?, ?, ?, 1)
        `).run(id, username, passwordHash, email, role || 'ADMIN');

        return res.status(201).json({ message: 'Tạo tài khoản thành công', id, username, email });
    } catch (err: any) {
        return res.status(400).json({ error: 'Username hoặc Email đã tồn tại' });
    }
});

/**
 * PUT /api/v1/users/:id - Cập nhật thông tin user
 */
usersRouter.put('/:id', (req: Request, res: Response) => {
    const { email, role, is_active, password } = req.body;
    try {
        if (password) {
            const passwordHash = bcrypt.hashSync(password, 10);
            db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(passwordHash, req.params.id);
        }

        db.prepare(`
            UPDATE admin_users
            SET email = COALESCE(?, email),
                role = COALESCE(?, role),
                is_active = COALESCE(?, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(email, role, is_active, req.params.id);

        return res.json({ message: 'Cập nhật tài khoản thành công' });
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
});

/**
 * DELETE /api/v1/users/:id - Xóa tài khoản user
 */
usersRouter.delete('/:id', (req: Request, res: Response) => {
    db.prepare('DELETE FROM admin_users WHERE id = ?').run(req.params.id);
    return res.json({ message: 'Đã xóa tài khoản thành công' });
});
