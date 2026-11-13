# VietMuse V30 — Hiện nhãn đã chỉnh sửa cạnh ngày đăng

**Cập nhật V29 → V30**. Trên trang đọc báo `bai-ban-doc.html`, ngày xuất bản giữ nguyên và thêm `(Edited)` ở bản EN hoặc `(Đã chỉnh sửa)` ở bản VI nếu bài được cập nhật sau thời điểm xuất bản. Lần đăng đầu tiên không hiện nhãn.

## File cần thay trong GitHub

1. `assets/js/v3.js`
2. `assets/css/style.css`
3. `bai-ban-doc.html`
4. `bai-viet.html` (cập nhật đường dẫn JS/CSS để tránh cache cũ)

Giữ nguyên các thư mục/đường dẫn khi tải lên GitHub. **Không cần chạy SQL**, không cần tạo cột và không thay cấu hình Supabase.

## Ví dụ

- VI, bài mới: `VietMuse Editorial · 13/11/2026`
- VI, bài đã lưu cập nhật sau khi đăng: `VietMuse Editorial · 13/11/2026 (Đã chỉnh sửa)`
- EN: `VietMuse Editorial · 13/11/2026 (Edited)`

## Giới hạn của cách nhận diện

Trạng thái dựa trên `updated_at > published_at` trong `public.news_posts`. Nếu Admin/Editor **lưu lại bài đã xuất bản dù nội dung không đổi**, database vẫn có thể cập nhật `updated_at` và hiện nhãn. Trình soạn song ngữ cũng có thể cập nhật cả hai bản khi lưu một cặp VI/EN; vì vậy nhãn thể hiện *bản ghi đã được cập nhật*, không chứng minh mọi câu chữ đều đã thay đổi. Nếu muốn chỉ gắn nhãn khi nội dung thực sự đổi thì cần một thay đổi SQL/trigger chuyên dụng.

Kiểm tra: mở bài đã đăng, ghi lại ngày; vào Newsroom Edit sửa nội dung và lưu Published; tải lại trang. Ngày đăng không đổi, có thêm nhãn. Đổi VI/EN để kiểm tra phiên bản ngôn ngữ.
