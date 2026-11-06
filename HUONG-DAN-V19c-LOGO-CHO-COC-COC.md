# VietMuse V19c — Logo phù hợp với chế độ tối trên trình duyệt

**Sửa đúng lỗi:** V19b chỉ cố đọc CSS để đoán Cốc Cốc đang bật chế độ tối. Một số chế độ tối của trình duyệt được áp ở tầng vẽ, nên web không thể đọc trạng thái này qua JavaScript. Kết quả là biểu tượng vẫn là bản sáng dù nền web đã tối.

## V19c làm gì?
- Giữ chế độ sáng của website làm mặc định, **không dùng** `prefers-color-scheme` của máy.
- Nếu chế độ tối của trình duyệt có chèn CSS/đổi màu nền mà JS đọc được, tự chuyển biểu tượng logo sang file tối do nhóm cung cấp.
- Bổ sung nút nhỏ `◐ Auto` ở thanh menu, **chỉ đổi phiên bản logo**, KHÔNG bật/tắt nền tối toàn website. Nhấn nút theo vòng: **Auto → Dark → Light → Auto**.
- Nhớ lựa chọn logo thủ công trên trình duyệt đang dùng. Đổi sang Auto thì trả quyền tự nhận diện.
- Tinh chỉnh màu chữ VietMuse và nền viền logo nav/footer khi đang chọn bản logo tối.

## Điều không thể đảm bảo
Cốc Cốc có thể làm tối website bên ngoài CSS/DOM (tầng render). Trong trường hợp này **không có API tiêu chuẩn cho website biết người dùng bật nút Duyệt web chế độ tối**, nên **không thể tự đổi đúng logo 100% bằng code website**. Khi gặp trường hợp này, nhấn `◐ Auto` một lần để chọn `Dark`. Muốn về Light khi tắt chế độ tối của trình duyệt, nhấn lần nữa để chọn `Light`. Đây là phương án dự phòng rõ ràng, không phải cam kết nhận diện hoàn toàn tự động.

## Cập nhật GitHub
1. Mở ZIP cập nhật nhỏ, chép các file trong ZIP vào đúng thư mục trong repo VietMuse, ghi đè file cùng tên.
2. Commit rồi chờ GitHub Pages hoàn tất triển khai.
3. Mở website trên Cốc Cốc, thử bật/tắt Duyệt web chế độ tối. Nếu logo không đổi tự động, dùng `◐ Auto` để chọn `Dark` và `Light`.
4. Không chạy SQL Supabase; bản nhỏ không có `assets/js/config.js`.

**Kiểm tra nội bộ:** JS đã qua `node --check`, file HTML có đường dẫn CSS/JS hợp lệ; chưa kiểm chứng với nút Cốc Cốc thật và Supabase trực tiếp.
