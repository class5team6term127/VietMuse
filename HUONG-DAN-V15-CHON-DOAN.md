# VietMuse V15 — Sửa thao tác chọn đoạn để chèn ảnh

## Vấn đề ở V14
Phần **View numbered paragraphs** trước đây chỉ là bảng xem trước. Các đoạn có màu nổi bật nhưng không phải nút tương tác. Vì vậy bấm đoạn 2 hoặc 3 không chuyển được vị trí.

## Đã sửa
- Từng đoạn văn là một **nút bấm** (cũng hỗ trợ Tab + Enter/Space).
- Bấm một đoạn sẽ đánh dấu **✓ Đã chọn / Selected**, đồng bộ ngay với ô **Insert image after paragraph** bên trên.
- Sau khi chọn, nhập **Image URL** (hoặc chọn file upload), Caption, Source và bấm **Insert image link** / **Upload & insert image**.
- Dùng ô chọn số đoạn cũng được. Chọn riêng cho VI và EN, không bị mất lựa chọn khi chuyển qua lại.
- Khi gõ/sửa nội dung, số đoạn tự cập nhật; nếu số đoạn bị giảm thì vị trí sẽ tự giới hạn về đoạn cuối cùng hiện còn.
- Tương thích cơ chế chèn ảnh `[[image|url|caption|source]]` V14.

## Cách cập nhật (không cần SQL)
1. Giải nén `VietMuse-V15-sua-chon-doan.zip`.
2. Đưa **đúng 3 file** `soan-bai-song-ngu.html`, `assets/js/bilingual-editor.js`, `assets/css/bilingual-editor.css` vào repository GitHub, ghi đè bản cũ.
3. Commit và chờ GitHub Pages triển khai xong; đóng tab cũ, tải lại trang soạn bài bằng tải lại không dùng cache.
4. Mở phần **Insert a photo in the article**, chọn VI/EN, bung danh sách đoạn, bấm vào đoạn muốn chèn, thấy **✓ Selected**, sau đó điền URL/Upload và thực hiện chèn.

> File cập nhật nhỏ không chứa config.js, không đụng Supabase hoặc bài báo đã lưu. Các migration SQL V12–V13 vẫn cần sẵn có để lưu / xuất bản song ngữ.
