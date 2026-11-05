# VietMuse V8 — Hướng dẫn sử dụng Newsroom (VI/EN)

Bản này kế thừa VietMuse V6/V7 đang dùng **GitHub Pages + Supabase**. Không cần tạo lại tài khoản, không cần chạy lại file 02-V3-SUPABASE.sql và **không reset database**.

## 1. V8 có gì mới?

- Trang quản trị riêng: `quan-ly-bao.html` (chỉ dành cho **Administrator**).
- Danh sách tất cả **bài trong Supabase CMS**, gồm `news` và `forum`, kể cả bản nháp, chờ duyệt, đã xuất bản, bị từ chối.
- Tìm theo tiêu đề/tác giả/biên tập viên/dịch giả; lọc loại bài, chuyên mục, trạng thái; xếp theo mới, cũ, lượt xem, bình luận.
- Tạo, sửa, xóa, lưu nháp, chờ duyệt, xuất bản bài báo; lựa chọn tiếng Việt hoặc tiếng Anh cho **từng bài**.
- Các trường **Tác giả** (bắt buộc), **Biên tập viên** và **Dịch giả** (không bắt buộc). Chỉ nhập trường nào muốn công khai.
- Chèn ảnh bìa từ đường dẫn HTTPS hoặc file ảnh. Chèn thêm ảnh giữa bài và chú thích ảnh. Không chấp nhận HTML tự do.
- Thẻ tác giả/byline phía trên bài như báo điện tử: avatar ký tự, tên tác giả, biên tập viên/dịch giả (nếu có), ngày đăng.
- Nút **Import demo drafts** để chuyển 18 bài minh họa từ mã cũ sang CMS dưới dạng nháp. KHÔNG tự xuất bản nội dung chưa kiểm chứng.

## 2. Chạy SQL V8 — PHẢI LÀM TRƯỚC

1. Vào https://supabase.com/dashboard → chọn project VietMuse.
2. Trước khi thay đổi cơ sở dữ liệu, nên tạo bản sao lưu phù hợp với gói đang dùng. Đừng bấm reset hay xóa bảng.
3. Nếu trước đây m **chưa** chạy file `backend/03-VIETMUSE-BILINGUAL.sql`, hãy chạy file đó trước. Nếu đã có cột `language`, không cần chạy lại.
4. Vào **SQL Editor → New query**, sao chép toàn bộ `backend/04-VIETMUSE-NEWSROOM.sql`, nhấn **Run**.
5. Kết quả cuối sẽ hiện hai dòng `editor_name` và `translator_name`.
6. Nếu PostgREST chưa cập nhật schema, chạy riêng:

```sql
NOTIFY pgrst, 'reload schema';
```

**File 04 chỉ bổ sung cột và index**, không xóa dữ liệu, không thay quyền đã có. Đừng chạy lặp lại file khởi tạo 02, vì các policy có thể báo trùng.

## 3. Kiểm tra quyền Administrator

Đăng nhập bằng tài khoản đã được cấp vai trò Admin (nhóm đã có thể cấp qua bảng `news_roles`). Trang này sẽ từ chối tài khoản Reader/Editor; biên tập viên vẫn dùng `duyet-bai.html` để quản lý tin và forum theo quyền cũ.

Nếu thấy Access denied, vào Supabase → **SQL Editor** để kiểm tra email đã được xác minh và quyền đã được gán (đổi email mẫu thành email thật):

```sql
SELECT r.email, r.role,
       u.email_confirmed_at IS NOT NULL AS email_verified
FROM public.news_roles r
LEFT JOIN auth.users u ON lower(u.email) = r.email
WHERE r.email = 'your-email@example.com';
```

Vai trò **admin** chỉ được gán bằng Supabase SQL Editor hoặc một Admin hiện có, **không gán quyền bằng cách sửa JavaScript**.

## 4. Cài vùng lưu ảnh

Vào Supabase → **Storage** → nếu chưa có bucket, tạo `news-covers`, chọn **Public**. Tệp SQL V3 đã tạo chính sách tải ảnh từ thư mục mang UUID của tài khoản; nếu gặp `new row violates row-level security policy`, hãy kiểm tra chính sách Storage thay vì tắt RLS.

