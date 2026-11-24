# Docs/rules.md - QUY CHUẨN MÃ NGUỒN, CHỐNG VIBE CODE & KIẾN TRÚC TOÀN DỰ ÁN

---

## 1. LUẬT CỨNG CHỐNG VIBE CODE — CODE CHO DEV ĐỌC HIỂU (MANDATORY CLEAN CODE RULES)

Mọi mã nguồn (Kotlin, TypeScript, Python, Go) do AI Agent hoặc lập trình viên đóng góp **BẮT BUỘC** đáp ứng chuẩn Senior Engineer dễ đọc, dễ review và bảo trì:

| Hạng mục | Luật Cứng Bắt Buộc | Mẫu CẤM (Vibe Code) |
| :--- | :--- | :--- |
| **Định dạng dòng lệnh** | Mỗi câu lệnh nằm trên **1 dòng riêng**; tối đa **120 ký tự/dòng**; thụt lề 4 spaces (Kotlin) / 2–4 spaces nhất quán (TS); có dòng trống giữa các hàm & khối logic. | `connecting = false; checking = false; publishState()` hoặc nén cả `if/try/catch` thành 1 dòng. |
| **Giới hạn kích thước** | File **≤ 350 dòng**; Hàm **≤ 50 dòng**; lồng tối đa **3 cấp** (dùng guard clause / early return). Không nhồi thêm logic mới vào file đã vượt ngưỡng. | Nhồi 1,200 dòng vào `AdManager.kt` hay 1,583 dòng vào `gameTester.ts`. |
| **Đặt tên & Cấu trúc** | Tên biến/hàm nói rõ ý định nghiệp vụ; khai báo property ở đầu class (không kẹp giữa các method); bỏ dead code, dead DAO và string rác. | Khai báo `private val repo = ...` giữa 2 hàm; giữ biến/DAO không ai gọi. |
| **UI tách khỏi Logic** | Toàn bộ màn hình & Dialog phức tạp dùng **XML Layout / Jetpack Compose** + `@color`, `@dimen`, `@string`, `@style`. | Dựng `Dialog`/`LinearLayout` + `Color.parseColor("#...")` bên trong `AdManager` hay `Activity`. |
| **Comment & Logging** | Comment song ngữ **Tiếng Việt có dấu đầy đủ + Tiếng Anh**, giải thích **TẠI SAO (Why)**; cấm comment vô nghĩa trên callback rỗng; `Log.d/i/v` phải bọc `BuildConfig.DEBUG` và không log PII/secret. | `/** Dong bo goi khong chong */`, chữ dính nhau `hủy đủ5 slot`, hoặc `Log.i` thẳng ở release. |
| **Không copy-paste & Không hack** | Trừu tượng hóa các state machine lặp lại; **CẤM** Java Reflection vào field private AndroidX trừ khi có ADR phê duyệt. | Copy-paste 3 bản sao Interstitial/Rewarded/AppOpen; reflection `mRecyclerView`/`mTouchSlop`. |

---

## 2. QUY CHUẨN MÃ NGUỒN ANDROID (KOTLIN)
- **Ngôn ngữ & SDK:** Kotlin 2.4+ (`compileSdk = 36`, `targetSdk = 36`, `minSdk = 24`).
- **Định danh ứng dụng:** `applicationId = "com.nextai.game.offline"`, Kotlin `namespace = "com.nextai.gameoffline"` (Thương hiệu: NextAI Technology / NextSolution, App Label: **Galaxy Game**, 419 mini-games: 100 bundled + 319 on-demand R2).
- **Quy tắc đặt tên:**
  - Class, Interface, Object: `PascalCase` (vd: `GameListViewModel`, `AppDatabase`, `AndroidGameBridge`).
  - Function, Variable, Property: `camelCase` (vd: `submitScore()`, `highScore`, `hasRewardedVideo`).
  - Constant: `UPPER_SNAKE_CASE` (vd: `TABLE_GAMES`, `DEFAULT_EACH_N_SECONDS`).
- **Bắt buộc có Comment Song Ngữ có dấu đầy đủ (Bilingual Comments):**
  ```kotlin
  /**
   * Cầu nối JavaScript hai chiều giữa Android Native và Game HTML5/WASM.
   * Two-way JavaScript bridge between Android Native and HTML5/WASM games.
   *
   * @param onScoreSubmitted Callback khi người chơi đạt điểm mới / Callback when player submits new score.
   */
  ```
