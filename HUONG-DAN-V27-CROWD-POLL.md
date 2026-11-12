# VietMuse V27 — Crowd Poll cho bài báo tòa soạn (tùy chọn)

## Tính năng
- Trong **Newsroom → New article / Edit → Bilingual Editor**, có mục **Add a Crowd Poll? / Thêm Crowd Poll?** (mặc định tắt).
- Bật lên sẽ thấy **câu hỏi tiếng Việt**, **câu hỏi tiếng Anh** và 2–6 đáp án, mỗi đáp án có đủ hai ngôn ngữ. Dùng **+ Add another option** để thêm.
- Bấm **Save draft**, **Send for review** hoặc **Publish both VI + EN** để lưu bài **và** Crowd Poll.
- Poll chỉ hiển thị ở cuối **bài News đã xuất bản**. Poll tắt thì không có khoảng trống.
- Kết quả bình chọn **dùng chung cho cặp bài VI/EN**, không nhân đôi phiếu nếu độc giả chuyển ngôn ngữ.
- Mỗi **tài khoản đã đăng nhập (không phải tài khoản khách ẩn danh)** có một phiếu; được đổi lựa chọn. Khách có thể xem kết quả, nhưng cần đăng nhập mới bình chọn.
- Sau khi đã có người bình chọn, Editor/Admin vẫn có thể **tắt poll**, nhưng không thể đổi ý nghĩa câu hỏi hoặc các đáp án; nhằm bảo vệ tính toàn vẹn kết quả.
- Forum Poll cũ không bị thay đổi.

## BẮT BUỘC: Chạy SQL 10 trước khi dùng poll
1. Supabase Dashboard → chọn **đúng project VietMuse** → **SQL Editor → New query**.
2. Mở file `backend/10-VIETMUSE-EDITORIAL-CROWD-POLLS.sql` (hoặc bản `.txt`), dán toàn bộ và **Run**.
3. Lệnh kiểm tra cuối cùng nên trả về `can_save_poll = true`, `can_read_poll = true`, `can_vote = true`.
4. Migration này **bổ sung bảng/RPC độc lập**; không xóa bài viết/bình luận/vote cũ, không cần chạy lại SQL 01–09. Cần các migration 02, 03, 06, 07 đã hoạt động.

## Cập nhật GitHub Pages
1. Giải nén `VietMuse-V27-Crowd-Poll-cap-nhat-nho.zip`.
2. Upload các file trong ZIP vào **đúng đường dẫn** GitHub repository `VietMuse`, bao gồm các file JS/CSS/HTML; không upload cả thư mục ZIP làm thư mục con.
3. Nhấn **Commit changes**. Đảm bảo GitHub Pages deploy xong.
4. Mở trang `soan-bai-song-ngu.html` từ Newsroom, tạo một bài song ngữ do nhóm tự viết và bật Crowd Poll thử.
5. Mở bài ở cả VI và EN: câu hỏi/nhãn đổi ngôn ngữ, nhưng tổng phiếu phải giống nhau. Thử bằng tài khoản độc giả đã đăng nhập.

## Ghi chú quan trọng
- Nếu chưa chạy SQL 10 nhưng đã upload code, **bài News không kèm poll vẫn lưu bình thường**. Khi bật poll có thể thấy lỗi `function not found`.
- Lưu bài và lưu poll là **hai yêu cầu API liên tiếp**. Nếu lỗi khi lưu poll, trang sẽ báo **"BÀI ĐÃ LƯU, nhưng Crowd Poll chưa lưu"**, kèm lỗi Supabase. Đừng đăng bài trùng: hãy sửa theo thông báo và bấm Lưu lại trong bài đang mở.
- Tỷ lệ phần trăm là thống kê tự nguyện, không phản ánh khảo sát đại diện.
- Vì dùng tài khoản độc giả để chống bình chọn lặp, đây không phải hệ thống khảo sát ẩn danh hay chống thao túng chuyên nghiệp.
- **Không đưa `service_role` hoặc secret key lên GitHub.** `assets/js/config.js` được giữ nguyên.
- Vẫn giữ trang About Us không đánh số thành viên và email `daomaichi@gmail.com`.

## Tập tin thay đổi
- `assets/js/crowd-editor.js` — form poll tùy chọn ở Bilingual Editor (file mới)
- `assets/js/bilingual-editor.js` — lưu poll cùng luồng soạn bài
- `assets/js/v3.js` — hiển thị poll và ghi vote trên trang đọc
- `assets/css/bilingual-editor.css` — form cho Editor/Admin
- `assets/css/style.css` — kết quả bình chọn trên trang đọc
- `soan-bai-song-ngu.html` — nạp script mới và refresh CSS cache
- `bai-ban-doc.html`, `bai-viet.html` — refresh JS/CSS cache
- `backend/10-VIETMUSE-EDITORIAL-CROWD-POLLS.sql` — database migrations
