# Bộ Công Cụ Kết Nối & Phân Tích GA4 — Game Gate Offline

Thư mục `GA4/` chứa công cụ Python độc lập kết nối tới **Google Analytics 4 Admin API & Data API (v1beta)** cho dự án Android `com.nextai.game.offline` (Firebase Project: `nextai-game-offline`).

---

## Cấu trúc thư mục

```text
GA4/
├── HUONG_DAN_LAY_KEY_GA4.md   # Hướng dẫn từng bước lấy JSON key & cấp quyền GA4
├── README.md                  # Tài liệu tổng quan (tệp này)
├── .env.example               # Mẫu cấu hình GA4_PROPERTY_ID & đường dẫn key
├── requirements.txt           # Thư viện Python chính thức của Google GA4
├── run_ga4.ps1 / run_ga4.bat  # Script chạy nhanh (tự dùng .venv và UTF-8)
├── credentials/               # Đặt file service-account.json tại đây (đã gitignore)
├── src/
│   ├── schema.py              # 53 sự kiện Android, 24 Custom Dimensions, 4 Custom Metrics, 13 ReportSpecs
│   ├── config.py              # Đọc cấu hình .env & khoảng ngày
│   ├── ga4_client.py          # Kết nối Admin API + Data API, dò Property, đồng bộ schema, xuất JSON/CSV
│   ├── analyzer.py            # Tính Fill Rate, CTR, Win Rate, IAP funnel, Golden Hours Notification
│   ├── report_builder.py      # Xuất GA4_ANALYSIS_REPORT.md & Dashboard HTML Sáng/Tối
│   ├── demo_generator.py      # Sinh dữ liệu mô phỏng để xem trước khi chưa gắn key
│   └── cli.py                 # Entrypoint dòng lệnh
├── tests/                     # Unit tests pytest kiểm tra toàn bộ pipeline
├── data/
│   ├── raw/                   # JSON thô từ GA4 (đã gitignore)
│   ├── csv/                   # Bảng CSV UTF-8 BOM mở trực tiếp Excel (đã gitignore)
│   └── demo/                  # Dữ liệu mẫu dùng cho --demo
└── reports/                   # Báo cáo Markdown & Dashboard HTML
```

---

## 13 bảng dữ liệu được kéo về (`data/csv/` & `data/raw/`)

| Tên file | Nội dung chính |
| :--- | :--- |
| `daily_overview` | DAU, New Users, Sessions, Engagement Rate, thời lượng tương tác theo ngày |
| `events_summary` | Tổng lượt và người dùng theo từng `eventName` |
| `app_versions` | Phân bố theo `appVersion` (1.2, 1.3...) và phiên bản Android |
| `geo_devices` | Quốc gia, dòng thiết bị, model điện thoại (`SM-A075F`, ...) |
| `hourly_activity` | Lưu lượng người dùng theo 24 giờ trong ngày |
| `games_performance` | Lượt mở, chơi, hoàn thành/thất bại level, thời lượng chơi từng mini-game |
| `game_levels` | Các event level theo `game_name` và `level_label` nếu dimension đã đăng ký và game gửi bridge |
| `r2_downloads` | Trạng thái `started / completed / failed` và lỗi tải 319 game Cloudflare R2 |
| `ads_funnel` | Phễu `ad_request -> ad_loaded -> ad_impression -> ad_clicked`, Google vs Meta mediation |
| `ads_format_events` | 20 sự kiện ads mới theo định dạng, phiên bản, unit và game khi có; không cộng với `ads_funnel` |
| `ads_diagnostics` | Mã lỗi tải/hiển thị quảng cáo và lý do suppress/cooldown |
| `iap_funnel` | Phễu `inapp_paywall_viewed -> inapp_purchase_initiated -> inapp_purchase_success` & Restore |
| `notifications_cohort` | Theo dõi lịch 5 notification/ngày theo slot, khung giờ và Open Rate |
| `daily_monetization` | Doanh thu AdMob (`totalAdRevenue`), doanh thu IAP (`purchaseRevenue`) và impressions theo ngày |
| `ua_campaigns` | Chi phí Google Ads (`advertiserAdCost`), clicks, newUsers và doanh thu theo chiến dịch |
| `ad_format_revenue` | Doanh thu và eCPM chi tiết theo phiên bản ứng dụng (`1.2`, `1.3`) và định dạng quảng cáo |
| `country_revenue` | Xếp hạng quốc gia theo tổng doanh thu, eCPM và ARPU / 1.000 người dùng |

Dimension event `level_label` cần đồng bộ lên GA4 trước khi Data API trả trường này; giá trị chữ như `level_5` được gửi cùng `level` số vì GA4 không parse integer cho event-scoped custom dimensions của app. Định nghĩa mới không tự áp dụng lại dữ liệu cũ. Bảng chi tiết ads mới tách khỏi phễu cũ để tránh đếm cùng một hành động hai lần. Báo cáo Markdown/dashboard hiện vẫn dùng phễu cũ; hai bảng mới có trong raw/CSV, không tự thay đổi KPI cũ.

---

## Tham chiếu nhanh các lệnh CLI

- **Xem hướng dẫn chi tiết lấy khóa:** [HUONG_DAN_LAY_KEY_GA4.md](file:///e:/DECOMPILER/Game/com.media720.games2020/GA4/HUONG_DAN_LAY_KEY_GA4.md)
- **Kiểm tra cấu hình & kết nối:** `.\GA4\run_ga4.ps1 --check`
- **Đồng bộ Custom Dimensions/Metrics lên GA4:** `.\GA4\run_ga4.ps1 --sync-dimensions`
- **Kéo dữ liệu thật & xuất báo cáo + dashboard:** `.\GA4\run_ga4.ps1 --pull --days 30`
- **Phân tích lại dữ liệu JSON cục bộ:** `.\GA4\run_ga4.ps1 --analyze-local`
- **Chạy thử chế độ Demo không cần key:** `.\GA4\run_ga4.ps1 --demo`
