# Kiểm kê điểm quảng cáo game – 2026-11-17

## Phạm vi và giới hạn

Kiểm tra tĩnh các tệp `.js`/`.html` trong `Android/src/main/assets/games/` (100 game đóng gói) và nguồn tại `R2_Upload/games/` (319 game remote). Đây là tìm chuỗi/cú pháp, không chứng minh nhánh chạy, nút người chơi, worker và tất cả điểm đặt quảng cáo. Gói ZIP R2 vẫn phải khớp manifest SHA-256; chưa sửa hoặc tải lên các gói đó. Không tính các file thư viện chung là game riêng. Cần kiểm thử trên thiết bị với test ads và game thực tế trước khi kết luận đầy đủ.

## Bridge Android trực tiếp được tìm thấy

- Interstitial: bundled `memory_match`, `solitaire_classic`, `solitaire_spider`, `tic_tac_toe`; nguồn R2 `among_us`, `angry_heroes`, `color_by_number`. Đây là các chuỗi `Android.showInterstitialInGame(...)` trực tiếp; yêu cầu thực tế vẫn qua giới hạn tần suất và consent/VIP.
- Rewarded: bundled `bee`, `cryptogram`, `pao_pao`, `water_sort`, `yellow_dot`; nguồn R2 `build_land`, `color_by_number`, `coloring_book`, `cowboy_shoot`, `golf_pin`, `jacko_gunner`, `jigsaw_puzzle`, `solitaire_tripeaks`, `tile_master_match`. Các callback đã thấy được ánh xạ bằng allowlist trong `RewardCallbackResolver`; mỗi game cần kiểm chứng reward có thực sự được trao đúng một lần sau `onUserEarnedReward`.
- `uno_vertical/js/game.js` gọi `sendEvent("showInterstitialInGame", "endRound")`; đã nối riêng event này sang Android, vẫn giữ đường iOS cho event còn lại. Node test routing PASS; placement cuối ván thực tế chưa kiểm chứng. `hero_match/__game-scripts.js` khai báo tên event và callback qua bridge PlayCanvas; phải kiểm tra runtime, không suy ra rằng bridge Android hiện tại đã hoạt động.
- `levelCompleteInGame` cũng có thể yêu cầu interstitial qua bridge hiện tại; đó là tín hiệu hoàn thành màn chơi, không phải chứng cứ rằng toàn bộ vị trí quảng cáo game được nối.

## SDK/giao thức chưa tích hợp

| Game/nguồn | Dấu hiệu mã | Việc còn lại |
| --- | --- | --- |
| `hexa_merge` bundled | `scripts/main.js`: `C3MobileAdvertsAPI.web`; event sheet tham chiếu interstitial | Đã thêm adapter DOM `nextai-c3-adapter.js` nối interstitial vào AdManager, tiếp tục runtime khi đóng/bị chặn; unit test JS PASS. Cần QA placement tự nhiên và no-fill trên thiết bị. Rewarded plugin có trong runtime, nhưng chưa thấy event sheet gọi CreateRewarded; không tự thêm reward. |
| `paper_fold`, `skibidi_toilet` R2 | `scripts/main.js`: cùng dạng C3 web adBreak | Tương tự; nếu phải sửa game nguồn/ZIP, build lại gói và cập nhật SHA manifest trước upload. |
| `spot_the_difference` R2 | `vendor/adbreak.js`: script Google web ads và callback `rewardfailedGame`, `rewardresumeGame` | Xác định thực tế script được gọi, thiết kế adapter cho các callback game; không dùng publisher ID web cũ hoặc nới CSP. |
| `ludo` bundled | `game.js` gọi `gdsdk.showBanner()` nếu SDK tồn tại | Xác minh placement/visibility; banner native riêng đã tồn tại, tránh tạo banner trùng hoặc đè game. |
| `uno_vertical` bundled | helper `sendEvent` gửi endRound | Đã nối riêng event interstitial Android qua gate hiện có; cần QA đến cuối ván thật. |
| `hero_match` R2 | PlayCanvas `JsServiceBridge`, event names và `RewardedComplete` | Kiểm tra đường Android, reward/lỗi và tương thích URL/manifest trước khi thêm adapter. |

Đây không phải danh sách đầy đủ của tất cả SDK được nhúng; các từ khóa tìm là `Android.showInterstitialInGame`, `Android.requestInterstitialAd`, `Android.showRewardedVideo`, `Android.showRewardedInGame`, `Android.requestRewardedVideo`, `adBreak(`, `C3AdUtils`, `C3.Plugins.AdMob`, `C3.Plugins.MobileAdvert`, `CrazyGames.SDK`, `PokiSDK`, `GameDistribution`, `gdsdk`, `ysdk.adv`.

## Không có quảng cáo hoặc chưa nhận thưởng

- Native không gọi callback thưởng khi no-fill, đóng sớm hoặc lỗi; chỉ thông báo và phát event `nextai-reward-unavailable`. Không được gọi callback thành công để giải phóng UI vì có thể trao thưởng sai.
- `build_land`: Promise callback hiện thấy chỉ resolve `true` khi reward thành công; không thấy nhánh native failure cho no-fill. Game có thể chờ vô hạn. Cần thêm một callback từ chối/timeout có kiểm chứng vào bridge game, cập nhật ZIP và manifest, rồi kiểm thử cả thành công và thất bại.
- `cryptogram`, `coloring_book`, `jigsaw_puzzle`: có đoạn tạm khóa `stage.eventMode` rồi tự mở lại sau 300–500 ms ở nhánh đã thấy. Không suy ra mọi popup/nhánh thất bại đã an toàn.
- Những game cũ không lắng nghe event `nextai-reward-unavailable` có thể không phản ứng với lỗi. Cần ma trận test theo game; tuyệt đối không cấp thưởng khi người chơi chưa hoàn thành quảng cáo.

## Đề xuất triển khai adapter C3/adBreak an toàn

1. Lập bản đồ engine, điểm gọi, luồng DOM/worker và callback cho từng game; tái hiện không quảng cáo, xem xong, đóng sớm, lỗi hiển thị và đổi Activity.
2. Adapter chỉ nhận loại placement cố định và ID callback do JavaScript tạo, ánh xạ ID theo session đang sống; không chạy mã JavaScript tùy ý từ game. Ràng buộc vào đúng game/origin, không nới sandbox/CSP và không làm lộ bridge cho trang ngoài.
3. Áp consent, VIP, frequency cap và cache AdManager chung. Reward chỉ gọi `adViewed` sau callback thực sự; lỗi/đóng sớm gọi `adDismissed`/`adBreakDone` phù hợp và khôi phục runtime đúng một lần. Với interstitial bị chặn hoặc no-fill, trả kết quả bất đồng bộ để game không bị kẹt.
4. Kiểm thử với test ads, test giả không có fill và test trên thiết bị thật; mọi thay đổi remote assets cần đóng gói lại, tái tạo allowlist kích thước/SHA-256, tải R2 và test theo phiên bản đã phát hành.
