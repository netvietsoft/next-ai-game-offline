# BÁO CÁO 09: CHIẾN LƯỢC PAYMENT WALL, GÓI IAP & BẢN ĐỒ QUẢNG CÁO (MONETIZATION)
**Dự án:** Offline Games: No WiFi Games (`com.media720.games2020`)  
**Mục tiêu:** Trả lời chi tiết Yêu cầu 14 trong `readme.txt`.

---

## 1. Kịch Bản Payment Wall & Gói Mua In-App Purchase (IAP)

Ứng dụng áp dụng mô hình **Freemium + Ad-Supported** kết hợp bán gói In-App Purchase vĩnh viễn (Non-Consumable Purchase):

### 1.1. Cấu Trúc Gói Mua (In-App Product)
- **SKU Gốc:** `com.media720.games2020.remove_ads` (hoặc `remove_ads_permanent`).
- **Hình thức:** Mua 1 lần sở hữu vĩnh viễn (One-time Non-Consumable Purchase).
- **Mức giá đề xuất:** $1.99 - $3.99 (hoặc 49.000 VNĐ - 79.000 VNĐ).
- **Quyền lợi mở khóa:**
  1. Loại bỏ 100% Banner Ads ở đáy màn hình chính và màn hình chơi game.
  2. Loại bỏ toàn bộ Interstitial Ads (Quảng cáo xen kẽ chuyển cảnh).
  3. Loại bỏ Offline Video Interstitials.
  4. Vẫn cho phép người dùng tự nguyện xem Rewarded Video nếu muốn nhận thêm lượt chơi/gợi ý giải đố.

### 1.2. Kịch Bản Kích Hoạt Payment Wall (Trigger Points)
Payment Wall (`BillingActivity`) được bật lên tự động trong 3 thời điểm vàng có tỷ lệ chuyển đổi cao nhất:
1. **Nút "Remove Ads" trên Header:** Người dùng chủ động bấm vào icon vương miện / biểu tượng cấm quảng cáo ở góc trên cùng.
2. **Sau khi xem 3 quảng cáo Interstitial liên tiếp:** Hệ thống hiện một Bottom Sheet / Dialog đề xuất: *"Mệt mỏi vì quảng cáo? Loại bỏ vĩnh viễn chỉ với $1.99!"*.
3. **Khi bấm vào Menu Cài Đặt (Settings Dialog):** Mục đầu tiên luôn là *"Xóa quảng cáo"*.

---

## 2. Bản Đồ Quảng Cáo Toàn Diện (Ads Placement Mapping)

Ứng dụng thiết kế hệ thống hiển thị quảng cáo thông minh dựa trên các tham số cấu hình trong database:

| Loại Quảng Cáo | Vị Trí Xuất Hiện Trong App | Điều Kiện & Tần Suất Kích Hoạt | Tham Số Cấu Hình Trong DB |
| :--- | :--- | :--- | :--- |
| **Banner Ad** | Đáy màn hình Home (`GameListActivity`) và Đáy màn hình chơi game (`GameActivity`). | Luôn hiển thị khi có mạng và chưa mua gói Remove Ads. | Tự động làm mới mỗi 30 - 45 giây. |
| **Interstitial Ad (Online)** | Khi thoát game ra Home, hoặc khi kết thúc màn chơi (`Game Over / Victory`). | Chỉ xuất hiện khi: Thời gian chơi game >= `minimum_time_played_in_game_sec` (30s) VÀ Số màn chơi >= `each_n_levels` (3) HOẶC Đạt điểm >= `each_n_scores`. | `each_n_seconds: 180`<br>`each_n_levels: 3`<br>`gameFinishedAd: 1` |
| **Offline Video Ad** | Khi kết thúc màn chơi trong trạng thái Không có kết nối mạng (Airplane mode / No WiFi). | Video MP4 đã tải trước vào bộ nhớ máy, phát tối đa 5 lần/ngày để quảng cáo app khác. | `showDailyLimit: 5`<br>`offline_games_interstitial` |
| **Rewarded Video Ad** | Trong các game giải đố khó (Water Sort, Nuts & Bolts, Chess Undo). | Người dùng bấm nút "Nhận thêm ống nghiệm / Thêm nước đi / Hồi sinh". | `has_rewarded_video: 1` |
| **Cross-Promo App Banner** | Dạng Card nổi bật xen kẽ trong danh sách game ở màn hình Home. | Mở app 2 lần trở lên (`minTimesToOpenMenuBeforeShow`). | `google_play_app_banners` |

---

## 3. Danh Sách Tệp Đặt Key Quảng Cáo & Vị Trí Cấu Hình

| Tên Key | Mục Đích | Tệp Cấu Hình Trong Dự Án | Dòng Mã / Ghi Chú |
| :--- | :--- | :--- | :--- |
| **AdMob App ID** | Định danh ứng dụng với Google AdMob | `apktool_out/AndroidManifest.xml` | `line 72`: `ca-app-pub-8355210739776763~9896751294` |
| **AdMob Banner Unit ID** | ID vị trí quảng cáo Banner | `decompiled_src/sources/com/media720/games2020/ads/` | Hardcode hoặc nạp từ `RemoteConfig` |
| **AdMob Interstitial Unit ID** | ID vị trí quảng cáo Xen kẽ | `decompiled_src/sources/com/media720/games2020/ads/` | Tích hợp trong Ad Manager Class |
| **AdMob Rewarded Unit ID** | ID vị trí quảng cáo Video Thưởng | `decompiled_src/sources/com/media720/games2020/ads/` | Gọi khi JS kích hoạt `showRewardedAd` |
| **AppLovin SDK Key** | Khởi tạo mạng mediation AppLovin MAX | `apktool_out/AndroidManifest.xml` | `line 166-188`: `applovininitprovider` |
| **IronSource App Key** | Khởi tạo LevelPlay Mediation | `apktool_out/AndroidManifest.xml` | `line 262-270`: `IronsourceLifecycleProvider` |
| **Unity Ads Game ID** | Phân phối quảng cáo Unity | `apktool_out/AndroidManifest.xml` | `line 127-131`: `AdsSdkInitializer` |
| **Yandex AppMetrica Key** | Đo lường hiệu quả quảng cáo và traffic | `apktool_out/res/values/strings.xml` | String key `appmetrica_key` |
