# BÁO CÁO CODE REVIEW & KIỂM TOÁN KIẾN TRÚC (CODE REVIEW & ARCHITECTURE AUDIT)

**Dự án:** Galaxy Game / NextAI Game Offline (`applicationId = com.nextai.game.offline`, namespace `com.nextai.gameoffline`)  
**Ngày kiểm toán:** 2026-11-20  
**Phạm vi:** Toàn bộ mã nguồn Android Kotlin (`Android/src/main/java/com/nextai/gameoffline/` — **55 file, 7,966 dòng**), cấu hình Gradle/Resources, và rà soát nhanh Backend (`Backend/src/` — **12 file**).  
**Trạng thái kiểm thử hiện tại:** `testDebugUnitTest` (39/39 PASS), `lintDebug` (0 lỗi, 402 cảnh báo), `assembleDebug` PASS.  
**Nguyên tắc báo cáo:** Chỉ nêu sự thật có bằng chứng trực tiếp từ mã nguồn (`file:line`), **chưa tự ý sửa mã nguồn sản phẩm** trong đợt audit này; toàn bộ tiêu chuẩn chống vibe code đã được luật hóa vào `AGENTS.md`, `Docs/rules.md`, `CLAUDE.md`, `.clinerules`.

---

## 1. ĐÁNH GIÁ TỔNG QUAN (EXECUTIVE VERDICT)

| Hạng mục | Điểm | Kết luận ngắn |
| :--- | :---: | :--- |
| **Khả năng biên dịch & chạy thực tế** | **8/10** | Build sạch, 39 unit test policy PASS, chạy được trên thiết bị Android 16 (API 36). |
| **Độ sạch & khả năng Dev đọc hiểu (Readability)** | **4/10** | Mang đậm dấu ấn **"Vibe Code"**: gộp nhiều lệnh bằng `;`, nén 1 dòng dài > 120 ký tự, dựng UI Dialog bằng code Kotlin, God Class 1,204 dòng, comment không dấu/dính chữ. |
| **Tính đúng đắn Logic, Concurrency & Lifecycle** | **5.5/10** | Còn nhiều bug tiềm ẩn nghiêm trọng (show Interstitial lúc app vào nền sau đệm 700ms, xóa cache đệ quy trên Main Thread, thiếu `@JavascriptInterface` ở 2 overload, unhandled `SecurityException`, re-seed DB 419 file mỗi lần `onOpen`, XSS/Path Traversal + hardcoded JWT ở Backend). |
| **Kiến trúc hệ thống (Architecture)** | **3.5/10** | **Vi phạm nghiêm trọng** kiến trúc MVVM & Clean Architecture đã cam kết trong `Docs/rules.md`: **0 `ViewModel`**, **0 `Repository` interface / tầng `domain`**, **31/55 file là Singleton `object`** giữ mutable state toàn cục, trùng lặp state machine quảng cáo 3 lần, 2 `BillingClient` chạy song song. |
| **Khả năng kiểm thử (Testability)** | **4.5/10** | Chỉ test được các policy thuần (`AdRetryPolicy`, `SubscriptionOfferPolicy`...); gần như **0% unit test** cho tầng điều phối cốt lõi (`AdManager`, `BillingManager`, `GameDownloadManager`, `GameListActivity`, `GameActivity`) do phụ thuộc cứng vào static Singleton và `Handler`. |

### Số liệu đo trực tiếp trên mã nguồn Android Kotlin

| Chỉ số | Giá trị đo thực tế | Ngưỡng chuẩn kỹ sư | Đánh giá |
| :--- | :---: | :---: | :---: |
| Tổng số file `.kt` / Tổng số dòng | `55` file / `7,966` dòng | — | — |
| File lớn nhất (`AdManager.kt`) | **1,204 dòng** | ≤ 350 dòng | **Vượt 3.4x** |
| Số file > 350 dòng | **6 file** (`AdManager`, `GameListActivity`, `GameActivity`, `GameAnalyticsManager`, `GameDownloadManager`, `BillingManager`) | 0 file | **Cần tách** |
| Số lượng Global Singleton (`object`) | **31 / 55 file (56%)** | Chỉ dùng cho hằng số / pure stateless utils | **Lạm dụng nghiêm trọng** |
| Số lượng `ViewModel` | **0** | ≥ 1 cho mỗi màn hình có state | **Thiếu hoàn toàn** |
| Số lượng tầng `domain/` & `Repository` interface | **0** | Tách biệt rõ `data` ↔ `domain` ↔ `presentation` | **Thiếu hoàn toàn** |
| Số file `SharedPreferences` rời rạc | **7 file prefs khác nhau** | Tập trung qua Storage/DataStore/Room | **Phân mảnh** |
| File lớn nhất Backend (`gameTester.ts`) | **1,583 dòng** | ≤ 350 dòng | **Vượt 4.5x** |

