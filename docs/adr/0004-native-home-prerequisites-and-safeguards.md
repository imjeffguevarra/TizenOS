# Điều kiện tiên quyết và cơ chế phòng vệ khi can thiệp Native Home

Can thiệp Native Home trên TV Samsung QA65Q8FAAKXXV bắt buộc tuân thủ 4 điều kiện an toàn sống còn:
1. Xác định chính xác phiên bản Firmware thực tế từ `/etc/prd_info.ini` và kiến trúc CPU thực tế (32-bit hay 64-bit) qua `sdb capability`.
2. Biên dịch lại công cụ can thiệp C# (`Control.cs`) phù hợp với đúng thông số trên.
3. Xuất và lưu trữ vĩnh viễn bản sao lưu nguyên trạng `original.json` trước khi thực thi lệnh `apply`.
4. Bắt buộc kích hoạt chính sách Auto Update Lockout (tắt cập nhật tự động phần mềm trên TV) để chống ghi đè cấu hình vconf.
