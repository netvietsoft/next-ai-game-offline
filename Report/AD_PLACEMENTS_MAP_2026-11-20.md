# BẢN ĐỒ TOÀN DIỆN CÁC KHU VỰC & VỊ TRÍ ĐẶT QUẢNG CÁO (ADMOB + META MEDIATION)

**Dự án:** Galaxy Game / NextAI Game Offline (`com.nextai.game.offline`)  
**Ngày kiểm kê:** 2026-11-20  
**Phạm vi kiểm chứng:** Toàn bộ Android Native Shell + **419 mini-game** (`100` game đóng gói sẵn trong APK + `319` game tải qua Cloudflare R2) đối chiếu trực tiếp với dữ liệu GA4 thực tế (`GA4/data/csv/games_performance.csv` — `16,856.2 phút` chơi có tên game, `52,492` lượt mở game, `189,562+` lượt bắt đầu màn).

---

## 0. TỔNG QUAN 6 AD UNIT ID PRODUCTION HIỆN CÓ

Nguồn: [AdConstants.kt](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/ads/AdConstants.kt)

| Định dạng AdMob | Production Ad Unit ID | Trạng thái hiện tại | Ghi chú quan trọng |
| :--- | :--- | :---: | :--- |
| **Banner** (Collapsible Bottom) | `ca-app-pub-4108090245719282/4579664323` | **ĐANG CHẠY** | Chạy ở Trang chủ (`GameListActivity`) & **371/419** game dọc (Portrait). Tự ẩn trên **48** game ngang (Landscape) & VIP. |
| **Interstitial** | `ca-app-pub-4108090245719282/3500572281` | **ĐANG CHẠY (THIẾU CHỖ)** | Đã có màn đệm `Loading Ad… 700ms`, preload sau `3s`, cap `90s` + `2` thao tác. Nhưng **chưa nối `levelLose` / `levelRestart` / Thoát game**, và bị chặn kép `eachNLevels = 3` ở game gọi trực tiếp. |
| **Rewarded Video** | `ca-app-pub-4108090245719282/7458098782` | **ĐANG CHẠY 14/71 GAME** | **Phát hiện lớn:** có tới **57 game Construct 3** (10 bundled + 47 R2) đã có sẵn nút gọi `showRewardedVideo`, nhưng đang bị [RewardCallbackResolver.kt](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/game/RewardCallbackResolver.kt) từ chối (`null` → Toast *"Reward unavailable"*). |
| **App Open** | `ca-app-pub-4108090245719282/3518853778` | **MỚI CÓ COLD LAUNCH** | Chỉ chạy ở `SplashAdActivity` (từ lần mở app thứ 3). **Chưa chạy khi quay lại app từ nền (Foreground Resume).** |
| **Native Ad** | `ca-app-pub-4108090245719282/8178183893` | **BỎ TRỐNG 100%** | Đã có Production ID nhưng chưa gắn bất kỳ vị trí nào trong app. |
| **Rewarded Interstitial** | `ca-app-pub-4108090245719282/5743592246` | **BỎ TRỐNG 100%** | Chỉ nên dùng nếu thiết kế màn thông báo đếm ngược tự nguyện trước thưởng (không ép tự động). |

---

## 1. KHU VỰC NATIVE APP SHELL (NGOÀI MÀN CHƠI GAME)

