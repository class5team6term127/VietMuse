# VietMuse V24 — Gửi bài Góc nhìn không cần đăng nhập

## Điều thay đổi

- Độc giả mở `gui-bai.html`, nhập tên/bút danh, tiêu đề, nội dung, chọn ngôn ngữ và có thể thêm poll, **không cần email/mật khẩu**.
- Lúc bấm gửi, Supabase tự tạo một phiên **anonymous Auth**. Đây không phải tài khoản đã đăng ký; không hiển thị như đã đăng nhập trong UI. Nó dùng để liên kết `user_id` hợp lệ và giữ RLS của database cũ.
- Bài được lưu vào `news_posts` dưới dạng `post_type='forum'`, `category='goc-nhin'`, `status='pending'`. Ban biên tập duyệt ở Newsroom/Moderation như trước. **Không tự đăng công khai**.
- Hiển thị mã tham chiếu bài đã gửi (UUID); khách nên lưu mã nếu cần hỏi ban biên tập về trạng thái. Không có dashboard theo dõi bài cho khách.
- Người dùng đăng ký tài khoản vẫn đăng bài và upload ảnh như trước. Khách chỉ đăng văn bản + bình chọn; **không được upload ảnh**, biên tập viên có thể thêm ảnh khi duyệt.

## Cài trên GitHub

1. Dùng gói vá nhỏ V24, tải các file đúng cấu trúc:
   - `gui-bai.html`
   - `assets/js/v3.js`
   - `assets/js/i18n.js`
   - `backend/09-VIETMUSE-GUEST-FORUM.sql` (tài liệu setup, không chạy trên GitHub)
2. Commit; đợi GitHub Pages hoàn tất triển khai; mở `https://class5team6term127.github.io/VietMuse/gui-bai.html` trong cửa sổ ẩn danh.
3. Đừng ghi đè hoặc chia sẻ `assets/js/config.js`; gói vá không chứa file đó.

## BẮT BUỘC: bật Anonymous Sign-ins trên Supabase

1. Vào https://supabase.com/dashboard → project VietMuse.
2. Xác định mục **Authentication → Providers → Anonymous Sign-ins** (tên hoặc vị trí có thể thay đổi); bật **Enable** sau khi chạy SQL 09 ở bước tiếp theo.
3. Mở **SQL Editor → New query** rồi chạy file `backend/09-VIETMUSE-GUEST-FORUM.sql` để giới hạn gửi spam từ guest, không cho guest gửi bình luận/bình chọn hoặc upload ảnh trực tiếp bằng API. SQL không xóa bài viết/tài khoản hiện có.
4. Kiểm tra dòng cuối `guest_limiter_installed = 1`.

**Lưu ý:** Chỉ up ZIP lên GitHub mà không bật Anonymous Sign-ins thì khách vẫn không gửi được. Không cần chạy lại SQL 01–08 khi chúng đã hoạt động.

## Kiểm tra sau khi cài

1. Tab ẩn danh/điện thoại chưa đăng nhập → vào `gui-bai.html` → thấy nút **Submit for review** sử dụng được.
2. Gửi thử một bài do chính nhóm viết, dài từ 60 ký tự, chọn poll hay không tùy ý. Một mã bài xuất hiện.
3. Vào Supabase → Table Editor → `news_posts`: bản ghi mới có `post_type=forum`, `status=pending` và `user_id` của phiên anonymous.
4. Admin/Editor đăng nhập mở `duyet-bai.html` hoặc `quan-ly-bao.html` để duyệt thử. Khi chưa duyệt, bài không hiện công khai.
5. Mở một tab đăng nhập thật → ảnh bìa và dashboard tài khoản vẫn hoạt động như cũ.
6. Test cả VI/EN trên điện thoại.

## An toàn & giới hạn

- SQL 09 giới hạn **3 bài / 24 giờ**, cách nhau tối thiểu **10 phút**, trên **mỗi phiên guest**. Không ngăn được mọi hình thức spam nếu kẻ xấu có thể tạo nhiều phiên; Supabase có giới hạn số lần tạo phiên anonymous theo IP. Với website công khai, cân nhắc thêm Cloudflare Turnstile / hCaptcha đúng cách trước khi mở rộng: bật CAPTCHA trên Supabase sẽ đòi hỏi tích hợp CAPTCHA vào cả luồng đăng nhập/đăng ký hiện có.
- Supabase anonymous sign-ins tạo bản ghi Auth thật, có thể ảnh hưởng quota dự án. Không nên xóa hàng loạt anonymous users khi chưa thiết kế cách bảo tồn bài: `news_posts.user_id` đang có `ON DELETE CASCADE`, xóa user có thể xóa cả bài của họ.
- Khách không thể quay lại cùng tài khoản nếu mất session. Cần tài khoản email nếu muốn theo dõi lịch sử sau này.
- Không dùng service_role/secret key trong GitHub Pages.
- Nếu đã bật login CAPTCHA cho Auth, cần bổ sung widget/token CAPTCHA vào form trước khi thử phương thức anonymous.

Đây là bản code dùng kết nối Supabase sẵn có. Chưa test trực tiếp trên database sản xuất của nhóm, nên sau khi triển khai cần kiểm tra bằng một bài thử trước khi công bố tính năng.
