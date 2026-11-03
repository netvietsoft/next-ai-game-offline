"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initDatabase = initDatabase;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
/**
 * Trình khởi tạo và quản lý cơ sở dữ liệu SQLite cho Backend Server (Cổng 6033).
 * Database connection and initialization manager for Backend Server (Port 6033).
 * Sử dụng node:sqlite tích hợp sẵn trên Node.js (Zero native compile dependencies).
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DatabaseSync } = require('node:sqlite');
const dbDirectory = path_1.default.join(__dirname, '../../data');
if (!fs_1.default.existsSync(dbDirectory)) {
    fs_1.default.mkdirSync(dbDirectory, { recursive: true });
}
const dbPath = path_1.default.join(dbDirectory, 'nextai_games.db');
class DatabaseWrapper {
    rawDb;
    constructor(filePath) {
        this.rawDb = new DatabaseSync(filePath);
    }
    exec(sql) {
        return this.rawDb.exec(sql);
    }
    prepare(sql) {
        const stmt = this.rawDb.prepare(sql);
        const sanitize = (params) => params.map(p => (p === undefined ? null : p));
        return {
            all: (...params) => stmt.all(...sanitize(params)),
            get: (...params) => stmt.get(...sanitize(params)),
            run: (...params) => stmt.run(...sanitize(params))
        };
    }
    pragma(sql) {
        return this.rawDb.exec(`PRAGMA ${sql};`);
    }
    transaction(fn) {
        return ((...args) => {
            this.rawDb.exec('BEGIN');
            try {
                const res = fn(...args);
                this.rawDb.exec('COMMIT');
                return res;
            }
            catch (err) {
                this.rawDb.exec('ROLLBACK');
                throw err;
            }
        });
    }
}
exports.db = new DatabaseWrapper(dbPath);
// Bật chế độ WAL để tăng tốc độ ghi đồng thời / Enable WAL mode for high concurrency
exports.db.pragma('journal_mode = WAL');
/**
 * Khởi tạo Schema và Seeding dữ liệu ban đầu.
 * Initialize database schema and seed initial data.
 */
function initDatabase() {
    let schemaSqlPath = path_1.default.join(__dirname, 'schema.sql');
    if (!fs_1.default.existsSync(schemaSqlPath)) {
        schemaSqlPath = path_1.default.join(__dirname, '../../src/database/schema.sql');
    }
    if (fs_1.default.existsSync(schemaSqlPath)) {
        const schema = fs_1.default.readFileSync(schemaSqlPath, 'utf8');
        exports.db.exec(schema);
    }
    // 1. Seed tài khoản Admin mặc định nếu chưa có / Seed default admin user
    const adminCheck = exports.db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
    if (adminCheck.count === 0) {
        const passwordHash = bcryptjs_1.default.hashSync('NextAIAdmin@2026', 10);
        exports.db.prepare(`
            INSERT INTO admin_users (id, username, password_hash, email, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run((0, uuid_1.v4)(), 'admin', passwordHash, 'admin@nextai.com', 'SUPER_ADMIN', 1);
    }
    // 2. Seed danh sách 419 mini-game từ games_catalog.json / Seed full games list
    const gamesCheck = exports.db.prepare('SELECT COUNT(*) as count FROM games').get();
    let catalogPath = path_1.default.join(__dirname, '../../../Android/src/main/assets/games_catalog.json');
    if (!fs_1.default.existsSync(catalogPath)) {
        catalogPath = path_1.default.join(__dirname, '../../Android/src/main/assets/games_catalog.json');
    }
    if (gamesCheck.count < 400 && fs_1.default.existsSync(catalogPath)) {
        try {
            const catalogRaw = fs_1.default.readFileSync(catalogPath, 'utf8');
            const catalog = JSON.parse(catalogRaw);
            const insertGame = exports.db.prepare(`
                INSERT OR REPLACE INTO games (name, title, category, position, has_rewarded_video, each_n_levels, is_horizontal, is_active, thumbnail_url, size_mb)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const insertMany = exports.db.transaction((games) => {
                for (const g of games) {
                    insertGame.run(g.name, g.title || g.name, g.category || 'Casual', g.position || 0, g.hasRewardedVideo ? 1 : 0, g.eachNLevels || 3, g.isHorizontal ? 1 : 0, 1, g.icon ? `/icons/${g.icon}` : null, 1.5);
                }
            });
            insertMany(catalog);
            console.log(`✅ Loaded and seeded ${catalog.length} games into database.`);
        }
        catch (e) {
            console.error('Failed to seed games from catalog:', e);
        }
    }
    // 3. Seed dữ liệu thiết bị mẫu / Seed demo registered devices
    const deviceCheck = exports.db.prepare('SELECT COUNT(*) as count FROM registered_devices').get();
    if (deviceCheck.count === 0) {
        const insertDevice = exports.db.prepare(`
            INSERT INTO registered_devices (device_id, app_version, os_version, device_model, ip_address, country_code, is_premium)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        insertDevice.run('device_sam_s23_001', '2.1.0', 'Android 14', 'Samsung Galaxy S23', '118.70.192.45', 'VN', 1);
        insertDevice.run('device_xi_13t_002', '2.1.0', 'Android 13', 'Xiaomi 13T Pro', '14.162.88.12', 'VN', 0);
        insertDevice.run('device_pixel_8_003', '2.1.0', 'Android 14', 'Google Pixel 8', '172.56.21.90', 'US', 0);
    }
}
