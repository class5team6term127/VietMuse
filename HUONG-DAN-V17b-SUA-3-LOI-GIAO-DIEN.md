# VietMuse V17b — Sửa ba lỗi giao diện theo ảnh ngày 06/11/2026

## Các thay đổi

1. **Ảnh/tiêu đề chồng lên nhau trong chuyên mục.** Các thẻ bài viết thuộc trang chuyên mục, tìm kiếm, khám phá và phần bài dạng lưới trên trang chủ giờ có **ảnh bìa 16:9 phía trên, tiêu đề và thông tin phía dưới**. Desktop hiển thị 3 cột / 2 cột theo chiều rộng; điện thoại một cột. Tiêu đề không còn nằm đè lên ảnh.
2. **Thông tin tác giả quá lớn.** Đã loại bỏ avatar chữ cái, gói tác giả + biên tập viên (nếu có) + dịch giả (nếu có) + ngày thành một dải metadata nhỏ, cho phép xuống dòng trên màn hình hẹp. Không ảnh hưởng dữ liệu tác giả trong Supabase.
3. **Nút “Read Vietnamese version / Read English version” thừa.** Không hiển thị nút đổi bản dịch bên trong bài. Dùng **VI/EN chung trên thanh menu**. Khi bài có hai phiên bản đã xuất bản và được ghép bằng `translation_group`, nút đó dẫn tới bản dịch cùng bài. Khi chưa có bản dịch công khai, nó chỉ chuyển ngôn ngữ giao diện, không tự dịch nội dung.

## Cài đặt

* Tải ZIP cập nhật V17b, giải nén, chép đè vào đúng thư mục của repository GitHub Pages (`assets/css/`, `assets/js/`, các file `.html` ở thư mục gốc).
* **Không thay** file `assets/js/config.js` (không nằm trong ZIP cập nhật).
* Commit changes, chờ GitHub Pages deploy hoàn thành; thử trang trong cửa sổ ẩn danh hoặc tải lại cứng. Asset có version `20261106-v17b` để giảm tình trạng Safari dùng CSS/JS cũ.
* **Ba chỉnh sửa giao diện không yêu cầu SQL** và không thay đổi bài viết/tài khoản trong Supabase.

## Nếu đồng thời cập nhật chức năng video/multiple-media của V17

ZIP `VietMuse-V17b-Media-va-Giao-dien-Cap-nhat.zip` cũng chứa những file JS/CSS/HTML hỗ trợ nhiều ảnh/video. Xem `HUONG-DAN-V17-VIDEO-VA-NHIEU-MEDIA.md` bên trong.

- Chèn video bằng link YouTube/Vimeo hoặc link MP4/WebM có sẵn: không cần SQL mới.
- **Upload file video lên Supabase**: chạy migration `backend/08-VIETMUSE-VIDEO-STORAGE.sql`, bật/kiểm tra bucket `news-videos` Public và giới hạn upload theo hướng dẫn riêng. Tính năng này là phần video, không liên quan sửa giao diện.

## Kiểm thử

- Đã kiểm tra cú pháp JS, không có liên kết bản dịch thừa trong markup, cache-busting, đường dẫn các asset nội bộ, và tính toàn vẹn ZIP.
- **Chưa kiểm thử trực quan trong trình duyệt với dữ liệu Supabase thật**; Chromium tại môi trường build không hoàn thành thao tác chụp trang. Sau khi deploy hãy mở một bài Education có ảnh bìa, xem trên desktop và điện thoại, và thử VI/EN trên một cặp bài đã xuất bản.
