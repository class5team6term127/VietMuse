# VietMuse V22 — Căn đều thẻ bài báo

## Thay đổi

- Các thẻ bài trong cùng hàng (3 cột desktop, 2 cột tablet) giãn bằng nhau; đường kẻ cuối thẻ và dòng ngày/views/responses thẳng hàng.
- Ảnh giữ tỷ lệ 16:9. Tiêu đề được hiển thị đầy đủ, không cắt và không thêm dấu ba chấm.
- Di động 1 cột để các thẻ cao tự nhiên.
- Bản V22 cũng giữ hai chỉnh sửa đã xác nhận: không đánh số 01/05 trên chân dung nhóm; email Đào Mai Chi là `daomaichi@gmail.com`.

## Cài đặt GitHub Pages

1. Tải ZIP cập nhật nhỏ, giải nén.
2. Upload các file vào repository VietMuse, giữ nguyên thư mục `assets/css`, `assets/js`, v.v. Khi có file trùng tên, thay file cũ.
3. Commit changes; đợi GitHub Pages triển khai xong và mở lại trang.
4. Kiểm tra lưới `News & Sections` trên desktop, trang chuyên mục, phần bài Forum và giao diện điện thoại.

Bản cập nhật không chứa `assets/js/config.js`, không cần SQL, không sửa Supabase.

Lưu ý: chiều cao các hàng có thể khác nhau nếu nội dung dài khác nhau; điều được bảo đảm là các thẻ **cùng một hàng** cao đều nhau, kể cả khi tiêu đề dài hơn. Chưa kiểm thử live website của nhóm.
