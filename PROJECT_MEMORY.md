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
- **ADR-014 (Production AdMob Credentials & Key Isolation):** Cập nhật App ID chính thức `ca-app-pub-4108090245719282~5370179426` và 5 khối quảng cáo AdMob Production (Banner `7079433640`, Interstitial `5953445428`, Rewarded `4004949254`, Native `2014200410`, App Open `6673530530`) trong `AdConstants.kt` và `AndroidManifest.xml`.
- **ADR-015 (Brand Identity: Game Gate Offline):** Đổi tên hiển thị thương hiệu chính thức thành **Game Gate Offline** (đồng bộ `strings.xml`, `settings.gradle.kts`, `LegalPolicyHelper.kt`, `AndroidManifest.xml`).
- **ADR-016 (Deep Firebase Analytics Tracking Architecture):** Tích hợp Firebase SDK (`firebase-bom:33.4.0`, `firebase-analytics`, `google-services.json`). Xây dựng `GameTrackingRepository.kt` và `GameAnalyticsManager.kt` lưu vết và đẩy sự kiện chuyên sâu: (1) Mở game & tiến trình chơi: `game_open`, `game_play_time`, `game_level_start`, `game_level_complete`, `game_level_fail`, `game_level_restart` ghi nhận `open_count`, `play_count`, `session_duration_sec`, `total_play_time_sec`, `highest_level`; (2) Toàn bộ sự kiện hệ thống quảng cáo AdMob: `ad_request`, `ad_loaded`, `ad_failed_to_load`, `ad_impression`, `ad_clicked`, `ad_dismissed`, `ad_failed_to_show`, `ad_reward_earned`; (3) Toàn bộ sự kiện In-App Purchase: `inapp_paywall_viewed`, `inapp_purchase_initiated`, `inapp_purchase_success`, `inapp_purchase_failed`, `inapp_purchase_canceled`, `inapp_restore_initiated`, `inapp_restore_success`, `inapp_restore_none_found`; (4) Khắc phục xung đột `AD_SERVICES_CONFIG` giữa Google AdMob và Firebase Analytics trên Android 14+ / Privacy Sandbox bằng `tools:replace="android:resource"`.
- **ADR-017 (Anchored Adaptive Banner & Blue Separator Line Policy Compliance):** Nâng cấp Banner AdMob sang `AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize` lấp đầy 100% chiều ngang màn hình. Bổ sung dải phân cách màu xanh `#3B82F6` (3dp) ở mép trên banner phân tách hoàn toàn với các nút bấm gameplay, chống triệt để tình trạng click nhầm vi phạm Google AdMob Policy.
- **ADR-018 (Dual-Device Hardware Verification & Deployment):** Kiểm thử và nghiệm thu thực tế trực tiếp trên 2 thiết bị vật lý: **SAMSUNG Galaxy A50** (`SM-A507FN`) qua mDNS TLS connect và **SAMSUNG Galaxy A07** (`SM-A075F`) qua Wi-Fi ADB `192.168.1.17:5555`. Chụp ảnh nghiệm thu gameplay, banner, dải xanh và kiểm chứng live analytics logs.
- **ADR-019 (Git Deployment Architecture & SSH Deploy Key):** Khởi tạo Git repo nhánh `main`, thiết lập SSH Deploy Key `id_ed25519_nextai_game`, cấu hình `~/.ssh/config` và `.gitignore` chuẩn (loại trừ `build/`, `.gradle/`, `node_modules/`, `R2_Upload/`). Push thành công 7.595 file sạch chứa toàn bộ source code Android + 100 game đóng gói sẵn trong APK/AAB build lên `git@github.com:netvietsoft/next-ai-game-offline.git`.
- **ADR-020 (Official Firebase Project & AdMob Keys Synchronization):** Phát hiện và đồng bộ tài nguyên chính thức từ thư mục `Next ai game offline/`: (1) Tệp `com.nextai.game.offline.google-services (3).json` (Project ID: `nextai-game-offline`, Project Number: `593740416942`, App ID: `1:593740416942:android:47f8f54c95c4c9b277ea3f`, API Key: `AIzaSyCn5ynU87rmNwErA46IKI3a3P5x4_CMbAs`) thay thế toàn bộ dummy key ban đầu; (2) Tệp `com.nextai.game.offline_admob.txt` chứa App ID `ca-app-pub-4108090245719282~4299594158` và Banner `ca-app-pub-4108090245719282/4579664323`, Interstitial `3500572281`, Rewarded Interstitial `5743592246`, Rewarded `7458098782`, Native `8178183893`, App Open `3518853778`; (3) Biên dịch và xác thực truyền tải thành công dữ liệu phân tích lên máy chủ Firebase Analytics (HTTP 204) và nạp SDK AdMob core.
- **ADR-021 (Version Increment: VersionCode 9 / VersionName 1.2 for Google Play Update):** Nâng cấp `versionCode = 9` (tăng từ 8) và `versionName = "1.2"` (tăng từ 1.1) theo yêu cầu cập nhật phát hành Google Play Store. Xuất bản gói `GameGateOffline-v9-release.aab` (**121.12 MB**) và `GameGateOffline-v9-release.apk` (**122.88 MB**) tại thư mục `Release_APK/`, targetSdk 36, đã ký số với keystore chính thức `nextai_release.jks`.

