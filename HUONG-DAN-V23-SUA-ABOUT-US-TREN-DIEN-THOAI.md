# VietMuse V23 — Sửa lỗi About Us trên iPhone/Safari

## Nguyên nhân

CSS trang About Us cũ dùng ký tự Unicode `✳` làm họa tiết trang trí cỡ 500px trong `.vm-about-outro::before`. Trên một số phiên bản iOS, glyph đó được kết xuất theo kiểu emoji màu **xanh lá** với nền vuông, nên che lên tiêu đề, nội dung và nút ở cuối trang. Các mũi tên chéo `↗` cũng có thể hiện thành emoji xanh.

## Thay đổi

- Bỏ ký tự emoji 500px, thay bằng các vòng tròn nền vẽ thuần CSS.
- Thay các mũi tên emoji của email và các nút cuối trang bằng SVG đơn sắc, tự theo màu chữ.
- Thay các ký tự trang trí `✳` còn lại bằng biểu tượng văn bản `✦` (không có phiên bản emoji xanh).
- Cố định chiều rộng và cách sắp xếp CTA trên mobile; giữ nội dung ở lớp phía trước họa tiết.
- Giữ 5 ảnh và thông tin thành viên; không có ô đánh số 01/05; email Đào Mai Chi là `daomaichi@gmail.com`.

## Cài đặt lên GitHub Pages

1. Tải và giải nén ZIP cập nhật **VietMuse-V23-fix-About-Us-mobile.zip**.
2. Mở repository GitHub của VietMuse; thay đúng 3 file trong thư mục website:
   - `gioi-thieu.html`
   - `assets/css/about.css`
   - `assets/js/about.js`
3. Commit changes và kiểm tra GitHub Actions nếu có.
4. Trên iPhone, đóng tab cũ và mở lại `https://class5team6term127.github.io/VietMuse/gioi-thieu.html` trong tab mới / riêng tư để tránh cache.

**Không cần SQL**, không đụng tới `config.js`, Supabase hay các trang khác.

## Kiểm thử

Đã kiểm tra cú pháp JavaScript và mô phỏng dựng nội dung bằng Node (VI/EN): đủ 5 thành viên, email của Chi đúng, không còn số thứ tự, hai CTA đều có SVG. CSS cũng không còn họa tiết `✳` 500px. **Chưa kiểm thử trực tiếp trên iOS/Cốc Cốc thật**.
