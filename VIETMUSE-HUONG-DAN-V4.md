# VietMuse V4 — Hướng dẫn bằng tiếng Việt cho người mới

## 1. Cập nhật website (GitHub Pages)

1. Tải `vietmuse-bilingual-v4.zip`, giải nén.
2. Mở repository GitHub đang chạy website.
3. Chọn **Add file → Upload files**, kéo **toàn bộ các file và thư mục BÊN TRONG `ban-tin-moc`** lên để thay thế file cũ. Không upload riêng ZIP.
4. Nhấn **Commit changes**. Bảo đảm `index.html` ở thư mục gốc repository.
5. Vào **Settings → Pages** và kiểm tra đã đặt nhánh `main`, thư mục `/(root)`.
6. Mở URL GitHub Pages cũ; nhấn Cmd+Shift+R để làm mới.

Website vẫn dùng các đường dẫn cũ, vì vậy không bắt buộc đổi repository hoặc URL.

## 2. Tên và logo

- Tên thương hiệu: `VietMuse` — trong `assets/js/data.js`, biến `window.SITE.name` và `brandMain`, `brandAccent`.
- Logo gốc đã được tải trực tiếp từ Google Drive của nhóm và nhúng thành các file LOCAL:
  - `assets/images/vietmuse-original.webp` — logo đầy đủ.
  - `assets/images/vietmuse-mark.webp` — biểu tượng hoa sen cho header/footer.
  - `assets/images/vietmuse-favicon.png` — biểu tượng tab trình duyệt.
- HTML header/footer nằm trong hàm `nav()` / `footer()` của `assets/js/app.js`.
- Kích thước logo và bố cục nằm cuối `assets/css/style.css`.
- Không cần để file gốc trên Google Drive ở chế độ Public để logo hoạt động.

## 3. Hai ngôn ngữ VI / EN

- Nút **VI / EN** nằm ở thanh điều hướng, cũng dùng được trên điện thoại.
- Giao diện, menu, biểu mẫu CMS và 18 bài minh họa có cả hai ngôn ngữ.
- Ngôn ngữ chọn được lưu riêng trong trình duyệt bằng `localStorage`.
- Các bài do độc giả/biên tập viên viết **không tự động dịch**. Khi viết bài mới, chọn ngôn ngữ bài (`Tiếng Việt` hoặc `English`). Bài được hiển thị trong danh mục tương ứng với ngôn ngữ đã chọn. Muốn có cùng tin ở hai bản, cần viết và đăng hai bài (EN và VI).
- `assets/js/i18n.js`: bản dịch giao diện; `assets/js/content-vi.js`: nội dung demo tiếng Việt; `assets/js/data.js`: nội dung demo tiếng Anh.
- Khi chưa kết nối Supabase, website vẫn hiển thị các bài minh họa nhờ dữ liệu cục bộ.

## 4. Cập nhật Supabase (phần đăng nhập, CMS, forum)

**Bắt buộc nếu muốn đăng bài thật:**
1. Tạo project trong Supabase (nếu chưa tạo).
2. Nếu lần đầu dùng CMS, chạy `backend/02-V3-SUPABASE.sql` trong **Supabase Dashboard → SQL Editor**. Nếu đã chạy V3 trước đó, không chạy lại toàn bộ script tùy tiện vì các policy có thể đã tồn tại.
3. Chạy thêm **`backend/03-VIETMUSE-BILINGUAL.sql`** — bổ sung cột `language` cho bài viết. Nếu chưa chạy file này, form gửi bài trong V4 sẽ báo lỗi thiếu cột `language`.
4. Trong Supabase, vào **Project Settings → API** (hoặc **Connect**) và sao chép **Project URL**, dạng `https://xxxx.supabase.co`.
5. Mở `assets/js/config.js`, điền địa chỉ vào `supabaseUrl: ''`. File đã giữ Publishable Key hiện có. Không dán secret key/service_role vào website.
6. Upload bản cập nhật `assets/js/config.js` lên GitHub để website kết nối dữ liệu.
7. Trong Supabase Authentication → URL Configuration: đặt Site URL là URL GitHub Pages thật; thêm Redirect URL là `https://YOURNAME.github.io/YOURREPO/tai-khoan.html` để link xác minh email hoạt động.

**Lưu ý:** Project URL vẫn chưa được cung cấp. Hiện tại ZIP không tự kết nối được Supabase và chưa thể kiểm thử đăng nhập trực tuyến.

## 5. Cấp quyền điều hành cho email đã chỉ định

T đã tạo một file SQL RIÊNG bên ngoài ZIP chính: `VietMuse-CAP-QUYEN-ADMIN-CHAY-RIENG-TRONG-SUPABASE.sql`.

- **KHÔNG đưa file SQL này lên GitHub**, vì nó chứa email cá nhân dùng để cấp quyền.
- Mở Supabase Dashboard → SQL Editor → tạo query mới.
- Sao chép nội dung SQL RIÊNG, nhấn Run. Lệnh `INSERT ... ON CONFLICT` tạo/cập nhật quyền admin gắn với email được chỉ định.
- Sau đó đăng ký tại `tai-khoan.html` **bằng đúng email**, mở thư xác minh Supabase, xác minh, đăng nhập.
- Truy cập `duyet-bai.html`. Quyền Admin chỉ có hiệu lực nếu email tài khoản đã được xác minh trong Supabase Auth.
- Admin có quyền viết/sửa/xóa/duyệt bài, xét bình luận và quản lý email biên tập viên.
- Không cấp quyền trong JavaScript: cơ sở dữ liệu sử dụng RLS và kiểm tra email đã xác minh.
- File SQL RIÊNG chỉ *chuẩn bị lệnh*; quyền chưa được kích hoạt cho đến khi m trực tiếp chạy lệnh trên Supabase.

## 6. Trạng thái kiểm thử

Các file đã được kiểm tra bằng kiểm tra cú pháp JavaScript, tính đầy đủ liên kết asset, dữ liệu 18 bài mẫu và ảnh logo cục bộ. Việc xác thực Supabase, cấp quyền Admin, duyệt bài và đăng hai ngôn ngữ **chưa được thử với project thật**, vì chưa có Project URL và thông tin kết nối thực tế.

## 7. Chú ý bảo mật

- Không bao giờ đưa Supabase Secret Key, service_role key, mật khẩu admin, hay lệnh SQL chứa email riêng vào code GitHub công khai.
- Publishable Key có thể xuất hiện trong frontend, nhưng mọi bảng phải bật RLS.
- Trang web là dự án học tập, các bài demo chưa phải báo chí được kiểm chứng.
