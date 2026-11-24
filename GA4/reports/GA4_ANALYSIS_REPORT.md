# BÁO CÁO PHÂN TÍCH GA4 — GAME GATE OFFLINE [LIVE GA4 DATA]

- **Nguồn dữ liệu:** `[LIVE GA4 DATA]`
- **GA4 Property ID:** `561301538`
- **Khoảng thời gian:** `2026-08-27` → `2026-11-24` (22 ngày)
- **Thời điểm trích xuất (UTC):** `2026-11-24T01:32:03.351946+00:00`
- **Tình trạng Schema Custom:** Dimensions `28/28` | Metrics `6/6`

---

## 1. Tổng Quan Người Dùng & Tương Tác (Overview)

| Chỉ Số KPI | Giá Trị | Ghi Chú |
| :--- | ---: | :--- |
| **DAU Trung Bình** | 564.50 | Đỉnh ngày cao nhất: 1,919 |
| **Xu Hướng DAU (Nửa cuối vs Nửa đầu kỳ)** | 90.0% | Tăng/giảm giữa 2 nửa chu kỳ |
| **Tổng Người Dùng Mới (New Users)** | 6,176 | Cộng dồn theo ngày |
| **Tổng Phiên (Sessions)** | 21,425 | Engaged Sessions: 19,709 |
| **Engagement Rate** | 91.99% | Tỉ lệ phiên có tương tác thực |
| **Thời Gian Tương Tác TB / DAU** | 16.06 phút | Trung bình mỗi người chơi/ngày |
| **Tổng Sự Kiện (Event Count)** | 2,081,214 | Active 30 phút gần nhất: 8 |

## 2. Khuyến Nghị Hành Động Tự Động (Actionable Recommendations)

1. Tỉ lệ Fill Rate quảng cáo hiện đạt 20.52% (< 75%). Ưu tiên hoàn thiện Meta Audience Network Bidding trên AdMob Mediation (TASK-045) để tăng cạnh tranh giá thầu.
2. CẢNH BÁO CHÍNH SÁCH ADMOB: CTR Banner đang vượt ngưỡng 3.5%. Kiểm tra lại khoảng cách dải phân cách xanh 3dp phía trên Banner trên các thiết bị màn hình nhỏ.
3. Tỉ lệ tải thành công gói game R2 đạt 23.18% (< 90%). Kiểm tra cấu hình DNS `pub-r2.nextai.games` và tăng cơ chế retry cho các game có lượt failed cao.
4. Game 'geometry_rash' có tỉ lệ qua màn thấp (0.0%). Cân nhắc gắn gợi ý xem Rewarded Video để nhận trợ giúp hoặc cân bằng lại độ khó các màn đầu.
5. Tỉ lệ chuyển đổi Paywall -> Mua VIP đạt 0.0%. Thử A/B testing điểm đặt Paywall ngay sau lần hiện Interstitial thứ 2 hoặc tối ưu copy ưu đãi.
6. HIỆU QUẢ CHI TIÊU ADS (ROAS): Blended ROAS hiện đạt 6.43% (Chi $157.38 / Thu $10.12, Paid CPI $0.028 vs eCPM TB $0.173). Cần loại trừ các quốc gia Tier-3 có eCPM < $0.10 khỏi chiến dịch Install Volume và chuyển Google Ads sang đấu thầu Target ROAS (Ad Revenue).
7. Khung giờ vàng mở Notification cao nhất: 12:00 (3.11%), 08:00 (2.52%), 20:00 (2.47%). Ưu tiên đẩy thông điệp game mới / streak thưởng vào các khung giờ này.

## 3. Phân Tích Gameplay & Kho 419 Game

- **Tổng lượt mở game (`game_open`):** 74,722
- **Tổng ván bắt đầu (`game_start`):** 0
- **Hoàn thành / Thất bại Level:** 153,077 thắng / 156,436 thua (Win Rate tổng: **49.46%**)
- **Số game ghi nhận dữ liệu:** 419

### Top Mini-Game Mở Nhiều Nhất

