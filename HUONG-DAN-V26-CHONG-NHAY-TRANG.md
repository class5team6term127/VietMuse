# VietMuse V26 — Sửa hiện bài demo trước khi bài thật tải xong

## Nguyên nhân
`assets/js/app.js` dựng dữ liệu mẫu tại `DOMContentLoaded`, sau đó `assets/js/v3.js` đợi Supabase Auth và hai truy vấn (`news_posts`, `news_metrics`) rồi ghi đè trang chủ bằng bài thật. Vì thế F5 thấy trang báo bị đổi ảnh/tiêu đề đột ngột.

## Đã sửa
- Trang chủ, chuyên mục, Most Read/Explore, tìm kiếm không bao giờ hiển thị bài mẫu trước bài thật.
- Trong lúc chờ dữ liệu, chỉ hiện trạng thái tải nhẹ, tự tắt khi Supabase trả kết quả.
- Trang công khai không chờ kiểm tra tài khoản trước khi tải bài báo.
- Không tải và dựng lại bài công khai khi trạng thái đăng nhập thay đổi.
- Bản VI được chuyển ngôn ngữ đồng bộ ngay khi dựng để tránh nháy tiếng Anh → tiếng Việt.
- Nếu Supabase lỗi, hiển thị thông báo kết nối + nút thử lại; không nói sai rằng chưa đăng bài.
- Không đổi database, Newsroom, Media Library, Storage hay cơ chế tính view.

## Cài đặt
1. Tải ZIP cập nhật nhỏ. Giải nén và đưa các file vào **đúng đường dẫn** trong GitHub repository VietMuse, giữ nguyên các thư mục con.
2. Commit changes, kiểm tra GitHub Pages deploy thành công.
3. Reload trang chủ bằng tab ẩn danh / Cmd+Shift+R. Chờ bài thật tải xong; không còn ảnh/tiêu đề mẫu hiện trước đó.
4. Thử chuyển VI/EN, mở chuyên mục, Most Read, tìm kiếm và trang About Us để bảo đảm các tính năng trước còn hoạt động.

### Không cần SQL
Không cần chạy lại SQL migration. Bản cập nhật nhỏ không chứa `config.js`, không ghi đè Supabase project.

### Nếu muốn cập nhật thủ công
Chủ yếu sửa `assets/js/app.js`, `assets/js/v3.js`, `assets/js/i18n.js` và thêm skeleton CSS vào `assets/css/style.css`. Bốn HTML công khai được sửa query `?v=...` để tránh dùng cache JS cũ.

### Giới hạn kiểm tra
Kiểm tra cú pháp và các luồng mock đã đạt, nhưng chưa đăng lên GitHub hoặc test với Supabase thật. Nếu API chậm thì skeleton hiện lâu hơn thay vì hiện sai bài báo; tốc độ mạng/Supabase vẫn quyết định thời gian trả dữ liệu.

### Các quy tắc VietMuse giữ nguyên
- Không hiển thị số thứ tự 01/05... trong Meet Our Team.
- Email Đào Mai Chi là `daomaichi@gmail.com`.
