-- ==============================================================================
-- DATABASE SCHEMA: Offline Games (com.media720.games2020)
-- Target RDBMS: SQLite (Client Local) / PostgreSQL & MySQL (CMS & Server Sync)
-- Độ chính xác: 100% khớp với Room Database Entities và Local App Architecture
-- ==============================================================================

-- 1. Bảng Quản Lý Danh Sách Mini-Game
CREATE TABLE IF NOT EXISTS `games` (
    `name` VARCHAR(100) NOT NULL PRIMARY KEY,
    `position` INTEGER NOT NULL,
    `soundToggleType` INTEGER NOT NULL DEFAULT 1,
    `configType` INTEGER NOT NULL DEFAULT 0,
    `useWideViewPortAndOverviewMode` INTEGER NOT NULL DEFAULT 1,
    `leaderboardId` VARCHAR(255) DEFAULT NULL,
    `section` VARCHAR(50) DEFAULT NULL,
    `has_rewarded_video` INTEGER NOT NULL DEFAULT 0,
    `each_n_seconds` INTEGER DEFAULT 180,
    `each_n_levels` INTEGER DEFAULT 3,
    `each_n_scores` INTEGER DEFAULT 500,
    `minimum_level` INTEGER DEFAULT 1,
    `minimum_time_played_in_game_sec` INTEGER DEFAULT 30,
    `gameFinishedAd` INTEGER NOT NULL DEFAULT 1,
    `js_popup_each_n_seconds` INTEGER DEFAULT 120,
    `remote_image_url` TEXT DEFAULT NULL,
    `remote_url_version` INTEGER DEFAULT 1,
    `remote_url` TEXT DEFAULT NULL,
    `size_mb` DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    `title` VARCHAR(150) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `isHorizontal` INTEGER NOT NULL DEFAULT 0
);

-- 2. Bảng Quản Lý Banner Nổi Bật Trên Header
CREATE TABLE IF NOT EXISTS `banners` (
    `gameId` VARCHAR(100) NOT NULL,
    `position` INTEGER NOT NULL,
    `image_url` TEXT NOT NULL,
    PRIMARY KEY (`gameId`, `position`),
    FOREIGN KEY (`gameId`) REFERENCES `games`(`name`) ON DELETE CASCADE
);

-- 3. Bảng Quản Lý Chiến Dịch Quảng Cáo Ngoại Tuyến (Offline Interstitial Video Ads)
CREATE TABLE IF NOT EXISTS `offline_games_interstitial` (
    `version` INTEGER NOT NULL PRIMARY KEY,
    `url` TEXT NOT NULL,
    `actionUrl` TEXT NOT NULL,
    `showDailyLimit` INTEGER NOT NULL DEFAULT 5
);

-- 4. Bảng Cross-Promotion Ứng Dụng Khác Từ Google Play
CREATE TABLE IF NOT EXISTS `google_play_app_banners` (
    `id` INTEGER NOT NULL PRIMARY KEY,
    `packageName` VARCHAR(150) NOT NULL,
    `referrer` VARCHAR(100) NOT NULL,
    `showTimes` INTEGER NOT NULL DEFAULT 10,
    `minTimesToOpenMenuBeforeShow` INTEGER NOT NULL DEFAULT 2,
    `showEachMenuOpen` INTEGER NOT NULL DEFAULT 1,
    `title` VARCHAR(150) NOT NULL,
    `subtitle` VARCHAR(255) NOT NULL,
    `iconUrl` TEXT NOT NULL,
    `buttonText` VARCHAR(50) NOT NULL
);

-- 5. Bảng Hardcoded Games Để Debug / Fallback Cục Bộ
CREATE TABLE IF NOT EXISTS `debug_hardcoded_games` (
    `name` VARCHAR(100) NOT NULL PRIMARY KEY,
    `title` VARCHAR(150) NOT NULL,
    `position` INTEGER NOT NULL,
    `active` INTEGER NOT NULL DEFAULT 1
);

-- 6. Bảng Quản Lý Giao Dịch In-App Purchase & Subscriptions (Backend/Local Sync)
CREATE TABLE IF NOT EXISTS `user_purchases` (
    `order_id` VARCHAR(100) NOT NULL PRIMARY KEY,
    `product_id` VARCHAR(50) NOT NULL,
    `purchase_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `purchase_state` VARCHAR(20) NOT NULL,
    `is_acknowledged` INTEGER NOT NULL DEFAULT 1,
    `price_currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
    `price_amount` DECIMAL(6,2) NOT NULL
);

-- 7. Bảng Thống Kê & Điểm Số Người Chơi (User Game Statistics)
CREATE TABLE IF NOT EXISTS `user_game_stats` (
    `game_name` VARCHAR(100) NOT NULL PRIMARY KEY,
    `high_score` INTEGER NOT NULL DEFAULT 0,
    `games_played` INTEGER NOT NULL DEFAULT 0,
    `total_time_spent_sec` INTEGER NOT NULL DEFAULT 0,
    `is_favorite` INTEGER NOT NULL DEFAULT 0,
    `last_played` TIMESTAMP NULL,
    FOREIGN KEY (`game_name`) REFERENCES `games`(`name`) ON DELETE CASCADE
);

-- Chỉ mục tối ưu hóa hiệu năng truy vấn
CREATE INDEX IF NOT EXISTS `idx_games_category` ON `games`(`category`);
CREATE INDEX IF NOT EXISTS `idx_games_section` ON `games`(`section`);
CREATE INDEX IF NOT EXISTS `idx_stats_favorite` ON `user_game_stats`(`is_favorite`);
CREATE INDEX IF NOT EXISTS `idx_stats_score` ON `user_game_stats`(`high_score` DESC);
