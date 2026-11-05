# VietMuse V12 — Hướng dẫn đăng bài song ngữ trực tiếp từ Newsroom

## Kết quả
- **New article / Edit** trong `quan-ly-bao.html` mở `soan-bai-song-ngu.html`.
- Một form có **Vietnamese version (VI)** + **English version (EN)**, từng bản có tiêu đề, tóm tắt, nội dung riêng.
- Chọn một chuyên mục; nhập tác giả, biên tập viên, dịch giả (tùy chọn), nguồn gốc, ảnh bìa chung.
- Có nút chèn ảnh vào bản VI/EN bằng URL hoặc tải ảnh, kèm chú thích và nguồn ảnh.
- Save draft: lưu một hoặc hai bản; Publish both: bắt buộc cả hai bản hoàn chỉnh.
- Trong bài báo đã đăng, có nút chuyển sang bản dịch tương ứng. Chuyển VI/EN trong thanh ngôn ngữ cũng mở bài dịch nếu có.
- Thống kê view, bình luận và các quyền Editor/Admin trong CMS vẫn dùng Supabase như trước.
- Có **Import Google Docs draft pack**: nhập JSON 18 cặp / 36 bản nháp từ bộ tài liệu trước, **không tự công khai**.

## A — CÀI ĐẶT CƠ SỞ DỮ LIỆU (bắt buộc)
1. Trong Supabase, **Database → Backups**: sao lưu nếu dự án/gói cho phép; nếu không, hãy xuất dữ liệu quan trọng trước khi chạy migration.
2. Kiểm tra đã chạy các migration cũ `02-V3-SUPABASE.sql`, `03-VIETMUSE-BILINGUAL.sql`, `04-VIETMUSE-NEWSROOM.sql`.
3. Vào **Supabase → SQL Editor → New query**.
4. Sao chép toàn bộ `backend/06-VIETMUSE-BILINGUAL-NEWSROOM.sql` và bấm **Run**.
5. Kiểm tra Results: 4 dòng `source_key`, `source_name`, `source_url`, `translation_group`.
6. SQL 06 **không xóa bài**; nó liên kết các bản nháp từ gói 36 bài trước nếu bạn đã nhập chúng bằng file SQL trước đây.
7. Không chạy `DROP TABLE` hay tải SQL từ nguồn không rõ. Không dán mật khẩu, service_role/secret key vào repo GitHub.

### Nếu chạy SQL báo lỗi
- `relation public.news_posts does not exist`: trước tiên cần migration 02.
- `column language does not exist`: trước tiên cần migration 03.
- `column editor_name does not exist`: trước tiên cần migration 04.
- `function public.news_save_bilingual(...) does not exist`: kiểm tra migration 06 đã chạy xong, thử `NOTIFY pgrst, 'reload schema';`.
- `Editor or administrator role required`: kiểm tra quyền email đã xác minh trong bảng `news_roles` và đăng nhập lại.

## B — CẬP NHẬT GITHUB
1. Dùng `VietMuse-V12-chi-file-thay-doi.zip` nếu website hiện đã là bản V10/V11. **Không xóa repo**.
2. Giải nén và upload các file/thư mục **bên trong**, bảo đảm `index.html` và `soan-bai-song-ngu.html` nằm ở thư mục gốc repository.
3. Commit changes → vào **Actions** để kiểm tra Pages deploy thành công.
4. Mở site và nhấn **Cmd + Shift + R** hoặc thử tab riêng tư.
5. **Không ghi đè `assets/js/config.js`**. Bản vá nhỏ không chứa config.js.

## C — ĐĂNG BÀI TỪ WEBSITE (KHÔNG CẦN GITHUB)
1. Đăng nhập tài khoản đã được cấp quyền Editor hoặc Administrator.
2. Vào menu **Newsroom → New article** hoặc truy cập `soan-bai-song-ngu.html`.
3. Chọn **Category**, điền **Author**, có thể điền **Editor / Translator**, URL nguồn.
4. Nhập phần **Vietnamese version**: Headline, Summary, Article body.
5. Nhập phần **English version** tương ứng.
6. Chọn ảnh bìa, dùng Media Library hoặc Upload để chèn ảnh vào nội dung VI/EN ở đúng vị trí.
7. Chọn **Save draft** để chuẩn bị, hoặc **Publish both VI + EN** để đăng ngay. Hai bản được lưu cùng giao dịch trong Supabase, nên lỗi một bản sẽ khiến toàn giao dịch không được lưu.
8. Tải lại trang chủ hoặc chọn chuyên mục đúng ngôn ngữ. Mỗi ngôn ngữ sẽ thấy bản tương ứng; trong bài đã đăng có liên kết qua bản còn lại.

