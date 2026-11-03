"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
exports.authenticateAdmin = authenticateAdmin;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../database/db");
/**
 * Router xác thực và quản lý phiên đăng nhập Admin CMS.
 * Authentication router for Admin CMS Dashboard.
 */
exports.authRouter = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'nextai_super_secret_jwt_key_2026';
/**
 * Middleware bảo vệ các API yêu cầu quyền Admin.
 * Middleware protecting admin routes.
 */
function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.adminUser = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
    }
}
/**
 * API Đăng nhập Admin
 * POST /api/v1/auth/login
 */
exports.authRouter.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Vui lòng cung cấp username và password / Username and password are required' });
    }
    const user = db_1.db.prepare('SELECT * FROM admin_users WHERE username = ? AND is_active = 1').get(username);
    if (!user || !bcryptjs_1.default.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác / Invalid credentials' });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
        message: 'Đăng nhập thành công / Login successful',
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
});
/**
 * API Lấy thông tin tài khoản hiện tại
 * GET /api/v1/auth/me
 */
exports.authRouter.get('/me', authenticateAdmin, (req, res) => {
    const adminUser = req.adminUser;
    const user = db_1.db.prepare('SELECT id, username, email, role, created_at FROM admin_users WHERE id = ?').get(adminUser.id);
    return res.json({ user });
});