- **Kiến trúc Clean MVVM & Dependency Injection (BẮT BUỘC cho code mới & refactor):**
  - `di/`: `AppContainer` (hoặc Hilt) cấp phát phụ thuộc qua **constructor injection** — **CẤM** thêm phụ thuộc mới vào `GameApplication.instance` hoặc tạo Global Mutable Singleton `object`.
  - `data/local`: Room Entities, Room DAOs, `AppDatabase.kt`, Preferences/DataStore wrappers.
  - `data/remote`: R2 Transfer, Download Manager, Repository implementations.
  - `domain`: Repository interfaces, Domain Models, UseCases/Policies thuần (100% unit-test được trên JVM).
  - `presentation`: Activities/Fragments/Compose Screens **mỏng** (chỉ render UI & gửi event) + **ViewModels** giữ `StateFlow`.
  - `ads`: Tách rõ từng vai trò (SDK Initializer, Generic Full-Screen Ad Slot, Banner Controller, Interstitial/Rewarded/AppOpen Coordinators, Consent Manager, XML Loading Overlay).
  - `billing`: Google Play Billing **v9.1.0** — **1 nguồn chân lý duy nhất** (`BillingRepository` phát `StateFlow`), không mở song song nhiều `BillingClient`.
- **Quy tắc Lifecycle, Threading & Security bắt buộc:**
  - Không bao giờ chạy File I/O, `deleteRecursively`, parse JSON lớn hoặc DB query trên Main Thread (phải dùng `Dispatchers.IO`).
  - Trước khi show `Dialog` / Full-Screen Ad sau delay hoặc callback bất đồng bộ: BẮT BUỘC kiểm tra `!isFinishing && !isDestroyed` và `lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED)`.
  - Mọi phương thức expose cho JS phải có `@JavascriptInterface` đầy đủ trên mọi overload cần dùng, chuyển về thread an toàn và validate tham số đầu vào; mọi dữ liệu tiêm vào `evaluateJavascript` phải được escape an toàn.

---

## 3. QUY CHUẨN BACKEND & CMS (TYPESCRIPT / GO)
- **Ngôn ngữ:** TypeScript (Node.js 20+) + Express / Fastify + Golang services.
- **Cổng dịch vụ (Port):** **6033** (Bắt buộc theo yêu cầu hệ thống).
- **Tài liệu API:** Tự động tạo bằng Swagger UI tại `/api-docs`.
- **Tách biệt tầng xử lý:** Route handlers, Services, Database access và View/HTML templates phải tách thành các file riêng biệt (≤ 350 dòng/file), không nhồi HTML/CSS/JS khổng lồ vào file router TypeScript.
- **Admin Dashboard UI:**
  - Hỗ trợ chuyển đổi chế độ Sáng / Tối (Light & Dark theme).
  - Cấu trúc URL phân cấp rõ ràng: `domain.com/admin/menu-cha/menu-con`.
  - Thiết kế thích ứng trên thiết bị di động (Mobile Responsive).
  - Hiển thị dữ liệu dạng Card khi có nhiều thông tin trên 1 dòng.
- **Bảo mật & Xác thực Admin:**
  - Bắt buộc `JWT_SECRET` từ biến môi trường (cấm hardcode fallback secret trong production), dùng `bcrypt` bất đồng bộ (`compare`), khóa CORS theo whitelist và bật rate limit.
  - Mọi tham số đường dẫn (`gameName`, file path) bắt buộc validate whitelist + kiểm tra `path.resolve` nằm trong thư mục gốc và escape tuyệt đối trước khi render vào HTML/JS.
- **Xử lý Tệp Đa Phương Tiện:** Tích hợp S3/Cloudflare R2 API để thêm/xóa ảnh, âm thanh, video (đồng bộ xóa cả trên cloud tránh file mồ côi).

---

## 4. QUY TRÌNH KIỂM THỬ, SELF-REVIEW & BÁO CÁO KIẾN TRÚC (QUALITY GATE)
1. **Unit & Integration Test:** Viết Unit Test cho Policies, Repositories, ViewModels, Room DAO và API Endpoints; tuyệt đối không sửa test để làm xanh giả tạo.
2. **UI & Device QA:** Chạy kiểm thử Web Admin bằng **Playwright**; kiểm thử Android bằng `testDebugUnitTest`, `lintDebug` (0 lỗi), `assembleDebug` và **ADB CLI** khi có thiết bị.
3. **Cổng Self-Review Bắt Buộc trước khi kết thúc task:**
   - [ ] Code đọc trôi chảy như Senior Engineer viết tay — 0 dòng nén `;`, 0 dòng vượt 120 ký tự vô lý, không hàm/file phình vượt ngưỡng.
   - [ ] Logic biên, nullability, exception, concurrency và Android Lifecycle (`RESUMED`, hủy `Job`/`Handler`) đều an toàn.
   - [ ] Không tạo thêm Global Mutable Singleton hay copy-paste state machine; UI phức tạp nằm trong XML/Compose.
   - [ ] Comment song ngữ Tiếng Việt có dấu đầy đủ + Tiếng Anh; log debug bọc `BuildConfig.DEBUG`.
   - [ ] Nếu phát hiện nợ kiến trúc cần refactor vượt phạm vi task: **ĐÃ BÁO CÁO RÕ RÀNG** cho User kèm vị trí, nguyên nhân và lộ trình đề xuất.
