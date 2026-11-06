# VietMuse V17 — Video và nhiều ảnh/video trong một bài báo

## Tính năng

- Bilingual Newsroom (`soan-bai-song-ngu.html`) có phần **Chèn ảnh & video**.
- Có sẵn một khối media. Nhấn **+ Thêm ảnh/video?** để tạo thêm khối. Có thể thêm nhiều khối, mỗi khối chọn riêng: ảnh/video, bản VI/EN, đoạn văn, URL hoặc file upload, chú thích và nguồn.
- Mỗi khối có nút **Chèn bằng link** và **Upload & chèn**. Nhớ nhấn một trong hai nút ở TỪNG khối; chỉ thêm khối mà chưa nhấn Chèn sẽ không làm ảnh/video xuất hiện trong nội dung.
- Bản VI và EN có bộ đếm đoạn độc lập. Các media vừa chèn không được tính như đoạn văn.
- Video hỗ trợ: **YouTube**, **Vimeo**, link HTTPS trực tiếp tới **.mp4** hoặc **.webm**. Ảnh là HTTPS thông thường.
- Video hiển thị bằng trình phát hỗ trợ di động trong trang đọc bài; ảnh/video cũ không đổi.
- Media Library (`thu-vien-anh.html`) cho phép upload và lấy link/mã chèn cho cả ảnh và video.

## Cập nhật GitHub Pages

1. Giải nén `VietMuse-V17-cap-nhat-nho.zip`.
2. Upload các file đã giải nén vào repository VietMuse ở **đúng thư mục**, giữ nguyên `assets/js/...` và `assets/css/...`.
3. Nhấn **Commit changes**, kiểm tra GitHub Actions/Pages deploy đã hoàn thành.
4. Tải lại trang bằng hard refresh hoặc tab ẩn danh.
5. Không ghi đè `assets/js/config.js`. Bản cập nhật nhỏ không chứa file này.

## Bước SQL 08 — CHỈ BẮT BUỘC KHI UPLOAD VIDEO FILE

Nếu chỉ dán link video YouTube/Vimeo hoặc file MP4/WebM đã được host ở nơi khác, **không cần SQL 08**.

Để upload video trực tiếp từ máy/điện thoại lên VietMuse:

1. Đảm bảo đã chạy migration 02 (đã có `private.news_role`) và tài khoản đăng nhập có quyền `editor` hoặc `admin`.
2. Vào **Supabase > SQL Editor > New query**.
3. Dán toàn bộ `backend/08-VIETMUSE-VIDEO-STORAGE.sql` và nhấn **Run**.
4. Vào **Storage**: xác nhận bucket **`news-videos`** ở chế độ **Public**. Nếu đã tồn tại từ trước với thiết lập khác, kiểm tra cấu hình bucket.
5. Trong **Storage Settings**, để **Global file size limit >= 25 MB** nếu muốn upload tối đa 25 MB.
6. Trở lại Newsroom, chọn **Video**, chọn file `.mp4` hoặc `.webm` <= 25 MB, nhấn **Upload & chèn**.

SQL 08 không xóa các bảng, bài viết hoặc tệp cũ. Nó chỉ tạo bucket video và chính sách Storage cho Editor/Admin upload vào folder của chính họ. Hạn mức của Supabase Free vẫn áp dụng.

**Lưu ý bảo mật:** Bucket video đặt Public để độc giả xem video trên bài báo. File có thể truy cập qua URL ngay từ lúc upload, kể cả khi bài vẫn là nháp. Không upload video nội bộ/riêng tư/chưa được phép công khai.

**Giới hạn:** 25 MB mỗi video, 2 MB mỗi ảnh; clip dài nên đăng lên YouTube/Vimeo rồi chèn link để tránh tiêu tốn Storage và egress (băng thông) của Supabase Free. Upload trực tiếp file lớn còn có thể bị ảnh hưởng bởi chất lượng mạng.

## Ví dụ 1 bài có nhiều media

