# VietMuse V31 — Thông tin bên lề / Side Notes

## Cài đặt (không cần SQL)

1. **Sao lưu repository trước khi cập nhật.**
2. Giải nén `VietMuse-V31-Cap-Nhat-Nho.zip`.
3. Tải các file trong ZIP lên GitHub tại **đúng đường dẫn** (giữ cấu trúc `assets/js/`, `assets/css/`). Chọn ghi đè các file cũ và nhấn **Commit changes**.
4. Mở `soan-bai-song-ngu.html` bằng tài khoản Editor/Admin. Dưới ô nội dung VI và EN sẽ có nút **ⓘ Bên lề / Side note**.
5. Bấm nút, nhập **tiêu đề (không bắt buộc)**, **nội dung**, và tích **Đổ nền màu kem** nếu muốn. Đặt con trỏ trong nội dung bài tại vị trí mong muốn rồi chọn **Chèn vào bài**. Dùng **Xem trước / Preview** để kiểm tra.

## Hai kiểu thông tin

Không đổ nền:

```text
:::note|Thông tin thêm
Nội dung bên lề ở đây.
:::
```

Có nền kem:

```text
:::note fill|Bạn có biết?
Nội dung bên lề có nền màu.
:::
```

Bản tiếng Anh dùng `Side note` làm tiêu đề mặc định. Các khối `:::info` viết trước đó vẫn được hiển thị. Nên để khối riêng giữa các đoạn, không đặt trong câu văn liên tục.

## File thay đổi

- `assets/js/bilingual-editor.js`: công cụ chèn thông tin bên lề trong hai bản ngôn ngữ
- `assets/js/v3.js`: hiển thị khối an toàn trong Preview và trang đọc báo
- `assets/css/bilingual-editor.css`: bố cục bảng nhập
- `assets/css/style.css`: thẻ thông tin bình thường / có màu
- `soan-bai-song-ngu.html`, `bai-ban-doc.html`, `bai-viet.html`: cập nhật phiên bản tệp để hạn chế cache trình duyệt

### Bảo toàn dữ liệu

- Không cần chạy SQL hoặc chỉnh Supabase.
- Không thay đổi `assets/js/config.js` hay nội dung các bài đã lưu.
- Đọc các bài viết cũ bình thường.
- Bản V31 được phát triển dựa trên mã VietMuse V30 hiện có; nếu website đã được chỉnh thủ công sau V30, hãy so sánh các file trước khi ghi đè.
- About Us giữ nguyên email Đào Mai Chi `daomaichi@gmail.com` và không có nhãn số thứ tự thành viên.
