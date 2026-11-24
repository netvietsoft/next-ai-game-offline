# HƯỚNG DẪN LẤY KEY & KẾT NỐI GOOGLE ANALYTICS 4 (GA4)
**Dự án:** Game Gate Offline (`com.nextai.game.offline`)  
**Firebase / GCP Project:** `nextai-game-offline` (Project Number: `593740416942`)  
**Vị trí lưu khóa đích:** `E:\DECOMPILER\Game\com.media720.games2020\GA4\credentials\service-account.json`

---

## Tổng quan quy trình (4 bước — mất ~5 phút)
1. **Bật 2 API** trên Google Cloud Console (`Google Analytics Data API` và `Google Analytics Admin API`).
2. **Tạo Service Account & tải file JSON Key** về đặt vào `GA4/credentials/service-account.json`.
3. **Cấp quyền cho email Service Account** trong trang quản trị GA4 (`Admin -> Property access management`).
4. **Chạy lệnh `--check`, `--sync-dimensions` và `--pull`** để kéo toàn bộ dữ liệu về máy và xuất Dashboard.

---

## Phần 1 — Bật 2 API bắt buộc trên Google Cloud Console

Đăng nhập bằng tài khoản Google đang quản trị dự án **`nextai-game-offline`** và bật lần lượt 2 API sau:

1. **Google Analytics Data API** (dùng để kéo số liệu báo cáo):  
   https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com?project=nextai-game-offline  
   → Nhấn nút **ENABLE (BẬT)**.
2. **Google Analytics Admin API** (dùng để tự động dò Property ID và tạo Custom Dimensions/Metrics):  
   https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com?project=nextai-game-offline  
   → Nhấn nút **ENABLE (BẬT)**.

> [!TIP]
> Nếu đường dẫn mở ra đúng dự án `nextai-game-offline` chưa có sẵn trong trình duyệt, kiểm tra lại góc trên bên trái Google Cloud Console xem đã chọn đúng project **`nextai-game-offline`** (`593740416942`) chưa.

---

## Phần 2 — Tạo Service Account & Tải file JSON Key

1. Mở trang quản lý Service Account của dự án:  
   https://console.cloud.google.com/iam-admin/serviceaccounts?project=nextai-game-offline
2. Nhấn **+ CREATE SERVICE ACCOUNT (Tạo tài khoản dịch vụ)**:
   - **Service account name:** `ga4-analytics-reader`
   - **Service account ID:** tự sinh dạng `ga4-analytics-reader@nextai-game-offline.iam.gserviceaccount.com`
   - Nhấn **CREATE AND CONTINUE** → phần **Grant this service account access to project** có thể bỏ qua (không cần gán role GCP mức project, vì quyền đọc GA4 cấp trực tiếp ở Phần 3) → nhấn **DONE**.
3. Bấm vào dòng Service Account vừa tạo trong danh sách → chọn tab **KEYS (Khóa)**:
   - Nhấn **ADD KEY (Thêm khóa)** → **Create new key (Tạo khóa mới)**.
   - Chọn định dạng **JSON** → nhấn **CREATE**.
4. Trình duyệt sẽ tải xuống một tệp `.json`. Đổi tên và di chuyển tệp đó vào đúng đường dẫn:
   ```text
   E:\DECOMPILER\Game\com.media720.games2020\GA4\credentials\service-account.json
   ```
5. Mở nhẹ tệp vừa lưu (hoặc xem trên trang Service Account) để chép lại địa chỉ **`client_email`** (ví dụ: `ga4-analytics-reader@nextai-game-offline.iam.gserviceaccount.com`).  
   *(Tệp `GA4/credentials/*.json` đã được cấu hình chặn trong `.gitignore`, tuyệt đối không gửi nội dung khóa này lên mạng hay Git.)*

---

## Phần 3 — Cấp quyền trên Google Analytics 4 & Lấy Property ID

