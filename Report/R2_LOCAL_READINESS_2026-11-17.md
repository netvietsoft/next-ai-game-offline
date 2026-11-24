# Kiểm tra gói R2 trước upload — 2026-11-17

**Kết quả: PASS cho gói cục bộ.** Chưa xác nhận upload, DNS, CDN hoặc gameplay trên thiết bị từ báo cáo này.

| Kiểm tra | Kết quả |
| --- | --- |
| Catalog phát hành | 419 game = 100 bundled + 319 remote |
| ZIP/source/integrity record | 319 / 319 / 319, cùng tập game |
| Tổng dung lượng ZIP | 1.005.530.891 bytes (~958,95 MiB) |
| Tổng dữ liệu giải nén | 1.710.644.967 bytes |
| Tổng tệp trong ZIP | 29.525 |
| SHA-256 + size ZIP so với manifest Android | 319/319 khớp |
| File count + extracted size so với manifest | 319/319 khớp |
| Đọc giải nén toàn bộ và CRC | 29.525/29.525 tệp đạt |
| Nội dung ZIP so với source hiện có | 29.525/29.525 tệp SHA-256 khớp; không thiếu/thừa |
| Root `index.html` không rỗng | 319/319 |
| Path/symlink/encryption/compression/duplicate/executable bị chặn | 0 lỗi |
| Trần ZIP/extracted size 128 MiB và 10.000 tệp/gói | Tất cả đạt |

Đã kiểm tra tất cả 100 game bundled có `index.html`; thư mục `iads` có `index.html` nhưng là tài nguyên dùng chung, không tính là game thứ 101.

Manifest được kiểm tra: `Android/src/main/assets/r2_game_integrity.json`.
SHA-256 của tệp manifest tại thời điểm kiểm tra:
`c3b059f1950ace8967038a461365b8af0616a342215059fbf05e1a70795b6273`.

## Điều kiện triển khai

- Upload đúng bytes các tệp `R2_Upload/packages/{game_name}.zip` tới object key `games/{game_name}.zip`.
- Android hiện chỉ cho URL canonical `https://pub-r2.nextai.games/games/{game_name}.zip`, HTTPS, không redirect. Thay host cần cập nhật catalog và chính sách Android tương ứng.
- Sau upload cần tải qua URL public và xác minh SHA-256/size đủ 319 gói, không chỉ tin `HEAD` metadata. Kiểm tra tải/cài/chơi trên thiết bị vẫn cần thực hiện.
- Không cần đóng gói lại cho bộ source hiện tại: audit không tìm source drift. Mọi lần thay bytes ZIP phải đồng bộ manifest và bản app; không thay ZIP ở cùng URL mà bỏ qua tương thích app đã phát hành.
- Kiểm tra này xác nhận cấu trúc và tính toàn vẹn, không khẳng định mọi game, SDK quảng cáo hay ngôn ngữ UI đều chạy đúng. Các giới hạn từng game còn ở `Docs/AUDIT_AD_PLACEMENTS_2026-11-17.md`.

## Gói lớn nhất

| Game | ZIP bytes | Extracted bytes | Files |
| --- | ---: | ---: | ---: |
| build_land | 23.794.577 | 43.830.746 | 719 |
| word_pictures | 16.940.809 | 23.534.032 | 709 |
| jigsaw_master | 16.258.058 | 18.902.454 | 148 |
| hero_match | 15.760.404 | 22.716.399 | 322 |
| horror_spranky_beats | 15.233.161 | 16.554.416 | 126 |

Không sửa source, ZIP, catalog hoặc manifest trong lần kiểm tra này.
