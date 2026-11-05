# VietMuse V10 — Menu điện thoại, Newsroom và Media Library

**Các thay đổi**

- Điện thoại → menu **☰ → Gửi bài Góc nhìn / Submit a Perspective**. Tất cả độc giả nhìn thấy; khi gửi bài phải đăng nhập, bài đi vào trạng thái *Pending review*.
- Tài khoản Editor/Admin → **Account → Newsroom · Manage articles**, hoặc **☰ → Newsroom · Publish articles** trên điện thoại. Trang `quan-ly-bao.html` dùng để tạo/sửa bài báo, ảnh bìa, tiêu đề, chuyên mục và trạng thái.
- Trang mới **Thư viện ảnh / Media Library**: `thu-vien-anh.html`. Chỉ Editor/Admin được mở. Upload JPG/PNG/WebP tối đa 2 MB → Copy image URL hoặc Copy image snippet. Chỉ ảnh trong thư mục của tài khoản hiện tại được liệt kê.
- Trang Newsroom: công cụ chèn ảnh có ô *Caption*, *Photo source*, mở thư viện ảnh trong tab mới, chèn ảnh URL hoặc tải ảnh trực tiếp.
- Nội dung bài giờ hiểu cú pháp `[[image|URL|Caption|Source]]`. Cú pháp cũ `[[image|URL|Caption]]` vẫn hoạt động.

## A. Cài trên Supabase (1 lần)

1. Chọn đúng Project VietMuse trong Supabase Dashboard.
2. Vào **Storage → Buckets**, kiểm tra bucket `news-covers` có trạng thái **Public**. Nếu chưa có, file SQL V10 sẽ tạo. Nếu đã có nhưng để Private, hãy xác nhận và đổi Public trong Storage trước khi sử dụng liên kết ảnh. Chú ý: mọi người có URL ảnh công khai đều xem được ảnh, kể cả bản nháp.
3. Vào **SQL Editor → New query**. Dán và chạy toàn bộ nội dung `backend/05-VIETMUSE-MEDIA-LIBRARY.sql`.
4. Đảm bảo đã chạy các migration trước: 02 (core), 03 (language), 04 (editor/translator), và đã cấp quyền email Editor/Admin. SQL 05 **không xóa** tài khoản, bài viết, bảng hoặc bucket hiện tại.

## B. Upload V10 lên GitHub Pages

1. Tải `VietMuse-V10-cap-nhat-nho.zip`, giải nén.
2. Trong repository website, cập nhật đúng đường dẫn các file từ ZIP. `index.html`, `assets/js/app.js`, `assets/js/v3.js`, `assets/js/newsroom.js`, `assets/js/media.js`, `assets/css/style.css`, ... phải nằm đúng vị trí.
3. Bản cập nhật nhỏ **không chứa** `assets/js/config.js`, nên không ghi đè Supabase URL/API key đang hoạt động.
4. Commit, vào **Actions** chờ deploy thành công, rồi refresh `Command + Shift + R` hoặc mở tab ẩn danh.
5. Nếu `thu-vien-anh.html` hiện lỗi chưa kết nối Supabase, kiểm tra Project URL, publishable key và việc đã đăng nhập tài khoản có quyền.

## C. Cách đăng bài có ảnh ở giữa đoạn

1. Đăng nhập tài khoản Editor/Admin → vào **Newsroom**.
2. Nhấn **+ New article**; chọn chuyên mục, ngôn ngữ, tiêu đề, tác giả, nội dung.
3. Mở trang **Media Library** từ nút trong trình soạn; chọn ảnh từ máy và nhấn **Upload & get link**.
4. Có thể **Copy image URL**, về trình soạn dán URL vào ô **Insert image URL**, nhập **Caption** + **Photo source**, nhấn **Insert URL image**. Công cụ sẽ chèn ảnh ngay tại vị trí con trỏ của ô nội dung.
5. Hoặc nhanh hơn, chọn **Copy image snippet** trong Media Library, dán mã vào dòng trống giữa hai đoạn trong ô nội dung bài.
6. Nhấn **Preview article** trước khi **Save draft** / **Publish**.

Mẫu nội dung:

```text
Đoạn mở đầu của bài báo, có thể dài nhiều câu.

[[image|https://.../photo.webp|Ảnh minh họa cuộc phỏng vấn|Nhóm VietMuse]]

Đoạn thứ hai tiếp tục ở đây.
```

Sau khi xuất bản, website hiển thị ảnh, dòng chú thích và dòng **Nguồn: Nhóm VietMuse** (English: **Source: VietMuse Team**). Mã chèn ảnh chỉ được render ở phần nội dung bài; không chạy HTML/JavaScript người dùng gửi.

## D. Các giới hạn và kiểm thử

- URL và file ảnh dùng bucket công khai Supabase, không phải kho ảnh riêng tư. Không tải lên ảnh nhạy cảm, chưa được phép sử dụng, hoặc ảnh không được phép công khai.
- Danh sách ảnh chỉ lấy 60 tệp gần nhất do **tài khoản hiện tại** upload; không phải trình quản lý tất cả media của mọi biên tập viên.
- Không cần chạy lại 02/03/04 nếu đã chạy; chỉ thêm SQL 05.
- Chức năng thật cần kiểm thử với tài khoản Editor/Admin trên Supabase đang hoạt động; chỉ kiểm tra tĩnh code và trình duyệt nội bộ không chứng minh kết nối thật.
