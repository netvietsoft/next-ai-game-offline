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
| 10 | **Cloudflare R2 Storage Keys + Bucket** | Cloudflare Dashboard | Ignored `.ai/r2.local.json`, bucket `comnextaigameoffline`; upload script đọc local credentials, không nhúng vào app | Đã cung cấp và S3 kiểm tra thành công | ✅ Đã cấu hình; tiến độ TASK-054 |
| 11 | **Admin JWT Secret Key** | Tự sinh (Self-generated) | `Backend/.env` (`JWT_SECRET`) | `nextai_super_secret_jwt_key_2026` |  Đã có |
| 12 | **Keystore Ký Release APK (AAB)**| Android Studio / CI secrets | Bản local ignored: `Android/keystore.local/nextai_release.jks`; Gradle đọc `NEXTAI_RELEASE_*` hoặc ignored `keystore.properties` | Đã backup local, không còn plaintext trong source | ⚠️ Dùng tạm tới khi rotate |
| 13 | **Cloudflare R2 Public Custom Domain** | Cloudflare DNS/R2 | Thử nghiệm dùng `https://pub-087272be70054d98a65246778849e2d0.r2.dev/games/{name}.zip` đã cập nhật policy/catalog Android | r2.dev đã hoạt động; chưa có domain riêng | ⏳ Domain riêng cần cho production; trial đã có |
| 14 | **Meta Audience Network Console** | Meta Business + AdMob | Tạo Property/Payment/Placement IDs; map Meta Bidding vào Banner/Interstitial/Rewarded mediation groups | Chưa cấu hình | ⏳ Bắt buộc để Meta có fill |
| 15 | **Ads Consent & app-ads.txt** | AdMob Privacy & Messaging / Website | Thêm Meta vào GDPR/US-state partner lists, publish UMP message và `app-ads.txt` | SDK UMP đã có, console/web chưa có | ⏳ Bắt buộc trước production |
| 16 | **Firebase Crashlytics First Report** | Firebase Console + Internal Test device | Gửi một test crash/non-fatal từ bản Internal Testing rồi xác nhận dashboard | Mapping release đã upload | ⏳ Cần device QA |
| 17 | **Firebase Notification Custom Dimensions** | Firebase Analytics Console | Đăng ký `notification_id`, `scheduled_hour`, `notification_slot`, `delivery_status` để lập báo cáo open rate theo giờ | Event code đã có | ⏳ Cần cấu hình dashboard |
| 18 | **Google Play Purchase Verification Backend** | Google Play Developer API | Service account + API endpoint port 6033 xác minh purchase token trước khi cấp entitlement lâu dài | Client hiện kiểm PURCHASED + acknowledge; server chưa có | ⏳ Production security gate |
| 19 | **Rotate Play Upload Key** | Google Play Console | Keystore/password cũ từng được commit/push; bản local đã chuyển sang `Android/keystore.local/` và Gradle dùng env | Chưa rotate | ⏳ Khuyến nghị bảo mật bắt buộc |
| 20 | **Online Privacy Policy & Play Data Safety** | Website + Play Console | Đồng bộ Firebase Analytics/Crashlytics/AdMob/Meta/notification disclosures với policy trong app | Policy offline đã sửa | ⏳ Bắt buộc trước rollout |
| 21 | **Meta/Ads/Notification Device QA** | Samsung A07/A50 hoặc Internal Testing | Ad Inspector single-source Meta, UMP geography test, notification permission/reboot/click, Crashlytics report | Không có thiết bị ADB kết nối trong phiên này | ⏳ Cần kiểm thử trực tiếp |
| 22 | **Backend 6033 Hardening** | Backend deployment | Bỏ JWT fallback/default admin, giới hạn CORS/rate/upload, triển khai R2 thật | Backend hiện chưa an toàn để public | ⏳ Bắt buộc trước khi public server |
| 23 | **GA4 Service Account Key & Property Access** | Google Cloud Console (`nextai-game-offline`) + Google Analytics 4 Admin | `GA4/credentials/service-account.json` & `GA4/.env` (`GA4_PROPERTY_ID=561301538`, Account `413928908`, Stream `16225665654`) | Đã kết nối, đã đăng ký 23/23 Custom Dimensions + 4/4 Custom Metrics và kéo dữ liệu thật | ✅ Đã cấu hình |
| 24 | **Xác nhận SKU VIP và thử mua** | Google Play Console / Internal Testing | Đối chiếu sản phẩm đang active với `com.nextai.game.offline.remove_ads` và SKU cũ `com.nextai.gameoffline.remove_ads`; thử mua, pending và restore bằng tài khoản kiểm thử | Chưa xác nhận SKU thực tế | ⏳ Cần Console và thiết bị |
| 25 | **Xác nhận Designed for Families** | Google Play Console / AdMob | Kiểm tra phân loại đối tượng và tham gia Designed for Families trước khi phát hành App Open; format này không được hỗ trợ trong chương trình đó | Chưa xác nhận trạng thái chương trình | ⏳ Cần kiểm tra trước rollout |
| 26 | **Facebook Client Token và quyền Dashboard** | Meta App Dashboard | App2333393207502258; điền `clientToken` trong ignored `.ai/facebook.local.json`, Settings → Advanced → Security. Cần hồ sơ browser có quyền quản trị để điền Android package/activity/hash | Fb.zip chỉ có App Secret/referrer key, không thay Client Token; chưa truy cập dashboard | ⏳ Thiếu Client Token và phiên quản trị |
| 27 | **Play subscriptions Internal Testing** | Google Play Console | game_premium/weekly/weekly-premium3day; game_premium_monthly/monthly/monthly-premium5day; game_premium_yearly/yearly/yearly-premium14day. Console ACTIVE174regions; kiểm purchase/renewal/expiry/eligibletrial/restore bằng bản cài Play | API quyền sảnphẩm đã cấp; cấu hình Console xác minh | ⏳ Cần tester và phát hành bản Internal Test; serververification/RTDN vẫn thiếu |

---

## 📌 HƯỚNG DẪN XỬ LÝ CHO NGƯỜI DÙNG:
1. Bạn có thể tiếp tục chạy thử nghiệm và kiểm thử mã nguồn trên máy thật hoặc máy ảo với toàn bộ **Test Key / Sandbox** đã được thiết lập sẵn.
2. Khi chuẩn bị phát hành chính thức lên Google Play, hãy tạo các tài khoản nêu trên và điền các giá trị thực tế vào các vị trí tệp tương ứng.
