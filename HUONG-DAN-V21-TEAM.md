# VietMuse V21 — Meet Our Team trên trang About Us

## Có gì mới?

- Thêm 5 thẻ chân dung trong mục **03 / Editorial Board** của `gioi-thieu.html`.
- Mỗi thẻ có **ảnh, tên, email** đúng theo thông tin nhóm cung cấp.
- Bố cục màn hình lớn **3 thẻ hàng đầu, 2 thẻ cân giữa bên dưới**; tablet 2 cột; điện thoại 1 cột.
- Chữ của phần giới thiệu đội ngũ có **VI/EN** theo nút ngôn ngữ của trang.
- Ảnh được lưu tại `assets/images/team/` dưới dạng WebP đã tối ưu; không phụ thuộc liên kết Drive khi người đọc mở website.
- Bỏ dòng “Coming soon” ở phần Editorial Board vì đã có thành viên thật.

## Cách cập nhật GitHub Pages

1. Tải và giải nén **VietMuse-V21-About-Us-Team-cap-nhat-nho.zip**.
2. Upload **đúng đường dẫn** các file sau vào repo GitHub VietMuse, chấp nhận ghi đè file cũ:
   - `gioi-thieu.html`
   - `assets/js/about.js`
   - `assets/css/about.css`
   - Toàn bộ **5 ảnh `.webp`** trong `assets/images/team/`
3. Nhấn **Commit changes**. Chờ GitHub Actions/GitHub Pages triển khai.
4. Mở `https://class5team6term127.github.io/VietMuse/gioi-thieu.html` rồi kiểm tra bằng VI, EN trên desktop và điện thoại.

**Không cần SQL/Supabase**, không sửa `assets/js/config.js` và không ảnh hưởng dữ liệu bài báo.

## Lưu ý email cần xác nhận

Bạn cung cấp email **Đào Mai Chi = `daomaichi@gmail`**, hiện thiếu hậu tố tên miền. Trang giữ nguyên giá trị này và hiển thị dưới dạng văn bản để không tạo đường dẫn email sai. Khi nhóm xác nhận email chính xác, sửa trường `email` của thành viên đầu tiên trong `assets/js/about.js`, ví dụ tìm `daomaichi@gmail` và thay bằng giá trị **đã xác nhận**. Các email còn lại có thể nhấn để mở ứng dụng email.

## Kiểm thử

Kiểm tra cú pháp JS, hai bộ từ ngữ VI/EN, đường dẫn ảnh, đủ 5 chân dung, file ZIP và dữ liệu patch. Chưa xác minh tương tác/hiển thị trực tiếp trên GitHub Pages thật.
