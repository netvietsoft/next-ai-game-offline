# Firebase Analytics và Crashlytics — kiểm kê theo mã Android

Kiểm kê mã nguồn ngày 2026-11-17. Đây là các sự kiện được ứng dụng định nghĩa và các điểm gọi trong mã, không phải bằng chứng mọi sự kiện đã xuất hiện trong GA4 production. Bản QA trên thiết bị được cấu hình riêng để không ghi Analytics production.

## Analytics: sự kiện do ứng dụng ghi

| Nhóm | Tên sự kiện | Nội dung chính |
| --- | --- | --- |
| Game | `game_open` | Tên, tiêu đề, thể loại game; số lần mở, level cao nhất, tổng thời gian chơi, timestamp. |
| Game | `game_play_time` | Game, thời lượng phiên (giây/phút), tổng thời gian và level. |
| Game | `game_level_start`, `game_level_complete`, `game_level_failed`, `game_level_reached`, `game_level_restart` | Game, level; tùy sự kiện có điểm, lý do, level cao nhất và timestamp. Chỉ phát khi game gọi phương thức bridge tương ứng. |
| Game | `game_score_submitted` | Game, điểm và cờ high score được truyền qua bridge. |
| Tải game | `game_download` | Game, trạng thái started/completed/failed, size_mb; lỗi có tên lớp exception. |
| Ads | `ad_request`, `ad_loaded`, `ad_failed_to_load`, `ad_failed_to_show` | Loại và ID ad unit; thời gian tải hoặc mã/mô tả lỗi tùy sự kiện. |
| Ads | `ad_impression`, `ad_clicked`, `ad_dismissed`, `ad_reward_earned` | Loại/unit, màn hình hoặc game khi được cung cấp; rewarded có loại và số lượng thưởng. |
| Ads mediation | `ad_mediation_loaded`, `ad_mediation_failed`, `ad_load_suppressed` | Loại quảng cáo; network/adapter/thời gian nạp, mã/domain lỗi, tóm tắt waterfall hoặc lý do chặn tùy sự kiện. |
| VIP | `inapp_paywall_viewed`, `inapp_purchase_initiated`, `inapp_purchase_success`, `inapp_purchase_failed`, `inapp_purchase_canceled` | Nguồn mở paywall; mã sản phẩm, giá hiển thị, response code và debug message tùy sự kiện. |
| VIP | `inapp_restore_initiated`, `inapp_restore_success`, `inapp_restore_none_found` | Bắt đầu khôi phục, khôi phục thành công (có product_id), hoặc không tìm thấy. |
| Notification | `notification_scheduled`, `notification_delivery`, `notification_opened`, `notification_permission` | ID, slot, giờ/phút lịch, múi giờ; lý do lập lịch, trạng thái/độ trễ giao, số lượt mở hoặc trạng thái quyền tùy sự kiện. Có user property `notification_cohort_hour`. |

`game_start` có định nghĩa trong `GameAnalyticsManager.kt` nhưng hiện chưa có nơi gọi. Phải kiểm tra từng game có gọi bridge thì mới biết phạm vi level/score thực tế, không mặc định mọi game đều gửi. Các tham số tùy chỉnh cần được cấu hình phù hợp trong GA4 để báo cáo; dữ liệu cũ thiếu tham số không được tự bổ sung hồi tố. Analytics SDK cũng có thể thu thập các sự kiện tự động theo cấu hình và điều kiện runtime; danh sách đó không đồng nghĩa các sự kiện tự viết ở trên.

## Sự kiện riêng theo định dạng quảng cáo

Mỗi cột là một tên event GA4 cố định; `game_name` là tham số của `game_open` và các event `game_level_*`, không tạo tên event khác nhau cho từng game. `level` số và `level_label` (ví dụ `level_5`) chỉ có khi game gửi sự kiện level qua bridge; GA4 dùng `level_label` làm custom dimension vì integer event parameters của app không được parse cho event-scoped custom dimensions.