1. Truy cập Google Analytics 4:
   - Cách 1: Vào trực tiếp https://analytics.google.com/ và chọn đúng Property của app **Game Gate Offline / nextai-game-offline**.
   - Cách 2: Mở [Firebase Console — nextai-game-offline](https://console.firebase.google.com/project/nextai-game-offline/settings/integrations) → **Project Settings** → tab **Integrations** → thẻ **Google Analytics** → bấm **Manage / View in Google Analytics**.
2. Nhìn góc dưới bên trái màn hình GA4, bấm biểu tượng bánh răng **Admin (Quản trị)**.
3. Ở cột **Property (Thuộc tính)**:
   - Bấm **Property details (Chi tiết thuộc tính)** → chép lại **Property ID** ở góc trên bên phải (là dãy số 9–10 chữ số, ví dụ `412345678` — lưu ý **không** nhầm với Measurement ID `G-XXXXXXXXXX`).
   - Quay lại mục **Property access management (Quản lý quyền truy cập thuộc tính)**:
     - Bấm nút **+** (góc trên phải) → **Add users (Thêm người dùng)**.
     - Dán **`client_email`** của Service Account đã tạo ở Phần 2.
     - Chọn quyền (Role):
       - Chọn **Viewer (Người xem)** nếu chỉ cần kéo báo cáo và phân tích dữ liệu.
       - Chọn **Editor (Người chỉnh sửa)** nếu muốn dùng lệnh `--sync-dimensions` để tool tự động tạo sẵn **23 Custom Dimensions + 4 Custom Metrics** cho toàn bộ sự kiện game, AdMob và Notification. *(Sau khi đồng bộ xong có thể hạ quyền về Viewer).*
     - Nhấn **Add (Thêm)**.
4. Sao chép `GA4/.env.example` thành `GA4/.env` và điền Property ID (hoặc để trống để tool tự động dò):
   ```powershell
   Copy-Item E:\DECOMPILER\Game\com.media720.games2020\GA4\.env.example E:\DECOMPILER\Game\com.media720.games2020\GA4\.env
   ```
   Mở `GA4/.env` và cập nhật dòng `GA4_PROPERTY_ID=412345678` (thay bằng số Property ID thật của bạn).

---

## Phần 4 — Các lệnh chạy kiểm tra, đồng bộ và kéo dữ liệu

Mở PowerShell tại thư mục gốc `E:\DECOMPILER\Game\com.media720.games2020`:

```powershell
# 1. Kiểm tra file key, quyền truy cập GA4 và đếm số Custom Dimensions đã đăng ký
.\GA4\run_ga4.ps1 --check

# 2. (Chạy thử trước) Xem trước những Custom Dimensions/Metrics nào sẽ được tạo
.\GA4\run_ga4.ps1 --sync-dimensions --dry-run

# 3. Tạo tự động toàn bộ Custom Dimensions/Metrics còn thiếu trên GA4 (cần quyền Editor)
.\GA4\run_ga4.ps1 --sync-dimensions

# 4. Kéo toàn bộ dữ liệu 30 ngày gần nhất về JSON/CSV, phân tích & tạo Dashboard
.\GA4\run_ga4.ps1 --pull --days 30

# 5. Kéo theo khoảng ngày tùy chọn
.\GA4\run_ga4.ps1 --pull --start-date 2026-10-01 --end-date 2026-11-16

# 6. Phân tích lại dữ liệu đã kéo sẵn (không gọi lại API)
.\GA4\run_ga4.ps1 --analyze-local

# 7. Chạy chế độ Demo xem trước Dashboard & Báo cáo mẫu khi chưa gắn key
.\GA4\run_ga4.ps1 --demo
```

Sau khi chạy `--pull`, mở kết quả phân tích tại:
- Báo cáo chi tiết: `GA4/reports/GA4_ANALYSIS_REPORT.md`
- Dashboard trực quan (Light/Dark Mode): `GA4/reports/dashboard.html`
- Dữ liệu CSV mở bằng Excel: `GA4/data/csv/*.csv`

---

## Phần 5 — Xử lý lỗi thường gặp (Troubleshooting)

| Lỗi / Hiện tượng | Nguyên nhân chính | Cách khắc phục |
| :--- | :--- | :--- |
| `403 PERMISSION_DENIED` hoặc `User does not have sufficient permissions` | Chưa thêm `client_email` vào Property Access trên GA4, hoặc đang để quyền Viewer khi chạy `--sync-dimensions`. | Vào **GA4 → Admin → Property access management**, kiểm tra lại `client_email` và mức quyền (**Viewer** để `--pull`, **Editor** để `--sync-dimensions`). |
| `API has not been used in project ... before or it is disabled` | Chưa bật `Google Analytics Data API` hoặc `Google Analytics Admin API` trên đúng project. | Mở 2 link ở Phần 1 và nhấn **ENABLE**, chờ 1–2 phút rồi chạy lại `--check`. |
| `Không tìm thấy GA4 Property nào` | Tài khoản Service Account chưa gắn vào GA4 hoặc Firebase project chưa liên kết GA4 Property. | Kiểm tra Firebase Console → Project Settings → Integrations → Google Analytics để xác nhận đã liên kết Property, sau đó cấp quyền trên Property đó. |
| Đã `--sync-dimensions` xong nhưng dữ liệu `game_name` / `ad_type` vẫn là `(not set)` hoặc `0` | **Đặc thù của GA4:** Custom Dimensions chỉ ghi nhận dữ liệu **kể từ sau thời điểm đăng ký** (không hồi tố quá khứ) và mất **24–48 giờ** để hiện số liệu đầy đủ. | Chờ 24–48 giờ để GA4 xử lý dữ liệu mới phát sinh. Trong thời gian đó, các bảng tổng quan (`daily_overview`, `events_summary`, `geo_devices`) vẫn hoạt động bình thường. |
| Muốn truy vấn lại dữ liệu raw trước khi đăng ký Custom Dimensions | GA4 UI/Data API không hồi tố custom parameter cũ trước lúc tạo Custom Dimension. | Vào **GA4 → Admin → Product links → BigQuery links** (hoặc Firebase Integrations → BigQuery) để bật **Daily Export miễn phí** (Sandbox/Spark hoặc GCP project có billing tối thiểu) — mọi `event_params` thô sẽ được lưu vĩnh viễn để query SQL sau này. |
