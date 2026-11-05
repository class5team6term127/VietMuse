# VIETMUSE V16 — ABOUT US / VỀ CHÚNG TÔI

Bản thiết kế mới cho trang giới thiệu, dựa trên đúng nội dung About Us mà nhóm cung cấp.

## Các file cần thay đổi (chỉ 3 file)

1. `gioi-thieu.html` — liên kết các tài nguyên mới.
2. `assets/css/about.css` — giao diện editorial responsive.
3. `assets/js/about.js` — nội dung tiếng Anh và tiếng Việt, giữ nguyên phần header/footer của VietMuse.

Cách cập nhật: Upload 3 file đúng đường dẫn vào repository GitHub Pages, Commit Changes, đợi Actions deploy, mở lại `gioi-thieu.html` và hard-refresh nếu cần. KHÔNG cần chạy SQL, KHÔNG thay config.js hoặc dữ liệu Supabase.

## Thiết kế

- Hero nền đỏ gạch, logo VietMuse trong vòng tròn trang trí, chữ serif lớn.
- Giới thiệu có bố cục editorial, hai phần Approach / Mission và Editorial Board.
- Minh họa từ `assets/images/culture.svg` có sẵn trong website.
- Các nút sang trang chủ và gửi bài Góc nhìn, bố cục mobile.
- Nội dung EN là nguyên văn người dùng cung cấp; VI là bản dịch tương ứng.
- Chưa tạo hồ sơ nhân sự giả; ban biên tập được đánh dấu sắp cập nhật.

## Tương thích

Áp dụng trên VietMuse V15, tiếp tục tương thích code V12–V14 do chỉ thêm tài nguyên riêng cho About Us. Nếu website đã chỉnh sửa độc lập sau V15, chỉ thay ba file, không thay file khác.
