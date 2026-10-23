# ADR 0002: Tùy biến danh mục ứng dụng, Icon Vector và Bản địa hóa giao diện CleanFrame

## Bối cảnh
Người dùng TV Samsung QLED 65" (`QA65Q8FAAKXXV`) sử dụng kết hợp các ứng dụng phát nội dung trong nước (VieON, VTVgo) và các ứng dụng sideload giải trí/gaming (Moonlight, TizenBrew, Nuvio TV, Emby, Plex, Stremio).

Giao diện CleanFrame nguyên bản có các hạn chế:
1. Thiếu các ứng dụng nội bộ tại Việt Nam.
2. Icon của các app không có sẵn vector SVG bị hiển thị dưới dạng ảnh vuông mặc định (bitmap thô), tạo sự không đồng nhất về thẩm mỹ.
3. Giao diện bị pha trộn giữa Tiếng Anh và Tiếng Việt.
4. Nút Khung tranh (Art Mode) bị gỡ khi thay bằng Nguồn HDMI.
5. Danh sách "Tất cả ứng dụng" (All apps) giới hạn 12 app/trang khiến người dùng tưởng thiếu app nếu chưa cuộn xuống.

## Quyết định Thực hiện
1. **Khôi phục nút Khung tranh (Art Mode)**:
   - Thanh điều khiển trên cùng (Utility bar) được cấu hình 4 nút: `[ Nguồn (HDMI) ]`, `[ Khung tranh ]`, `[ Tất cả ứng dụng ]`, `[ Cài đặt ]`.
2. **Đồng bộ hóa 100% Tiếng Việt**:
   - Chuyển đổi toàn bộ nhãn tiện ích, tiêu đề các trang, nhãn trạng thái ("Đã thêm vào Home", "Xóa khỏi Home", v.v.) và menu cài đặt sang Tiếng Việt.
3. **Nâng cấp thẩm mỹ Icon**:
   - Bổ sung các icon vector SVG trong suốt cho: `emby.svg`, `plex.svg`, `vieon.svg`, `vtv.svg`, `xbox.svg`.
   - Với các ứng dụng còn lại dùng icon bitmap mặc định từ TV: áp dụng bo góc `border-radius: 18px` và hiệu ứng bóng đổ mềm `drop-shadow` để đạt độ tinh tế tương đương tvOS.
4. **Tối ưu hóa bộ lọc ứng dụng (App Catalog Filter)**:
   - Mở rộng phạm vi nhận diện cho các ứng dụng người dùng cài thêm, không bỏ sót các app sideload hoặc app nội địa.

## Kết quả
- Giao diện đạt độ hoàn thiện cao, đồng nhất về ngôn ngữ Tiếng Việt và phong cách đồ họa kính mờ sang trọng.
