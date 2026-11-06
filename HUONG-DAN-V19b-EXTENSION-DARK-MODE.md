# VietMuse V19b — Sửa hành vi Light/Dark

## Đúng ý người dùng
- Website luôn hiển thị bản sáng theo mặc định, bất kể máy/điện thoại đang dùng giao diện tối.
- Chế độ tối được điều khiển bởi công cụ/chế độ tối của trình duyệt; khi tắt thì web sáng, khi bật thì tiện ích sẽ đổi nền và chữ.
- Không còn `@media(prefers-color-scheme: dark)` đổi bảng màu hoặc logo theo hệ điều hành.
- Hai ảnh logo gốc của người dùng vẫn có sẵn; script thử tự nhận diện khi tiện ích chèn CSS hoặc làm tối nền đã tính toán để dùng ảnh logo tối.

**Giới hạn kỹ thuật:** Không có API web chuẩn để website biết chính xác nút bật/tắt của bất kỳ tiện ích dark mode nào trên Safari/Chrome. Một số tiện ích tô lại màu ở tầng kết xuất mà JavaScript không đọc được, vì vậy đổi ảnh logo tự động có thể không hoạt động với mọi tiện ích. Trong trường hợp đó, tiện ích thường tự chuyển màu ảnh/logo hoặc người dùng có thể sử dụng bản logo mặc định.

## Cách cập nhật
1. Giải nén ZIP nhỏ, tải đúng đường dẫn từng file lên GitHub, ghi đè file tương ứng.
2. Commit và chờ GitHub Pages triển khai.
3. Test trên Safari: máy bật Dark Mode nhưng tiện ích web tối **tắt** => web phải sáng; bật tiện ích => tiện ích điều khiển tối; tắt tiện ích => trở lại sáng.
4. Không cần SQL. Không ghi đè `assets/js/config.js`.
