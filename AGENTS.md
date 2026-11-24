# AGENTS.md - HIẾN PHÁP DỰ ÁN DÀNH CHO AI AGENT
**Dự án:** Galaxy Game / NextAI Game Offline - Multi-Game Platform (`applicationId = com.nextai.game.offline`, Kotlin namespace `com.nextai.gameoffline`)  
**Tiêu chuẩn:** Development Workspace Standard V2.1 (Design-Gated + Clean Engineering + APK-to-Full-Stack Reconstruction)

---

## 1. QUY TẮC CỐT LÕI (MANDATORY RULES)

Mọi AI Agent tham gia dự án BẮT BUỘC phải đọc và tuân thủ các quy tắc sau trước khi thực hiện bất kỳ thao tác nào:

1. **Thứ tự đọc bắt buộc khi bắt đầu:**
   - Đọc `README.md`
   - Đọc `AGENTS.md` (Tài liệu này — bao gồm **Luật Cứng Mục 2**)
   - Đọc `Docs/rules.md`
   - Đọc `PROJECT_MEMORY.md` và `UPDATETODOS.md`
   - Đọc Architecture, Specs và báo cáo audit gần nhất (`Report/CODE_REVIEW_ARCHITECTURE_AUDIT_*.md`) liên quan đến task được giao.
   - Kiểm tra `.ai/locks.json` và `.ai/state.json`.

2. **Quy định về Code & Ngôn ngữ:**
   - **Mã nguồn Android:** Kotlin hiện đại (Coroutines, Flow, Jetpack Compose, XML ViewBinding, Room ORM, WebView Bridge) với `applicationId = com.nextai.game.offline` và Kotlin package/namespace `com.nextai.gameoffline` (Thương hiệu: **NextAI Technology / NextSolution**, tên hiển thị **Galaxy Game**).
   - **Mã nguồn Backend:** TypeScript (Node.js) và Golang, phục vụ API và Admin CMS trên **Port 6033**.
   - **Chú thích mã nguồn:** Mọi class, method, logic phức tạp **BẮT BUỘC có comment song ngữ Tiếng Việt có dấu đầy đủ + Tiếng Anh (Bilingual Comments)**, giải thích **TẠI SAO (Why)** thay vì chỉ lặp lại cú pháp hiển nhiên.

3. **Nguyên tắc File Lock & Ownership:**
   - Kiểm tra `.ai/locks.json` trước khi chỉnh sửa bất kỳ tệp nào.
   - Không can thiệp vào các tệp đang bị lock bởi Agent khác mà không có sự phê duyệt của **Agent 0 (Orchestrator)**.

4. **Nguyên tắc Testing & Quality Gate:**
   - **TUYỆT ĐỐI KHÔNG** sửa đổi test để làm xanh giả tạo (Do not alter tests to fake pass).
   - Mọi task chỉ được coi là `DONE` khi vượt qua toàn bộ Quality Gate (Build, Lint, Typecheck, Unit Test, Self-Review theo Mục 2, Visual QA, Review).

5. **Bộ nhớ vận hành (Operational Memory):**
   - Cập nhật tiến độ vào `TASK_LOG.md` và `UPDATETODOS.md` bằng tiếng Việt có dấu rõ ràng (cấm viết tắt dính chữ khó đọc) sau mỗi mốc hoàn thành.
   - Các thông tin cần người dùng cung cấp (API Keys, Ads IDs, Store Credentials) phải ghi vào `Tasksrequiring.md`.

---

## 2. LUẬT CỨNG KỸ THUẬT: CHỐNG VIBE CODE, CODE CHO DEV ĐỌC HIỂU & KIỂM SOÁT KIẾN TRÚC (HARD ENGINEERING RULES)

> **CẤM TUYỆT ĐỐI VIẾT "VIBE CODE" (Code kiểu nghe-hiểu viết nhanh, nén dòng, chắp vá cho chạy được rồi bỏ đó).**  
> Mọi dòng code sinh ra phải đạt tiêu chuẩn **Senior Engineer viết cho lập trình viên người thật đọc, review, debug và bảo trì lâu dài**. Vi phạm bất kỳ điều khoản nào dưới đây đều bị coi là **KHÔNG ĐẠT QUALITY GATE**.