| # | Game ID | Thể Loại | Lượt Mở | Lượt Chơi | Tổng Phút Chơi | Win Rate (%) |
| :---: | :--- | :--- | ---: | ---: | ---: | ---: |
| 1 | `amaze_ball_quest` | Casual | 2,060 | 0 | 4,672 | 100.0% |
| 2 | `burger_run` | Arcade | 1,344 | 0 | 2,266.30 | 12.57% |
| 3 | `apple_worm` | Casual | 1,063 | 0 | 2,964.60 | 40.64% |
| 4 | `tic_tac_toe` | 2 Players | 817 | 0 | 1,502.40 | 0.0% |
| 5 | `ludo` | 2 Players | 814 | 0 | 7,076.70 | 0.0% |
| 6 | `ball_escape` | Casual | 737 | 0 | 1,168.90 | 44.38% |
| 7 | `sea_battle` | 2 Players | 608 | 0 | 1,214.80 | 0.0% |
| 8 | `balloons_creator` | Casual | 594 | 0 | 2,019.20 | 75.0% |
| 9 | `pool_8_pro` | 2 Players | 571 | 0 | 2,116.70 | 0.0% |
| 10 | `block_blast` | Puzzle | 533 | 0 | 1,609.50 | 0.0% |
| 11 | `checkers` | 2 Players | 517 | 0 | 1,393.70 | 0.0% |
| 12 | `bee` | Casual | 473 | 0 | 966.60 | 0.0% |
| 13 | `uno_vertical` | 2 Players | 467 | 0 | 1,899.70 | 0.0% |
| 14 | `pipe_rush` | Arcade | 460 | 0 | 682.80 | 34.79% |
| 15 | `knife_hit` | Arcade | 388 | 0 | 728.50 | 81.03% |

### Tải Game On-Demand Từ Cloudflare R2

- **Started:** 15,159 | **Completed:** 3,498 | **Failed:** 11,591 | **Tỉ lệ thành công:** **23.18%**

| Lỗi Tải R2 | Số Lượt |
| :--- | ---: |
| `UnknownHostException` | 9,410 |
| `bx1` | 581 |
| `SocketException` | 497 |
| `ConnectException` | 472 |
| `SocketTimeoutException` | 286 |
| `SSLHandshakeException` | 159 |
| `ix1` | 100 |
| `IllegalArgumentException` | 53 |
| `SSLException` | 22 |
| `FileNotFoundException` | 7 |

## 4. Hiệu Suất Quảng Cáo AdMob & Meta Mediation

| Chỉ Số Ads | Giá Trị | Công Thức |
| :--- | ---: | :--- |
| **Ad Requests** | 159,192 | Tổng yêu cầu tải |
| **Ad Loaded** | 32,661 | Fill Rate: **20.52%** |
| **Ad Impressions** | 58,380 | Show Rate: **178.75%** (Effective: 36.67%) |
| **Ad Clicks** | 2,668 | CTR: **4.57%** |
| **Rewarded Earned** | 60 | Lượt nhận thưởng xem hết video |
| **Suppressed / Blocked** | 101,860 | Bị chặn bởi Frequency Cap / Cooldown |

### Chi Tiết Theo Định Dạng Quảng Cáo

| Định Dạng | Requests | Loaded | Fill Rate | Impressions | Show Rate | Clicks | CTR |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `APP_OPEN` | 5,466 | 1,282 | 23.45% | 46 | 3.59% | 18 | 39.13% |
| `BANNER` | 27,589 | 5,798 | 21.02% | 7,405 | 127.72% | 417 | 5.63% |
| `INTERSTITIAL` | 17,181 | 3,214 | 18.71% | 1,750 | 54.45% | 526 | 30.06% |
| `NATIVE` | 12,885 | 6,385 | 49.55% | 2,863 | 44.84% | 237 | 8.28% |
| `REWARDED` | 7,366 | 1,193 | 16.2% | 41 | 3.44% | 4 | 9.76% |

### Tỉ Trọng Thắng Thầu Mediation (Google vs Meta)

| Mạng Quảng Cáo | Số Lần Thắng | Tỉ Trọng |
| :--- | ---: | ---: |
| `google` | 15,229 | 100.0% |

### Top Mã Lỗi Tải/Hiển Thị Quảng Cáo

| Sự Kiện | Định Dạng | Mã Lỗi | Thông Báo | Số Lượt |
| :--- | :--- | :---: | :--- | ---: |
| `ad_failed_to_load` | `(not set)` | `(not set)` | (not set) | 77,638 |
| `ad_failed_to_load` | `BANNER` | `(not set)` | Unable to obtain a JavascriptEngine. | 13,301 |
| `ad_failed_to_load` | `INTERSTITIAL` | `(not set)` | Unable to obtain a JavascriptEngine. | 6,794 |
| `ad_failed_to_load` | `BANNER` | `(not set)` | (not set) | 4,571 |
| `ad_failed_to_load` | `INTERSTITIAL` | `(not set)` | (not set) | 3,288 |
| `ad_failed_to_load` | `REWARDED` | `(not set)` | Unable to obtain a JavascriptEngine. | 2,555 |
| `ad_failed_to_load` | `BANNER` | `` | Unable to obtain a JavascriptEngine. | 2,086 |
| `ad_mediation_failed` | `BANNER` | `(not set)` | Unable to obtain a JavascriptEngine. | 1,537 |
| `ad_failed_to_load` | `NATIVE` | `(not set)` | (not set) | 1,533 |
| `ad_failed_to_load` | `REWARDED` | `(not set)` | (not set) | 1,490 |
| `ad_failed_to_load` | `INTERSTITIAL` | `` | Unable to obtain a JavascriptEngine. | 1,417 |
| `ad_mediation_failed` | `INTERSTITIAL` | `(not set)` | Unable to obtain a JavascriptEngine. | 1,404 |

