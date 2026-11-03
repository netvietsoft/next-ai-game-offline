# Docs/rules.md - QUY CHUẨN MÃ NGUỒN & KỸ THUẬT TOÀN DỰ ÁN

---

## 1. QUY CHUẨN MÃ NGUỒN ANDROID (KOTLIN)
- **Ngôn ngữ:** Kotlin 2.0+ (Target SDK 34, Min SDK 24).
- **Package Name:** `com.nextai.gameoffline` (Publisher: NextAI Technology / NextSolution).
- **Quy tắc đặt tên:**
  - Class, Interface, Object: `PascalCase` (vd: `GameListActivity`, `AppDatabase`, `AndroidGameBridge`).
  - Function, Variable, Property: `camelCase` (vd: `submitScore()`, `highScore`, `hasRewardedVideo`).
  - Constant: `UPPER_SNAKE_CASE` (vd: `TABLE_GAMES`, `DEFAULT_EACH_N_SECONDS`).
- **Bắt buộc có Comment Song Ngữ (Bilingual Comments):**
  ```kotlin
  /**
   * Cầu nối JavaScript hai chiều giữa Android Native và Game HTML5/WASM.
   * Two-way JavaScript bridge between Android Native and HTML5/WASM games.
   *
   * @param onScoreSubmitted Callback khi người chơi đạt điểm mới / Callback when player submits new score.
   */
  ```
- **Kiến trúc MVVM & Clean Architecture:**
  - `data/local`: Room Entities, Room DAOs, `AppDatabase.kt`.
  - `domain`: Repositories interfaces, Models.
  - `presentation`: Activities, Fragments, Compose Screens, ViewModels.
  - `ads`: Quản lý AdMob, AppLovin MAX và Offline Video Interstitials.
  - `billing`: Google Play Billing v8.3.0.

---

## 2. QUY CHUẨN BACKEND & CMS (TYPESCRIPT / GO)
- **Ngôn ngữ:** TypeScript (Node.js 20+) + Express / Fastify + Golang services.
- **Cổng dịch vụ (Port):** **6033** (Bắt buộc theo yêu cầu hệ thống).
- **Tài liệu API:** Tự động tạo bằng Swagger UI tại `/api-docs`.
- **Admin Dashboard UI:**
  - Hỗ trợ chuyển đổi chế độ Sáng / Tối (Light & Dark theme).
  - Cấu trúc URL phân cấp rõ ràng: `domain.com/admin/menu-cha/menu-con`.
  - Thiết kế thích ứng trên thiết bị di động (Mobile Responsive).
  - Hiển thị dữ liệu dạng Card khi có nhiều thông tin trên 1 dòng.
- **Xác thực Admin:** JWT Token + bcrypt hash mật khẩu.
- **Xử lý Tệp Đa Phương Tiện:** Tích hợp S3/Cloudflare R2 API để thêm/xóa ảnh, âm thanh, video (đồng bộ xóa cả trên cloud tránh file mồ côi).

---

## 3. QUY TRÌNH KIỂM THỬ & QUALITY GATE
- Viết Unit Test cho Room Database DAO, ViewModel và API Endpoints.
- Chạy kiểm thử giao diện Web Admin bằng **Playwright**.
- Kiểm thử tự động trên máy Android thật / máy ảo qua **ADB CLI**.
