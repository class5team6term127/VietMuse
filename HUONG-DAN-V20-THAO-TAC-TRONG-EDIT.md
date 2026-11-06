# VietMuse V20 — Gộp View / Delete vào trang Edit

## Những gì đã thay đổi

- Newsroom (`quan-ly-bao.html`): cột **Actions** chỉ còn nút **✍️**, có tên hỗ trợ cho trình đọc màn hình.
- Nhấn ✍️ trên **bài báo** → mở trang biên tập song ngữ (`soan-bai-song-ngu.html?id=...`). Ngay phía trên form có mục **Article management / Quản lý bài viết** chứa **View** phiên bản VI/EN đã xuất bản và **Delete**.
- Nhấn ✍️ trên **bài Forum** → mở form chỉnh sửa Forum trong Newsroom. Ngay dưới form có **View** (nếu đã công khai) và **Delete**.
- Với **bài nháp/chờ duyệt**, nút View bản công khai không xuất hiện vì người đọc không thể truy cập; dùng nút Preview/Xem trước đã có trong trình soạn.
- **Delete bài báo song ngữ** xóa cả hai phiên bản VI/EN cùng các bình luận/dữ liệu liên quan, sau khi hiện hộp thoại xác nhận. Không thể hoàn tác. File ảnh/video trong Storage không được tự xóa.
- **Delete bài Forum** xóa đúng bài Forum và dữ liệu liên quan như trước, sau khi xác nhận.
- Bài chưa lưu lần đầu sẽ không có phần Delete cho tới khi lưu nháp/xuất bản thành công.

## Cài vào GitHub Pages

1. Tải và giải nén file `VietMuse-V20-cap-nhat-nho.zip`.
2. Upload **đúng đường dẫn** 6 file sau vào repository VietMuse, ghi đè file cùng tên:
   - `assets/js/newsroom.js`
   - `assets/js/bilingual-editor.js`
   - `assets/css/style.css`
   - `assets/css/bilingual-editor.css`
   - `quan-ly-bao.html`
   - `soan-bai-song-ngu.html`
3. Commit changes; chờ GitHub Pages deploy xong. Dùng tab ẩn danh hoặc reload không dùng cache.
4. Đăng nhập quyền Editor/Admin, vào Newsroom, nhấn ✍️ trên một bài và kiểm tra View/Delete trong form.

**Không cần chạy SQL.** Không chỉnh `assets/js/config.js`; mọi quyền vẫn do Supabase Auth và Row Level Security quyết định.

## Lưu ý trước khi xóa

Hãy kiểm tra kỹ rằng đúng bài cần xóa, đặc biệt khi có hai bản VI/EN. Việc xóa bài song ngữ là vĩnh viễn; nên sao lưu dữ liệu định kỳ.

## Trạng thái kiểm thử

Đã kiểm tra cú pháp JavaScript, nội dung được kết xuất của bảng Newsroom và hai trường hợp bản nháp/đã xuất bản trong trình soạn song ngữ bằng mô phỏng code. Chưa kiểm chứng xóa thật trên dự án Supabase đang chạy.

**Lưu ý về bản website đầy đủ:** Bộ website không kèm `assets/js/config.js`. Hãy **giữ nguyên config.js đang chạy trên GitHub** để không mất kết nối Supabase.