---

## 2. PHÂN TÍCH "VIBE CODE" — NHỮNG ĐIỂM CẢN TRỞ DEV ĐỌC HIỂU

Đây là các biểu hiện đặc trưng của code do AI sinh nối tiếp theo từng lần sửa lỗi nhanh, khiến lập trình viên người thật rất khó đọc, debug và bảo trì:

### 2.1. Gộp nhiều câu lệnh bằng dấu chấm phẩy `;` trên 1 dòng (Anti-Kotlin Style)
Trái hoàn toàn với chuẩn **Kotlin Official Style Guide**. Nhiều câu lệnh cập nhật trạng thái quan trọng bị ép dồn vào một dòng duy nhất, cực kỳ dễ bỏ sót khi review diff:
- [`BillingManager.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/billing/BillingManager.kt) (**17 dòng** nén bằng `;`):
  - `L52`: `init { BillingEntitlements.isPremium(app); refresh() }`
  - `L82`: `connecting = false; checking = false; ownershipReady = false; ownershipError = true`
  - `L143`: `onPurchaseFailed("..."); refresh(); return@onMain`
  - `L217`: `checking = true; ownershipReady = false; ownershipError = false; publishState()`
  - `L240`, `L247`, `L264`, `L303`, `L312` lặp lại cùng kiểu viết tắt này.
- [`BillingActivity.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/billing/BillingActivity.kt) (**9 dòng**):
  - `L69`, `L82-83`: `if (ready) { pendingPurchase = false; purchaseRequested = false }`
  - `L308`: `override fun onResume() { super.onResume(); refreshBilling() }`
  - `L310`: `override fun onDestroy() { if (::billingManager.isInitialized) billingManager.close(); super.onDestroy() }`
