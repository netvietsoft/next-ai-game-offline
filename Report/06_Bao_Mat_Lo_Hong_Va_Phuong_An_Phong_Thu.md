# BÁO CÁO 06: PHÂN TÍCH BẢO MẬT, LỖ HỔNG & PHƯƠNG ÁN PHÒNG THỦ
**Dự án:** Offline Games: No WiFi Games (`com.media720.games2020`)  
**Mục tiêu:** Trả lời chi tiết Yêu cầu 10 và 12 trong `readme.txt`.

---

## 1. Danh Sách Các Lỗ Hổng Bảo Mật Phát Hiện Từ Bản Decompile (Yêu Cầu 10)

Qua quá trình đảo ngược mã nguồn (Reverse Engineering), chúng tôi phát hiện 5 vấn đề bảo mật nghiêm trọng trong ứng dụng gốc:

### 1.1. Lỗ Hổng 1: Cho Phép Lưu Thông Dữ Liệu Không Mã Hóa (Cleartext Traffic)
- **Vị trí:** `apktool_out/AndroidManifest.xml` (dòng 65): `android:usesCleartextTraffic="true"`.
- **Rủi ro:** Cho phép ứng dụng gửi/nhận HTTP không có mã hóa SSL/TLS. Kẻ tấn công trên cùng mạng Wi-Fi công cộng có thể thực hiện tấn công Man-In-The-Middle (MitM) để đánh cắp dữ liệu hoặc thay đổi file tải về từ `http://appwill.top/...`.
- **Phương án chặn:** Đổi thành `android:usesCleartextTraffic="false"` và cấu hình `network_security_config.xml` chỉ cho phép HTTPS.

### 1.2. Lỗ Hổng 2: Rủi Ro Bảo Mật Trong Android WebView Bridge
- **Vị trí:** `com.media720.games2020.presentation.game.GameActivity`.
- **Rủi ro:** Ứng dụng bật `setJavaScriptEnabled(true)` và gắn `@JavascriptInterface` mà không có cơ chế xác thực nguồn gốc domain (`Origin Validation`). Nếu WebView tải một URL độc hại từ bên ngoài, JavaScript độc hại có thể gọi các hàm Native của ứng dụng.
- **Phương án chặn:** Chỉ nạp các tệp cục bộ có tiền tố `file:///android_asset/` hoặc sử dụng `androidx.webkit.WebViewAssetLoader` an toàn.

### 1.3. Lỗ Hổng 3: Cơ Chế Xác Thực IAP Client-Side Dễ Bị Bẻ Khóa
- **Vị trí:** `com.media720.games2020.billing.presentation.BillingActivity`.
- **Rủi ro:** Trạng thái mua hàng ("Remove Ads") chỉ được kiểm tra cục bộ và lưu trữ trong SharedPreferences mà không có Server-side Receipt Validation qua Google Play Developer API. Các công cụ patch app (như Lucky Patcher) hoặc can thiệp bộ nhớ (GameGuardian/Frida) có thể dễ dàng bypass để mở khóa tính năng Premium miễn phí.
- **Phương án chặn:** Sử dụng giải pháp xác thực biên lai trên Server (Backend Server hoặc Firebase Cloud Functions xác thực với Google Play API).

### 1.4. Lỗ Hổng 4: Cơ Sở Dữ Liệu SQLite Không Được Mã Hóa
- **Vị trí:** `/data/data/com.media720.games2020/databases/games_offline_database.db`.
- **Rủi ro:** File database Room SQLite lưu trữ ở dạng plain-text. Trên các máy đã Root, người dùng có thể đọc hoặc chỉnh sửa trực tiếp điểm số cao kỷ lục, danh sách game và cấu hình hiển thị ads.
- **Phương án chặn:** Sử dụng **SQLCipher** (`net.zetetic:android-database-sqlcipher`) để mã hóa toàn bộ cơ sở dữ liệu SQLite.

### 1.5. Lỗ Hổng 5: Tải File Chạy Nền Không Xác Thực Hash / Signature
- **Vị trí:** `InterstitialDownloadService.java`.
- **Rủi ro:** Dịch vụ tải video / resource quảng cáo chạy nền không kiểm tra chữ ký số SHA-256 của file tải về trước khi lưu vào bộ nhớ trong.
- **Phương án chặn:** Thêm trường `checksum_sha256` vào bảng `offline_games_interstitial` và kiểm tra hash trước khi lưu file.

---

## 2. Bảng Thống Kê Các Key & Mức Độ Nhạy Cảm Tìm Thấy (Yêu Cầu 12)

| STT | Tên Key / Định Danh | Giá Trị Tìm Thấy | Vị Trí Trong File | Mức Độ Nhạy Cảm | Đánh Giá Tác Động Khi Bị Lộ |
| :--- | :--- | :--- | :--- | :---: | :--- |
| 1 | **AdMob App ID** | `ca-app-pub-8355210739776763~9896751294` | `AndroidManifest.xml:72` | **Thấp (Public)** | Định danh phân phối quảng cáo, kẻ gian chỉ có thể gửi traffic rác. |
| 2 | **Yandex AppMetrica Key** | `R.string.appmetrica_key` (ID: 2131951753) | `GameApplication.java:160` | **Trung Bình** | Cho phép gửi sự kiện giả lập lên bảng thống kê của nhà phát hành. |
| 3 | **Google Play Games App ID** | `@string/game_services_app_id` | `AndroidManifest.xml:86` | **Thấp (Public)** | ID dịch vụ trò chơi Google Play để liên kết bảng thành tựu. |
| 4 | **Tracer Mapping UUID** | `4e090e30-aff5-11f0-9f27-3e3c84784f26` | `res/values/strings.xml:837` | **Thấp** | Định danh giải mã lỗi obfuscation của hệ thống crash log. |
| 5 | **Play Billing Version** | `8.3.0` | `AndroidManifest.xml:152` | **Thông tin** | Phiên bản thư viện thanh toán. |
| 6 | **Firebase Sender / App ID** | `@string/notification_channel_id` | `AndroidManifest.xml:95` | **Thấp - Trung Bình**| Dùng để nhận diện thiết bị nhận Push Notification. |

---

## 3. Khuyến Nghị Phòng Thủ Toàn Diện Cho Sản Phẩm Mới

1. **Obfuscation & Integrity Protection:** Bật ProGuard/R8 với quy tắc nâng cao, kèm Google Play App Integrity API để chống dịch ngược và chỉnh sửa APK trái phép.
2. **Hardening WebView:** Tắt quyền truy cập file hệ thống ngoài sandbox: `setAllowFileAccess(false)`, `setAllowContentAccess(false)`.
3. **Encrypted Storage:** Sử dụng `EncryptedSharedPreferences` (Jetpack Security) và `SQLCipher` để bảo vệ điểm số, cấu hình người dùng.
