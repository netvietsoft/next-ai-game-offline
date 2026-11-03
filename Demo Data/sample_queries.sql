-- Câu lệnh truy vấn dữ liệu từ bảng games (Offline Games Database)

-- 1. Xem tổng số lượng game (Bao gồm game có sẵn và game tải từ server)
SELECT count(*) AS total_games FROM games;

-- 2. Xem danh sách 319 game tải từ server (Kèm link tải trực tiếp file zip)
SELECT position, name, title, category, size_mb, remote_url, remote_image_url
FROM games
WHERE remote_url IS NOT NULL
ORDER BY position;

-- 3. Xem danh sách 99 game mặc định có sẵn trong APK
SELECT position, name, title, category
FROM games
WHERE remote_url IS NULL
ORDER BY position;

-- 4. Thống kê số lượng game theo thể loại (Category)
SELECT category, count(*) as total_count, round(sum(size_mb), 2) as total_size_mb
FROM games
GROUP BY category
ORDER BY total_count DESC;

-- 5. Lọc các game màn hình ngang (isHorizontal = 1) hoặc màn hình dọc (isHorizontal = 0)
SELECT name, title, category, isHorizontal
FROM games
WHERE isHorizontal = 1;
