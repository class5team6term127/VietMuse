# VietMuse V11 — Sửa email xác minh chuyển tới localhost

## Nguyên nhân

Ở Supabase, **Authentication → URL Configuration**, Site URL có thể vẫn là `http://localhost:3000`. Nếu Redirect URL được code yêu cầu không được đưa vào danh sách cho phép, Supabase quay về Site URL và link trong email mở localhost trên điện thoại.

V11 thêm trang `xac-minh.html` hiển thị trạng thái email đã được xác minh **khi có tài khoản xác minh hợp lệ** và hai nút "Về trang chủ" / "Đăng nhập"; tự hiển thị song ngữ EN/VI. Nếu không kiểm tra được phiên xác thực, trang không tự nhận đã xác minh mà hướng dẫn người dùng đăng nhập.

## Bước A — Sửa Supabase trước

1. Mở project VietMuse tại https://supabase.com/dashboard.
2. Vào **Authentication → URL Configuration**.
3. **Site URL**: thay `http://localhost:3000` bằng **URL trang chủ VietMuse thật** (vd `https://TEN-USER.github.io/TEN-REPO/`). Phải dùng tên user/repo thật; không để nguyên URL ví dụ.
4. **Redirect URLs → Add URL**: thêm **URL chính xác** của trang xác minh, ví dụ `https://TEN-USER.github.io/TEN-REPO/xac-minh.html`.
5. Giữ lại các Redirect URLs hợp lệ khác nếu chúng đang phục vụ password reset hoặc tính năng khác. Nhấn Save.
6. Vào **Authentication → Email Templates → Confirm signup**, kiểm tra nút xác minh dùng `{{ .ConfirmationURL }}` (mặc định). Nếu team tự tạo template, không dùng link localhost cố định. Trong trường hợp template tự tạo token_hash riêng thì cần kiểm tra lại trước khi dùng.

Nếu trang đã dùng custom domain, thay toàn bộ URL GitHub Pages ví dụ bằng domain thật của VietMuse.

## Bước B — Upload đúng 4 file patch lên GitHub

Sau khi giải nén `VietMuse-V11-email-confirm-fix.zip`, thay các file tương ứng ở root repository GitHub Pages:

- `xac-minh.html` — trang đích xác minh email (mới).
- `assets/js/auth-confirm.js` — kiểm tra phiên xác minh Supabase (mới).
- `assets/js/v3.js` — gửi link đăng ký tới `xac-minh.html` thay cho `tai-khoan.html`.
- `tai-khoan.html` — đổi mã phiên bản để tải JS mới, tránh cache trên điện thoại.

KHÔNG upload lại hoặc chỉnh `assets/js/config.js` nếu project của bạn đang kết nối tốt. Không cần chạy SQL. Không được đưa secret/service_role key vào frontend.

Chọn **Commit changes**, chờ Actions / Pages báo triển khai xong. Mở cửa sổ riêng tư trên điện thoại để thử tạo tài khoản mới bằng **một email chưa đăng ký**, sau đó mở email xác minh.

## Bước C — Kiểm tra link

Link đích đúng phải có dạng:

`https://TEN-USER.github.io/TEN-REPO/xac-minh.html`

Không phải `http://localhost:3000`.

Với tài khoản đã xác minh trước đó: không cần đăng ký lại hoặc bấm lại link email cũ; chỉ cần đăng nhập VietMuse. Link cũ đã phát hành có thể vẫn dẫn đến localhost, không thể sửa hồi tố.

Nếu trang hiện "Mời bạn đăng nhập", có thể tài khoản đã xác minh ở Supabase nhưng Safari chưa giữ phiên đăng nhập xác thực; hãy đăng nhập theo nút bên dưới. Trang không tự báo "thành công" chỉ từ URL.

## Lưu ý riêng tư

Luồng xác minh dựa trên Supabase Auth và `getUser()` để xác nhận tài khoản; không dựa vào URL `?success=true`. GitHub Pages chỉ phục vụ giao diện tĩnh và không xác minh email trực tiếp trên server.
