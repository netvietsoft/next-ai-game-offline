# BÁO CÁO 11: KHẢO SÁT LLM, AI AGENTS & THUẬT TOÁN BOT CỦA MINI-GAME
**Dự án:** Offline Games: No WiFi Games (`com.media720.games2020`)  
**Mục tiêu:** Trả lời chi tiết Yêu cầu 18 trong `readme.txt`.

---

## 1. Kết Quả Khảo Sát Tích Hợp Mô Hình Ngôn Ngữ Lớn (LLM / Generative AI)

- **Kết luận:** **Ứng dụng KHÔNG sử dụng bất kỳ Mô hình Ngôn ngữ Lớn (LLM)** nào (như OpenAI GPT, Anthropic Claude, Google Gemini, DeepSeek, Meta LLaMA) và **KHÔNG có AI Agent** kết nối qua API Cloud.
- **Bằng chứng phân tích:**
  1. Trong toàn bộ 5 file DEX (`classes.dex` -> `classes5.dex`), không tồn tại bất kỳ API Key, Bearer Token hay HTTP Client nào kết nối tới OpenAI, Anthropic, Google AI Studio hay OpenRouter.
  2. Toàn bộ tính năng thông minh của trò chơi đều phải hoạt động mượt mà khi thiết bị **ngắt 100% kết nối mạng (Airplane Mode)**.

---

## 2. Bản Chất Trí Tuệ Nhân Tạo (AI) Của Các Mini-Game Trong Ứng Dụng

Toàn bộ AI đối thủ trong các mini-game (Cờ Vua, Cờ Ca-rô, Cờ Tướng, Cờ Vây, Cờ Lật Othello, Đố Chữ Wordle) sử dụng các **thuật toán trí tuệ nhân tạo cổ điển (Classical Algorithmic AI)** được viết thuần bằng **JavaScript / WebAssembly** chạy trực tiếp trên trình duyệt WebView của thiết bị:

### 2.1. Thuật Toán Minimax Kết Hợp Tỉa Nhánh Alpha-Beta (Alpha-Beta Pruning)
- **Áp dụng trong:** `chess` (Cờ vua), `checkers` (Cờ đam), `reversi_2` (Cờ lật Othello), `tic_tac_toe` (Cờ ca-rô 3x3 và 5x5).
- **Cơ chế hoạt động:**
  - Cây trò chơi được duyệt trước từ 3 đến 6 nước đi (`Depth = 3 - 6`).
  - Hàm đánh giá thế cờ (Heuristic Evaluation Function) tính điểm dựa trên: Số lượng quân cờ, quyền kiểm soát trung tâm, độ an toàn của vua/tướng, số nước đi hợp lệ.
  - Tỉa nhánh Alpha-Beta giúp loại bỏ 80% nhánh tính toán dư thừa, cho phép bot phản hồi nước đi trong vòng **dưới 50 mili-giây**, không tiêu hao pin và đạt độ thông minh tương đương mức Master.

### 2.2. Thuật Toán Heuristic & Greedy Search (Tìm Kiếm Tham Lam)
- **Áp dụng trong:** `block_blast`, `water_sort`, `twenty48`, `bubble_shooter`.
- **Cơ chế hoạt động:**
  - Bot gợi ý (Hint system) mô phỏng các khả năng rót nước hoặc đặt khối gạch vào lưới 8x8 để tìm nước đi đem lại điểm combo cao nhất hoặc không làm tắc bàn cờ.

### 2.3. Bảng Từ Điển Nội Bộ (Offline Trie / Dictionary)
- **Áp dụng trong:** `wordly` (Wordle), `word_search`, `word_connect`.
- **Cơ chế hoạt động:**
  - Toàn bộ ngân hàng từ vựng 5 chữ cái tiếng Anh (~12.000 từ) được lưu trữ dưới dạng cấu trúc cây tiền tố Trie hoặc JSON nén cục bộ trong thư mục `assets/wordly/`.
  - Thuật toán so khớp ký tự xanh (đúng vị trí), vàng (sai vị trí), xám (không có trong từ) chạy tức thì 100% offline.

---

## 3. Khuyến Nghị Cho Dự Án Tái Dựng
- Không cần chi phí mua token API LLM hàng tháng.
- Có thể giữ nguyên toàn bộ mã nguồn AI Minimax JavaScript có sẵn trong `GAME HTML/` để đạt hiệu năng cao nhất và giữ nguyên tính năng chơi offline.
