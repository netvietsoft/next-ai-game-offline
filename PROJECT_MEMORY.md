# PROJECT_MEMORY.md - BỘ NHỚ VẬN HÀNH DỰ ÁN (PROJECT MEMORY)
**Dự án:** NextAI Game Offline (`com.nextai.gameoffline`)  
**Tác giả:** Agent 0 - Bộ não điều phối hệ thống

---

## 1. BỐI CẢNH & NGUỒN GỐC DỰ ÁN (CONTEXT)
- **App Gốc Decompile:** `com.media720.games2020` (Offline Games: No WiFi Games của JindoBlu).
- **Mục tiêu:** Tái dựng thành sản phẩm hoàn chỉnh mang thương hiệu **NextAI Technology** (`com.nextai.gameoffline`), độc lập bản quyền, kiến trúc hiện đại, có hệ sinh thái Backend & Admin CMS quản trị tập trung.
- **Tiêu chuẩn vận hành:** `Development Workspace Standard V2.1 (Design-Gated + APK-to-Full-Stack Reconstruction)`.

---

## 2. QUY CHUẨN CÔNG NGHỆ & KIẾN TRÚC (TECH STACK CONVENTIONS)
1. **Android Client (`Android/`):**
   - Ngôn ngữ: **Kotlin** (100% thay thế Java cũ).
   - UI Framework: Kết hợp linh hoạt **Jetpack Compose** + **XML ViewBinding** cho tốc độ tối đa.
   - Database: **Room ORM (SQLite)** lưu trữ 423 game, banners, user stats.
   - WebView Bridge: `AndroidGameBridge` hai chiều (JS <-> Kotlin) truyền điểm, quảng cáo, rung haptic.
   - Monetization: Google AdMob + AppLovin MAX Mediation + Google Play Billing v8.3.0.
   - Audio/Video: AndroidX Media3 ExoPlayer phục vụ phát video quảng cáo offline.
2. **Backend & Admin CMS (`Backend/`):**
   - Ngôn ngữ: **TypeScript (Node.js)** và **Golang**.
   - Cổng chạy dịch vụ: **Port 6033**.
   - API Docs: **Swagger OpenAPI 3.0** (`/api-docs`).
   - Giao diện Admin: **Light/Dark Mode**, Responsive Mobile, Card Data Display, URL phân cấp `/admin/parent/child`.
   - Media Storage: Trừu tượng hóa **Cloudflare R2 / S3**.

---