| Mã | Khu vực / Màn hình | Vị trí & Thời điểm kích hoạt | Loại Ads | Trạng thái | Mức độ hợp lý & Rủi ro |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **S1** | **Splash Cold Launch** ([SplashAdActivity.kt](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/splash/SplashAdActivity.kt)) | Mở app từ trạng thái tắt (từ lần mở thứ 3, timeout 2.5s) | App Open | **ĐÃ CÓ** | Hợp lý, giữ nguyên. Không ép lần mở 1–2 để bảo vệ giữ chân (D1 retention). |
| **S2** | **Quay lại App từ nền** (Foreground Resume) | Người chơi ẩn app đi việc khác (≥ 30–60s) rồi mở lại app (trừ lúc đang ở Splash / Paywall / đang hiện Ad khác) | App Open | **CHƯA CÓ** | **Rất nên đặt.** Chuẩn AdMob Official cho App Open; tránh hiện nếu vừa rời app < 30s hoặc vừa tắt Interstitial < 90s. |
| **S3** | **Đáy Trang chủ** ([GameListActivity.kt](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/gamelist/GameListActivity.kt)) | Neo đáy màn hình danh sách game (`collapsible = "bottom"` + vạch ngăn 3dp) | Banner | **ĐÃ CÓ** | Đã chuẩn Google AdMob, giữ nguyên. |
| **S4** | **In-Feed giữa lưới 419 game** ([GameAdapter.kt](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/gamelist/GameAdapter.kt)) | Chèn thẻ Native toàn chiều ngang (`spanSize = 2`) sau mỗi **6–8 hàng** (12–16 game) khi cuộn lưới danh mục | **Native Ad** | **CHƯA CÓ** | **Rất hợp lý.** Khai thác ID Native đang bỏ không; bắt buộc nhãn `"Ad"` rõ ràng, tách biệt card game để không vi phạm click nhầm. |
| **S5** | **Hộp thoại tải game R2** ([dialog_game_download.xml](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/res/layout/dialog_game_download.xml)) | Hiển thị ngay dưới thanh `ProgressBar` trong lúc chờ tải 319 game từ Cloudflare R2 (vài giây–chục giây) | **Native Ad** (Compact) | **CHƯA CÓ** | **Rất hợp lý.** Người chơi đang rảnh mắt chờ tải; tách xa nút `Play Now` / `Close` ≥ 16dp. |
| **S6** | **Bấm mở Game từ Trang chủ** (`GameListActivity.openGame`) | Khi nhấn vào 1 game đã cài để chuyển vào `GameActivity` (tôn trọng cap 90s + 2 actions + đệm 700ms) | Interstitial | **ĐÃ CÓ** | Hợp lý, giữ nguyên. Lưu ý không hiện nếu ngay vừa xem App Open (< 90s). |
| **S7** | **Thoát Game về Trang chủ** (`GameActivity` Back press) | Khi bấm Back thoát từ `GameActivity` về `GameListActivity` **NẾU phiên chơi ≥ 60 giây** (vẫn qua cap 90s + đệm 700ms) | Interstitial | **CHƯA CÓ** | **Cực kỳ nên đặt.** Đây là nguồn doanh thu chính cho **66 game không có hook** (chiếm **32% tổng thời gian chơi**, gồm `ludo`, `pool_8_pro`, `chess`, `block_blast`, `uno`, `mahjong_deluxe`). |
| **S8** | **Hộp thoại xác nhận Thoát App** (`GameListActivity` Back press) | Bấm Back tại Trang chủ mở Dialog *"Thoát Galaxy Game?"* chứa thẻ Native ở trên, 2 nút *"Ở lại"* / *"Thoát"* rõ ràng ở dưới | **Native Ad** (Medium) | **CHƯA CÓ** | **Khá tốt** (nếu không dùng Interstitial thoát app — vì AdMob **CẤM** Interstitial khi thoát hẳn ứng dụng). |
| **S9** | **Màn hình Paywall / Settings** ([BillingActivity.kt](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/billing/BillingActivity.kt), `SettingsDialogController`) | Màn nâng cấp VIP & Cài đặt | **KHÔNG ĐẶT** | **ĐÚNG** | Tuyệt đối không đặt Ads ở màn mua hàng VIP hay Settings. |

---

## 2. PHÂN LOẠI TOÀN BỘ 419 GAME THEO VỊ TRÍ ĐẶT ADS BÊN TRONG GAME

Kết quả quét tĩnh toàn bộ **419 game** (xác minh SID thực tế trong Construct 3 `data.json`, JS bridge trực tiếp, SDK bên thứ 3) kết hợp dữ liệu GA4 thực tế:

