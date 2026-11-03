-- ==============================================================================
-- DATABASE SCHEMA: NextAI Game Offline Platform (Relational & OLAP)
-- Database Engine: SQLite / PostgreSQL compatible
-- Port: 6033 Backend System
-- ==============================================================================

-- 1. RELATIONAL SCHEMA: Quản lý Quản trị viên & Người dùng hệ thống (Admin & Users)
CREATE TABLE IF NOT EXISTS `admin_users` (
    `id` VARCHAR(50) PRIMARY KEY,
    `username` VARCHAR(50) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100) UNIQUE NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'ADMIN', -- SUPER_ADMIN, ADMIN, EDITOR
    `is_active` INTEGER NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. RELATIONAL SCHEMA: Quản lý Thiết bị & Người chơi đăng ký (Registered Devices & Users)
CREATE TABLE IF NOT EXISTS `registered_devices` (
    `device_id` VARCHAR(100) PRIMARY KEY,
    `app_version` VARCHAR(20) NOT NULL,
    `os_version` VARCHAR(20) NOT NULL,
    `device_model` VARCHAR(100) NOT NULL,
    `ip_address` VARCHAR(50) DEFAULT NULL,
    `country_code` VARCHAR(10) DEFAULT 'VN',
    `is_premium` INTEGER NOT NULL DEFAULT 0,
    `fcm_token` TEXT DEFAULT NULL,
    `first_seen` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `last_active` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. RELATIONAL SCHEMA: Quản lý Kho 423 Mini-Games (Games Catalog)
CREATE TABLE IF NOT EXISTS `games` (
    `name` VARCHAR(100) PRIMARY KEY,
    `title` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `position` INTEGER NOT NULL,
    `has_rewarded_video` INTEGER NOT NULL DEFAULT 0,
    `each_n_seconds` INTEGER DEFAULT 180,
    `each_n_levels` INTEGER DEFAULT 3,
    `each_n_scores` INTEGER DEFAULT 500,
    `is_horizontal` INTEGER NOT NULL DEFAULT 0,
    `is_active` INTEGER NOT NULL DEFAULT 1,
    `thumbnail_url` TEXT DEFAULT NULL,
    `remote_bundle_url` TEXT DEFAULT NULL,
    `size_mb` DECIMAL(6,2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. RELATIONAL SCHEMA: Quản lý Header Carousel Banners
CREATE TABLE IF NOT EXISTS `banners` (
    `id` VARCHAR(50) PRIMARY KEY,
    `game_id` VARCHAR(100) NOT NULL,
    `position` INTEGER NOT NULL,
    `image_url` TEXT NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `action_url` TEXT DEFAULT NULL,
    `is_active` INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (`game_id`) REFERENCES `games`(`name`) ON DELETE CASCADE
);

-- 5. RELATIONAL SCHEMA: Quản lý File Đa Phương Tiện (Media Assets & Cloudflare R2 Sync)
CREATE TABLE IF NOT EXISTS `media_assets` (
    `id` VARCHAR(50) PRIMARY KEY,
    `file_name` VARCHAR(255) NOT NULL,
    `file_type` VARCHAR(20) NOT NULL, -- image, audio, video, bundle
    `file_size_bytes` INTEGER NOT NULL,
    `storage_provider` VARCHAR(50) NOT NULL DEFAULT 'CLOUDFLARE_R2',
    `r2_key` VARCHAR(255) NOT NULL,
    `public_url` TEXT NOT NULL,
    `checksum_sha256` VARCHAR(64) DEFAULT NULL,
    `uploaded_by` VARCHAR(50) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. RELATIONAL SCHEMA: Quản lý Chiến Dịch Quảng Cáo Ngoại Tuyến (Offline Video Ads)
CREATE TABLE IF NOT EXISTS `offline_ad_campaigns` (
    `id` VARCHAR(50) PRIMARY KEY,
    `version` INTEGER NOT NULL UNIQUE,
    `media_asset_id` VARCHAR(50) NOT NULL,
    `action_url` TEXT NOT NULL,
    `daily_limit` INTEGER NOT NULL DEFAULT 5,
    `is_active` INTEGER NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`media_asset_id`) REFERENCES `media_assets`(`id`)
);

-- 7. OLAP / ANALYTICS SCHEMA: Thống kê Phiên Chơi Game (Game Sessions Analytics)
CREATE TABLE IF NOT EXISTS `olap_game_sessions` (
    `session_id` VARCHAR(100) PRIMARY KEY,
    `device_id` VARCHAR(100) NOT NULL,
    `game_name` VARCHAR(100) NOT NULL,
    `duration_seconds` INTEGER NOT NULL,
    `score_achieved` INTEGER NOT NULL DEFAULT 0,
    `levels_completed` INTEGER NOT NULL DEFAULT 0,
    `country_code` VARCHAR(10) DEFAULT 'VN',
    `session_timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. OLAP / ANALYTICS SCHEMA: Thống kê Hiển thị & Doanh thu Quảng Cáo (Ad Impressions)
CREATE TABLE IF NOT EXISTS `olap_ad_events` (
    `event_id` VARCHAR(100) PRIMARY KEY,
    `device_id` VARCHAR(100) NOT NULL,
    `ad_type` VARCHAR(30) NOT NULL, -- BANNER, INTERSTITIAL, REWARDED, OFFLINE_VIDEO
    `ad_network` VARCHAR(30) NOT NULL, -- ADMOB, APPLOVIN, OFFLINE
    `revenue_estimated_usd` DECIMAL(8,5) DEFAULT 0.00000,
    `event_timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
