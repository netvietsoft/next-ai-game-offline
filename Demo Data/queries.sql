-- ==============================================================================
-- BỘ TRUY VẤN SQL MẪU (SQL Queries For Offline Games CMS & Analytics)
-- ==============================================================================

-- 1. Lấy danh sách game theo thứ tự hiển thị tại màn hình Home (Lobby)
SELECT 
    name, 
    title, 
    category, 
    isHorizontal, 
    size_mb, 
    has_rewarded_video
FROM games
ORDER BY position ASC;

-- 2. Lấy danh sách các game Yêu Thích của người dùng kèm điểm kỷ lục
SELECT 
    g.title, 
    g.category, 
    s.high_score, 
    s.games_played, 
    s.last_played
FROM games g
INNER JOIN user_game_stats s ON g.name = s.game_name
WHERE s.is_favorite = 1
ORDER BY s.last_played DESC;

-- 3. Kiểm tra trạng thái kích hoạt Gỡ Quảng Cáo (Entitlement Check)
SELECT 
    order_id, 
    product_id, 
    purchase_time, 
    purchase_state
FROM user_purchases
WHERE product_id IN ('disable_ads_forever', 'disable-ads-1-month', 'disable-ads-1-year')
  AND purchase_state = 'PURCHASED';

-- 4. Thống kê dung lượng bộ nhớ của toàn bộ 64 mini-game theo danh mục
SELECT 
    category, 
    COUNT(*) AS total_games, 
    ROUND(SUM(size_mb), 2) AS total_size_mb, 
    ROUND(AVG(size_mb), 2) AS avg_size_mb
FROM games
GROUP BY category
ORDER BY total_size_mb DESC;

-- 5. Lấy danh sách Banner quảng cáo ngoài trang chủ kèm thông tin game liên kết
SELECT 
    b.position, 
    b.image_url, 
    g.title, 
    g.category
FROM banners b
LEFT JOIN games g ON b.gameId = g.name
ORDER BY b.position ASC;

-- 6. Danh sách game cần hiển thị quảng cáo Interstitial sau mỗi N giây
SELECT 
    name, 
    title, 
    each_n_seconds, 
    each_n_levels, 
    gameFinishedAd
FROM games
WHERE each_n_seconds > 0
ORDER BY each_n_seconds ASC;

-- 7. Lấy ứng dụng Cross-Promotion phù hợp để hiển thị tại Menu mở
SELECT 
    packageName, 
    title, 
    subtitle, 
    iconUrl, 
    buttonText
FROM google_play_app_banners
WHERE showTimes > 0
ORDER BY minTimesToOpenMenuBeforeShow ASC
LIMIT 1;
