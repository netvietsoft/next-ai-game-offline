"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devicesRouter = void 0;
const express_1 = require("express");
const db_1 = require("../database/db");
const auth_1 = require("./auth");
/**
 * Router quản lý thiết bị và người chơi đăng ký (Device Registry & Tracking).
 * Device Registry & Player Management Router.
 */
exports.devicesRouter = (0, express_1.Router)();
/**
 * API Đăng ký hoặc báo cáo trạng thái hoạt động của thiết bị từ Android App.
 * POST /api/v1/devices/register
 */
exports.devicesRouter.post('/register', (req, res) => {
    const { device_id, app_version, os_version, device_model, country_code, fcm_token } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
    if (!device_id) {
        return res.status(400).json({ error: 'Thiếu device_id' });
    }
    const existingDevice = db_1.db.prepare('SELECT * FROM registered_devices WHERE device_id = ?').get(device_id);
    if (existingDevice) {
        db_1.db.prepare(`
            UPDATE registered_devices
            SET app_version = COALESCE(?, app_version),
                os_version = COALESCE(?, os_version),
                fcm_token = COALESCE(?, fcm_token),
                last_active = CURRENT_TIMESTAMP
            WHERE device_id = ?
        `).run(app_version, os_version, fcm_token, device_id);
        return res.json({ message: 'Thiết bị đã được cập nhật', is_premium: existingDevice.is_premium });
    }
    else {
        db_1.db.prepare(`
            INSERT INTO registered_devices (device_id, app_version, os_version, device_model, ip_address, country_code, fcm_token)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(device_id, app_version || '2.1.0', os_version || 'Android', device_model || 'Unknown', ipAddress, country_code || 'VN', fcm_token);
        return res.status(201).json({ message: 'Đăng ký thiết bị thành công', is_premium: 0 });
    }
});
/**
 * API Lấy danh sách toàn bộ thiết bị (Admin Only).
 * GET /api/v1/devices
 */
exports.devicesRouter.get('/', auth_1.authenticateAdmin, (req, res) => {
    const devices = db_1.db.prepare('SELECT * FROM registered_devices ORDER BY last_active DESC').all();
    return res.json({ total: devices.length, devices });
});