## 5. Phễu Mua Hàng VIP Remove Ads (In-App Purchase)

| Bước Trong Phễu | Số Lượt | Tỉ Lệ Chuyển Đổi |
| :--- | ---: | ---: |
| 1. Xem Paywall (`inapp_paywall_viewed`) | 191 | 100% |
| 2. Bấm Mua (`inapp_purchase_initiated`) | 2 | 1.05% từ Paywall |
| 3. Mua Thành Công (`inapp_purchase_success`) | 0 | **0.0%** từ Paywall (0.0% từ Bấm Mua) |
| Hủy / Thất Bại | 1 hủy / 1 lỗi | Restore thành công: 0 |

## 6. Lịch 5 Notification/Ngày & Khung Giờ Vàng

- **Lập lịch (`notification_scheduled`):** 89,441 | **Hiển thị (`displayed`):** 2,592 (2.9%) | **Người dùng mở (`opened`):** 70 (**Open Rate: 2.7%**)

| Khung Giờ | Scheduled | Delivered | Opened | Delivery Rate | Open Rate |
| :---: | ---: | ---: | ---: | ---: | ---: |
| `08:00` | 30,316 | 834 | 21 | 2.75% | **2.52%** |
| `12:00` | 29,774 | 869 | 27 | 2.92% | **3.11%** |
| `20:00` | 29,351 | 889 | 22 | 3.03% | **2.47%** |

## 7. Phân Bổ Quốc Gia & Thiết Bị Top Đầu

| Quốc Gia | Active Users | Sessions | Engagement Rate |
| :--- | ---: | ---: | ---: |
| India | 1,072 | 3,543 | 92.77% |
| Algeria | 608 | 2,239 | 93.3% |
| Pakistan | 409 | 1,426 | 94.53% |
| Bangladesh | 392 | 1,105 | 91.67% |
| Egypt | 293 | 1,180 | 92.29% |
| Iraq | 262 | 616 | 90.1% |
| Venezuela | 244 | 718 | 92.62% |
| Nepal | 229 | 658 | 92.25% |
| Brazil | 194 | 297 | 94.28% |
| Morocco | 183 | 547 | 92.14% |

## 8. Chi Phí Quảng Cáo (UA), Doanh Thu & Chỉ Số ROAS

| Chỉ Số Tài Chính | Giá Trị (USD) | Chi Tiết & Công Thức |
| :--- | ---: | :--- |
| **Tổng Chi Phí Ads (Google Ads Spend)** | **$157.38** | 705,027 imps · 25,389 clicks · CPC: $0.0062 (CTR 3.6%) |
| **Chi Phí / Cài Đặt (CPI)** | **$0.0255** | Paid CPC CPI: $0.0277 (5,673 paid / 6,176 new users) |
| **Doanh Thu AdMob (`totalAdRevenue`)** | **$10.1196** | 58,379 imps · eCPM gộp: **$0.173** |
| **Doanh Thu Gói VIP (`purchaseRevenue`)** | **$0.0000** | Doanh thu In-App Purchase / Subscription |
| **Tổng Doanh Thu (`totalRevenue`)** | **$10.1196** | AdMob + Google Play Billing |
| **Lãi / Lỗ Gộp (Net P&L)** | **-$147.26** | `Tổng Doanh Thu - Tổng Chi Phí Ads` |
| **Chỉ Số ROAS Tổng Thể (Blended ROAS)** | **6.43%** | `Tổng Doanh Thu / Tổng Chi Phí Ads` |

### Hiệu Quả Theo Chiến Dịch / Nguồn Cài Đặt

| Chiến Dịch | Nguồn / Kênh | Chi Phí | Clicks | New Users | CPI | Doanh Thu Gắn Trực Tiếp | ROAS Trực Tiếp |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| `Global` | `google / cpc` | $101.74 | 15,667 | 635 | $0.160 | $1.0046 | 0.99% |
| `Global2` | `google / cpc` | $32.23 | 8,578 | 1,119 | $0.029 | $1.5589 | 4.84% |
| `US` | `google / cpc` | $11.30 | 164 | 28 | $0.404 | $0.6883 | 6.09% |
| `Global ROAS` | `google / cpc` | $6.47 | 451 | 82 | $0.079 | $0.5467 | 8.46% |
| `Brazil` | `google / cpc` | $5.56 | 516 | 159 | $0.035 | $0.6635 | 11.94% |
| `Nam Phi` | `google / cpc` | $0.04 | 8 | 1 | $0.040 | $0.0000 | 0.0% |
| `Argentina` | `google / cpc` | $0.04 | 3 | 1 | $0.037 | $0.0064 | 17.26% |
| `Mexico` | `google / cpc` | $0.01 | 2 | 0 | $0.000 | $0.0000 | 0.0% |

