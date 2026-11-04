# Tasksrequiring.md - DANH MỤC TÀI NGUYÊN & KEYS USER CẦN BỔ SUNG
**Dự án:** NextAI Game Offline (`com.nextai.gameoffline`)  
**Mục đích:** Liệt kê toàn bộ các cấu hình, khóa API, tài khoản thanh toán và dịch vụ bên ngoài cần User cập nhật để đưa ứng dụng lên môi trường Production. Các giá trị hiện tại trong mã nguồn đang được gán tạm bằng giá trị Demo / Sandbox.

---

## 📋 BẢNG THỐNG KÊ CÁC KEY & TÀI KHOẢN CẦN CUNG CẤP

| STT | Tên Tài Nguyên / Key | Dịch Vụ Cung Cấp | Vị Trí Cấu Hình Trong Dự Án | Giá Trị Chính Thức (Production) | Trạng Thái |
| :---: | :--- | :--- | :--- | :--- | :---: |
| 1 | **Google AdMob App ID** | Google AdMob Console | `Android/src/main/AndroidManifest.xml` (meta-data `com.google.android.gms.ads.APPLICATION_ID`) | `ca-app-pub-4108090245719282~4299594158` |  Đã cấu hình |
| 2 | **AdMob Banner Unit ID** | Google AdMob Console | `Android/src/main/java/com/nextai/gameoffline/ads/AdConstants.kt` | `ca-app-pub-4108090245719282/4579664323` |  Đã cấu hình |
| 3 | **AdMob Interstitial Unit ID** | Google AdMob Console | `Android/src/main/java/com/nextai/gameoffline/ads/AdConstants.kt` | `ca-app-pub-4108090245719282/3500572281` |  Đã cấu hình |
| 4 | **AdMob Rewarded Unit ID** | Google AdMob Console | `Android/src/main/java/com/nextai/gameoffline/ads/AdConstants.kt` | `ca-app-pub-4108090245719282/7458098782` |  Đã cấu hình |
| 4b| **AdMob Rewarded Interstitial** | Google AdMob Console | `Android/src/main/java/com/nextai/gameoffline/ads/AdConstants.kt` | `ca-app-pub-4108090245719282/5743592246` |  Đã cấu hình |
| 4c| **AdMob Native Unit ID** | Google AdMob Console | `Android/src/main/java/com/nextai/gameoffline/ads/AdConstants.kt` | `ca-app-pub-4108090245719282/8178183893` |  Đã cấu hình |
| 4d| **AdMob App Open Unit ID**| Google AdMob Console | `Android/src/main/java/com/nextai/gameoffline/ads/AdConstants.kt` | `ca-app-pub-4108090245719282/3518853778` |  Đã cấu hình |
| 5 | **AppLovin MAX SDK Key** | AppLovin Dashboard | `Android/src/main/AndroidManifest.xml` | Đã gỡ bỏ (Chuyển sang 100% AdMob + Firebase) |  Không cần |
| 6 | **Firebase google-services.json**| Firebase Console | `Android/google-services.json` | Project: `nextai-game-offline`, App ID: `1:593740416942:android:47f8f54c95c4c9b277ea3f` |  Đã cấu hình |
| 7 | **Google Play Console License Key** | Google Play Developer Console | `Android/src/main/java/com/nextai/gameoffline/billing/BillingConstants.kt` | `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...` (Public Key) | ⏳ Cần thay thế |
| 8 | **IAP Product SKU** | Google Play Developer Console | `Android/src/main/java/com/nextai/gameoffline/billing/BillingConstants.kt` | `com.nextai.gameoffline.remove_ads` ($1.99 - $2.99) |  Đã cấu hình |
| 9 | **Google Play Games App ID** | Google Play Games Services | `Android/src/main/res/values/strings.xml` (`game_services_app_id`) | `123456789012` | ⏳ Tùy chọn |
| 10 | **Cloudflare R2 Storage Keys** | Cloudflare Dashboard | `Backend/.env` (`CLOUDFLARE_R2_ACCOUNT_ID`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`) | `demo_account_id`, `demo_access_key` | ⏳ Cần thay thế |
| 11 | **Admin JWT Secret Key** | Tự sinh (Self-generated) | `Backend/.env` (`JWT_SECRET`) | `nextai_super_secret_jwt_key_2026` |  Đã có |
| 12 | **Keystore Ký Release APK (AAB)**| Android Studio Keytool | `Android/keystore/nextai_release.jks` | Đã tạo `nextai_release.jks` (Alias: `nextai_game`, lưu tại `Release_APK/KEYSTORE_INFO.txt`) |  Đã tạo |

---

## 📌 HƯỚNG DẪN XỬ LÝ CHO NGƯỜI DÙNG:
1. Bạn có thể tiếp tục chạy thử nghiệm và kiểm thử mã nguồn trên máy thật hoặc máy ảo với toàn bộ **Test Key / Sandbox** đã được thiết lập sẵn.
2. Khi chuẩn bị phát hành chính thức lên Google Play, hãy tạo các tài khoản nêu trên và điền các giá trị thực tế vào các vị trí tệp tương ứng.