Khi dùng nút tải ảnh trong Newsroom:
- JPG/PNG/WebP, tối đa 2 MB mỗi ảnh.
- Ảnh bìa: hiện trên trang chủ/danh sách và đầu bài báo.
- Ảnh trong bài: chọn file ở phần **Upload inline image** → **Upload & insert**. Công cụ thêm mã ký hiệu như `[[image|https://...|Chú thích ảnh]]` vào vùng nội dung, sau đó bấm lưu bài.
- Dùng ảnh có quyền sử dụng. **Bucket Public nghĩa là người biết URL có thể xem ảnh ngay cả trước khi bài được duyệt**. Không tải ảnh nội bộ, ảnh cá nhân nhạy cảm hoặc tài liệu mật lên bucket này.

## 5. Upload code lên GitHub

**Khuyên dùng file `VietMuse-V8-only-changed-files.zip`**, không chứa `config.js`, nên tránh ghi đè kết nối Supabase đã hoạt động.

1. Giải nén ZIP.
2. Mở GitHub repository của VietMuse và giữ `index.html` ở thư mục gốc.
3. Đặt từng tệp vào **đúng đường dẫn trong ZIP**: `assets/js/v3.js`, `assets/js/newsroom.js`, `assets/js/app.js`, `assets/css/style.css`, `quan-ly-bao.html`, các trang HTML khác (để cập nhật chống cache).
4. Commit changes. Vào tab **Actions** đợi Pages triển khai thành công rồi mới mở website.
5. Trên Mac, nhấn `Command + Shift + R` để tải bản JavaScript mới.

Nếu trang `/quan-ly-bao.html` hiện **404**: kiểm tra file đó nằm cùng cấp với `index.html` trong nhánh/folder đang dùng để publish GitHub Pages.

## 6. Mở trang quản trị

Địa chỉ sẽ là `https://TEN-TAI-KHOAN.github.io/TEN-REPO/quan-ly-bao.html` (thay bằng URL web hiện tại của nhóm). Hoặc vào **Account → Newsroom · Manage all articles** khi tài khoản đã là Admin.

Trên Newsroom:
1. **New article**: tạo bài báo; chọn category, VI/EN, nhập tác giả và nội dung.
2. **Editor / Translator**: trường tùy chọn. Bỏ trống sẽ **không hiển thị** trong bài.
3. **Cover image / Upload**: URL ảnh HTTPS hoặc tải ảnh bìa từ thiết bị.
4. **Body**: có nút tạo đề mục, chữ đậm, trích dẫn, upload ảnh kèm chú thích. Nhấn **Preview article** để xem trước (không tự lưu).
5. **Save draft**: lưu riêng, chưa công khai. **Publish**: công khai. **Pending review**: đưa về chờ duyệt. **Save changes**: giữ nguyên trạng thái hiện tại.
6. **Edit / Delete / View**: sửa bài, xóa vĩnh viễn (xóa cả phản hồi liên quan), mở bài đã xuất bản.

## 7. View và các bài cũ

- Bảng `news_metrics` đã có sẵn từ V3; thống kê `views` không phải Google Analytics. Cơ chế V3 ước tính **mỗi thiết bị/ngày tính một lượt**, có thể bị thao túng và không phải số độc giả duy nhất.
- Những bài đã lưu trong **Supabase** sẽ xuất hiện tự động trong Newsroom. **18 bài demo tĩnh ở `assets/js/data.js` không tự động hiện**; bấm **Import demo drafts** nếu muốn quản lý chúng bằng CMS. Chúng được đánh dấu `[DEMO]`, lưu nháp; chỉ đăng sau khi thay bằng nội dung đã xác minh.
- Mọi bài có ngôn ngữ gốc riêng, nút VI/EN **không tự dịch bài đăng**. Để có hai bản dịch, tạo hai bài và ghi dịch giả nếu thích.

## 8. Nếu gặp lỗi

- `Could not find the ... column`: chưa chạy file 04 hoặc chưa reload schema.
- `Access denied`: quyền Admin chưa được gán cho email đã xác minh, hoặc session chưa tải lại. Đăng xuất → đăng nhập.
- `Bucket not found`: chưa tạo Storage bucket `news-covers`.
- `Cannot save article`: kiểm tra tiêu đề từ 8–180 ký tự, tóm tắt 15–400, nội dung 60–30000 và ảnh phải là HTTPS.
- `No matching articles`: chưa có bài trong Supabase hoặc bộ lọc đang thu hẹp kết quả.

**Quan trọng:** Các thao tác tạo/sửa/xóa thực sự kết nối Supabase sau khi triển khai. Bộ file đã được kiểm tra tĩnh (cú pháp JS, asset HTML, SQL additive). Chưa kiểm thử trực tiếp với Supabase project của nhóm và không tuyên bố đã đưa lên GitHub hộ nhóm.