- [`GameWebViewClient.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/game/GameWebViewClient.kt) (**8 dòng**), [`GameListActivity.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/gamelist/GameListActivity.kt) (**5 dòng**: `L407`, `L480`, `L488`, `L494`), [`SplashAdActivity.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/splash/SplashAdActivity.kt) (**3 dòng**), [`NotificationScheduler.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/notifications/NotificationScheduler.kt#L33) (`if (old != null) { alarms.cancel(old); old.cancel() }`).

### 2.2. Nén hàm & biểu thức quá 120 ký tự, thiếu khoảng thở giữa các khối logic
- [`BillingManager.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/billing/BillingManager.kt) có **23 dòng > 120 ký tự**; [`BillingActivity.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/billing/BillingActivity.kt) có **19 dòng > 120 ký tự**; [`GameActivity.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/game/GameActivity.kt) có **14 dòng > 120 ký tự**; [`LegalPolicyHelper.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/settings/LegalPolicyHelper.kt) có **13 dòng > 120 ký tự**.
- Nhiều file ([`BillingManager.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/billing/BillingManager.kt), [`BillingActivity.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/billing/BillingActivity.kt), [`DailyNotificationReceiver.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/notifications/DailyNotificationReceiver.kt#L69-L71)) nén cả khối `try/catch/finally` hoặc nhiều callback nối tiếp trên 1–2 dòng không có dòng trống ngăn cách.

### 2.3. God Classes — Một file ôm quá nhiều trách nhiệm
1. [`AdManager.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/ads/AdManager.kt) (**1,204 dòng**): Ôm trọn khởi tạo MobileAds SDK, dựng View Banner + đường phân cách 3dp, 3 state machine quảng cáo độc lập (Interstitial, Rewarded, App Open) với logic load/cache/TTL/backoff/jitter bị **copy-paste lặp lại 3 lần**, tự dựng `Dialog` đệm 700ms bằng code Kotlin, hẹn giờ preload 3s, phản ứng consent/VIP và logging waterfall.
2. [`GameListActivity.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/gamelist/GameListActivity.kt) (**658 dòng**): Vừa làm UI Launcher, vừa gọi thẳng `AppDatabase.populateGamesCatalogDirect`, vừa quan sát Room Flow, lọc tìm kiếm, reflection `ViewPager2`, quản lý Banner/Consent, dựng Dialog tải game bằng Kotlin, dựng Dialog Settings và điều phối Interstitial.
3. [`GameActivity.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/game/GameActivity.kt) (**562 dòng**): Dựng toàn bộ layout bằng Kotlin code, cấu hình WebView + ServiceWorker, tiêm script tắt âm thanh JS, truy vấn Room DB trực tiếp, theo dõi thời gian phiên chơi và điều phối Banner/Interstitial/Rewarded.
4. [`Backend/src/cms/gameTester.ts`](file:///e:/DECOMPILER/Game/com.media720.games2020/Backend/src/cms/gameTester.ts) (**1,583 dòng**): Gộp Express API + toàn bộ HTML/CSS/JS của công cụ test game vào 1 file TypeScript duy nhất.

### 2.4. Dựng UI phức tạp trực tiếp bằng Kotlin thay vì XML / Compose
- [`GameActivity.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/game/GameActivity.kt#L87-L161) dựng toàn bộ cây View bằng code.
- [`GameListActivity.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/gamelist/GameListActivity.kt#L414-L495) (`showDownloadGameDialog`) và [`AdManager.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/ads/AdManager.kt#L982-L1048) (`showInterstitialBufferDialog`) tạo `LinearLayout`, `GradientDrawable`, `TextView`, `ProgressBar`, `Color.parseColor("#...")` và phép nhân `density` trực tiếp trong code logic nghiệp vụ.

### 2.5. Comment, Log & Tài liệu xuống cấp, thiếu nhất quán
- **Comment tiếng Việt mất dấu / dính chữ:** [`BillingManager.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/billing/BillingManager.kt#L11) (`Dong bo Google Play va mua subscription`), `L139` (`khong chong goi dang active`); [`BillingActivity.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/billing/BillingActivity.kt#L213); [`NotificationScheduler.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/notifications/NotificationScheduler.kt#L12) (`Ba reminder08/12/20 giờ`), `L21` (`hủy đủ5 slot cũ` / `all5`).
- **Comment rác trên override rỗng:** [`NotificationFeatureInitializer.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/notifications/NotificationFeatureInitializer.kt#L124-L140) lặp 6 lần `/** Callback rỗng theo giao diện hệ thống / No-op system callback. */`.
- **Log không kiểm `BuildConfig.DEBUG`:** [`GameUnlockHelper.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/game/GameUnlockHelper.kt#L166) (`L166`, `L177`) và [`GameTrackingRepository.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/data/local/GameTrackingRepository.kt#L39) (`L39`, `L51`, `L66`, `L81`) ghi `Log.d`/`Log.i` thẳng ra logcat production.
- **Lệch tài liệu dự án:** `AGENTS.md`, `CLAUDE.md`, `.clinerules`, `Docs/rules.md` vẫn còn ghi `423 game` (thực tế là `419`), `Billing 8.x` (thực tế là `9.1.0`), và chưa phân biệt rõ `applicationId = com.nextai.game.offline` với Kotlin `namespace = com.nextai.gameoffline`.

### 2.6. Hack Reflection & Mã chết (Dead Code / Dead Schema)
- **Reflection vào field private AndroidX:** [`GameListActivity.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/gamelist/GameListActivity.kt#L294-L309) dùng `getDeclaredField("mRecyclerView")` và `getDeclaredField("mTouchSlop")` — dễ vỡ ngầm khi nâng cấp AndroidX hoặc R8 tối ưu.
- **2 bảng/DAO Room chết không còn nơi gọi:** `BannersDao` (`bannersDao()`) và `OfflineAdsDao` (`offlineAdsDao()`) trong [`AppDatabase.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/data/local/AppDatabase.kt#L41-L43) có **0 nơi sử dụng** trong toàn bộ codebase.
- **String tài nguyên cũ chưa dọn:** [`strings.xml`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/res/values/strings.xml) vẫn giữ bộ string Paywall Lifetime cũ song song với `strings_paywall.xml` và `strings_subscriptions.xml`.
- **Khai báo thuộc tính nằm giữa các hàm:** [`AndroidGameBridge.kt`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/game/AndroidGameBridge.kt#L67) khai báo `private val trackingRepo = ...` nằm kẹp giữa hàm `onGameReady()` và `levelStartInGame()` thay vì ở đầu class.

---

## 3. LỖI LOGIC, CONCURRENCY, LIFECYCLE & BẢO MẬT (BUGS & RISKS)

### Mức P0 — Rủi ro Crash / Vi phạm chính sách / Lỗ hổng bảo mật

| # | Vị trí | Vấn đề cụ thể | Tác động |
| :---: | :--- | :--- | :--- |
| **B-01** | [`AdManager.kt#L485-L496`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/ads/AdManager.kt#L485-L496), [`L1187-L1188`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/ads/AdManager.kt#L1187-L1188) | Trong 700ms hiển thị màn hình đệm `Loading Ad…`, nếu người dùng nhấn Home/chuyển app (`onPause`/`onStop`), `activity.isFinishing` và `isDestroyed` vẫn là `false` vì `isActivityUsable()` **không kiểm tra** `Lifecycle.State.RESUMED`. Sau 700ms, `ad.show(activity)` vẫn bị gọi khi app đang ở nền. | Hiển thị quảng cáo ngoài app (rủi ro chính sách AdMob) hoặc rơi vào lỗi show không hiển thị; ngoài ra check `JELLY_BEAN_MR1` dư thừa vì `minSdk = 24`. |
| **B-02** | [`GameActivity.kt#L373`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/game/GameActivity.kt#L373) | `GameDownloadManager.getGameLaunchUrl()` có thể ném `SecurityException` (nếu dữ liệu game tải về bị hệ điều hành/người dùng xóa sau khi Launcher kiểm tra `isGameInstalled`), nhưng `GameActivity.loadGameMetadataAndStart()` **không bắt ngoại lệ**. | **Crash app ngay lập tức** khi mở game bị hỏng/thiếu file. |
| **B-03** | [`Backend/src/server.ts#L37-L57`](file:///e:/DECOMPILER/Game/com.media720.games2020/Backend/src/server.ts#L37-L57), [`Backend/src/api/auth.ts#L11`](file:///e:/DECOMPILER/Game/com.media720.games2020/Backend/src/api/auth.ts#L11) | (1) `req.params.gameName` ghép trực tiếp vào `path.join(GAMES_PATH, gameName, 'index.html')` không kiểm chứng canonical path & whitelist, đồng thời chèn thẳng vào `<script>` (`game: '${gameName}'`) gây **Reflected XSS**; (2) `JWT_SECRET` có fallback chuỗi cứng `'nextai_super_secret_jwt_key_2026'`; (3) `app.use(cors())` mở toàn bộ origin, không rate limit. | Nguy cơ lộ quyền Admin / chiếm phiên nếu Backend chạy ngoài localhost. |

### Mức P1 — Lỗi Logic nghiệp vụ, Hiệu năng & Thread-Safety

| # | Vị trí | Vấn đề cụ thể | Tác động |
| :---: | :--- | :--- | :--- |
| **B-04** | [`AppDatabase.kt#L75-L134`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/data/local/AppDatabase.kt#L75-L134), [`GameListActivity.kt#L361`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/gamelist/GameListActivity.kt#L361) | `AppDatabaseCallback.onOpen()` chạy `populateGamesCatalogDirect()` **mỗi lần mở DB** (đọc & parse file JSON 5,449 dòng + gọi `isGameInstalled()` kiểm tra ổ đĩa **419 lần** + upsert 419 row Room), đồng thời `GameListActivity.observeGames()` cũng gọi lại khi count = 0. | Làm chậm khởi động app (cold start I/O nặng) và gây race condition giữa 2 luồng seed. |
| **B-05** | [`GameSettingsManager.kt#L103-L118`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/settings/GameSettingsManager.kt#L103-L118) | `clearCache()` vừa khởi tạo một `WebView(context)` mới vừa gọi `cacheDir.deleteRecursively()` và `externalCacheDir?.deleteRecursively()` **đồng bộ trên Main Thread**. | Giật màn hình hoặc **ANR** khi cache lớn. |
| **B-06** | [`AndroidGameBridge.kt#L108,L139`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/game/AndroidGameBridge.kt#L108) | Hai hàm `levelCompleteInGame(level: Int, extra: String?)` (`L108`) và `levelLoseInGame(level: Int, extra: String?)` (`L139`) **thiếu annotation `@JavascriptInterface`** trong khi các overload nhận `String` lại có. | Game JS gọi truyền `(number, string)` có thể bị rớt hoặc không khớp chữ ký tùy engine WebView. |
| **B-07** | [`GameTrackingRepository.kt#L32-L83`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/data/local/GameTrackingRepository.kt#L32-L83) | Thực hiện read-modify-write không đồng bộ (`synchronized`/atomic) trên `SharedPreferences` từ cả luồng `JavaBridge` (WebView background) lẫn Main Thread; đồng thời phình 1 file XML SharedPreferences lên tới ~2,095 key (5 key × 419 game) dù Room đã có `UserStatsEntity`. | Mất số đếm khi ghi đồng thời + đọc toàn bộ file XML lớn vào RAM khi mở app. |
| **B-08** | [`GameUnlockHelper.kt#L160-L216`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/game/GameUnlockHelper.kt#L160-L216) | (1) Sau khi đã chạy `specificScript` truyền config object vào `window.clearLocalStorage({...})` (như `solitaire_classic`, `spades`, `coloring_book`, `cryptogram`), code vẫn chạy tiếp nhánh fallback `window.clearLocalStorage()` không tham số ở `L196`; (2) Chèn `cleanKey` không escape vào chuỗi JS (`L178`); (3) `mainHandler.post` giữ strong ref tới `WebView` không hủy khi `GameActivity` đóng. | Có nguy cơ ghi đè cấu hình khởi tạo game hoặc lỗi trên WebView đã destroy. |
| **B-09** | [`GameListActivity.kt#L187`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/presentation/gamelist/GameListActivity.kt#L187) | Đặt `viewPagerGames.offscreenPageLimit = categories.size` (`6`), buộc Android inflate và bind đồng thời cả **6 `RecyclerView`** (chứa danh sách tới 419 card game) ngay lúc mở màn hình chính. | Tăng mạnh RAM tiêu thụ & độ trễ frame đầu trên máy cấu hình thấp. |

### Mức P2 — Nợ kỹ thuật, Rò rỉ nhỏ & API lỗi thời

| # | Vị trí | Vấn đề cụ thể |
| :---: | :--- | :--- |
| **B-10** | [`BillingActivity.kt#L61,L263,L308`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/billing/BillingActivity.kt#L61), [`BillingManager.kt#L52`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/billing/BillingManager.kt#L52) | `onCreate()` tạo `BillingManager` (gọi `refresh()` ngay trong `init`), rồi ngay sau đó `onResume()` gọi tiếp `refreshBilling()`, reset `catalogStatus = LOADING` dư thừa; đồng thời tồn tại **2 `BillingClient` độc lập** (`BillingEntitlementMonitor` và `BillingActivity`) phải đồng bộ thủ công bằng biến `generation`. |
| **B-11** | [`EntitlementAdObserver.kt#L16`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/ads/EntitlementAdObserver.kt#L16) | Hardcode chuỗi `"nextai_billing_prefs"` ghép chặt vào nội bộ lưu trữ của `BillingEntitlements` thay vì subscribe `StateFlow<Boolean>` từ 1 nguồn chân lý duy nhất. |
| **B-12** | [`NotificationFeatureInitializer.kt#L59`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/notifications/NotificationFeatureInitializer.kt#L59) | Khởi tạo `Handler(Looper.getMainLooper())` mới mỗi lần `onActivityResumed`, giữ tham chiếu mạnh tới `Activity` trong 1,200ms mà không có `removeCallbacks` khi `onPause`. |
| **B-13** | [`AdManager.kt#L146,L219`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/ads/AdManager.kt#L146) | (1) Nếu `MobileAds.initialize` ném exception vẫn gán `isMobileAdsReady = true` vĩnh viễn (không cho thử khởi tạo lại về sau); (2) Dùng API đã deprecated `AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize`. |
| **B-14** | [`GameDownloadCoordinator.kt#L24`](file:///e:/DECOMPILER/Game/com.media720.games2020/Android/src/main/java/com/nextai/gameoffline/data/remote/GameDownloadCoordinator.kt#L24) | `downloads` Map giữ vĩnh viễn `MutableStateFlow<State>` của mọi game đã tải suốt vòng đời process (không có bước dọn các entry đã `Complete`). |

---

## 4. ĐÁNH GIÁ KIẾN TRÚC & LỘ TRÌNH REFACTOR BẮT BUỘC

### 4.1. Đối chiếu Kiến trúc cam kết vs Thực tế hiện tại

| Thành phần kiến trúc | Cam kết trong `Docs/rules.md` | Thực tế hiện tại trong codebase | Mức độ lệch |
| :--- | :--- | :--- | :---: |
| **Presentation Layer** | Activities / Compose + **ViewModels** | **0 ViewModel**; Activity tự giữ toàn bộ state, gọi thẳng Room DAO, AdManager, BillingManager, DownloadCoordinator. | **Nghiêm trọng** |
| **Domain Layer** | `domain/` chứa Repository interfaces & Models | **Không tồn tại thư mục `domain/`**. | **Nghiêm trọng** |
| **Dependency Injection** | Quản lý phụ thuộc rõ ràng (nhắc Hilt trong `Docs/CAU_TRUC_THU_MUC.md`) | Không có DI; dùng Service Locator `GameApplication.instance` + **31 Singleton `object`**. | **Nghiêm trọng** |
| **Ads Module** | Tách sạch Consent, Cache/Backoff, Mediation | 1 God Object `AdManager.kt` **1,204 dòng** copy-paste 3 lần logic Interstitial/Rewarded/AppOpen + vẽ UI Dialog bên trong. | **Cao** |
| **Billing Module** | Single Source of Truth cho Entitlement & Catalog | **2 `BillingClient`** chạy song song (`BillingEntitlementMonitor` & `BillingActivity`) + `SharedPreferences` listener rời rạc. | **Cao** |
| **Data Persistence** | Room ORM chuẩn hóa | Room có 2 DAO chết (`BannersDao`, `OfflineAdsDao`), còn thống kê từng game lại tách sang `SharedPreferences` (~2,095 keys) thay vì nằm chung `UserStatsEntity`. | **Trung bình-Cao** |
| **Backend CMS** | Modular API + UI tách biệt | `gameTester.ts` dồn 1,583 dòng (API + HTML + CSS + JS inline), thiếu hardening bảo mật (`auth.ts`, `server.ts`). | **Trung bình-Cao** |

### 4.2. Kiến trúc mục tiêu đề xuất (Target Architecture)

```text
Android/src/main/java/com/nextai/gameoffline/
├── di/
│   └── AppContainer.kt                 # Constructor DI container (thay thế GameApplication.instance)
├── domain/
│   ├── model/                          # GameItem, BillingPlan, AdState, DownloadProgress
│   └── repository/                     # GameCatalogRepository, BillingRepository, GameStatsRepository
├── data/
│   ├── local/                          # Room DB (chỉ giữ GamesDao, UserStatsDao), SeedVersionStore
│   ├── remote/                         # GameDownloadManager, GamePackageTransfer, R2DownloadRepository
│   └── repository/                     # DefaultGameCatalogRepository, PlayBillingRepository
├── ads/
│   ├── MobileAdsInitializer.kt         # Chỉ lo khởi tạo SDK & hàng đợi callback
│   ├── FullScreenAdSlot.kt             # Generic cache/load/TTL/retry/dedupe (xóa bỏ 3x copy-paste!)
│   ├── BannerAdController.kt           # Anchored collapsible banner + divider XML
│   ├── InterstitialCoordinator.kt      # Cap + 700ms buffer + 3s post-dismiss preload
│   ├── RewardedCoordinator.kt          # Rewarded ad flow
│   ├── AppOpenCoordinator.kt           # App Open flow
│   └── AdLoadingOverlayDialog.kt       # UI Dialog tách ra XML (dialog_ad_loading.xml)
└── presentation/
    ├── gamelist/                       # GameListActivity (mỏng) + GameListViewModel + DownloadDialogFragment
    ├── game/                           # GameActivity (mỏng) + GameViewModel + AndroidGameBridge
    └── billing/                        # BillingActivity (mỏng) + PaywallViewModel
```

### 4.3. Lộ trình Refactor ưu tiên (4 Phases — Đề xuất để User duyệt thực hiện)

> **Lưu ý:** Không nên "đập đi viết lại" toàn bộ cùng lúc để tránh hồi quy (regression) trên 419 game và luồng AdMob/Billing đã kiểm chứng. Chia thành 4 đợt gọn, mỗi đợt đều qua đủ Quality Gate (`testDebugUnitTest`, `lintDebug`, `assembleDebug`, ADB smoke test).

1. **Phase 1 — Sửa toàn bộ Bug P0/P1 & Làm sạch "Vibe Code" (Rủi ro thấp, hiệu quả ngay):**
   - Vá **B-01** (`Lifecycle.State.RESUMED` trước khi `ad.show()` sau đệm 700ms), **B-02** (`try/catch` `SecurityException` ở `GameActivity`), **B-03** (sanitize/canonicalize `gameName` + bắt buộc `JWT_SECRET` ở Backend), **B-04** (chỉ seed catalog khi version/checksum đổi), **B-05** (chuyển xóa cache sang `Dispatchers.IO`), **B-06** (thêm `@JavascriptInterface` còn thiếu), **B-08** (không gọi `window.clearLocalStorage()` rỗng khi đã chạy `specificScript` + escape `cleanKey`), **B-09** (`offscreenPageLimit = 1`).
   - Dọn toàn bộ dấu `;` gộp lệnh & dòng > 120 ký tự trên các file trọng tâm (`BillingManager`, `BillingActivity`, `GameListActivity`, `GameWebViewClient`, `AdManager`), tách Dialog UI ra XML (`dialog_ad_loading.xml`, `dialog_game_download.xml`), cấu hình **ktlint / detekt** làm cổng kiểm soát tự động.
2. **Phase 2 — Phá bỏ God Classes (`AdManager` 1,204 dòng & `gameTester.ts` 1,583 dòng):**
   - Trừu tượng hóa `FullScreenAdSlot<T>` để xóa bỏ 3 bản sao copy-paste trong `AdManager.kt`, tách `BannerAdController`, `InterstitialCoordinator`, `RewardedCoordinator`, `AppOpenCoordinator`, `MobileAdsInitializer`.
   - Tách `Backend/src/cms/gameTester.ts` thành route handler + file HTML/CSS/JS tĩnh riêng.
3. **Phase 3 — Chuyển sang Clean MVVM + Single BillingRepository + AppContainer DI:**
   - Hợp nhất 2 `BillingClient` thành **1 `PlayBillingRepository` duy nhất** phát `StateFlow<BillingState>` (xóa bỏ `EntitlementAdObserver` nghe raw `SharedPreferences` và bỏ cờ `generation` thủ công).
   - Tạo `AppContainer`, `GameCatalogRepository`, `GameListViewModel`, `GameViewModel`, `PaywallViewModel`.
   - Gom `GameTrackingRepository` vào Room `UserStatsEntity`/`UserStatsDao` (kèm migration giữ dữ liệu cũ) và dọn 2 DAO chết (`BannersDao`, `OfflineAdsDao`) cùng string Paywall cũ.
4. **Phase 4 — Nâng độ phủ Unit Test & Hardening Production:**
   - Viết unit test bằng fake/stub cho `FullScreenAdSlot`, `InterstitialCoordinator`, `PlayBillingRepository`, `GameListViewModel`, `GameViewModel`.
   - Bổ sung xác minh Google Play Purchase Token phía server / RTDN (theo `Tasksrequiring.md`).

---

## 5. LUẬT CỨNG ĐÃ ĐƯỢC BAN HÀNH CHO CÁC PHIÊN AI TIẾP THEO

Toàn bộ yêu cầu về **code sạch chuẩn logic, chống vibe code, viết cho Dev đọc hiểu, bắt buộc kiểm tra & báo cáo refactor kiến trúc** đã được đưa vào luật cứng tại 4 tệp quản trị dự án:
- [`AGENTS.md`](file:///e:/DECOMPILER/Game/com.media720.games2020/AGENTS.md) (Mục 2 — Luật cứng chống Vibe Code & Kiểm soát Kiến trúc)
- [`Docs/rules.md`](file:///e:/DECOMPILER/Game/com.media720.games2020/Docs/rules.md) (Ngưỡng định lượng kích thước file/hàm, chuẩn format Kotlin/TS, nguyên tắc MVVM/DI & Self-Review Checklist)
- [`CLAUDE.md`](file:///e:/DECOMPILER/Game/com.media720.games2020/CLAUDE.md) (Đồng bộ luật cứng cho Claude Code / AI Assistants)
- [`.clinerules`](file:///e:/DECOMPILER/Game/com.media720.games2020/.clinerules) (Đồng bộ luật cứng cho Cline / Roo Code)
