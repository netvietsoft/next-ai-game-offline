import crypto from 'crypto';
import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/db';

/**
 * Thông tin quản trị viên đã giải mã từ JWT.
 * Decoded administrator payload stored on authenticated Express requests.
 */
export interface AdminTokenPayload {
    id: number;
    username: string;
    role: string;
}

export interface AuthenticatedRequest extends Request {
    adminUser?: AdminTokenPayload;
}

interface AdminUserRow {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    role: string;
    is_active: number;
}

interface RateLimitBucket {
    count: number;
    resetAtMs: number;
}

const MIN_PRODUCTION_SECRET_LENGTH = 32;
const LOGIN_WINDOW_MS = 60_000;
const LOGIN_MAX_ATTEMPTS = 15;
const loginAttempts = new Map<string, RateLimitBucket>();

/**
 * Nạp JWT secret an toàn: bắt buộc đặt biến môi trường ở production; sinh khóa phiên ngẫu nhiên
 * cho dev/test để tuyệt đối không tồn tại chuỗi bí mật cứng trong mã nguồn.
 * Resolves JWT secret safely: enforces env configuration in production and generates an
 * ephemeral random secret in dev/test so no hardcoded fallback secret exists in source code.
 */
function resolveJwtSecret(): string {
    const configured = process.env.JWT_SECRET?.trim();
    if (configured && configured.length >= MIN_PRODUCTION_SECRET_LENGTH) {
        return configured;
    }
    if (process.env.NODE_ENV === 'production') {
        throw new Error(
            `JWT_SECRET environment variable must be configured with at least ` +
                `${MIN_PRODUCTION_SECRET_LENGTH} characters in production.`
        );
    }
    if (configured && configured.length > 0) {
        return configured;
    }
    if (process.env.NODE_ENV !== 'test') {
        console.warn('[Auth] JWT_SECRET not set; using ephemeral in-memory secret for local development.');
    }
    return crypto.randomBytes(32).toString('hex');
}

const JWT_SECRET = resolveJwtSecret();

/**
 * Giới hạn tần suất đăng nhập theo IP trong bộ nhớ để chống brute-force cơ bản.
 * Lightweight in-memory login rate limiter mitigating basic credential brute-forcing.
 */
function loginRateLimiter(req: Request, res: Response, next: NextFunction): void {
    if (process.env.NODE_ENV === 'test') {
        next();
        return;
    }
    const clientKey = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const existing = loginAttempts.get(clientKey);
    if (!existing || now > existing.resetAtMs) {
        loginAttempts.set(clientKey, { count: 1, resetAtMs: now + LOGIN_WINDOW_MS });
        next();
        return;
    }
    if (existing.count >= LOGIN_MAX_ATTEMPTS) {
        res.status(429).json({
            error: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau / Too many login attempts'
        });
        return;
    }
    existing.count += 1;
    next();
}

/**
 * Router xác thực và quản lý phiên đăng nhập Admin CMS.
 * Authentication router for Admin CMS Dashboard.
 */
export const authRouter = Router();

/**
 * Middleware bảo vệ các API yêu cầu quyền Admin.
 * Middleware protecting admin routes via Bearer JWT validation.
 */
export function authenticateAdmin(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
        return;
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
        req.adminUser = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
    }
}

/**
 * API Đăng nhập Admin — dùng `bcrypt.compare` bất đồng bộ để không chặn event loop.
 * POST /api/v1/auth/login
 */
authRouter.post('/login', loginRateLimiter, async (req: Request, res: Response) => {
    const { username, password } = req.body as { username?: unknown; password?: unknown };

    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
        return res.status(400).json({
            error: 'Vui lòng cung cấp username và password / Username and password are required'
        });
    }

    const user = db
        .prepare('SELECT * FROM admin_users WHERE username = ? AND is_active = 1')
        .get(username) as AdminUserRow | undefined;

    if (!user) {
        return res.status(401).json({
            error: 'Tên đăng nhập hoặc mật khẩu không chính xác / Invalid credentials'
        });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
        return res.status(401).json({
            error: 'Tên đăng nhập hoặc mật khẩu không chính xác / Invalid credentials'
        });
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
 * API Lấy thông tin tài khoản hiện tại.
 * GET /api/v1/auth/me
 */
authRouter.get('/me', authenticateAdmin, (req: AuthenticatedRequest, res: Response) => {
    const adminUser = req.adminUser;
    if (!adminUser) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = db
        .prepare('SELECT id, username, email, role, created_at FROM admin_users WHERE id = ?')
        .get(adminUser.id);
    return res.json({ user });
});
