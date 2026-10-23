# ADR 0005: Quản lý nguồn phát HDMI và Menu lựa chọn cổng (HDMI Dropdown)

## Bối cảnh & Hiện trạng
Trên Smart TV Samsung QLED 65" (`QA65Q8FAAKXXV`), người dùng kết nối nhiều thiết bị ngoại vi qua các cổng HDMI (PC Gaming, Console, Soundbar qua cổng HDMI 2 eARC). CleanFrame nguyên bản thiếu tính năng chuyển đổi cổng nguồn HDMI.

Ban đầu, các cổng HDMI được tách riêng thành từng ô (HDMI 1, HDMI 2) trên Dock chính, nhưng điều này chiếm dụng các vị trí ứng dụng giải trí khác (giới hạn 9 app trên Home). Người dùng yêu cầu gom lại thành 1 nút HDMI duy nhất và khi nhấn sẽ hiển thị một menu danh sách các cổng HDMI (HDMI 1, 2, ... eARC) để lựa chọn.

## Quyết định Thiết kế
1. **Một nút bấm duy nhất trên Dock & Top Bar**:
   - Thay thế các ô `hdmi1`, `hdmi2` bằng một tile duy nhất: `{ id: 'hdmi', name: 'HDMI', brand: 'hdmi', appId: 'hdmi:menu' }`.
   - Nút `Nguồn (HDMI)` trên thanh tiện ích trên cùng cũng gọi chung phương thức này.
2. **Menu lựa chọn nguồn phát (Source Dropdown / Modal)**:
   - Sử dụng kiến trúc `sheet` / `message` native của CleanFrame để mở bảng chọn cổng:
     - `HDMI 1`
     - `HDMI 2 (eARC)`
     - `HDMI 3`
     - `HDMI 4`
     - `Đóng (Cancel)`
   - Tự động truy vấn `tizen.systeminfo.getPropertyValue('VIDEOSOURCE')`: Nếu cổng nào đang có dây cáp cắm vào, menu sẽ hiển thị ký hiệu `●` và tự động focus sẵn vào cổng đó.
   - Hỗ trợ phím điều hướng Trái / Phải / Lên / Xuống trên remote TV, nhấn OK để kích hoạt, nhấn Back để đóng menu.
3. **Cơ chế chuyển nguồn sang video full-screen**:
   - Khi chọn một cổng (ví dụ HDMI 2): Gọi `tizen.tvwindow.setSource(source)` và khởi chạy trình xem video gốc của Samsung: `org.tizen.tv-viewer`.

## Hệ quả & Đánh giá
- Màn hình Home giữ được bố cục gọn gàng, trả lại vị trí cho app VieON (đủ 9 app chính).
- Trải nghiệm trực quan, dễ thao tác với remote TV.
- An toàn, không gây ảnh hưởng đến cấu hình hệ thống TV.
