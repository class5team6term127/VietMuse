# VietMuse V29 — Khách không đăng nhập vẫn vote Crowd Poll

## Tính năng

- Trang đọc bài News của tòa soạn có Crowd Poll cho **mọi độc giả** nhấn chọn; không phải đăng ký/đăng nhập bằng email.
- Chỉ khi khách bấm vote, website mới gọi `supabase.auth.signInAnonymously()` để tạo **phiên khách ẩn danh**. Việc đọc tin bình thường không tạo thêm tài khoản ẩn danh.
- Nếu độc giả đã đăng nhập tài khoản VietMuse, hệ thống **giữ nguyên tài khoản**, không tạo phiên khách mới.
- Mỗi người dùng/phiên khách chỉ có một phiếu cho **mỗi Crowd Poll**; chọn lại sẽ thay lựa chọn cũ (không tăng tổng số phiếu).
- Cặp bài **VI/EN** dùng chung một `translation_group`, do đó tổng phiếu và lựa chọn giống nhau khi đổi ngôn ngữ.
- Kết quả vẫn hiện với tất cả người đọc. Poll Forum cũ **không thay đổi**.
- Nếu tính năng Anonymous Sign-ins chưa bật hay SQL 11 chưa chạy, nút sẽ hiển thị thông báo lỗi thay vì âm thầm bỏ qua.

## 1. BẮT BUỘC: Cập nhật Supabase

1. Đảm bảo đã chạy **SQL 10** của V27 (hệ thống Crowd Poll hoạt động với tài khoản đăng nhập).
2. Vào Supabase Dashboard -> **Authentication -> Providers** -> bật **Anonymous Sign-ins** (V24 đã cần bước này cho Gửi bài không đăng nhập; nếu đang bật thì không thay đổi gì).
3. Supabase Dashboard -> **SQL Editor -> New query** -> mở `VIETMUSE-SQL-11-GUEST-CROWD-POLLS.txt`, copy hết, dán, **Run**.
4. Kết quả cuối SQL nên có 3 cột `vote_rpc_ready`, `results_rpc_ready`, `guest_session_can_vote` đều `true`.
5. SQL 11 **chỉ thay hai hàm RPC** `news_crowd_get` và `news_crowd_vote`. Không xóa bảng, không reset phiếu, không sửa nội dung các bài News hay Forum.

**Không chạy lại SQL 10 sau SQL 11:** SQL 10 có định nghĩa cũ chặn khách, sẽ ghi đè SQL 11. Nếu lỡ chạy, chỉ cần chạy lại SQL 11.

## 2. Cập nhật GitHub

Giải nén `VietMuse-V29-Khach-Vote-Khong-Dang-Nhap-cap-nhat-nho.zip`, rồi upload các file **đúng đường dẫn** vào repo VietMuse:

- `assets/js/v3.js` — tự tạo phiên khách khi vote và cập nhật poll.
- `bai-ban-doc.html` — tăng mã version script chống cache.
- `bai-viet.html` — đồng bộ mã version script.

Trong ZIP còn có file SQL 11 và hướng dẫn để lưu làm dự phòng; không bắt buộc upload SQL lên GitHub. **Không có `assets/js/config.js` trong bản cập nhật nhỏ.**

Nhấn **Commit changes**, kiểm tra GitHub Pages deploy rồi mở trang bài News có Crowd Poll.

## 3. Test nhanh

1. Mở bài News đã có Crowd Poll ở cửa sổ ẩn danh / chế độ khách.
2. Chọn một phương án. Đợi thông báo `Đã ghi nhận bình chọn!` và xem tỷ lệ / phiếu cập nhật.
3. Chọn phương án khác: tổng lượt tham gia không tăng (chỉ cập nhật lựa chọn).
4. Đổi nút VI/EN sang bản dịch của cùng bài: tổng phiếu và lựa chọn được giữ nguyên.
5. Đăng nhập tài khoản thường và thử vote trên một poll khác: vẫn bình chọn bình thường.

## Giới hạn và lưu ý bảo mật

- Đây là **một phiếu trên mỗi Supabase Auth UID**, không phải một phiếu được xác minh trên mỗi con người.
- Khi khách xóa dữ liệu trình duyệt, mở trình duyệt khác hoặc tạo phiên ẩn danh mới, họ có thể được tính như một người mới. Không thể bảo đảm chống gian lận hoàn toàn bằng frontend/GitHub Pages.
- Anonymous Sign-ins tạo một bản ghi Supabase Auth. Với website công khai, nên triển khai **Cloudflare Turnstile / CAPTCHA** và theo dõi giới hạn Auth trước khi mở poll quy mô lớn.
- SQL 11 cấp `EXECUTE` cho vai trò `authenticated` (bao gồm phiên khách Supabase Auth), **không cấp quyền ghi trực tiếp cho Postgres `anon`**. Cơ chế `PRIMARY KEY (article_group, user_id)` và server RPC bảo vệ một phiếu mỗi phiên.
- Không đưa `service_role` hay secret API key lên GitHub. Kho ảnh, tài khoản Editor/Admin và poll Forum giữ nguyên.
- SQL code chỉ kiểm tra ở mức cú pháp, cấu trúc và mô phỏng JavaScript. Chưa chạy trực tiếp với project Supabase của nhóm.

**Nhắc lại yêu cầu About Us:** Không đưa lại đánh số `01/05` và giữ email `daomaichi@gmail.com`.
