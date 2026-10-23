# CleanFrame for Samsung Tizen TV

CleanFrame là giao diện màn hình chính (Home Launcher) tối giản cho Samsung Smart TV chạy hệ điều hành Tizen OS, thay thế giao diện mặc định Samsung Smart Hub.

## Language

**Standalone Mode**:
Chế độ chạy CleanFrame như một ứng dụng Web thông thường (.wgt) độc lập, khởi chạy qua thanh ứng dụng mà không can thiệp vào phím Home vật lý hoặc cấu hình hệ thống của TV.
_Avoid_: App thường, chế độ phụ, manual mode

**Native Home Mode**:
Chế độ can thiệp vào cơ sở dữ liệu hệ thống (vconf) của Tizen OS để gán phím Home vật lý trên điều khiển từ xa trực tiếp cho CleanFrame.
_Avoid_: Root mode, system hack, hijack mode

**App Catalog**:
Tập hợp các mã định danh ứng dụng (App ID) đã cài đặt trên TV được CleanFrame quản lý để khởi chạy qua Tizen Application Control API.
_Avoid_: App list, shortcut list, danh sách phần mềm

**Baseline Snapshot**:
Bản sao lưu trạng thái cấu hình hệ thống nguyên bản (original.json) của TV trước khi thực hiện bất kỳ can thiệp Native Home nào, dùng làm căn cứ phục hồi tuyệt đối.
_Avoid_: Backup file, system dump, restore point

**Ambient Mode**:
Chế độ hình nền/nghệ thuật trên dòng TV Samsung QLED thông thường, thay thế cho Art Mode vốn là tính năng độc quyền của dòng The Frame.
_Avoid_: Art Mode, chế độ tranh

**Auto Update Lockout**:
Chính sách bắt buộc tắt tính năng cập nhật phần mềm tự động (OTA) trên TV để ngăn Samsung ghi đè hoặc vô hiệu hóa cấu hình Native Home.
_Avoid_: Tắt update, bỏ update