### Doanh Thu & eCPM Theo Phiên Bản Và Định Dạng

| Phiên Bản | Định Dạng | Doanh Thu | Impressions | Clicks | CTR | eCPM |
| :---: | :--- | ---: | ---: | ---: | ---: | ---: |
| `1.4.1` | `Interstitial` | $0.0037 | 2 | 3 | 150.0% | **$1.875** |
| `1.4.1` | `Banner` | $0.0000 | 1 | 0 | 0.0% | **$0.027** |
| `1.4.0` | `Interstitial` | $0.1551 | 127 | 28 | 22.05% | **$1.221** |
| `1.4.0` | `Native advanced` | $0.0232 | 90 | 3 | 3.33% | **$0.257** |
| `1.4.0` | `Rewarded` | $0.0156 | 9 | 1 | 11.11% | **$1.737** |
| `1.4.0` | `Banner` | $0.0084 | 47 | 0 | 0.0% | **$0.179** |
| `1.4.0` | `App open` | $0.0001 | 1 | 0 | 0.0% | **$0.132** |
| `1.3.1` | `Interstitial` | $1.0654 | 415 | 165 | 39.76% | **$2.567** |
| `1.3.1` | `Banner` | $0.7048 | 1,169 | 76 | 6.5% | **$0.603** |
| `1.3.1` | `Native advanced` | $0.5181 | 1,014 | 56 | 5.52% | **$0.511** |

### Bảng Lãi / Lỗ & Blended ROAS 10 Ngày Gần Nhất

| Ngày | DAU | New Users | Chi Phí Ads | Doanh Thu | Imps (AdMob) | eCPM | Lãi/Lỗ Ngày | Blended ROAS |
| :---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `2026-11-15` | 812 | 146 | $0.74 | $0.3712 | 2,599 | $0.143 | -$0.37 | **50.23%** |
| `2026-11-16` | 587 | 81 | $0.70 | $0.1699 | 1,801 | $0.094 | -$0.53 | **24.16%** |
| `2026-11-17` | 540 | 37 | $0.19 | $0.1592 | 1,554 | $0.102 | -$0.03 | **82.95%** |
| `2026-11-18` | 416 | 38 | $0.14 | $0.1893 | 1,164 | $0.163 | $0.04 | **131.22%** |
| `2026-11-19` | 386 | 27 | $0.10 | $0.0834 | 1,233 | $0.068 | -$0.01 | **86.42%** |
| `2026-11-20` | 426 | 78 | $0.14 | $0.1782 | 1,490 | $0.120 | $0.04 | **124.69%** |
| `2026-11-21` | 1,919 | 1,545 | $44.41 | $3.1055 | 10,047 | $0.309 | -$41.31 | **6.99%** |
| `2026-11-22` | 1,022 | 334 | $6.13 | $1.1775 | 3,971 | $0.297 | -$4.96 | **19.2%** |
| `2026-11-23` | 633 | 138 | $1.21 | $0.8109 | 1,790 | $0.453 | -$0.39 | **67.26%** |
| `2026-11-24` | 120 | 16 | $0.83 | $0.1902 | 363 | $0.524 | -$0.64 | **22.98%** |

### Top Quốc Gia Theo Doanh Thu, eCPM & ARPU

| Quốc Gia | Active Users | Doanh Thu | Impressions | eCPM | ARPU / 1,000 Users |
| :--- | ---: | ---: | ---: | ---: | ---: |
| United States | 65 | $1.4848 | 631 | $2.353 | $22.84 |
| India | 1,071 | $1.2435 | 12,727 | $0.098 | $1.16 |
| Brazil | 194 | $0.7718 | 2,155 | $0.358 | $3.98 |
| Algeria | 605 | $0.7614 | 6,397 | $0.119 | $1.26 |
| Bangladesh | 392 | $0.5572 | 4,167 | $0.134 | $1.42 |
| Iraq | 261 | $0.4034 | 2,364 | $0.171 | $1.55 |
| Pakistan | 408 | $0.3680 | 3,889 | $0.095 | $0.90 |
| Egypt | 293 | $0.3042 | 2,918 | $0.104 | $1.04 |
| Venezuela | 242 | $0.2861 | 2,105 | $0.136 | $1.18 |
| Morocco | 183 | $0.2444 | 1,536 | $0.159 | $1.34 |
