# NextAI Game Offline - Multi-Game Platform

![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20Web%20Admin-green.svg)
![Architecture](https://img.shields.io/badge/architecture-Kotlin%20%2B%20HTML5%20WASM%20%2B%20TypeScript%20Go-orange.svg)

Dự án tái dựng toàn diện (Full-Stack Reconstruction) nền tảng trò chơi ngoại tuyến **NextAI Game Offline** (`com.nextai.gameoffline`) từ bản dịch ngược APK, chuẩn hóa theo chuẩn phát triển đa tác nhân **Development Workspace Standard V2.1 (Design-Gated)**.

---

## 🎯 Mục Tiêu Dự Án
1. **Ứng Dụng Android Native (Kotlin):**
   - Package Name mới: `com.nextai.gameoffline` (Nhà phát hành: NextAI Technology).
   - Tích hợp trọn vẹn **423 mini-game HTML5 / WebAssembly** mượt mà 60 FPS.
   - Kiến trúc Modern Android: **Kotlin Coroutines, Jetpack Compose / ViewBinding, Room SQLite Database, WebView Two-Way JavascriptBridge**.
   - Tích hợp hệ thống kiếm tiền: **Google AdMob, AppLovin MAX Mediation & Google Play In-App Billing v8.3.0**.
   - Khắc phục triệt để 5 lỗ hổng bảo mật phát hiện từ bản decompile (Cleartext traffic, WebView sandbox, Plain-text DB, Client-side IAP, Unverified download).

2. **Hệ Thống Backend & Admin CMS (`Backend/`):**
   - Công nghệ: **TypeScript (Node.js/Express) & Go microservice**, phục vụ trên **Cổng 6033**.
   - Quản lý tập trung: Mini-games metadata, User & Device Registry, Banners, Push Notifications, Remote Ad Configuration.
   - Quản lý tài nguyên đa phương tiện (Audio, Image, Video) tích hợp trừu tượng hóa Cloudflare R2 / S3 Storage.
   - Tài liệu API tương tác tự động với **Swagger OpenAPI UI** tại `http://localhost:6033/api-docs`.
   - Giao diện Web Admin Dashboard chuẩn UX/UI: Hỗ trợ chuyển đổi Theme Sáng/Tối (Light/Dark mode), Responsive Mobile, thiết kế dạng Card trực quan.

---

## 🏗️ Cấu Trúc Dự Án

```
├── Android/                    # Mã nguồn ứng dụng Android Kotlin (com.nextai.gameoffline)
│   ├── src/main/java/com/nextai/gameoffline/
│   │   ├── GameApplication.kt
│   │   ├── data/local/         # Room Database, DAOs & Entities
│   │   ├── presentation/       # Compose/XML UI, Launcher, WebView Game Container
│   │   ├── billing/            # Google Play Billing 8.x
│   │   └── ads/                # AdMob, MAX Mediation & Offline Video Interstitial
│   ├── src/main/assets/games/  # 423 mini-game HTML5/WASM
│   └── AndroidManifest.xml
│
├── Backend/                    # Backend API & Admin CMS Server (Port 6033)
│   ├── src/
│   │   ├── server.ts           # Server chính chạy trên cổng 6033
│   │   ├── api/                # API routes (Games, Users, Devices, Media, Ads)
│   │   ├── cms/                # Web Admin Dashboard (Light/Dark mode, Responsive)
│   │   └── database/           # Relational & OLAP Schema, Migrations
│   └── swagger.yaml
│
├── Docs/                       # Toàn bộ tài liệu chuẩn Workspace Standard V2.1
├── Report/                     # 12 Tệp báo cáo phân tích chuyên sâu chi tiết
├── Demo Data/                  # Database SQLite, CSV models & SQL query templates
├── Redesign/                   # Design Tokens, Palette mã màu, XML Layouts
└── .ai/                        # Trạng thái điều phối Agent, Task Graph & Machine State
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Khởi Chạy Backend & Admin CMS (Cổng 6033)
```bash
cd Backend
npm install
npm run dev
# Mở trình duyệt truy cập Web Admin: http://localhost:6033/admin
# Xem tài liệu API Swagger: http://localhost:6033/api-docs
```

### 2. Mở Dự Án Android
- Mở thư mục `Android/` bằng **Android Studio Ladybug (hoặc mới hơn)**.
- Gradle sync và chạy trực tiếp trên thiết bị máy ảo / điện thoại Android thật.

---

## 📜 Tài Liệu Tham Chiếu
- [AGENTS.md](file:///e:/DECOMPILER/Game/com.media720.games2020/AGENTS.md) - Hiến pháp phân công nhiệm vụ AI Agent.
- [UPDATETODOS.md](file:///e:/DECOMPILER/Game/com.media720.games2020/UPDATETODOS.md) - Bảng theo dõi tiến độ công việc trực tiếp.
- [Tasksrequiring.md](file:///e:/DECOMPILER/Game/com.media720.games2020/Tasksrequiring.md) - Danh mục tài nguyên người dùng cần cung cấp.
- [PROJECT_MEMORY.md](file:///e:/DECOMPILER/Game/com.media720.games2020/PROJECT_MEMORY.md) - Bộ nhớ dự án và ngữ cảnh kỹ thuật.