| Thống kê tổng danh mục (419 game) | Tổng 419 | 100 Bundled | 319 R2 | Ý nghĩa đặt Ads |
| :--- | :---: | :---: | :---: | :--- |
| **Màn hình dọc (Portrait)** | **371** | 91 | 280 | Đủ điều kiện gắn **Bottom Collapsible Banner** trong `GameActivity` (đã chạy). |
| **Màn hình ngang (Landscape)** | **48** | 9 | 39 | **KHÔNG đặt Banner** (diện tích dọc hẹp, đè nút bấm). Chỉ dùng Interstitial (chuyển màn/thoát game) + Rewarded. |
| **Có `levelCompleteInGame` (Thắng màn)** | **327** | 52 | 275 | **ĐÃ NỐI** Interstitial (qua `eachNLevels = 3` + cap 90s). |
| **Có `levelLoseInGame` (Thua màn)** | **298** | 45 | 253 | **CHƯA NỐI Interstitial!** (GA4: **114,032** lượt thua toàn app!). |
| **Có `levelRestartInGame` (Chơi lại màn)** | **302** | 44 | 258 | **CHƯA NỐI Interstitial!** (GA4: **56,051+** lượt bấm chơi lại!). |
| **Gọi trực tiếp `showInterstitialInGame`** | **174** | 30 | 144 | **ĐÃ NỐI nhưng bị CHẶN KÉP** (`eachNLevels = 3` đè lên timer riêng của game!). |
| **Rewarded Video ĐANG CHẠY** | **14** | 5 | 9 | Đã allowlist trong `RewardCallbackResolver.kt`. |
| **Rewarded Video BỊ CHẶN (chưa allowlist)** | **57** | **10** | **47** | Game đã có sẵn nút xem Ads nhận thưởng, nhưng `RewardCallbackResolver` đang trả `null`! |
| **Chỉ có `scoreInGame` (không có level/inter)** | **4** | 4 | 0 | `merge_dice`, `magic_candy`, `lines98`, `drop_n_merge`. Không bắn ads theo `scoreInGame` (tránh gián đoạn khi đang ghi điểm); dùng Exit Interstitial + Banner. |
| **Không có bất kỳ Bridge Hook nào (Zero-Hook)** | **66** | 32 | 34 | Chiếm **32.0% tổng thời gian chơi** (`5,389.9 / 16,856.2 phút`). Cần **Exit-Game Interstitial** (+ nối chọn lọc `game_end`/`gameOver` cho top game như `ludo`, `pool_8_pro`). |

### Phân bổ theo 5 Danh mục (Category)

| Danh mục | Tổng (Bundled / R2) | Dọc / Ngang | Có Inter trực tiếp | Có Thắng / Thua / Chơi lại | Rewarded Đang chạy / Bị chặn | Zero-Hook |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Casual** | 249 (55 / 194) | 213 / 36 | 92 | 201 / 182 / 184 | 8 / **28** | 38 |
| **Puzzle** | 111 (19 / 92) | 110 / 1 | 55 | 93 / 85 / 88 | 4 / **22** | 9 |
| **Arcade** | 28 (8 / 20) | 25 / 3 | 14 | 20 / 20 / 19 | 1 / **5** | 7 |
| **Classic** | 18 (10 / 8) | 15 / 3 | 9 | 9 / 7 / 8 | 1 / **2** | 6 |
| **2 Players** | 13 (8 / 5) | 8 / 5 | 4 | 4 / 4 / 3 | 0 / 0 | **7** |

---

## 3. CHI TIẾT 5 NHÓM ĐIỂM ĐẶT ADS TRONG GAME

### Nhóm A — Điểm dừng Thua màn (`levelLoseInGame`) & Chơi lại (`levelRestartInGame`): **~300 game (CHƯA NỐI)**

Trong [AndroidGameBridge.kt](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/game/AndroidGameBridge.kt), hiện chỉ có `levelCompleteInGame` gọi `onShowInterstitialAdRequested()`, còn `levelLoseInGame` (dòng 136) và `levelRestartInGame` (dòng 152) chỉ ghi log Analytics.

Số liệu GA4 thực tế cho thấy **tỷ lệ điểm dừng bị bỏ lỡ cực lớn** trên chính các game nhiều người chơi nhất:

| Game | Thắng (`W`) | Thua (`L`) | Chơi lại (`R`) | % điểm dừng đang bỏ lỡ |
| :--- | :---: | :---: | :---: | :---: |
| `burger_run` | 525 | **5,181** | **1,906** | **93.1%** |
| `green_prickle` | 68 | **769** | **727** | **95.7%** |
| `trap_path` | 109 | **1,148** | 0 | **91.3%** |
| `disk_throw` | 67 | 0 | **611** | **90.1%** |
| `draw_parking` | 208 | **349** | **905** | **85.8%** |
| `apple_worm` | 343 | **560** | **856** | **80.5%** |
| `pipe_rush` | 585 | **1,030** | **989** | **77.5%** |
| `dot_shot` | 119 | **200** | **182** | **76.2%** |
| `ball_escape` | 108 | **110** | **209** | **74.7%** |
| `master_fall_down` | 393 | **392** | **495** | **69.3%** |
| `cut_for_cat` | 457 | **755** | **178** | **67.1%** |
| `block_fit_puzzle` | 424 | **423** | **207** | **59.8%** |

