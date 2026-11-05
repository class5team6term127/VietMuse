# VietMuse V13 — Tóm tắt (Summary) không bắt buộc

## Đã sửa
- Ở trình soạn bài song ngữ, cả bản **Tiếng Việt** và **English** đều có ô **Summary / Tóm tắt (optional)**.
- Có thể để trống hoàn toàn. Nếu nhập, tối đa **400 ký tự**. Không còn yêu cầu tối thiểu 15 ký tự.
- Tiêu đề vẫn cần 8–180 ký tự và nội dung bài 60–30.000 ký tự.
- Áp dụng luôn cho trình biên tập cũ, bài Góc nhìn / Forum, và trang duyệt bài.
- Khi Summary trống, website tự ẩn đoạn tóm tắt ở đầu bài / thẻ bài.

## Cài đặt bắt buộc — 2 bước
1. **Supabase:** SQL Editor → New query → mở `backend/07-VIETMUSE-OPTIONAL-SUMMARY.sql`, dán toàn bộ rồi chọn Run. Script cập nhật ràng buộc database và hàm lưu hai ngôn ngữ. **Đừng chạy lại SQL 02, 06 để tránh hoàn tác thay đổi này.** Nếu báo lỗi, dừng và gửi thông báo lỗi.
2. **GitHub:** Giải nén ZIP bản cập nhật, đưa các tệp và thư mục vào đúng vị trí trong repo, commit. Tham số JS đã đổi thành `v13` để hạn chế lưu cache.

## Kiểm tra
- Vào `soan-bai-song-ngu.html`, điền đủ headline và body của cả hai ngôn ngữ, bỏ trống cả hai Summary.
- Bấm **Save draft** trước để thử, sau đó **Publish both** với nội dung nhóm có quyền xuất bản.
- Mở bài vừa đăng: không còn khoảng trống Summary ở đầu bài.
- Nếu Supabase báo lại `news_posts_excerpt_check` hoặc `Invalid version`, kiểm tra đã chạy SQL 07 thành công chưa và đã cập nhật script trên GitHub chưa.

## Lưu ý bảo mật / cấu hình
- Bản cập nhật nhỏ KHÔNG chứa `assets/js/config.js` và không cần gửi key riêng.
- Không thay URL Supabase hoặc quyền Editor/Admin. Không xóa bài hiện có.
