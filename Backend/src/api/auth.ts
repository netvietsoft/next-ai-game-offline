import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/db';

/**
 * Router xác thực và quản lý phiên đăng nhập Admin CMS.
 * Authentication router for Admin CMS Dashboard.
 */
export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'nextai_super_secret_jwt_key_2026';

/**
 * Middleware bảo vệ các API yêu cầu quyền Admin.
 * Middleware protecting admin routes.
 */
export function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).adminUser = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
    }
}

/**
 * API Đăng nhập Admin
 * POST /api/v1/auth/login
 */
authRouter.post('/login', (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Vui lòng cung cấp username và password / Username and password are required' });
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE username = ? AND is_active = 1').get(username) as any;

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác / Invalid credentials' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

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
authRouter.get('/me', authenticateAdmin, (req: Request, res: Response) => {
    const adminUser = (req as any).adminUser;
    const user = db.prepare('SELECT id, username, email, role, created_at FROM admin_users WHERE id = ?').get(adminUser.id);
    return res.json({ user });
});