```text
Đoạn thứ nhất.

[[image|https://example.com/photo-1.jpg|Chú thích ảnh 1|VietMuse]]

Đoạn thứ hai.

[[video|https://www.youtube.com/watch?v=dQw4w9WgXcQ|Video minh họa|Nguồn công khai]]

[[image|https://example.com/photo-2.webp|Chú thích ảnh 2|VietMuse]]

Đoạn thứ ba.
```

Các mã trên được tạo tự động khi bấm **Chèn** trong form. Không cần viết mã bằng tay.

## Trình tự soạn bài

1. Vào **Newsroom > Bilingual Editor**; viết phần thân VI và EN.
2. Trong **Chèn ảnh & video**, ở khối 1 chọn loại, bản VI/EN, vị trí sau đoạn, dán URL hoặc chọn file. Nhấn **Chèn bằng link** / **Upload & chèn**.
3. Muốn chèn tiếp: nhấn **+ Thêm ảnh/video?**, hoàn thiện khối 2 rồi nhấn **Chèn**. Lặp lại cho các khối tiếp theo.
4. Nhấn **Preview / Xem trước** trong vùng nội dung VI/EN để kiểm tra vị trí. Mã ảnh/video được lưu ngay vào phần Body tương ứng; nếu muốn xóa một media đã chèn thì xóa dòng `[[image|...]]` hoặc `[[video|...]]` trong Body.
5. Nhấn **Save draft**, **Send for review** hoặc **Publish both** sau khi hoàn thiện. Việc upload riêng không đồng nghĩa với việc bài đã được lưu/xuất bản.

## Không phải lỗi SQL 06 / 07

Bản V17 không sửa chức năng `news_save_bilingual`. Nếu vẫn thấy lỗi về `editor_name` hoặc `summary`, đó là các migration 04/07 của các bản trước, không liên quan đến SQL 08.

## Kiểm thử

Đã kiểm tra cú pháp JS, đường dẫn tài nguyên, thứ tự chèn nhiều media, an toàn link video và kết xuất ảnh/video trong nội dung bằng phép thử JavaScript. **Chưa xác nhận thao tác upload trực tiếp và xuất bản trên project Supabase thật của nhóm**. Trước khi dùng rộng rãi, hãy thử đăng một bài nháp 1 ảnh + 1 video và xem trên máy tính/điện thoại.

## Cập nhật giao diện theo 3 ảnh phản hồi

1. **Trang chuyên mục**: sửa kiểu danh sách bài báo từ lưới ép nội dung ảnh-trái/chữ-phải thành thẻ tin toàn chiều rộng của một cột: ảnh 16:9 ở trên, tiêu đề/tóm tắt/thống kê ở dưới. Có dự phòng logo VietMuse nếu link ảnh bìa hỏng hoặc chưa có.
2. **Gọn giao diện**: bảng chèn ảnh/video giảm khoảng cách/chiều cao các trường, có nút **Thu gọn / Mở rộng**; sau khi chèn vào thân bài, bảng tương ứng sẽ tự thu gọn. Thông tin tác giả, BTV và dịch giả phía trên bài cũng gọn hơn trên điện thoại.
3. **Bỏ nút “Read Vietnamese version / Read English version”** bên trong bài. Nút **VI/EN trên thanh menu** sẽ tự dẫn đến bản dịch của cùng bài báo nếu cả hai đã được xuất bản. Không còn hai cơ chế đổi ngôn ngữ song song.

Các thay đổi giao diện trên chỉ cần cập nhật GitHub, **không cần SQL riêng**. Chức năng upload file video vẫn cần migration 08 như hướng dẫn ở trên.

**Điểm cần kiểm thử trên website thật**: Mở một chuyên mục có bài với ảnh bìa dài/ngắn khác nhau; thử thêm hai media và thu gọn, đổi VI/EN trên một bài đã xuất bản cả hai ngôn ngữ. Khi không có bản dịch công khai, nút VI/EN chỉ đổi ngôn ngữ giao diện, không tự dịch nội dung bài.
