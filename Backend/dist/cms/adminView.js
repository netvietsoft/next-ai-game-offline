"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCmsRouter = void 0;
const express_1 = require("express");
const db_1 = require("../database/db");
/**
 * Web Admin CMS Dashboard Router (Cổng 6033).
 * Rich Web Admin Dashboard with Light/Dark Theme, Responsive Card Layout & URL Routing.
 */
exports.adminCmsRouter = (0, express_1.Router)();
exports.adminCmsRouter.get('*', (req, res) => {
    // Lấy số liệu thống kê tổng quan cho Dashboard / Summary statistics
    const totalGames = db_1.db.prepare('SELECT COUNT(*) as count FROM games').get()?.count || 0;
    const totalDevices = db_1.db.prepare('SELECT COUNT(*) as count FROM registered_devices').get()?.count || 0;
    const totalUsers = db_1.db.prepare('SELECT COUNT(*) as count FROM admin_users').get()?.count || 0;
    const totalMedia = db_1.db.prepare('SELECT COUNT(*) as count FROM media_assets').get()?.count || 0;
    const games = db_1.db.prepare('SELECT * FROM games ORDER BY position ASC LIMIT 50').all();
    const devices = db_1.db.prepare('SELECT * FROM registered_devices ORDER BY last_active DESC LIMIT 20').all();
    const users = db_1.db.prepare('SELECT id, username, email, role, is_active, created_at FROM admin_users').all();
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NextAI Game Offline - Admin CMS Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-body: #0f172a;
            --bg-card: #1e293b;
            --bg-sidebar: #0b1120;
            --border-color: #334155;
            --text-main: #f8fafc;
            --text-sub: #94a3b8;
            --accent-blue: #3b82f6;
            --accent-green: #10b981;
            --accent-purple: #8b5cf6;
            --accent-red: #ef4444;
            --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
        }

        [data-theme="light"] {
            --bg-body: #f1f5f9;
            --bg-card: #ffffff;
            --bg-sidebar: #ffffff;
            --border-color: #e2e8f0;
            --text-main: #0f172a;
            --text-sub: #64748b;
            --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; transition: background 0.2s, color 0.2s; }
        body { background-color: var(--bg-body); color: var(--text-main); display: flex; min-height: 100vh; }

        /* Sidebar Navigation */
        aside {
            width: 260px;
            background: var(--bg-sidebar);
            border-right: 1px solid var(--border-color);
            padding: 24px 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .brand { font-size: 20px; font-weight: 700; color: var(--accent-blue); padding: 0 12px 20px; border-bottom: 1px solid var(--border-color); margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
        .brand span { color: var(--text-main); font-size: 14px; font-weight: 500; background: rgba(59,130,246,0.1); padding: 2px 8px; border-radius: 6px; }

        .nav-item {
            padding: 12px 16px;
            border-radius: 10px;
            color: var(--text-sub);
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
        }

        .nav-item:hover, .nav-item.active { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); }

        /* Main Content */
        main { flex: 1; padding: 24px 32px; overflow-y: auto; }

        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .top-bar h1 { font-size: 24px; font-weight: 700; }
        .top-actions { display: flex; gap: 12px; align-items: center; }

        .theme-btn {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            color: var(--text-main);
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;
        }

        .swagger-btn {
            background: var(--accent-blue);
            color: #fff;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
        }

        /* Stat Grid */
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 20px;
            box-shadow: var(--card-shadow);
        }
        .stat-card .label { font-size: 13px; color: var(--text-sub); margin-bottom: 8px; }
        .stat-card .val { font-size: 28px; font-weight: 700; color: var(--text-main); }

        /* Card-based Data Representation (Requirement 15) */
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .data-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 16px;
            box-shadow: var(--card-shadow);
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .data-card-title { font-size: 16px; font-weight: 600; color: var(--text-main); display: flex; justify-content: space-between; }
        .data-card-meta { font-size: 12px; color: var(--text-sub); }
        .badge { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
        .badge-puzzle { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .badge-2p { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
        .badge-arcade { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .badge-classic { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }

        @media (max-width: 768px) {
            body { flex-direction: column; }
            aside { width: 100%; border-right: none; border-bottom: 1px solid var(--border-color); }
            main { padding: 16px; }
        }
    </style>
</head>
<body data-theme="dark">

    <aside>
        <div class="brand">
            🎮 NextAI CMS <span>v2.1</span>
        </div>
        <a class="nav-item active" onclick="switchTab('dashboard')">📊 Tổng Quan (Dashboard)</a>
        <a class="nav-item" onclick="switchTab('games')">🎯 Kho Mini-Game (423 Game)</a>
        <a class="nav-item" href="/tester" target="_blank" style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-weight: bold;">🧪 Testing Studio & AdMob ↗</a>
        <a class="nav-item" onclick="switchTab('devices')">📱 Thiết Bị Đăng Ký</a>
        <a class="nav-item" onclick="switchTab('users')">👥 Quản Trị Viên (Users)</a>
        <a class="nav-item" onclick="switchTab('media')">☁️ Media & Cloudflare R2</a>
        <a class="nav-item" onclick="switchTab('ads')">💰 Cấu Hình Quảng Cáo</a>
    </aside>

    <main>
        <div class="top-bar">
            <div>
                <h1>Bảng Quản Trị Nền Tảng Game Offline</h1>
                <p style="color: var(--text-sub); font-size: 13px; margin-top: 4px;">Máy chủ Backend đang vận hành trên <strong>Cổng 6033</strong></p>
            </div>
            <div class="top-actions">
                <a href="/tester" class="swagger-btn" style="background: #10b981;" target="_blank">🧪 Testing Studio (Web Play)</a>
                <button class="theme-btn" onclick="toggleTheme()">🌓 Sáng / Tối</button>
                <a href="/api-docs" class="swagger-btn" target="_blank">📖 Swagger API Docs</a>
            </div>
        </div>

        <div class="stat-grid">
            <div class="stat-card">
                <div class="label">Tổng Số Mini-Game Tích Hợp</div>
                <div class="val">${totalGames}</div>
            </div>
            <div class="stat-card">
                <div class="label">Thiết Bị Android Đăng Ký</div>
                <div class="val">${totalDevices}</div>
            </div>
            <div class="stat-card">
                <div class="label">Tài Khoản Quản Trị</div>
                <div class="val">${totalUsers}</div>
            </div>
            <div class="stat-card">
                <div class="label">Tệp Cloudflare R2 Storage</div>
                <div class="val">${totalMedia}</div>
            </div>
        </div>

        <div class="section-header">
            <h2>🎯 Danh Sách Mini-Game Nổi Bật (Card Layout Trực Quan)</h2>
        </div>

        <div class="card-grid">
            ${games.map((g) => `
                <div class="data-card">
                    <div class="data-card-title">
                        <span>${g.title}</span>
                        <span class="badge badge-${g.category.toLowerCase().replace(' ', '')}">${g.category}</span>
                    </div>
                    <div class="data-card-meta">
                        <p>📁 Asset Path: <code>assets/games/${g.name}/index.html</code></p>
                        <p style="margin-top: 4px;">⚙️ Rewarded Ad: <strong>${g.has_rewarded_video ? 'Có' : 'Không'}</strong> | Màn Ad: <strong>${g.each_n_levels}</strong></p>
                        <p style="margin-top: 4px;">💾 Dung lượng: <strong>${g.size_mb} MB</strong> | Vị trí: <strong>#${g.position}</strong></p>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="section-header">
            <h2>📱 Thiết Bị Android Mới Nhất</h2>
        </div>
        <div class="card-grid">
            ${devices.map((d) => `
                <div class="data-card">
                    <div class="data-card-title">
                        <span>${d.device_model}</span>
                        <span class="badge badge-puzzle">${d.is_premium ? 'VIP / Remove Ads' : 'Free / Ads'}</span>
                    </div>
                    <div class="data-card-meta">
                        <p>🆔 Device ID: <code>${d.device_id}</code></p>
                        <p style="margin-top: 4px;">🌐 IP: <strong>${d.ip_address}</strong> (${d.country_code}) | App v${d.app_version}</p>
                        <p style="margin-top: 4px;">🕒 Hoạt động: ${d.last_active}</p>
                    </div>
                </div>
            `).join('')}
        </div>

    </main>

    <script>
        function toggleTheme() {
            const body = document.body;
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-theme', newTheme);
        }

        function switchTab(tabName) {
            console.log('Switch tab:', tabName);
        }
    </script>
</body>
</html>`;
    res.send(html);
});