| Định dạng | Gửi request | Tải thành công | Tải lỗi | Đã hiển thị | Click |
| --- | --- | --- | --- | --- | --- |
| Banner | `banner_load` | `banner_loaded` | `banner_load_fail` | `banner_showed` | `banner_click` |
| Interstitial | `interstitial_load` | `interstitial_loaded` | `interstitial_load_fail` | `interstitial_showed` | `interstitial_click` |
| App Open | `app_open_load` | `app_open_loaded` | `app_open_load_fail` | `app_open_showed` | `app_open_click` |
| Rewarded | `reward_load` | `reward_loaded` | `reward_load_fail` | `reward_showed` | `reward_click` |

Các event kèm `ad_type`, `ad_unit_id`; lỗi có `error_code` và `error_message`, tải thành công có `load_duration_ms`. `game_name` có khi ngữ cảnh hiện/click có game. `showed` của banner đến từ impression callback; fullscreen đến từ `onAdShowedFullScreenContent`. `*_load` chỉ đếm request do app khởi tạo; SDK refresh banner có thể tạo thêm loaded/impression mà không có callback request tương ứng. Không cộng các event riêng vào event tổng để tính lại cùng hành động. Tên `ad_impression` hiện có có thể trùng sự kiện SDK tự thu thập khi liên kết AdMob; không mặc định dùng tổng đó làm số impression riêng của app.

## Notification schedule update (TASK-055)

- Local device schedule: 08:00, 12:00, 20:00; the supplied 365-day script supplies exactly 1,095 English messages. Day is a rotation index starting when this schedule is enabled, not the example calendar date in the file.
- `notifycation_time_8h`, `notifycation_time_12h`, `notifycation_time_20h` preserve the requested spelling. They fire only after a successful NotificationManager post. They do not prove that a user saw/read the notification. Denied permission, duplicate, expired or failed deliveries do not fire these aliases.
- `notification_scheduled` records scheduling; `notification_delivery` includes status; `notification_opened` records a tap opening the selected installed game. Do not add aliases to `notification_delivery` when counting posts.
- Parameters include `notification_id`, `game_name`, `scheduled_hour_label` (`hour_08`, `hour_12`, `hour_20`), `content_day_label` (`day_001`…`day_365`), `notification_phase` (`scheduled`, `posted`, `suppressed`, `opened`), timezone and delivery delay. The three new alphanumeric dimensions were registered in GA4 Property561301538.
- Inexact Android alarms can be delayed by the OS. Occurrences more than two hours late are skipped; the app respects notification permission, app and channel settings. The upgrade cancels all five legacy alarm slots and re-arms the three requested times.
- This is local scheduling in an updated app, not an FCM campaign sent to already-installed old versions. No production user notifications were sent by the development tools. Device QA is isolated from production analytics.

## Crashlytics (unchanged)

- Khởi tạo ở `GameApplication`: thu thập được bật cho bản không debuggable (release) và tắt ở bản debug.
- Custom keys: `build_environment`, `android_api`, `app_package`, `last_non_fatal_component`; SDK thu nhận crash theo cấu hình và những exception được ghi rõ dưới đây.
- Non-fatal hiện được ghi tại: `daily_notification_delivery`, `daily_notification_reschedule` trong `DailyNotificationReceiver`; `notification_open` trong `NotificationClickTracker`.
- Hàm `recordNonFatal` truyền trực tiếp exception vào `recordException`: nội dung exception/stack trace có thể bao gồm thông tin do nguồn lỗi tạo ra, nên không được mặc định rằng message đã được loại bỏ.
- Trạng thái dashboard thực tế và mapping release cần được xác nhận bằng thiết bị/bản thử nghiệm. Không suy ra báo cáo crash đã đến Firebase chỉ từ cấu hình SDK.

Nguồn mã: `analytics/GameAnalyticsManager.kt`, `ads/AdMediationAnalytics.kt`, `notifications/NotificationAnalyticsTracker.kt`, `crash/CrashReportingManager.kt`, và các điểm gọi trong `presentation/game`, `billing`, `ads`, `notifications`.
