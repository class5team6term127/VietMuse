# VietMuse V14 — Chèn ảnh sau đoạn văn được chọn

## Có gì mới?
- Trong `soan-bai-song-ngu.html`, mục **Chèn ảnh vào nội dung / Insert a photo** có thêm **Vị trí ảnh / Image placement**.
- Mặc định là **Sau đoạn văn được chọn / After a chosen paragraph**.
- Chọn ngôn ngữ **VI** hoặc **EN**; hệ thống tự đếm số đoạn của **phiên bản đó** và hiển thị danh sách **Sau đoạn 1, Sau đoạn 2, ...** kèm một phần nội dung để dễ nhận diện.
- Danh sách và bộ đếm cập nhật ngay khi chỉnh sửa nội dung.
- Có thể bấm **Xem các đoạn văn đã đếm / View numbered paragraphs** để đối chiếu vị trí.
- Chọn ảnh bằng **Image URL** hoặc **Upload photo**, nhập **Caption** và **Source**, sau đó bấm **Chèn URL ảnh** hoặc **Tải ảnh và chèn**.
- Muốn chèn theo vị trí con trỏ như V13, đổi **Vị trí ảnh** sang **Tại vị trí con trỏ (cách cũ)**.
- Bài cũ có marker `[[image|URL|caption|source]]` vẫn hiển thị bình thường. V14 chỉ thay đổi trình soạn, không thay đổi cơ sở dữ liệu.

## Quy tắc đếm đoạn
Website hiển thị bài theo các **khối văn bản phân cách bằng một dòng trống**: để tạo đoạn mới, nhấn **Enter hai lần** giữa hai đoạn.
- Những dòng xuống hàng liên tục, không có dòng trống, được coi là **cùng một đoạn**, giống cách website hiển thị hiện tại.
- **Tiêu đề phụ** (`##` hoặc `###`), **trích dẫn** (`>`), **danh sách** (`-`) và **ảnh đã chèn** không được cộng vào bộ đếm đoạn văn.
- Số đoạn của VI và EN có thể khác nhau; hãy chọn đúng ngôn ngữ trước khi chèn ảnh.

## Ví dụ
Nội dung trước:

```
Đoạn 1: Nội dung mở đầu.

Đoạn 2: Nội dung tiếp theo.

Đoạn 3: Kết luận.
```

Chọn **VI → Sau đoạn 2 → Upload/URL → Chèn**. Hệ thống sẽ cập nhật nội dung thành:

```
Đoạn 1: Nội dung mở đầu.

Đoạn 2: Nội dung tiếp theo.

[[image|https://example.com/anh.jpg|Chú thích ảnh|VietMuse Team]]

Đoạn 3: Kết luận.
```

Khi mở bài, website hiển thị ảnh giữa đoạn 2 và 3, kèm chú thích và nguồn.

## Cập nhật GitHub Pages
1. Giải nén `VietMuse-V14-chi-file-thay-doi.zip`.
2. Upload các file có trong ZIP vào **đúng thư mục** trong repository VietMuse, thay thế file cũ.
3. Chọn **Commit changes**, đợi GitHub Pages build thành công và refresh cứng (`Cmd + Shift + R`).
4. Đăng nhập tài khoản Editor/Admin, mở **Newsroom → Bilingual Editor**, thử tạo bài VI/EN có ba đoạn văn rồi chọn chèn ảnh sau đoạn 2.

## Lưu ý
- **Không cần chạy thêm SQL** trong Supabase cho V14, nhưng các SQL V12 và V13 trước đó vẫn cần được áp dụng nếu nhóm chưa chạy.
- File cập nhật nhỏ không có `assets/js/config.js`: không ghi đè kết nối Supabase.
- Ảnh upload vẫn dùng bucket `news-covers` và quyền truy cập hiện có (JPG/PNG/WebP tối đa 2 MB).
- Ảnh trong bucket Public có thể xem qua đường dẫn ngay cả khi bài còn là bản nháp. Không upload ảnh riêng tư hay chưa được cấp phép.
- Nếu bài đang có 30.000 ký tự, chèn thêm marker ảnh có thể khiến vượt giới hạn body: cần rút ngắn nội dung.
- Chưa xác minh upload trực tiếp trên Supabase thật của nhóm trong môi trường này; kiểm tra thực tế sau khi deploy.
