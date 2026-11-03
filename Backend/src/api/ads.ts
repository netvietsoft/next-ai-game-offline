import { Router, Request, Response } from 'express';
import { db } from '../database/db';
import { authenticateAdmin } from './auth';

/**
 * Router quản lý cấu hình quảng cáo từ xa (Remote Ad Config) và Video Offline Interstitials.
 * Remote Ad Configuration and Offline Video Campaigns Router.
 */
export const adsRouter = Router();

/**
 * API Lấy cấu hình quảng cáo cho App Android Client.
 * GET /api/v1/ads/config
 */
adsRouter.get('/config', (req: Request, res: Response) => {
    const offlineAd = db.prepare('SELECT * FROM offline_ad_campaigns WHERE is_active = 1 ORDER BY version DESC LIMIT 1').get();

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
adsRouter.post('/config', authenticateAdmin, (req: Request, res: Response) => {
    const { version, media_asset_id, action_url, daily_limit } = req.body;

    try {
        db.prepare(`
            INSERT INTO offline_ad_campaigns (id, version, media_asset_id, action_url, daily_limit, is_active)
            VALUES (?, ?, ?, ?, ?, 1)
        `).run(`ad_campaign_${version}`, version, media_asset_id || 'demo_asset', action_url || '', daily_limit || 5);

        return res.json({ message: 'Cập nhật cấu hình quảng cáo thành công' });
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
});
