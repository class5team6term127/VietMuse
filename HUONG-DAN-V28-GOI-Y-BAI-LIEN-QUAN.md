# VietMuse V28 — Gợi ý bài báo liên quan (Related stories)

## Có gì mới?

Trong trang đọc báo thật `bai-ban-doc.html?id=...`, sau nội dung / Crowd Poll / bình luận sẽ xuất hiện mục **Có thể bạn quan tâm** hoặc **You might also like** với tối đa **3 bài báo liên quan** (mặc định). Bài không có gợi ý phù hợp thì không hiện khối rỗng.

VietMuse tự chấm điểm các bài đã xuất bản dựa vào:
- Từ khóa và cụm từ xuất hiện ở **tiêu đề, tóm tắt và thân bài**, ưu tiên tiêu đề/tóm tắt, giảm trọng số từ quá phổ biến.
- **Cùng chuyên mục**, cùng loại bài (News với News; Forum với Forum).
- Độ mới của bài và lượt xem (ảnh hưởng nhẹ, không lấn át độ liên quan).

Lọc để không bao giờ gợi ý chính bài đang đọc, bản dịch VI/EN của bài đó, bài nháp/đang duyệt, hoặc bài sai ngôn ngữ. Với bài song ngữ, gợi ý ở bản VI chỉ lấy bài VI, bản EN chỉ lấy bài EN. Chỉ những bài đã xuất bản và đang nằm trong danh sách 200 bài gần nhất mà website tải từ Supabase mới được xét.

**Chú ý:** Đây là thuật toán tự động dựa trên chủ đề và độ trùng từ ngữ, **không phải mô hình AI hiểu ngữ nghĩa như ChatGPT**. Không gọi API AI trả phí, không thêm dữ liệu theo dõi người đọc, không đòi thêm SQL. Các bài viết khác chữ nhưng cùng ý có thể không được xếp đầu tiên. Nếu sau này số bài lớn hoặc muốn liên quan ngữ nghĩa chính xác hơn, có thể bổ sung tags/vector search.

## Cài bản cập nhật nhỏ V28

1. Giải nén `VietMuse-V28-Goi-Y-Bai-Lien-Quan-cap-nhat-nho.zip`.
2. Upload **đúng cấu trúc đường dẫn** bốn file sau vào GitHub repository VietMuse, ghi đè file tương ứng:
   - `assets/js/related-stories.js` (mới)
   - `assets/js/v3.js` (đã cập nhật)
   - `assets/css/style.css` (đã cập nhật)
   - `bai-ban-doc.html` (đã nạp JS mới / đổi version cache)
3. Chọn **Commit changes**, chờ GitHub Pages deploy.
4. Mở một bài News **đã xuất bản** trong `bai-ban-doc.html?id=...`, kéo xuống dưới phần bình luận; mục gợi ý sẽ hiển thị nếu có các bài liên quan.
5. Thử chuyển VI/EN bằng thanh điều hướng rồi kiểm tra gợi ý đổi sang đúng ngôn ngữ.

**Không cần chạy SQL**. Không thay đổi `assets/js/config.js`, bảng Supabase, quyền đăng bài, Crowd Poll, video, ảnh, hay forum. V28 giữ nguyên email Đào Mai Chi `daomaichi@gmail.com` và không bổ sung lại số thứ tự thành viên.

## Tùy chỉnh

- Số bài gợi ý: trong `assets/js/v3.js` tìm `recommend(current,allPosts,metrics,3)` và đổi số `3` (tối đa 6).
- Trọng số các yếu tố: trong `assets/js/related-stories.js`, chỉnh `sameCategory ? 22 : 0`, hệ số `overlap`, `fresh` và `popular`.
- Màu sắc và bố cục: cuối `assets/css/style.css`, tìm `V28 — Related stories`.

## Kiểm thử

- Đã kiểm tra cú pháp JS, thử với dữ liệu giả lập về cùng chủ đề, trùng bài, bài nháp, VI/EN và thử HTML escaping.
- Đã kiểm tra các đường dẫn file trong gói cập nhật.
- **Chưa kiểm thử trực tiếp với Supabase/GitHub Pages của nhóm**, nên không thể xác nhận nội dung gợi ý của các bài đang đăng trên website thật.

**Bản website đầy đủ:** Giống các bản VietMuse trước, bộ mã nguồn **không kèm `assets/js/config.js`** vì đây là cấu hình riêng của website. Khi cập nhật phải giữ nguyên file `assets/js/config.js` đang có trên GitHub. Bản ZIP cập nhật nhỏ được khuyên dùng để tránh ghi đè các thay đổi khác.