### 2.1. Luật sạch & khả năng Dev đọc hiểu (Human-Readable Code Only)
1. **CẤM nén nhiều câu lệnh trên 1 dòng bằng dấu `;`:** Trong Kotlin (và TypeScript trừ cấu trúc vòng lặp `for`), mỗi câu lệnh BẮT BUỘC nằm trên một dòng riêng. Cấm tuyệt đối kiểu `a = false; b = false; publishState()` hay `dialog.dismiss(); openGame(x)`.
2. **CẤM ép dòng dài / code-golf:** Giới hạn độ dài dòng tối đa **120 ký tự** (trừ URL hoặc chuỗi tài nguyên bất khả kháng). Xuống dòng, thụt lề 4 spaces chuẩn Kotlin Official Style Guide / Prettier, **có dòng trống ngăn cách** rõ ràng giữa các hàm và các khối logic.
3. **Giới hạn kích thước & độ phức tạp:**
   - **Mỗi file:** mục tiêu **≤ 300–350 dòng**. Nếu file hiện hữu đã vượt ngưỡng (vd: `AdManager.kt`, `GameListActivity.kt`, `GameActivity.kt`, `gameTester.ts`), **KHÔNG ĐƯỢC nhét thêm logic mới vào làm phình thêm** — phải tách class/component mới có trách nhiệm đơn lẻ (SRP) hoặc báo cáo kế hoạch tách file trước khi sửa.
   - **Mỗi hàm:** mục tiêu **≤ 40–50 dòng**, lồng tối đa **3 cấp** (`if`/`when`/`for`); ưu tiên **early return (guard clauses)** và đặt tên hàm/biến nói rõ ý định nghiệp vụ.
4. **Tách biệt UI và Logic nghiệp vụ:**
   - **CẤM** dựng cây View/Dialog phức tạp trực tiếp bằng code Kotlin (`LinearLayout`, `GradientDrawable`, `Color.parseColor("#...")`, phép tính `dp` cứng) bên trong Manager hoặc Activity. Mọi UI phải nằm trong **XML Layout / Jetpack Compose** dùng `@color`, `@dimen`, `@string`, `@style`.
5. **Comment & Log chuẩn kỹ sư:**
   - Tiếng Việt trong comment và tài liệu **BẮT BUỘC có dấu đầy đủ, đúng chính tả, không dính chữ**.
   - **CẤM** đặt comment sáo rỗng trên các callback rỗng (`/** Callback không dùng */`).
   - Mọi log debug (`Log.d`, `Log.i`, `Log.v`) BẮT BUỘC bọc `BuildConfig.DEBUG` và không bao giờ ghi PII, token hay secret.

### 2.2. Luật đúng chuẩn Logic, Lifecycle, Threading & Security
1. **Đúng chuẩn Lifecycle Android:** Trước khi hiển thị `Dialog`, `FullScreenContent` (Interstitial/Rewarded/AppOpen) hoặc đụng vào UI sau tác vụ bất đồng bộ (`postDelayed`, coroutine, network callback), BẮT BUỘC kiểm tra `!isFinishing && !isDestroyed` **VÀ** `lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED)` (khi cần hiển thị foreground UI/Ads). Mọi `Handler`/`Job`/listener gắn với `Activity` phải được hủy sạch trong `onStop`/`onDestroy`.
2. **Không bao giờ chạy I/O nặng trên Main Thread:** Đọc/ghi file, giải nén, xóa thư mục (`deleteRecursively`), parse JSON lớn, truy vấn DB phải chạy trên `Dispatchers.IO`.
3. **Bắt lỗi tường minh & An toàn đồng thời (Concurrency):** Mọi đường dẫn có thể ném ngoại lệ kiểm soát được (`SecurityException`, `IOException`, JSON/IPC) phải có xử lý fallback rõ ràng, không nuốt lỗi im lặng và không làm crash UI. Mọi trạng thái chia sẻ giữa `JavaBridge`/background/Main thread phải thread-safe (dùng `StateFlow`, `Atomic*`, `Mutex` hoặc Room transaction).
4. **An toàn WebView & Backend:** Không chèn dữ liệu ngoài/dynamic chưa escape vào JS (`evaluateJavascript`) hay HTML `<script>`; mọi đường dẫn file phải canonicalize & kiểm tra prefix; cấm hardcode secret/JWT fallback.

