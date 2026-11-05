# VietMuse V5 — Tự động ngày & thời tiết

## Những thay đổi

- Đã bỏ bộ chọn thành phố và nút `Use my IP` trên thanh đầu trang.
- Dải **thứ/ngày/tháng/năm + thành phố + nhiệt độ** chuyển xuống nằm ngay phía trên `IN FOCUS` trên trang chủ, cả hai chế độ VI/EN.
- Ngày tháng lấy từ ngày giờ trên thiết bị; tự cập nhật mỗi phút.
- Thành phố được ước lượng theo IP khi mở trang, KHÔNG dùng GPS; API ipwho.is.
- Nhiệt độ cập nhật từ Open-Meteo, làm mới khoảng 30 phút một lần khi trang còn mở.
- Nếu không lấy được vị trí hoặc dữ liệu thời tiết, hiện trạng thái không khả dụng, không hiển thị số nhiệt độ giả.

## Cập nhật GitHub Pages

1. Giải nén ZIP V5.
2. Upload mọi thư mục và file bên trong `ban-tin-moc` vào gốc repository GitHub cũ.
3. Ghi đè các file trùng tên và commit. Nhớ upload **file mới** `assets/js/weather.js`.
4. Mở site và dùng Ctrl+Shift+R (Windows) hoặc Cmd+Shift+R (Mac) để tải lại.
5. Chuyển VI/EN để kiểm tra ngày tháng.

**Thông tin quyền riêng tư:** Khi người dùng truy cập homepage, trình duyệt tự gửi yêu cầu đến `ipwho.is` để suy ra vị trí gần đúng theo IP. Địa chỉ IP được nhà cung cấp nhận khi xử lý yêu cầu; Open-Meteo nhận tọa độ gần đúng để trả về nhiệt độ. Cần bổ sung thông tin này trong trang chính sách bảo mật trước khi ra mắt công khai. IP có thể định vị sai do VPN, mạng di động, mạng công ty. Nếu dùng website cho mục đích thương mại, kiểm tra hạn mức và điều khoản của dịch vụ API.

Bản V5 giữ nguyên CMS, Forum, Supabase config và logo VietMuse.