- **Đề xuất vị trí:** Nối cả `levelLoseInGame` và `levelRestartInGame` vào `GameAdSessionController` (dùng chung bộ đếm natural break hoặc ngưỡng 2–3 lần thua/chơi lại), **VẪN đi qua cổng `90 giây` + `2 thao tác` + màn hình đệm `Loading Ad… 700ms`** nên không bao giờ spam khi người chơi thua liên tục trong 10 giây.
- **Chi phí kỹ thuật:** Rất thấp (chỉ sửa Native Kotlin, **0 sửa file game**, **0 re-upload R2**).

---

### Nhóm B — Rewarded Video trong game: **14 game đang chạy + 57 game BỊ CHẶN**

#### B1. 14 game đã allowlist trong `RewardCallbackResolver.kt` (Đang hoạt động)
- **5 Bundled:** `bee` (`GiveRewarded`), `cryptogram` (`RewardedComplete`), `pao_pao` (`add_hint`/`add_shuffle`/`shuffle_popup`), `water_sort` (`watchAdsAdsGlassComplete`), `yellow_dot` (`GiveRewarded`).
- **9 R2:** `build_land` *(lưu ý: còn rủi ro kẹt UI khi no-fill nếu không có nhánh reject)*, `color_by_number`, `coloring_book`, `cowboy_shoot`, `golf_pin`, `jacko_gunner`, `jigsaw_puzzle`, `solitaire_tripeaks` (`Money`, `SpinWheel`), `tile_master_match`.

#### B2. 57 game Construct 3 ĐÃ CÓ SẴN nút Rewarded nhưng đang bị chặn bởi `RewardCallbackResolver.kt`
Tất cả 57 game này đều chạy `Android[t.name_event](t.param)` gọi `Android.showRewardedVideo(...)` khi người chơi bấm nút nhận thưởng/hồi sinh/gợi ý/skip màn, nhưng hiện bị trả về `Toast("Reward unavailable for this game")`:

- **10 game Bundled (đều dùng chuẩn `c3_callFunction("RewardedComplete")`, lưu lượng GA4 cao):**
  1. `block_tetris` (**563.1 phút**, 63 lượt mở)
  2. `apple_worm` (**491.1 phút**, 180 lượt mở)
  3. `ball_escape` (**231.0 phút**, 134 lượt mở)
  4. `solitaire_associations` (**203.9 phút**, 34 lượt mở)
  5. `knife_hit_2` (**185.7 phút**, 101 lượt mở)
  6. `block_connect` (**170.8 phút**, 66 lượt mở)
  7. `knife_hit` (**163.2 phút**, 115 lượt mở)
  8. `trap_path` (**160.7 phút**, 42 lượt mở)
  9. `nuts_and_bolts_sort` (**151.3 phút**, 53 lượt mở)
  10. `shooting_balls` (**123.8 phút**, 38 lượt mở)
- **40 game R2 dùng chuẩn `c3_callFunction("RewardedComplete")`:**
  `arcane_blocks`, `archers_random`, `block_builder`, `block_matcher`, `bus_jam_escape`, `car_traffic_puzzle`, `coin_sort`, `color_nuts`, `doge_blocks`, `doge_love`, `draw_to_pee`, `draw_to_smash`, `food_jam`, `fruits_match_2`, `impostor_red` *(cần QA hàm đích)*, `juice_merge`, `kingdom_survivor`, `knit_bear`, `knit_rescue`, `marble_legends`, `match_emoji`, `meow_merge`, `mr_bullet`, `nuts_and_bolts`, `onet_fish_2`, `save_the_doge`, `screw_pin`, `sheep_and_sheep`, `sleeping_animal`, `slice_it_up`, `slide_block_puzzle`, `summer_maze`, `switch_off`, `tap_arrow_away`, `tap_away`, `ten_master`, `theos_time_puzzle`, `tower_war`, `traffic_parking`, `zig_zag_warp`.
- **7 game R2 có nhiều nút Rewarded / tên callback riêng (cực giàu vị trí đặt Rewarded):**
  - `sandy_balls` (**5 nút Rewarded**): `RewardedCompleteSkip` (bỏ qua màn), `RewardedDoubleCoin` (x2 xu), `RewardedAddCoin` (nhận xu), `RewardedClaimCar` (nhận xe), `RewardedClaimKey` (nhận chìa khóa).
  - `mahjong_solitaire` (**4 nút Booster**): `RewardedCompleteMagnet`, `RewardedCompleteFire`, `RewardedCompleteFlash`, `RewardedCompleteShuffle`.
  - `candy_match_saga_2` (**2 nút**): `RewardedComplete`, `RewardedComplete2`.
  - `unpuzzle_master` (**2 nút**): `RewardedComplete`, `RewardedComplete2`.
  - `brainrot_merge`, `labubu_merge`, `merge_fruits`: truyền `c3_callFunction("ShowRewardedVideo")` *(cần QA kiểm tra tên hàm thưởng thật trong runtime trước khi bật allowlist)*.