### 2.3. Luật Kiến trúc & Báo cáo Refactor Bắt Buộc (Architecture Governance)
1. **Tuân thủ Clean MVVM & Single Responsibility (SRP):**
   - **CẤM tạo thêm Global Mutable Singleton (`object`)** chứa trạng thái nghiệp vụ phức tạp hoặc truy cập Service Locator `GameApplication.instance` trong code mới.
   - Mọi tính năng/màn hình mới BẮT BUỘC tách theo luồng **UI (Activity/Compose mỏng) → ViewModel (`StateFlow`) → Repository / Coordinator (constructor injection)** để có thể viết Unit Test bằng fake/mock mà không cần Android runtime.
   - **CẤM copy-paste lặp lại state machine** (như sao chép logic load/cache/retry cho nhiều loại Ads); bắt buộc trừu tượng hóa dùng chung.
   - **CẤM dùng Java Reflection** truy cập field/method private của AndroidX/Android SDK trừ khi có ADR được User phê duyệt.
2. **Bắt buộc Kiểm tra & Báo cáo Yêu cầu Refactor Kiến trúc:**
   - Trước và sau mỗi task chỉnh sửa mã nguồn, AI Agent BẮT BUỘC đánh giá xem phần code chạm tới có nợ kiến trúc (God Class, thiếu ViewModel, trùng lặp state, vi phạm thread/lifecycle, dead code) hay không.
   - Nếu phát hiện yêu cầu refactor kiến trúc **vượt phạm vi task hiện tại**, Agent **KHÔNG được tự ý chắp vá thêm nợ kỹ thuật và cũng không tự ý đập viết lại ngoài phạm vi**, mà **BẮT BUỘC ghi rõ đề xuất refactor (vị trí, nguyên nhân, phương án, rủi ro)** trong câu trả lời cho User (và cập nhật vào báo cáo audit/backlog) để User quyết định ưu tiên.
3. **Cổng Self-Review Bắt Buộc trước khi báo DONE:**
   - Trước khi trả lời hoàn thành, Agent phải tự soát toàn bộ `git diff` theo 5 câu hỏi: *(1) Dev mới vào đọc có hiểu ngay không? (2) Còn dòng nào nén `;`, vượt 120 ký tự, hay hàm quá dài không? (3) Có lỗi biên về lifecycle/threading/null/exception không? (4) Có làm phình God Class hay sinh thêm Singleton/copy-paste không? (5) Build, Lint, Unit Test đều xanh thật sự chưa?*

---

## 3. PHÂN CÔNG VAI TRÒ CÁC AGENT

| Agent ID | Tên Vai Trò | Nhiệm Vụ Trọng Tâm |
| :---: | :--- | :--- |
| **Agent 0** | **ORCHESTRATOR (Bộ não)** | Phân tích yêu cầu, chia Task Graph, điều phối và kiểm soát trạng thái toàn bộ dự án. |
| **Agent 1** | **ARCHITECT** | Thiết kế kiến trúc tổng thể, mô hình dữ liệu, API contracts, ADRs, kiểm soát nợ kiến trúc. |
| **Agent 2** | **BACKEND** | Xây dựng API, CMS Server, Database Migrations, Auth, Cloudflare Storage trên cổng 6033. |
| **Agent 3** | **FRONTEND / ANDROID** | Phát triển ứng dụng Android Kotlin Native Shell bọc 419 game HTML5 (100 bundled + 319 R2), Web Admin CMS. |
| **Agent 5** | **PAYMENT** | Tích hợp Google Play Billing 9.1.0, xử lý gói Subscription & khôi phục gói Legacy "Remove Ads". |
| **Agent 6** | **TESTER** | Viết Unit Test, Integration Test, Playwright UI Test, ADB Test Suite. |
| **Agent 7** | **FIXER** | Phân tích root cause từ bug reports và sửa lỗi triệt để, không vá tạm kiểu vibe code. |
| **Agent 8** | **REVIEWER** | Đánh giá chất lượng mã nguồn, kiến trúc, tuân thủ Luật Cứng Mục 2 và chuẩn convention. |
| **Agent 9** | **SECURITY** | Rà soát lỗ hổng, vá cleartext traffic, gia cố WebView Sandbox, bảo vệ IAP & Backend Auth. |
| **Agent 10** | **DEVOPS** | Thiết lập Docker, scripts chạy kiểm thử, quy trình release & rollback. |
| **Agent 11** | **DESIGNER** | Quản lý Design Tokens, High-Fidelity UI, Dark/Light mode theme, Visual QA. |
| **Agent 12** | **DOCUMENTATION** | Cập nhật tài liệu kỹ thuật, API docs, Swagger, Changelog. |
