# VietMuse V6 — Đổi slogan và About us

**Slogan:** VI: Linh hồn sau mỗi câu chuyện · EN: The spirit behind stories.

**Đổi nhãn menu:** `About this project` → `About us`; tiếng Việt là `Về chúng tôi`. Footer và trang giới thiệu cũng chuyển sang định hướng giới thiệu nhóm, chưa tự đặt tên thành viên.

## Upload bản cập nhật nhỏ (khuyên dùng)
1. Tải `VietMuse-V6-chi-file-can-thay.zip`, giải nén.
2. Trên GitHub, tải các file tương ứng lên **đúng đường dẫn đang cấp GitHub Pages** (cùng cấp `index.html`), giữ nguyên cấu trúc `assets/js/`. Commit thay đổi.
3. Vào **Actions** xem Pages deploy thành công; mở lại website bằng `Command + Shift + R` (Mac) hoặc cửa sổ ẩn danh.

File cần thay gồm: `assets/js/data.js`, `content-vi.js`, `app.js`, `i18n.js` và 12 trang `.html` (để tránh cache JS cũ).

**Không thay** `assets/js/config.js` đã cấu hình Supabase; bản patch không chứa file này.

## Nếu vẫn hiện slogan cũ
- Vào **Settings → Pages** xác nhận đúng **branch** và **folder** đang phát website.
- Trực tiếp mở địa chỉ `https://<username>.github.io/<repository>/assets/js/data.js?v=20261105-vietmuse-v6` và tìm `The spirit behind stories` (tương tự cho `content-vi.js`).
- Nếu file live còn câu cũ, chưa deploy bản mới hoặc upload sai repository/đường dẫn. Nếu file live đã đúng, thử tải lại không cache hoặc trình duyệt ẩn danh.

## Sau này thay thông tin team
Sửa phần `function aboutPage()` trong `assets/js/app.js`; bản tiếng Việt của đoạn giới thiệu nằm ở `assets/js/i18n.js`.
