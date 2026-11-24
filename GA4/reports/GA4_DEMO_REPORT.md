# BÁO CÁO PHÂN TÍCH GA4 — GAME GATE OFFLINE [DEMO PREVIEW - CHƯA KẾT NỐI KEY THẬT]

- **Nguồn dữ liệu:** `[DEMO PREVIEW - CHƯA KẾT NỐI KEY THẬT]`
- **GA4 Property ID:** `DEMO-PREVIEW (nextai-game-offline)`
- **Khoảng thời gian:** `2026-10-18` → `2026-11-16` (30 ngày)
- **Thời điểm trích xuất (UTC):** `2026-11-16T14:10:30.360415+00:00`
- **Tình trạng Schema Custom:** Dimensions `23/23` | Metrics `4/4`

---

## 1. Tổng Quan Người Dùng & Tương Tác (Overview)

| Chỉ Số KPI | Giá Trị | Ghi Chú |
| :--- | ---: | :--- |
| **DAU Trung Bình** | 1,376.50 | Đỉnh ngày cao nhất: 1,797 |
| **Xu Hướng DAU (Nửa cuối vs Nửa đầu kỳ)** | 11.84% | Tăng/giảm giữa 2 nửa chu kỳ |
| **Tổng Người Dùng Mới (New Users)** | 12,016 | Cộng dồn theo ngày |
| **Tổng Phiên (Sessions)** | 76,695 | Engaged Sessions: 51,398 |
| **Engagement Rate** | 67.02% | Tỉ lệ phiên có tương tác thực |
| **Thời Gian Tương Tác TB / DAU** | 9.93 phút | Trung bình mỗi người chơi/ngày |
| **Tổng Sự Kiện (Event Count)** | 1,648,035 | Active 30 phút gần nhất: 148 |

## 2. Khuyến Nghị Hành Động Tự Động (Actionable Recommendations)

1. Khung giờ vàng mở Notification cao nhất: 20:00 (18.4%), 12:00 (14.6%), 22:00 (11.79%). Ưu tiên đẩy thông điệp game mới / streak thưởng vào các khung giờ này.

## 3. Phân Tích Gameplay & Kho 419 Game

- **Tổng lượt mở game (`game_open`):** 108,826
- **Tổng ván bắt đầu (`game_start`):** 95,894
- **Hoàn thành / Thất bại Level:** 126,319 thắng / 94,998 thua (Win Rate tổng: **57.08%**)
- **Số game ghi nhận dữ liệu:** 15

### Top Mini-Game Mở Nhiều Nhất

| # | Game ID | Thể Loại | Lượt Mở | Lượt Chơi | Tổng Phút Chơi | Win Rate (%) |
| :---: | :--- | :--- | ---: | ---: | ---: | ---: |
| 1 | `amaze_ball_quest` | Casual | 11,899 | 10,961 | 56,827.90 | 52.07% |
| 2 | `apple_worm` | Casual | 11,445 | 9,955 | 39,082 | 66.64% |
| 3 | `backgammon` | Casual | 10,592 | 8,750 | 28,620.20 | 62.76% |
| 4 | `balloons_creator` | Casual | 9,961 | 9,105 | 25,758.70 | 52.44% |
| 5 | `ball_escape` | Casual | 8,933 | 8,058 | 21,785 | 42.89% |
| 6 | `bee` | Casual | 8,382 | 7,513 | 38,045.40 | 57.79% |
| 7 | `block_blast` | Puzzle | 7,601 | 7,026 | 18,142.20 | 56.25% |
| 8 | `block_connect` | Puzzle | 7,329 | 6,356 | 33,262.40 | 44.41% |
| 9 | `block_fit_puzzle` | Puzzle | 6,878 | 5,745 | 19,325 | 56.42% |
| 10 | `block_tetris` | Puzzle | 6,211 | 5,217 | 17,132.30 | 64.47% |
| 11 | `abalone` | Casual | 5,312 | 4,990 | 18,402.30 | 52.88% |
| 12 | `amaze_number` | Casual | 4,509 | 3,769 | 18,382 | 81.62% |
| 13 | `among_us` | Casual | 4,028 | 3,661 | 20,342.60 | 67.31% |
| 14 | `animal_clicker` | Casual | 2,877 | 2,378 | 13,840.40 | 40.83% |
| 15 | `angry_heroes` | Casual | 2,869 | 2,410 | 11,248.50 | 79.78% |

### Tải Game On-Demand Từ Cloudflare R2

- **Started:** 6,525 | **Completed:** 6,100 | **Failed:** 425 | **Tỉ lệ thành công:** **93.49%**

