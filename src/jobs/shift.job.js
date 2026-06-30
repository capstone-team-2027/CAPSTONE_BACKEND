const cron = require('node-cron');
const shiftService = require('../service/admin/shift.service');
const { getDaysToAddForLastWorkingDay } = require('../util/dateShiftSlot.util');

// Chạy vào lúc 00:00 mỗi Thứ 7 hàng tuần (0 0 * * 6) chủ nhật admin sẽ vào confirm đặt lịch mà web site tự tạo ra 
// Hoặc nếu muốn chạy lúc 23:59 tối thứ 6 thì: 59 23 * * 5
cron.schedule('0 0 * * 6', async () => {
    console.log("CRON JOB: Bắt đầu tự động xếp ca cho tuần tiếp theo...");
    try {
        const today = new Date();

        // Thứ 7 → cộng thêm 2 ngày = Thứ 2 tuần sau
        const nextMonday = new Date(today);
        nextMonday.setDate(today.getDate() + 2);

        // Tính ngày kết thúc trong tuần thông qua cấu hình dùng chung
        const endDateObj = new Date(nextMonday);
        endDateObj.setDate(nextMonday.getDate() + getDaysToAddForLastWorkingDay());

        const startDate = nextMonday.toISOString().split('T')[0];
        const endDate = endDateObj.toISOString().split('T')[0];

        console.log(`CRON JOB: Xếp ca từ ${startDate} đến ${endDate}`);

        await shiftService.autoGenerateSchedule(startDate, endDate);
        console.log("CRON JOB: Xếp ca tự động hoàn tất!");

    } catch (error) {
        console.error("CRON JOB LỖI:", error.message);
    }
});