> **Quan trọng về bảo mật & trải nghiệm:** Chỉ mở allowlist **chính xác theo từng game và tên hàm cố định** trong `RewardCallbackResolver.kt` (không bao giờ `eval` chuỗi tự do từ WebView), và **QA từng game cả 2 nhánh: xem xong (nhận đúng 1 lần thưởng) + no-fill/đóng sớm (không treo UI, không trao thưởng nhầm)**.

---

### Nhóm C — Game gọi trực tiếp `showInterstitialInGame` (**174 game**: 30 Bundled + 144 R2)

- Gồm **9 game gọi JS trực tiếp**: Bundled `tic_tac_toe` (421 phút), `uno_vertical` (313 phút — cuối ván `endRound`), `solitaire_spider` (135 phút), `memory_match` (97 phút), `solitaire_classic` (46 phút), `hexa_merge` (24 phút — C3 adapter); R2 `among_us` (`GameOver`), `angry_heroes` (`RevealLiveHearts`), `color_by_number`.
- Và **165 game Construct 3** gọi `js_event_string("showInterstitialInGame", ...)` theo timer/hết ván riêng (`burger_run`, `amaze_ball_quest`, `find_number`, `block_tetris`, `pipe_rush`, `knife_hit`, `knife_hit_2`, `brick_breaker_retro`, `solitaire_associations`, v.v.).
- **Vấn đề hiện tại:** `GameAdSessionController.onInterstitialRequested()` đang ép **tất cả** lời gọi `showInterstitialInGame` phải cộng dồn `levelCountPlayed++ >= eachNLevels (3)` trước khi gọi `AdManager`. Với game đánh theo ván dài (`uno_vertical`, `tic_tac_toe`, `solitaire_classic`, `solitaire_spider`), người chơi phải xong **3 ván đầy đủ** mới được hỏi hiển thị 1 lần!
- **Đề xuất:** Tách 2 luồng trong `GameAdSessionController`:
  - `onExplicitInterstitialRequested()` (cho `showInterstitialInGame` / `requestInterstitialAd`): gọi thẳng `AdManager.showInterstitialAd(...)` — đã có sẵn hàng rào **90s cooldown + 2 thao tác + màn đệm 700ms**.
  - `onLevelBreakRequested()` (cho `levelComplete` / `levelLose` / `levelRestart`): đếm ngưỡng `eachNLevels` (hoặc 2–3 break) + vẫn qua cổng 90s + đệm 700ms.

---

### Nhóm D — 66 Game "Zero-Hook" & 4 Game "Score-Only" (KHÔNG có điểm bắn Interstitial trong game)

Đây là nhóm đang **rơi rớt doanh thu lớn nhất theo thời gian chơi** (**32.0% tổng thời gian chơi GA4 = 5,389.9 phút**), tập trung chủ yếu ở các game **2 Players / Board / Classic / Endless**:

