# BÁO CÁO 03: DANH SÁCH SDK, THƯ VIỆN BÊN NGOÀI & HƯỚNG DẪN THAY THẾ/XÓA
**Dự án:** Offline Games: No WiFi Games (`com.media720.games2020`)  
**Mục tiêu:** Trả lời chi tiết Yêu cầu 5 trong `readme.txt`.

---

## 1. Bảng Tổng Hợp SDKs & Libraries Được Sử Dụng

| STT | Tên SDK / Thư Viện | Phiên Bản | Nhiệm Vụ & Chức Năng | Package / Vị Trí Trong Code | Mức Độ Phụ Thuộc | Khuyến Nghị Thay Thế / Xóa |
| :--- | :--- | :---: | :--- | :--- | :---: | :--- |
| 1 | **Google Mobile Ads (AdMob)** | 23.x | Hiển thị Banner, Interstitial, Rewarded Video chính | `com.google.android.gms.ads.*`<br>`AndroidManifest.xml` (dòng 72) | Cao (Monetization) | Thay bằng AdMob ID riêng của bạn hoặc chuyển sang AppLovin MAX / Unity Ads |
| 2 | **AppLovin MAX SDK** | 12.x | Mediation quảng cáo đa mạng, tối ưu eCPM | `com.applovin.*`<br>`AndroidManifest.xml` (dòng 166-188) | Cao (Monetization) | Thay AppLovin SDK Key trong AndroidManifest |
| 3 | **IronSource LevelPlay** | 8.x | Mạng quảng cáo phụ trợ trong mediation | `com.ironsource.*`<br>`AndroidManifest.xml` (dòng 262-270) | Trung bình | Có thể xóa nếu chỉ dùng AdMob/MAX |
| 4 | **Unity Ads SDK** | 4.x | Mạng quảng cáo video thưởng và chuyển cảnh | `com.unity3d.services.ads.*`<br>`AndroidManifest.xml` (dòng 127-131) | Trung bình | Có thể giữ lại hoặc gỡ bỏ qua Gradle |
| 5 | **Vungle (Liftoff) SDK** | 7.x | Phân phối video ads | `com.vungle.ads.*`<br>`AndroidManifest.xml` (dòng 259-260) | Thấp | Có thể xóa không ảnh hưởng game |
| 6 | **Facebook Audience Network** | 6.x | Quảng cáo từ Meta Audience Network | `com.facebook.ads.*`<br>`AndroidManifest.xml` (dòng 256-257) | Thấp | Có thể xóa |
| 7 | **Yandex AppMetrica** | 5.x | Phân tích hành vi người dùng, crash, retention | `io.appmetrica.analytics.*`<br>`GameApplication.java` (dòng 160) | Trung bình | Thay bằng Firebase Analytics hoặc Mixpanel/PostHog |
| 8 | **Firebase Core & Crashlytics** | BoM 33.x | Báo cáo lỗi sập app, session tracking | `com.google.firebase.*`<br>`AndroidManifest.xml` (dòng 102-126) | Cao (Chất lượng app) | Thay file `google-services.json` của Firebase dự án mới |
| 9 | **Firebase Cloud Messaging (FCM)**| 24.x | Nhận tin nhắn đẩy (Push Notification) | `com.media720.games2020.push.firebase.*` | Trung bình | Thay FCM Sender ID / Server Key |
| 10 | **Google Play Billing Library** | 8.3.0 | Xử lý gói mua trong app (IAP - Remove Ads) | `com.android.billingclient.api.*`<br>`com.media720.games2020.billing.*` | Rất Cao | Tích hợp lại với Billing Client 7.x/8.x trên Google Play Console mới |
| 11 | **Google Play Games Services** | v2 SDK | Đồng bộ điểm số Leaderboard & Thành tựu | `com.google.android.gms.games.*` | Trung bình | Thay `game_services_app_id` trong `strings.xml` |
| 12 | **AndroidX Room (SQLite)** | 2.6.x | ORM quản lý database cục bộ (games, banners) | `com.media720.games2020.storage.*` | Cốt lõi | Giữ nguyên schema hoặc ánh xạ sang Room/Drift (nếu dùng Flutter) |
| 13 | **AndroidX Media3 / ExoPlayer** | 1.3.x | Tải và phát video offline interstitial | `com.media720.games2020.ads.offlinegames.downloader.*` | Trung bình | Có thể giữ để phát offline ad video |
| 14 | **Dagger Hilt** | 2.51.x | Dependency Injection cho toàn bộ app Android | `com.media720.games2020.Hilt_*` | Kiến trúc | Khi viết lại có thể dùng Hilt, Koin hoặc GetX/Provider |
| 15 | **Coil & Picasso** | 2.x | Tải và cache ảnh thumbnail mini-game | `coil.*`, `com.squareup.picasso.*` | UI | Thư viện chuẩn hiển thị ảnh |

---

## 2. Vị Trí Cụ Thể Trong Mã Nguồn Cần Can Thiệp Khi Thay Thế / Xóa Bỏ

### 2.1. Thay thế AdMob & AppLovin SDK
1. **`apktool_out/AndroidManifest.xml`**:
   - Dòng 72: Thay `ca-app-pub-8355210739776763~9896751294` bằng App ID AdMob mới.
   - Dòng 166-186: Thay hoặc cấu hình AppLovin SDK Key.
2. **`decompiled_src/sources/com/media720/games2020/ads/`**:
   - Chứa logic load và show Interstitial / Rewarded Ads.

### 2.2. Thay thế Firebase & AppMetrica
1. **`apktool_out/res/values/strings.xml`**:
   - Thay các key Firebase (`google_app_id`, `gcm_defaultSenderId`, `firebase_database_url`).
   - Dòng chứa `appmetrica_key` (hoặc `GameApplication.java` dòng 160).
2. **`GameApplication.java`**:
   - Xóa bỏ việc khởi tạo AppMetrica nếu không muốn gửi dữ liệu về cụm server Yandex.

### 2.3. Thay thế Google Play In-App Purchase
1. **`com/media720/games2020/billing/presentation/BillingActivity.java`**:
   - Quản lý giao diện Popup mời mua gói `remove_ads`.
   - Cần map đúng Product ID đã tạo trên Google Play Console của bạn (`com.media720.games2020.remove_ads`).
