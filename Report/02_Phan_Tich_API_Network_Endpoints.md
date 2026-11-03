# BÁO CÁO 02: PHÂN TÍCH API, NETWORK ENDPOINTS & CLIENT-SERVER COMMUNICATION
**Dự án:** Offline Games: No WiFi Games (`com.media720.games2020`)  
**Mục tiêu:** Trả lời chi tiết Yêu cầu 3 và 4 trong `readme.txt`.

---

## 1. Bản Chất Kiến Trúc Kết Nối Của Ứng Dụng (Yêu Cầu 3 & 4)

Ứng dụng **"Offline Games"** hoạt động theo tôn chỉ **"100% Offline-First Architecture"**. Tuy nhiên, khi thiết bị có kết nối mạng (Wi-Fi/4G), ứng dụng sử dụng các kênh kết nối bên ngoài phục vụ 3 mục đích chính:
1. **Phân phối quảng cáo & Mediation** (Google AdMob, AppLovin MAX, IronSource LevelPlay, Unity Ads, Vungle, InMobi, MyTarget).
2. **Theo dõi Analytics & Crash Reporting** (Firebase Crashlytics, Google Analytics for Firebase, Yandex AppMetrica).
3. **Đồng bộ Dynamic Bundle & Cross-Promotion** (Tải video quảng cáo offline `offline_games_interstitial` và kiểm tra phiên bản game mới qua CDN).

---

## 2. Bảng Danh Sách Endpoint API & Model Dữ Liệu Chi Tiết (Yêu Cầu 3)

| STT | Endpoint / URL Pattern | Phương Thức | Nhiệm Vụ & Chức Năng | Có Thể Tái Sử Dụng Ngay? | Model Dữ Liệu Input / Output |
| :--- | :--- | :---: | :--- | :---: | :--- |
| 1 | `https://appwill.top/games720/privacy_policy.html` | `GET` | Hiển thị chính sách bảo mật cho người dùng trong app và link Google Play | **Có** (Chỉ cần thay domain) | `HTML Document` |
| 2 | `http://appwill.top/games720/terms.html` | `GET` | Hiển thị điều khoản sử dụng (Terms of Service) | **Có** (Chỉ cần thay domain) | `HTML Document` |
| 3 | `https://*.applovin.com/fetch_ad` / `init` | `POST / GET` | Khởi tạo SDK và request quảng cáo trung gian từ AppLovin MAX Mediation | **Có** (Thay AppLovin SDK Key) | Input: Device ID, GAID, SDK Version<br>Output: `AdBidResponse (JSON)` |
| 4 | `https://pagead2.googlesyndication.com/pagead/mads/gma` | `POST` | Request banner, interstitial, rewarded video từ Google AdMob | **Có** (Thay Ad Unit ID) | Input: Encrypted AdRequest<br>Output: `VAST / HTML Ad Payload` |
| 5 | `https://*.ironsrc.mobi/sdk/` | `POST / GET` | Tải kịch bản waterfall và bid quảng cáo IronSource LevelPlay | **Có** (Thay IronSource AppKey) | Input: SessionToken, AppKey<br>Output: `JSON Controller Config` |
| 6 | `https://startup.mobile.yandex.net/api/v1/startup` | `POST` | Khởi tạo cấu hình và phân tích sự kiện người dùng qua Yandex AppMetrica | **Có** (Thay AppMetrica API Key) | Input: `AppMetricaStartupParams`<br>Output: `StartupResponse (JSON)` |
| 7 | `https://fcm.googleapis.com/v1/projects/.../messages:send` | `POST` | Nhận Push Notification từ Firebase Cloud Messaging | **Có** (Cần setup Firebase Console riêng) | Input: `FCM Payload (title, body, data)`<br>Output: `200 OK` |
| 8 | `https://firebaseremoteconfig.googleapis.com/...` | `GET / POST` | Đồng bộ cấu hình A/B testing & thời gian xuất hiện Ads (`each_n_seconds`) | **Có** (Tự dựng Firebase hoặc CMS) | Input: `ProjectID, AppInstanceId`<br>Output: `RemoteConfig Map (JSON)` |
| 9 | `CDN / Remote Bundle Storage URL` (`remote_url`) | `GET` | Tải gói game mở rộng hoặc video quảng cáo ngoại tuyến vào bộ nhớ cục bộ | **Tự dựng** (S3/Cloudflare R2) | Input: `Range Header`<br>Output: `Binary / MP4 Video File` |

---

## 3. Bảng Tổng Hợp Domain, IP & Cổng Bên Ngoài Client Kết Nối (Yêu Cầu 4)

| Domain / Hostname | Nhà Cung Cấp / Dịch Vụ | IP Range / Cụm Máy Chủ | Cổng (Port) | Mục Đích Kết Nối |
| :--- | :--- | :--- | :---: | :--- |
| `appwill.top` | Nhà phát hành JindoBlu / Media720 | Cloudflare Anycast CDN | 80 (HTTP), 443 (HTTPS) | Host chính sách, điều khoản và tài nguyên động |
| `*.googlesyndication.com` | Google Inc. | Google Global IPs | 443 (HTTPS) | Tải quảng cáo AdMob |
| `*.applovin.com`, `*.applvn.com` | AppLovin Corp | AWS / Fastly Anycast | 443 (HTTPS) | Mediation SDK & Waterfall Config |
| `*.ironsrc.mobi`, `*.supersonicads.com` | Unity Technologies / IronSource | Cloudflare / AWS | 443 (HTTPS) | LevelPlay Ads SDK Mediation |
| `*.unityads.unity3d.com` | Unity Technologies | AWS CloudFront | 443 (HTTPS) | Video Ads Provider |
| `*.vungle.com`, `*.liftoff.io` | Liftoff Mobile | AWS US-East | 443 (HTTPS) | Vungle SDK Ads Delivery |
| `*.appmetrica.yandex.net` | Yandex LLC | Yandex Anycast Cloud | 443 (HTTPS) | Thu thập Session, Event Analytics |
| `*.crashlytics.com`, `*.firebaseio.com` | Google Firebase | Google Global IPs | 443 (HTTPS) | Báo cáo lỗi ANR, Crash và lưu trữ cấu hình |
| `play.googleapis.com` | Google Play Games Services | Google Global IPs | 443 (HTTPS) | Đồng bộ Leaderboard & Achievements |

---

## 4. Đánh Giá Khả Năng Vận Hành Độc Lập Khi Không Có Server Riêng

- **Điểm mạnh xuất sắc:** App không phụ thuộc vào một server backend runtime chuyên biệt để render game hay xử lý logic. 
- **Khi offline hoàn toàn:** 100% 423 mini-game chạy cục bộ qua WebView, SQLite lưu trữ điểm số, Media3 ExoPlayer phát video quảng cáo offline trong `assets/iads/`.
- **Khuyến nghị tái dựng:** Đối với bản làm lại, chỉ cần tạo 1 Backend CMS đơn giản (Node.js/FastAPI + PostgreSQL/Supabase) để quản lý danh sách game, Remote Config, và nhận receipt IAP. Không cần hạ tầng server đắt tiền.