## 3. CÁC QUYẾT ĐỊNH KIẾN TRÚC ĐÃ THÔNG QUA (KEY DECISIONS)
- **ADR-001 (Game Engine):** Giữ nguyên kho **423 mini-game HTML5 / WebAssembly Box2D / Phaser** có sẵn trong `GAME HTML/` để đạt hiệu năng 60 FPS, không viết lại bằng Unity vì sẽ làm phình dung lượng APK lên > 2GB.
- **ADR-002 (Package Name):** Đổi toàn bộ sang `com.nextai.gameoffline` (NextAI Technology).
- **ADR-003 (Bilingual Code Comments):** 100% hàm và class đều có comment song ngữ Tiếng Việt + Tiếng Anh.
- **ADR-004 (Security Hardening):** Bật `usesCleartextTraffic=false`, cô lập WebView sandbox chỉ nạp local assets, mã hóa SQLite với SQLCipher, chuyển xác thực biên lai IAP lên Backend.
- **ADR-005 (Payment Wall Architecture):** Sử dụng Activity toàn màn hình chuẩn `@style/Theme.NextAIGameOffline` (tránh dùng Dialog Theme làm co cụm layout 0dp), thiết kế tông Dark-Gold VIP cao cấp, tích hợp Google Play Billing 8.x + tính năng Khôi phục mua hàng (Restore Purchases).
- **ADR-006 (Master Game Audio Mute):** Quản lý trạng thái tắt/bật âm thanh tập trung qua `GameSettingsManager`. Khi kích hoạt, tự động can thiệp vào `GameActivity.kt` inject mã JavaScript tắt triệt để mọi audio engine của mini-game (Howler.js, Construct 2/3, thẻ HTML5 `<audio>/<video>`, WebAudio API).
- **ADR-007 (AppCompat Drawable Resolution):** Loại bỏ toàn bộ các file stub drawable `res/drawable/abc_*.xml` decompiled chứa `android:drawable="@null"`. Điều này ngăn chặn lỗi crash `XmlPullParserException: <item> tag requires a 'drawable' attribute` và `StaticLayout` NPE trên Android 14/15/16 khi nạp `SwitchCompat`.
- **ADR-008 (Smooth Tab Navigation):** Sử dụng `ViewPager2` kết hợp `TabLayoutMediator`, hạ `mTouchSlop` xuống 0.5x và khắc phục xung đột touch trong `NestedScrollableHost` để tối ưu hóa cử chỉ vuốt ngang chuyển danh mục game.
- **ADR-009 (Android API 35 & Google Play Billing 9.1.0 Migration):** Nâng cấp Target/Compile SDK lên 35 (Android 15), cập nhật thư viện Google Play Billing Library lên `9.1.0`. Chuyển đổi callback `queryProductDetailsAsync` sang wrapper `QueryProductDetailsResult`, xử lý mã lỗi `BILLING_UNAVAILABLE`, và bổ sung quản lý Window Insets (`WindowInsetsCompat.Type.systemBars() or displayCutout()`) chuẩn Edge-to-Edge bắt buộc của Android 15.
- **ADR-010 (Application ID com.nextai.game.offline & Deterministic DB Seeding):** Cấu hình chính thức Application ID `com.nextai.game.offline` (gỡ bỏ hoàn toàn hậu tố `.debug`). Khắc phục triệt để race condition Room DB bằng cách gọi hàm `populateGamesCatalogDirect(context, gamesDao)` trong `observeGames()` nếu `gamesDao.getGamesCount() == 0`, đảm bảo hiển thị 100% 423 mini-game ngay từ lần khởi chạy đầu tiên. Đồng thời loại bỏ các tệp drawable decompiled `mtrl_switch_*.xml` thiếu transitions để các công tắc Settings Dialog hiển thị hoàn hảo.
- **ADR-011 (Hybrid Asset Architecture: 100 Bundled Games & 319 On-Demand via Cloudflare R2):** Nhằm đáp ứng giới hạn khắt khe của Google Play Console (AAB < 150 MB instant download / < 500 MB max): (1) Giữ lại 100 game nhẹ nhất (tổng 173 MB uncompressed) cùng các tài nguyên dùng chung (`fonts`, `iads`, `icons`, `plugins`) tích hợp trực tiếp trong AAB/APK, cho phép chơi offline ngay lập tức; (2) Đóng gói 319 game còn lại thành các file `.zip` độc lập tải từ Cloudflare R2 (`https://pub-r2.nextai.games/games/{game_name}.zip`); (3) Tích hợp `GameDownloadManager` giải nén an toàn chống Zip Slip vào `filesDir/games/`, nạp qua `WebViewAssetLoader.InternalStoragePathHandler("/downloaded_games/")`, kết hợp cơ chế fallback tài nguyên dùng chung trong assets; (4) Giảm kích thước AAB xuất xưởng từ 1.13 GB xuống chỉ **120.64 MB** và APK từ 1.16 GB xuống **122.59 MB**.
- **ADR-012 (Target SDK 36 - Android 16 Baklava Compliance):** Nâng cấp Target SDK và Compile SDK lên 36 (`compileSdk = 36`, `targetSdk = 36`, `buildToolsVersion = "36.0.0"`), đáp ứng 100% chính sách mới nhất của Google Play Console yêu cầu "must target at least API level 36". Đặt `versionCode = 2` phục vụ phát hành bản cập nhật.
- **ADR-013 (Removal of Unused FOREGROUND_SERVICE_DATA_SYNC):** Loại bỏ quyền `FOREGROUND_SERVICE_DATA_SYNC` và khai báo `<service>` thừa khỏi `AndroidManifest.xml`. Ứng dụng không chạy background sync ngầm khi đóng app (việc tải 319 game từ R2 dùng Coroutines trực tiếp trong Activity có UI progress), loại bỏ 100% form giải trình và rủi ro bị Google Play Console từ chối. Đặt `versionCode = 3`.

---




## 4. BỘ NHỚ VẬN HÀNH & THIẾT BỊ KIỂM THỬ (HARDWARE & RUNTIME MEMORY)
- **Thiết bị kiểm thử vật lý:** Samsung Galaxy A07 (`SM-A075F`, chip MediaTek Helio G99 / Android 16).
- **Kết nối kiểm thử:** Wi-Fi ADB (`192.168.1.9:5555`).
- **Quy trình cài đặt:** APK dung lượng 1.21 GB (chứa 423 game HTML5/WASM) phải dùng phương thức streaming install (`adb install -r -d <apk>`) để tránh timeout socket qua kết nối mạng không dây.
- **Trạng thái nghiệm thu thực tế:**
  - [x] Khởi chạy Launcher & nạp danh mục 423 game mượt mà.
  - [x] Hiển thị banner AdMob đáy màn hình không đè menu gameplay.
  - [x] Mở Payment Wall VIP Lifetime Pass từ vương miện và từ Cài đặt.
  - [x] Tắt âm thanh game engine hoạt động đồng bộ 100%.
  - [x] Popup hiển thị Chính sách quyền riêng tư & Điều khoản dịch vụ offline + online.
  - [x] Đánh giá 5 sao kích hoạt mở Google Play Store.
  - [x] Cử chỉ vuốt ngang chuyển tab danh mục mượt mà.