| Top Game Bundled Zero-Hook | Danh mục | Hướng | Lượt mở | Thời gian chơi | Banner hiện tại | Điểm đặt Ads đề xuất |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **`ludo`** (#1 app) | 2 Players | Dọc | 137 | **1,347.6 phút** | Có Banner | **Exit Interstitial (≥60s)** + nối có chọn lọc `gradle.event('game_end')`/`exitToMenu` (**CẤM** nối `dieClicked`!) |
| **`pool_8_pro`** (#4 app) | 2 Players | **NGANG** | 156 | **610.4 phút** | **0 Banner** | **Exit Interstitial (≥60s)** + nối `gameOver` / `restartGame` (hết ván bi-a) |
| **`chess`** (#10 app) | 2 Players | Dọc | 80 | **424.3 phút** | Có Banner | **Exit Interstitial (≥60s)** (không ngắt giữa ván cờ) |
| **`checkers`** (#13 app) | 2 Players | Dọc | 94 | **334.5 phút** | Có Banner | **Exit Interstitial (≥60s)** |
| **`block_blast`** (#14 app) | Puzzle | Dọc | 97 | **315.6 phút** | Có Banner | **Exit Interstitial (≥60s)** + cân nhắc nối Game Over / Play Again ở Phase sau |
| **`dominoes`** (#18 app) | Classic | Dọc | 68 | **268.9 phút** | Có Banner | **Exit Interstitial (≥60s)** + nối `endGame` |
| **`sea_battle`** (#19 app) | 2 Players | Dọc | 125 | **258.4 phút** | Có Banner | **Exit Interstitial (≥60s)** |
| **`mahjong_deluxe`** (#21) | Classic | **NGANG** | 35 | **250.1 phút** | **0 Banner** | **Exit Interstitial (≥60s)** + nối `gameOver` |
| **`uno`** | 2 Players | **NGANG** | 56 | **235.4 phút** | **0 Banner** | **Exit Interstitial (≥60s)** + nối `gameOver` |
| **`christmas`**, `indiara`, `screaming_chicken`, `drop_it`, `knife_shoot`, `goldblade`, `card_attack`, `backgammon` (Ngang), `snowball`, `earth_attack`, `twenty48`, `change_word`, `wordly`, `spades`, `circle_word`, `merge_2048`, `sudoku`, `dot_blast`, `solitaire`, `flapcat`, `reversi_2`, `skip_card`, `hexa_word` | Nhiều nhóm | 28 Dọc / 1 Ngang | 12–81 | 5–167 phút | Dọc có Banner | **Exit Interstitial (≥60s)** áp dụng tự động cho cả **419 game**! |
| **4 game Score-Only:** `merge_dice` (77m), `drop_n_merge` (63m), `lines98` (58m), `magic_candy` (26m) | Puzzle/Classic | Dọc | 24–66 | 26–77 phút | Có Banner | **Exit Interstitial (≥60s)** + Banner (**KHÔNG** bắn ads trên `scoreInGame`!). |

---

### Nhóm E — 5 Game có sẵn SDK quảng cáo bên thứ 3 chưa nối hoàn chỉnh

| Game | Nguồn | SDK phát hiện trong game | Khuyến nghị |
| :--- | :---: | :--- | :--- |
| `ludo` | Bundled | `gdsdk.showBanner()` gọi ở 3 chỗ (`button_pause`, `exitToMenu`, **`dieClicked`**) + `gradle.event('game_end')` | **KHÔNG** shim mù quáng `gdsdk.showBanner()` vì dòng `1679` gọi ngay lúc bấm tung xúc xắc! Chỉ nối `game_end` / `exitToMenu`. |
| `paper_fold` | R2 | Construct 3 `C3MobileAdvertsAPI` / `adBreak` | Có thể áp dụng adapter tương tự `hexa_merge` nếu lên kế hoạch build lại gói ZIP + SHA-256 manifest R2. |
| `skibidi_toilet` | R2 | Construct 3 `C3MobileAdvertsAPI` / `adBreak` | Tương tự `paper_fold` (cần cập nhật ZIP + manifest R2). |
| `spot_the_difference` | R2 | `vendor/adbreak.js` (`rewardfailedGame`, `rewardresumeGame`) | Cần adapter riêng cho Google web `adBreak` + cập nhật ZIP R2. |
| `hero_match` | R2 | PlayCanvas `JsServiceBridge` + `RewardedComplete` | Kiểm tra runtime trước khi nối adapter + cập nhật ZIP R2. |

---

## 4. BẢNG TOP 30 GAME LƯU LƯỢNG CAO NHẤT (GA4) & VỊ TRÍ ADS ĐỀ XUẤT

| # | Game | Hướng | Phút chơi | Lượt mở | Đang có trong game | Đề xuất bổ sung ngay |
| :-: | :--- | :-: | :-: | :-: | :--- | :--- |
| 1 | `ludo` | Dọc | **1,347.6** | 137 | Banner | **Exit Interstitial (≥60s)** + nối `game_end`/`exitToMenu` |
| 2 | `amaze_ball_quest` | Dọc | **727.5** | 316 | Banner, Win, Int | Bỏ chặn kép `showInterstitialInGame`, nối `Lose`/`Restart` |
| 3 | `cryptogram` | Dọc | **719.0** | 45 | Banner, Win, Reward | **Exit Interstitial (≥60s)** (ván chữ dài, ít kết màn) |
| 4 | `pool_8_pro` | **NGANG** | **610.4** | 156 | *(0 trong game)* | **Exit Interstitial (≥60s)** + nối `gameOver`/`restartGame` |
| 5 | `block_tetris` | Dọc | **563.1** | 63 | Banner, Win, Int | **Mở khóa Rewarded** (`RewardedComplete`), nối `Lose`/`Restart`, Exit Int |
| 6 | `burger_run` | Dọc | **507.8** | 268 | Banner, Win, Int | **Nối `Lose` (5,181!) & `Restart` (1,906!)** — mở khóa 93% điểm dừng! |
| 7 | `find_number` | Dọc | **498.7** | 99 | Banner, Int | Bỏ chặn kép `showInterstitialInGame`, Exit Int |
| 8 | `apple_worm` | Dọc | **491.1** | 180 | Banner, Win | **Mở khóa Rewarded**, **nối `Lose` (560) & `Restart` (856)** |
| 9 | `balloons_creator` | Dọc | **448.1** | 149 | Banner | **Exit Interstitial (≥60s)** (chơi tự do, không gọi event thắng/thua) |
| 10 | `chess` | Dọc | **424.3** | 80 | Banner | **Exit Interstitial (≥60s)** |
| 11 | `draw_parking` | Dọc | **423.3** | 99 | Banner, Win | **Nối `Lose` (349) & `Restart` (905)** (85.8% điểm dừng!) |
| 12 | `tic_tac_toe` | Dọc | **420.9** | 203 | Banner, Int | **Bỏ chặn kép `eachNLevels = 3`** trên `showInterstitialInGame` |
| 13 | `checkers` | Dọc | **334.5** | 94 | Banner | **Exit Interstitial (≥60s)** |
| 14 | `block_blast` | Dọc | **315.6** | 97 | Banner | **Exit Interstitial (≥60s)** |
| 15 | `uno_vertical` | Dọc | **312.5** | 81 | Banner, Int (`endRound`) | **Bỏ chặn kép `eachNLevels = 3`**, Exit Int |
| 16 | `cut_for_cat` | Dọc | **312.5** | 72 | Banner, Win | **Nối `Lose` (755) & `Restart` (178)** |
| 17 | `block_fit_puzzle` | Dọc | **291.2** | 88 | Banner, Win | **Nối `Lose` (423) & `Restart` (207)** |
| 18 | `dominoes` | Dọc | **268.9** | 68 | Banner | **Exit Interstitial (≥60s)** + nối `endGame` |
| 19 | `sea_battle` | Dọc | **258.4** | 125 | Banner | **Exit Interstitial (≥60s)** |
| 20 | `master_fall_down` | Dọc | **256.9** | 66 | Banner, Win | **Nối `Lose` (392) & `Restart` (495)** |
| 21 | `mahjong_deluxe` | **NGANG** | **250.1** | 35 | *(0 trong game)* | **Exit Interstitial (≥60s)** + nối `gameOver` |
| 22 | `uno` | **NGANG** | **235.4** | 56 | *(0 trong game)* | **Exit Interstitial (≥60s)** + nối `gameOver` |
| 23 | `ball_escape` | Dọc | **231.0** | 134 | Banner, Win | **Mở khóa Rewarded**, nối `Lose` (110) & `Restart` (209) |
| 24 | `bee` | Dọc | **221.0** | 99 | Banner, Win, Reward | Nối `Lose`/`Restart` |
| 25 | `turn_light` | Dọc | **213.6** | 55 | Banner, Win | Giữ nguyên + Exit Int |
| 26 | `solitaire_associations` | Dọc | **203.9** | 34 | Banner, Win, Int | **Mở khóa Rewarded**, bỏ chặn kép Int, nối `Lose`/`Restart` |
| 27 | `brick_breaker_retro` | **NGANG** | **197.5** | 66 | Win, Int *(0 Banner)* | **Nối `Lose` (80) & `Restart` (87)**, bỏ chặn kép Int, Exit Int |
| 28 | `pipe_rush` | Dọc | **192.4** | 105 | Banner, Win, Int | **Nối `Lose` (1,030!) & `Restart` (989!)** |
| 29 | `knife_hit_2` | Dọc | **185.7** | 101 | Banner, Win, Int | **Mở khóa Rewarded**, nối `Lose` (176), bỏ chặn kép Int |
| 30 | `merge_cards` | Dọc | **179.3** | 16 | Banner, Win, Int | Bỏ chặn kép Int, Exit Int |

---

## 5. RANH GIỚI ĐỎ ADMOB POLICY & UX (NHỮNG VỊ TRÍ TUYỆT ĐỐI KHÔNG ĐẶT)

1. **KHÔNG đặt Banner trong 48 game ngang (Landscape)** (`pool_8_pro`, `mahjong_deluxe`, `uno`, `brick_breaker_retro`, `trap_path`, `backgammon`, `slime_quest`, v.v.): chiều cao màn hình ngang quá nhỏ, banner sẽ che nút điều khiển gây click nhầm và bị Google Play / AdMob cảnh báo *Ad Overlapping Content*.
2. **KHÔNG hiện Interstitial giữa lúc đang thao tác** (như `dieClicked` trong `ludo`, hay `scoreInGame` khi điểm đang nhảy liên tục trong `merge_dice`/`magic_candy`/`find_number`). Mọi Interstitial bắt buộc đi qua **điểm dừng tự nhiên + màn đệm `Loading Ad… 700ms` + cooldown tối thiểu `90 giây`**.
3. **KHÔNG hiện Interstitial khi thoát hẳn ứng dụng** (bấm Back đóng hẳn app từ `GameListActivity`): vi phạm thẳng chính sách AdMob *Ads on App Exit*. Nếu muốn tận dụng bước thoát app, chỉ được dùng **Native Ad bên trong Dialog xác nhận thoát**.
4. **KHÔNG trao thưởng giả khi Rewarded Video bị no-fill hoặc đóng sớm**: luôn chỉ tiêm JS reward bên trong `onUserEarnedReward`, đồng thời test kỹ các game mới mở khóa để đảm bảo không bị treo UI khi không có quảng cáo.
5. **Tôn trọng VIP & UMP Consent 100%**: người dùng đã mua gói VIP/Remove Ads tắt toàn bộ Banner, Interstitial, App Open, Native (chỉ giữ Rewarded tự nguyện nếu họ tự bấm nút xem để lấy gợi ý/boost).

---

## 6. LỘ TRÌNH TRIỂN KHAI ĐỀ XUẤT (THEO THỨ TỰ HIỆU QUẢ / CÔNG SỨC)

| Giai đoạn | Các hạng mục đặt Ads | Sửa ở đâu? | Tác động ước tính |
| :--- | :--- | :--- | :--- |
| **Gói 1 — Quick Wins (Chỉ sửa Native Kotlin, 0 sửa game, 0 re-upload R2)** | 1. Nối `levelLoseInGame` + `levelRestartInGame` vào Interstitial (~300 game).<br>2. Bỏ chặn kép `eachNLevels = 3` với `showInterstitialInGame` trực tiếp (174 game).<br>3. Thêm **Exit-Game Interstitial** khi Back khỏi `GameActivity` sau ≥ 60s chơi (phủ 419 game, cứu 32% playtime nhóm Zero-Hook & 48 game Ngang).<br>4. Mở khóa **Rewarded Video** trong `RewardCallbackResolver.kt` cho các game đã kiểm chứng (ưu tiên **10 game Bundled** trước, sau đó mở tiếp nhóm R2 chuẩn `RewardedComplete`). | Chỉ 4 file Kotlin trong `Android/` | **Tăng mạnh số lần hiển thị Interstitial & Rewarded ngay lập tức**, rủi ro thấp nhất vì đã có cap 90s + đệm 700ms. |
| **Gói 2 — Mở khóa 2 Ad Unit ID đang bỏ trống (Native Shell)** | 1. **App Open Ad khi Resume từ nền** (sau ≥ 30–60s ở background).<br>2. **Native Ad trong Dialog tải R2** (`dialog_game_download.xml`).<br>3. **Native Ad In-Feed** trong lưới `GameListActivity` (mỗi 6–8 hàng = 12–16 game).<br>4. *(Tùy chọn)* **Native Ad trong Dialog xác nhận thoát App**. | Android Native Shell (XML + Kotlin SRP module) | **Tăng doanh thu bền vững** từ màn hình chính & lúc chờ tải R2, không ảnh hưởng nhịp chơi trong game. |
| **Gói 3 — Mở sâu vào Top Game Zero-Hook & SDK ngoài** | 1. Nối chọn lọc điểm kết ván (`game_end`/`exitToMenu`/`gameOver`) cho 5 game Bundled Top Playtime (`ludo`, `pool_8_pro`, `dominoes`, `mahjong_deluxe`, `uno`).<br>2. Nối adapter C3/adBreak cho 4 game R2 (`paper_fold`, `skibidi_toilet`, `spot_the_difference`, `hero_match`) + đóng gói lại ZIP & cập nhật SHA-256 manifest R2. | Sửa từng game cụ thể + kiểm thử thiết bị thật | Tối ưu tối đa cho các game chơi phiên dài (5–15 phút/ván). |