---

## 4. BỘ NHỚ VẬN HÀNH & THIẾT BỊ KIỂM THỬ (HARDWARE & RUNTIME MEMORY)
- **Thiết bị kiểm thử vật lý:**
  1. **Samsung Galaxy A50** (`SM-A507FN` / Android 11+ One UI): Kết nối mDNS TLS (`adb-R58MA581ZZA-n4XnSK._adb-tls-connect._tcp`).
  2. **Samsung Galaxy A07** (`SM-A075F` / Android 16): Kết nối Wi-Fi ADB (`192.168.1.17:5555`).
- **Gói phát hành chính thức (Google Play Store Release):**
  - **AAB:** `Release_APK/GameGateOffline-v9-release.aab` (**121.12 MB**, `versionCode = 9`, `versionName = "1.2"`, Target SDK 36, SHA256: `68E2A28CCC53724A717CF493D4D160E66EFA7F175F5130CF821AEC0A18C1B660`).
  - **APK:** `Release_APK/GameGateOffline-v9-release.apk` (**122.88 MB**, SHA256: `562C1F1CEC6B00E31CF6201CFC7FD302308A18F98503A23511B0F9050799DC55`).
  - **Debug APK:** `Android/build/outputs/apk/debug/GameGateOffline-debug.apk` (149.4 MB).
- **Trạng thái nghiệm thu thực tế 100% PASS:**
  - [x] Đổi tên thành công **Game Gate Offline** trên toàn bộ hệ thống.
  - [x] Nâng cấp thành công **VersionCode 9 (1.2)** và ký số release keystore chuẩn Google Play.
  - [x] Tích hợp và đồng bộ 100% Firebase Analytics (Project `nextai-game-offline`, xác thực HTTP 204 từ máy chủ Google).
  - [x] Tích hợp và đồng bộ 100% AdMob Production Keys mới nhất (App ID `~4299594158`, Banner `4579664323`).
  - [x] Khởi chạy Launcher & nạp danh mục 423 game mượt mà trên cả 2 máy test.
  - [x] Anchored Adaptive Banner hiển thị full 100% chiều ngang màn hình.
  - [x] Dải phân cách màu xanh `#3B82F6` (3dp) bảo vệ mép trên banner, ngăn cách nút gameplay chống click nhầm vi phạm AdMob Policy.
  - [x] Firebase Analytics ghi nhận 100% sự kiện mở game, thời gian chơi, sự kiện ads và in-app billing.
  - [x] Mở Payment Wall VIP Lifetime Pass từ vương miện và từ Cài đặt.
  - [x] Tắt âm thanh game engine hoạt động đồng bộ 100%.
  - [x] Popup hiển thị Chính sách quyền riêng tư & Điều khoản dịch vụ offline + online.
  - [x] Đánh giá 5 sao kích hoạt mở Google Play Store.
  - [x] Cử chỉ vuốt ngang chuyển tab danh mục mượt mà.
  - [x] Toàn bộ mã nguồn và 100 game đóng gói sẵn trong bản build đã đồng bộ lên GitHub `netvietsoft/next-ai-game-offline`.

