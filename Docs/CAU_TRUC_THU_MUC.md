# Docs/CAU_TRUC_THU_MUC.md - CẤU TRÚC THƯ MỤC CHUẨN TOÀN HỆ THỐNG

```
PROJECT_ROOT/
├── Android/                                    # Ứng dụng Android Kotlin tái dựng hoàn chỉnh
│   ├── build.gradle.kts                        # Cấu hình Gradle build script Kotlin DSL
│   ├── settings.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml                 # Manifest đã tối ưu hóa, bảo mật
│       ├── assets/
│       │   └── games/                          # 423 mini-game HTML5 / WASM
│       ├── java/com/nextai/gameoffline/        # Mã nguồn Kotlin chuẩn
│       │   ├── GameApplication.kt             # Khởi tạo App, Hilt, Notification
│       │   ├── data/
│       │   │   └── local/
│       │   │       ├── AppDatabase.kt          # Room SQLite Database
│       │   │       ├── dao/                    # GamesDao, BannersDao, StatsDao...
│       │   │       └── entity/                 # GameEntity, BannerEntity, UserStatsEntity...
│       │   ├── presentation/
│       │   │   ├── gamelist/
│       │   │   │   ├── GameListActivity.kt     # Màn hình chính Home Grid 2 cột
│       │   │   │   ├── HomeFragment.kt
│       │   │   │   └── GameAdapter.kt
│       │   │   └── game/
│       │   │       ├── GameActivity.kt         # Màn hình WebView Container
│       │   │       ├── GameFragment.kt
│       │   │       ├── AndroidGameBridge.kt    # Cầu nối hai chiều JS <-> Kotlin
│       │   │       └── GameWebViewClient.kt
│       │   ├── billing/
│       │   │   ├── BillingManager.kt           # Google Play Billing Client 8.x
│       │   │   ├── BillingActivity.kt          # Màn hình Paywall
│       │   │   └── BillingConstants.kt
│       │   └── ads/
│       │       ├── AdManager.kt                # Quản lý AdMob / AppLovin MAX
│       │       ├── AdConstants.kt
│       │       └── offlineads/                 # Quảng cáo video offline khi không có mạng
│       │           ├── OfflineAdDownloadService.kt
│       │           └── OfflineInterstitialActivity.kt
│       └── res/                                # Giao diện XML, Drawables, Values, Colors
│           ├── layout/
│           ├── values/
│           └── drawable/
│
├── Backend/                                    # Máy chủ API & Web Admin CMS (Port 6033)
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── server.ts                           # Server chính chạy trên cổng 6033
│   │   ├── api/
│   │   │   ├── routes/                         # Games, Users, Devices, Media, Ads, Auth
│   │   │   ├── controllers/
│   │   │   └── middlewares/
│   │   ├── cms/
│   │   │   ├── views/                          # Web Admin UI (Light/Dark mode, Responsive)
│   │   │   └── public/                         # CSS, JS, Assets
│   │   ├── services/                           # Cloudflare R2 / S3, Database sync
│   │   └── database/
│   │       ├── schema.sql                      # Relational & OLAP Schema
│   │       └── db.ts                           # Kết nối SQLite / PostgreSQL
│   └── tests/                                  # Backend API & Playwright Web UI tests
│
├── GAME HTML/                                  # 423 Mini-Game HTML5/WASM gốc
├── Demo Data/                                  # Dữ liệu mẫu CSV, SQLite Database, SQL queries
├── Redesign/                                   # Tokens, XML Layouts, Colors, Strings
├── Report/                                     # Toàn bộ 12 Báo cáo chuyên sâu
├── Docs/                                       # Tài liệu kiến trúc và hướng dẫn
├── .ai/                                        # Machine-readable task and agent state
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── .clinerules
├── UPDATETODOS.md
├── PROJECT_MEMORY.md
├── TASK_LOG.md
└── Tasksrequiring.md
```
