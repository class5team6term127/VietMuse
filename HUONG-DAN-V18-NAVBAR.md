# VietMuse V18 — Thanh điều hướng ghim khi cuộn

## Đã thay đổi
- Thanh navigation đỏ gạch **sticky** ở đầu trang khi kéo xuống; masthead/logo lớn cuộn bình thường. Không phải fixed che nội dung.
- Phông chữ menu máy tính **10px → 13px**; laptop **9px → 12px**; điện thoại **12px → 15px**. Nút VI/EN **11px → 14px**.
- Nếu màn hình không đủ rộng, danh mục có thể **cuộn ngang** bên trong thanh menu, trong khi logo/Home và VI/EN không bị trôi.
- Menu ba gạch trên mobile vẫn mở theo chiều dọc; có thể cuộn bên trong menu và vẫn ghim ở đỉnh.
- Không sửa Supabase, bài báo, video, ảnh, tài khoản hay Newsroom.

## Cập nhật GitHub Pages
1. Tải ZIP **bản cập nhật nhỏ**, giải nén và upload các file lên repository VietMuse theo đúng đường dẫn. Chọn ghi đè các file cũ.
2. Commit changes, kiểm tra GitHub Actions / Pages đã deploy.
3. Mở tab ẩn danh trên điện thoại và máy tính, cuộn xuống trang chủ và các trang chuyên mục để kiểm tra.
4. Không cần chạy SQL. Không ghi đè `assets/js/config.js` (không có trong bản cập nhật).

**Lưu ý:** Nếu nhóm đã tự chỉnh CSS hoặc các file HTML sau V17b, nên so sánh thay đổi trước khi ghi đè. Bản cập nhật này dựa trên VietMuse V17b.
