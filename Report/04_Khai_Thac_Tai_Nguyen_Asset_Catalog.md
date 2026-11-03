# BÁO CÁO 04: KHAI THÁC TÀI NGUYÊN & ASSET CATALOG TÁI SỬ DỤNG
**Dự án:** Offline Games: No WiFi Games (`com.media720.games2020`)  
**Mục tiêu:** Trả lời chi tiết Yêu cầu 8 và 17 trong `readme.txt`.

---

## 1. Tổng Thể Tài Nguyên Đã Trích Xuất Được

Đội ngũ phân tích đã giải nén và cấu trúc toàn bộ kho tài nguyên khổng lồ từ APK gốc vào các thư mục làm việc chuyên biệt:

```
e:\DECOMPILER\Game\com.media720.games2020\
├── GAME HTML\                  --> 423 Mini-Game HTML5/WASM hoàn chỉnh có thể chạy độc lập
├── Redesign\                   --> Design Tokens, Bảng màu, Chuỗi đa ngôn ngữ, Layouts
├── Demo Data\                  --> 15 tệp dữ liệu CSV, Database SQLite, SQL Schema & Queries
└── apktool_out\                --> Toàn bộ Resources nguyên bản (Drawables, Mipmaps, Values, XML)
```

---

## 2. Chi Tiết Kho Mini-Game HTML5 / WASM (423 Game)

Toàn bộ 423 mini-game trong thư mục `GAME HTML/` là các Web App độc lập, chứa đầy đủ:
- `index.html`: File khởi chạy webview.
- `c3runtime.js` / `phaser.min.js`: Engine game xử lý vật lý và tương tác.
- `physics.wasm` / `box2d.wasm`: Động cơ vật lý WebAssembly siêu mượt.
- `media/` / `sounds/`: Toàn bộ âm thanh hiệu ứng (.ogg, .mp3, .wav).
- `images/` / `sprites/`: Sprite sheets, Texture atlases chất lượng cao.

### 2.1. Phân Loại Danh Mục Mini-Game

| Danh Mục | Số Lượng Game | Đại Diện Tiêu Biểu | Công Nghệ Engine |
| :--- | :---: | :--- | :--- |
| **Logic & Puzzle (Giải đố)** | 145 game | `block_blast`, `water_sort`, `nuts_and_bolts`, `tangram_puzzle`, `pipe_connect`, `twenty48` | Scirra Construct 3 + WebAssembly Box2D |
| **2 Players (Chơi 2 người)** | 38 game | `chess`, `checkers`, `ludo`, `tic_tac_toe`, `air_hockey`, `reversi_2`, `sea_battle` | Phaser Canvas + Minimax AI Engine |
| **Classic & Board Games** | 52 game | `solitaire_classic`, `spider_solitaire`, `mahjong_classic`, `minesweeper`, `dominoes` | Pure JavaScript DOM + Canvas 2D |
| **Arcade & Action (Phản xạ)**| 98 game | `knife_hit`, `fruit_slice`, `bubble_shooter`, `geometry_rash`, `arrow_shooter` | Construct 3 Canvas 60 FPS |
| **Casual & Match-3** | 90 game | `candy_match_saga_2`, `three_tiles`, `tile_master_match`, `cube_merge_2248` | HTML5 Canvas + Web Audio API |

---

## 3. Tài Nguyên Đồ Họa & Âm Thanh Có Thể Dùng Lại 100%

1. **Biểu tượng Mini-Game (Icons / Thumbnails):**
   - Đã trích xuất đầy đủ 423 ảnh vuông thumbnail kích thước 512x512 PNG độ nét cao trong `GAME HTML/icons/` và `apktool_out/res/drawable-*/`.
2. **Âm Thanh & Nhạc Nền (Sound Effects & BGM):**
   - Hơn 3.500 file audio `.ogg` và `.mp3` chất lượng cao (tiếng click, nổ bong bóng, chiến thắng, cờ úp, rơi khối...).
3. **Phông Chữ (Fonts):**
   - Bộ phông game chữ số và typography tùy biến nằm trong `GAME HTML/fonts/` và `apktool_out/res/font/`.
4. **Bản Dịch Đa Ngôn Ngữ (Localization Strings):**
   - `apktool_out/res/values-*/strings.xml` chứa bản dịch hoàn chỉnh hơn 100 ngôn ngữ (Anh, Việt, Pháp, Đức, Tây Ban Nha, Nhật, Hàn, Trung, Nga, Ả Rập...).

---

## 4. Tài Nguyên Dành Cho Thiết Kế Lại (Thư Mục `Redesign/`)

Đã xuất đầy đủ thông số sang thư mục `Redesign/` để lập trình viên UI/UX tái dựng giao diện mới:
- **`Redesign/colors.xml`**: Hệ thống 150+ mã màu hex nguyên bản (Primary, Accent, Background, Card, Badge).
- **`Redesign/design_tokens.json`**: Token thiết kế JSON gồm Typography, Spacing, Radius, Shadow, Grid 2 columns.
- **`Redesign/strings.xml`**: Toàn bộ chuỗi nhãn menu, tiêu đề game, popup thông báo.
- **`Redesign/layouts/`**: Toàn bộ cấu trúc XML Layout của màn hình chính, item game card, paywall banner.