### Các quy tắc
- Đăng công khai cần cả **VI + EN** đầy đủ (tiêu đề 8–180, tóm tắt 15–400, thân bài 60–30.000 ký tự mỗi ngôn ngữ).
- Lưu nháp có thể mới hoàn thiện một ngôn ngữ.
- Nếu muốn sửa bài cũ, Newsroom → **Edit**: cùng một form cho hai ngôn ngữ, không tạo bản thứ ba.
- `Published` là trạng thái công khai, còn `Draft` thì độc giả không nhìn thấy.
- Phân quyền được kiểm tra trong PostgreSQL/Supabase (RLS + RPC), không dựa vào việc giấu nút.

## D — NHẬP BỘ 18 BÀI / 36 BẢN NHÁP TỪ GOOGLE DOCS
1. Tải riêng `VietMuse-Google-Docs-36-drafts.json` (đừng upload file này lên repo công khai).
2. Newsroom → **Bilingual editor** → kéo xuống **Import Google Docs draft pack (JSON)**.
3. Chọn file JSON, tích các bài muốn nhập, bấm **Import selected as drafts**.
4. Hệ thống nhập và liên kết cặp VI/EN; nhập lại cùng `source_key` sẽ cập nhật nháp tương ứng, không tạo thêm cùng một mã nhập. Nếu trước đó đã nhập qua file SQL cũ, chạy migration 06 để gắn mã và liên kết cặp cũ trước.
5. Vào Newsroom → Edit để soát nội dung, đối chiếu thông tin và hoàn thiện bản dịch. Không ấn Publish nếu chưa có quyền đăng lại toàn văn từ báo gốc.

**Bản quyền và biên tập**: Nhiều bài trong Google Docs là trích hoặc dịch từ báo có bản quyền. Ghi nguồn và dịch không tự tạo quyền đăng lại. Bản nháp có thể để nhóm biên tập riêng; chỉ xuất bản nguyên văn khi có quyền sử dụng, hoặc viết tin tổng hợp mới bằng lời của nhóm và dẫn link tới nguồn.

## E — KHẮC PHỤC LỖI UPLOAD / ĐĂNG BÀI
- **Không thấy Newsroom**: vào `quan-ly-bao.html`; kiểm tra tài khoản đã xác minh và role thực tế là editor/admin.
- **Lỗi SQL `news_save_bilingual`**: thiếu migration 06 hoặc API schema cache chưa reload.
- **Không thấy bài trên Home**: bài còn `draft`/`pending`, đang xem ngôn ngữ khác, hoặc trang chưa tải dữ liệu mới.
- **Upload ảnh bị chặn**: tạo bucket `news-covers` trong Supabase Storage ở chế độ Public; kiểm tra policy upload thư mục có tên UUID của người đăng (theo migration 02/05). Chỉ dùng JPG/PNG/WebP tối đa 2MB.
- **Ảnh chưa có quyền dùng**: không đưa lên public Storage bucket.
- **`relation ... does not exist`**: thiếu migration cơ sở dữ liệu; không khắc phục bằng cách chạy lại tất cả file ngẫu nhiên.
- **Các mục người đọc/forum** vẫn quản lý riêng và có kiểm duyệt, không được phép đăng thẳng tin chính.

## Trạng thái kiểm thử
Đã kiểm tra tĩnh mã JavaScript và cấu trúc các file trong gói. Chưa thể thực hiện end-to-end trên project Supabase thực tế của nhóm hoặc publish vào repo GitHub do không có phiên quản trị của nhóm. Sau khi cài đặt, hãy thử một bài do nhóm tự viết ở trạng thái Draft → Publish both; xác nhận nó hiện trong cả VI và EN, có thể sửa lại, chuyển ngôn ngữ, có lượt xem.
