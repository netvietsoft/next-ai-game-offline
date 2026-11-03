# BÁO CÁO 05: CẤU TRÚC THƯ MỤC CODE & KIẾN TRÚC MÃ NGUỒN
**Dự án:** Offline Games: No WiFi Games (`com.media720.games2020`)  
**Mục tiêu:** Trả lời chi tiết Yêu cầu 9 trong `readme.txt`.

---

## 1. Sơ Đồ Cấu Trúc Tổng Thể Thư Mục Mã Nguồn

Dưới đây là cây thư mục các package Java/Kotlin cốt lõi trong `decompiled_src/sources/com/media720/games2020/`:

```
com.media720.games2020/
├── GameApplication.java          # Điểm khởi tạo toàn cục (Dagger Hilt, ANR Watchdog, Notification, AppMetrica)
├── ads/                          # Hệ thống quản lý quảng cáo cục bộ & mạng trung gian
│   └── offlinegames/
│       ├── downloader/           # Dịch vụ tải video quảng cáo ngoại tuyến chạy nền (Media3 / WorkManager)
│       │   ├── InterstitialDownloadService.java
│       │   └── OfflineAdWorker.java
│       └── ui/                   # Giao diện phát video quảng cáo offline toàn màn hình
│           └── InterstitialActivity.java
├── base/                         # Base Activity, Base Fragment, MVVM ViewBinding extensions
├── billing/                      # Hệ thống Google Play In-App Purchase
│   └── presentation/
│       ├── BillingActivity.java  # Màn hình Paywall / Popup mời mua gói "Remove Ads"
│       └── ProductDescriptionView.java # Custom View hiển thị giá tiền và tính năng gói IAP
├── presentation/                 # Tầng giao diện người dùng chính (UI Layer)
│   ├── base/                     # Core Navigation & Base ViewModel
│   ├── game/                     # Màn hình chơi game (Chứa WebView Bridge)
│   │   ├── GameActivity.java     # Activity chứa WebView toàn màn hình nạp file HTML5 game
│   │   ├── GameFragment.java     # Fragment điều khiển vòng đời game và JavaScript Interface
│   │   └── JavascriptBridge.java # Cầu nối hai chiều: Java <--> JavaScript
│   └── gamelist/                 # Màn hình danh sách game & Launcher
│       └── redesign/
│           ├── GameListActivity.java # Màn hình Home chính (Search, Filter, Grid 2 cột)
│           ├── HomeFragment.java     # Fragment chứa danh sách game và Header Banners
│           └── GameAdapter.java      # Adapter RecyclerView hiển thị các Card game
├── push/                         # Xử lý thông báo đẩy
│   └── firebase/
│       └── FirebaseMessageService.java # Nhận push message, parse payload và hiển thị thông báo
└── storage/                      # Tầng cơ sở dữ liệu cục bộ (Persistence Layer)
    ├── AppDatabase.java          # Room Database Abstract Definition
    ├── AppDatabase_Impl.java     # Room Database Generated Implementation
    ├── dao/                      # Data Access Objects (GamesDao, BannersDao, StatsDao)
    └── entity/                   # Entity classes (GameEntity, BannerEntity, UserStatsEntity)
```

---

## 2. Chức Năng & Nhiệm Vụ Từng Module Cốt Lõi

| Module / Package | Chức Năng Chính | Các Class Quan Trọng | Tương Tác / Quan Hệ |
| :--- | :--- | :--- | :--- |
| **`GameApplication`** | Khởi chạy App, cấu hình Dependency Injection, thiết lập kênh thông báo và quản lý crash. | `GameApplication.java` | Khởi tạo Dagger Hilt Component, AppMetrica, NotificationChannels. |
| **`presentation.gamelist`** | Hiển thị màn hình chính, thanh tìm kiếm, bộ lọc thể loại, danh sách mini-game dạng lưới 2 cột. | `GameListActivity.java`, `HomeFragment.java` | Lấy dữ liệu từ `AppDatabase`, mở `GameActivity` khi người dùng click vào card game. |
| **`presentation.game`** | Khởi tạo WebView, tối ưu hóa phần cứng, nạp game HTML5 từ `assets/`, thiết lập giao tiếp `JavascriptInterface`. | `GameActivity.java`, `GameFragment.java` | Lắng nghe sự kiện từ JS (`submitScore`, `showAd`) để gọi tầng `ads` hoặc lưu vào `storage`. |
| **`ads.offlinegames`** | Cơ chế độc quyền phát quảng cáo khi không có mạng (Offline Video Ads). | `InterstitialDownloadService.java`, `InterstitialActivity.java` | Chạy nền tải video MP4 từ server, lưu vào disk và phát khi người dùng kết thúc màn chơi mà không có Internet. |
| **`billing.presentation`** | Xử lý mua gói IAP Xóa Quảng Cáo vĩnh viễn thông qua Google Play Billing. | `BillingActivity.java`, `ProductDescriptionView.java` | Cập nhật cờ `is_premium = true` vào DataStore/SharedPreferences khi thanh toán thành công để chặn toàn bộ Ads. |
| **`storage`** | Quản lý toàn bộ dữ liệu SQLite nội bộ bằng Room ORM. | `AppDatabase.java`, `AppDatabase_Impl.java` | Cung cấp dữ liệu danh sách game, banner, trạng thái yêu thích và điểm cao nhất cho ViewModel. |
