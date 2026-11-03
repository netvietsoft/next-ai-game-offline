"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adsRouter = void 0;
const express_1 = require("express");
const db_1 = require("../database/db");
const auth_1 = require("./auth");
/**
 * Router quản lý cấu hình quảng cáo từ xa (Remote Ad Config) và Video Offline Interstitials.
 * Remote Ad Configuration and Offline Video Campaigns Router.
 */
exports.adsRouter = (0, express_1.Router)();
/**
 * API Lấy cấu hình quảng cáo cho App Android Client.
 * GET /api/v1/ads/config
 */
exports.adsRouter.get('/config', (req, res) => {
    const offlineAd = db_1.db.prepare('SELECT * FROM offline_ad_campaigns WHERE is_active = 1 ORDER BY version DESC LIMIT 1').get();
    return res.json({
        global_ad_settings: {
            banner_refresh_seconds: 30,
            interstitial_interval_seconds: 180,
            interstitial_level_interval: 3,
            rewarded_ad_enabled: true
        },
        offline_interstitial: offlineAd || {
            version: 1,
            url: "https://assets.nextai.com/videos/offline_promo_sample.mp4",
            action_url: "https://play.google.com/store/apps/details?id=com.nextai.gameoffline",
            daily_limit: 5
        }
    });
});
/**
 * API Cập nhật cấu hình quảng cáo (Admin Only).
 * POST /api/v1/ads/config
 */
exports.adsRouter.post('/config', auth_1.authenticateAdmin, (req, res) => {
    const { version, media_asset_id, action_url, daily_limit } = req.body;
    try {
        db_1.db.prepare(`
            INSERT INTO offline_ad_campaigns (id, version, media_asset_id, action_url, daily_limit, is_active)
            VALUES (?, ?, ?, ?, ?, 1)
        `).run(`ad_campaign_${version}`, version, media_asset_id || 'demo_asset', action_url || '', daily_limit || 5);
        return res.json({ message: 'Cập nhật cấu hình quảng cáo thành công' });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
