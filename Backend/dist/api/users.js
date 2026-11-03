"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const db_1 = require("../database/db");
const auth_1 = require("./auth");
/**
 * Router quản lý tài khoản Quản trị viên và Người dùng hệ thống.
 * Users & Admin Accounts Management Router.
 */
exports.usersRouter = (0, express_1.Router)();
// Toàn bộ các API user đều yêu cầu quyền Admin / All user routes require Admin authentication
exports.usersRouter.use(auth_1.authenticateAdmin);
/**
 * GET /api/v1/users - Lấy danh sách toàn bộ admin/user
 */
exports.usersRouter.get('/', (req, res) => {
    const users = db_1.db.prepare('SELECT id, username, email, role, is_active, created_at FROM admin_users ORDER BY created_at DESC').all();
    return res.json({ total: users.length, users });
});
/**
 * POST /api/v1/users - Tạo user / admin mới
 */
exports.usersRouter.post('/', (req, res) => {
    const { username, password, email, role } = req.body;
    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Vui lòng cung cấp username, password và email' });
    }
    try {
        const id = (0, uuid_1.v4)();
        const passwordHash = bcryptjs_1.default.hashSync(password, 10);
        db_1.db.prepare(`
            INSERT INTO admin_users (id, username, password_hash, email, role, is_active)
            VALUES (?, ?, ?, ?, ?, 1)
        `).run(id, username, passwordHash, email, role || 'ADMIN');
        return res.status(201).json({ message: 'Tạo tài khoản thành công', id, username, email });
    }
    catch (err) {
        return res.status(400).json({ error: 'Username hoặc Email đã tồn tại' });
    }
});
/**
 * PUT /api/v1/users/:id - Cập nhật thông tin user
 */
exports.usersRouter.put('/:id', (req, res) => {
    const { email, role, is_active, password } = req.body;
    try {
        if (password) {
            const passwordHash = bcryptjs_1.default.hashSync(password, 10);
            db_1.db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(passwordHash, req.params.id);
        }
        db_1.db.prepare(`
            UPDATE admin_users
            SET email = COALESCE(?, email),
                role = COALESCE(?, role),
                is_active = COALESCE(?, is_active),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(email, role, is_active, req.params.id);
        return res.json({ message: 'Cập nhật tài khoản thành công' });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
/**
 * DELETE /api/v1/users/:id - Xóa tài khoản user
 */
exports.usersRouter.delete('/:id', (req, res) => {
    db_1.db.prepare('DELETE FROM admin_users WHERE id = ?').run(req.params.id);
    return res.json({ message: 'Đã xóa tài khoản thành công' });
});
