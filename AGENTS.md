# AGENTS.md - HIẾN PHÁP DỰ ÁN DÀNH CHO AI AGENT
**Dự án:** NextAI Game Offline - Multi-Game Platform (`com.nextai.gameoffline`)  
**Tiêu chuẩn:** Development Workspace Standard V2.1 (Design-Gated + APK-to-Full-Stack Reconstruction)

---

## 1. QUY TẮC CỐT LÕI (MANDATORY RULES)

Mọi AI Agent tham gia dự án BẮT BUỘC phải đọc và tuân thủ các quy tắc sau trước khi thực hiện bất kỳ thao tác nào:

1. **Thứ tự đọc bắt buộc khi bắt đầu:**
   - Đọc `README.md`
   - Đọc `AGENTS.md` (Tài liệu này)
   - Đọc `Docs/rules.md`
   - Đọc `PROJECT_MEMORY.md` và `UPDATETODOS.md`
   - Đọc Architecture & Specs liên quan đến task được giao.
   - Kiểm tra `.ai/locks.json` và `.ai/state.json`.

2. **Quy định về Code & Ngôn ngữ:**
   - **Mã nguồn Android:** Chuyển đổi toàn bộ từ Java decompile sang **Kotlin hiện đại** (Coroutines, Flow, Jetpack Compose, XML ViewBinding, Room ORM, WebView Bridge).
   - **Package Name mới:** `com.nextai.gameoffline` (Tên thương hiệu: **NextAI Technology / NextSolution**).
   - **Mã nguồn Backend:** Dùng **TypeScript (Node.js)** và **Golang**, phục vụ API và Admin CMS trên **Port 6033**.
   - **Chú thích mã nguồn:** Mọi class, method, logic phức tạp **BẮT BUỘC có comment song ngữ Tiếng Việt + Tiếng Anh (Bilingual Comments)**.

3. **Nguyên tắc File Lock & Ownership:**
   - Kiểm tra `.ai/locks.json` trước khi chỉnh sửa bất kỳ tệp nào.
   - Không can thiệp vào các tệp đang bị lock bởi Agent khác mà không có sự phê duyệt của **Agent 0 (Orchestrator)**.

4. **Nguyên tắc Testing & Quality Gate:**
   - **TUYỆT ĐỐI KHÔNG** sửa đổi test để làm xanh giả tạo (Do not alter tests to fake pass).
   - Mọi task chỉ được coi là `DONE` khi vượt qua toàn bộ Quality Gate (Build, Lint, Typecheck, Unit Test, Visual QA, Review).

5. **Bộ nhớ vận hành (Operational Memory):**
   - Cập nhật tiến độ vào `TASK_LOG.md` và `UPDATETODOS.md` sau mỗi mốc hoàn thành.
   - Các thông tin cần người dùng cung cấp (API Keys, Ads IDs, Store Credentials) phải ghi vào `Tasksrequiring.md`.

---

## 2. PHÂN CÔNG VAI TRÒ CÁC AGENT

| Agent ID | Tên Vai Trò | Nhiệm Vụ Trọng Tâm |
| :---: | :--- | :--- |
| **Agent 0** | **ORCHESTRATOR (Bộ não)** | Phân tích yêu cầu, chia Task Graph, điều phối và kiểm soát trạng thái toàn bộ dự án. |
| **Agent 1** | **ARCHITECT** | Thiết kế kiến trúc tổng thể, mô hình dữ liệu, API contracts, ADRs. |
| **Agent 2** | **BACKEND** | Xây dựng API, CMS Server, Database Migrations, Auth, Cloudflare Storage trên cổng 6033. |
| **Agent 3** | **FRONTEND / ANDROID** | Tái dựng ứng dụng Android Kotlin Native Shell bọc 423 game HTML5, Web Admin CMS. |
| **Agent 5** | **PAYMENT** | Tích hợp Google Play Billing 8.x, xử lý gói Non-Consumable "Remove Ads". |
| **Agent 6** | **TESTER** | Viết Unit Test, Integration Test, Playwright UI Test, ADB Test Suite. |
| **Agent 7** | **FIXER** | Phân tích root cause từ bug reports và sửa lỗi trong phạm vi cho phép. |
| **Agent 8** | **REVIEWER** | Đánh giá chất lượng mã nguồn, kiến trúc, tuân thủ chuẩn convention. |
| **Agent 9** | **SECURITY** | Rà soát lỗ hổng, vá cleartext traffic, gia cố WebView Sandbox, bảo vệ IAP. |
| **Agent 10** | **DEVOPS** | Thiết lập Docker, scripts chạy kiểm thử, quy trình release & rollback. |
| **Agent 11** | **DESIGNER** | Quản lý Design Tokens, High-Fidelity UI, Dark/Light mode theme, Visual QA. |
| **Agent 12** | **DOCUMENTATION** | Cập nhật tài liệu kỹ thuật, API docs, Swagger, Changelog. |