| Lỗi Tải R2 | Số Lượt |
| :--- | ---: |
| `ERR_NAME_NOT_RESOLVED: pub-r2.nextai.games` | 214 |
| `SocketTimeoutException: read timed out` | 211 |

## 4. Hiệu Suất Quảng Cáo AdMob & Meta Mediation

| Chỉ Số Ads | Giá Trị | Công Thức |
| :--- | ---: | :--- |
| **Ad Requests** | 218,500 | Tổng yêu cầu tải |
| **Ad Loaded** | 182,760 | Fill Rate: **83.64%** |
| **Ad Impressions** | 163,863 | Show Rate: **89.66%** (Effective: 74.99%) |
| **Ad Clicks** | 3,781 | CTR: **2.31%** |
| **Rewarded Earned** | 9,779 | Lượt nhận thưởng xem hết video |
| **Suppressed / Blocked** | 8,530 | Bị chặn bởi Frequency Cap / Cooldown |

### Chi Tiết Theo Định Dạng Quảng Cáo

| Định Dạng | Requests | Loaded | Fill Rate | Impressions | Show Rate | Clicks | CTR |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `APP_OPEN` | 29,800 | 24,138 | 81.0% | 19,069 | 79.0% | 476 | 2.5% |
| `BANNER` | 124,000 | 110,360 | 89.0% | 103,738 | 94.0% | 1,452 | 1.4% |
| `INTERSTITIAL` | 46,500 | 35,340 | 76.0% | 29,685 | 84.0% | 1,217 | 4.1% |
| `REWARDED` | 18,200 | 12,922 | 71.0% | 11,371 | 88.0% | 636 | 5.59% |

### Tỉ Trọng Thắng Thầu Mediation (Google vs Meta)

| Mạng Quảng Cáo | Số Lần Thắng | Tỉ Trọng |
| :--- | ---: | ---: |
| `google` | 150,496 | 82.35% |
| `meta` | 32,264 | 17.65% |

### Top Mã Lỗi Tải/Hiển Thị Quảng Cáo

| Sự Kiện | Định Dạng | Mã Lỗi | Thông Báo | Số Lượt |
| :--- | :--- | :---: | :--- | ---: |
| `ad_failed_to_load` | `BANNER` | `3` | No fill. | 10,250 |
| `ad_failed_to_load` | `INTERSTITIAL` | `3` | No fill. | 8,940 |
| `ad_mediation_failed` | `INTERSTITIAL` | `101` | Meta placement mapping not configured | 4,120 |
| `ad_failed_to_load` | `REWARDED` | `2` | Network Error | 3,180 |

## 5. Phễu Mua Hàng VIP Remove Ads (In-App Purchase)

| Bước Trong Phễu | Số Lượt | Tỉ Lệ Chuyển Đổi |
| :--- | ---: | ---: |
| 1. Xem Paywall (`inapp_paywall_viewed`) | 8,110 | 100% |
| 2. Bấm Mua (`inapp_purchase_initiated`) | 612 | 7.55% từ Paywall |
| 3. Mua Thành Công (`inapp_purchase_success`) | 184 | **2.27%** từ Paywall (30.07% từ Bấm Mua) |
| Hủy / Thất Bại | 376 hủy / 52 lỗi | Restore thành công: 44 |

## 6. Lịch 5 Notification/Ngày & Khung Giờ Vàng

- **Lập lịch (`notification_scheduled`):** 71,800 | **Hiển thị (`displayed`):** 62,464 (87.0%) | **Người dùng mở (`opened`):** 7,890 (**Open Rate: 12.63%**)

| Khung Giờ | Scheduled | Delivered | Opened | Delivery Rate | Open Rate |
| :---: | ---: | ---: | ---: | ---: | ---: |
| `08:00` | 15,200 | 13,224 | 1,084 | 87.0% | **8.2%** |
| `12:00` | 14,780 | 12,858 | 1,877 | 87.0% | **14.6%** |
| `16:00` | 14,360 | 12,493 | 1,311 | 87.0% | **10.49%** |
| `20:00` | 13,940 | 12,127 | 2,231 | 86.99% | **18.4%** |
| `22:00` | 13,520 | 11,762 | 1,387 | 87.0% | **11.79%** |

## 7. Phân Bổ Quốc Gia & Thiết Bị Top Đầu

| Quốc Gia | Active Users | Sessions | Engagement Rate |
| :--- | ---: | ---: | ---: |
| Vietnam | 5,420 | 13,450 | 70.04% |
| Indonesia | 3,890 | 9,210 | 67.43% |
| India | 3,410 | 7,820 | 66.37% |
| Philippines | 2,240 | 5,140 | 66.54% |
| Brazil | 1,860 | 4,210 | 65.08% |
| United States | 980 | 2,190 | 70.32% |
