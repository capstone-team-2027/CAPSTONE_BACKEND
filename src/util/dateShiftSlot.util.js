// Cấu hình các ngày làm việc trong tuần của Gara
// 0: Chủ Nhật, 1: Thứ 2, 2: Thứ 3, 3: Thứ 4, 4: Thứ 5, 5: Thứ 6, 6: Thứ 7
const WORKING_DAYS = [1, 2, 3, 4, 5]; // Hiện tại làm từ Thứ 2 đến Thứ 6

module.exports = {
    WORKING_DAYS,

    /**
     * Trả về mảng các ngày (string YYYY-MM-DD) nằm trong khoảng startDate -> endDate
     * và thỏa mãn điều kiện thuộc mảng WORKING_DAYS.
     */
    getWorkingDaysList: (startDate, endDate) => {
        const days = [];
        for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            if (WORKING_DAYS.includes(dayOfWeek)) {
                days.push(new Date(d).toISOString().split('T')[0]);
            }
        }
        return days;
    },

    /**
     * Dùng cho Cronjob tính ngày kết thúc lịch dựa vào ngày làm việc cuối cùng trong tuần.
     * Trả về số ngày cần cộng thêm từ Thứ 2.
     * VD: Làm đến Thứ 6 (5) -> khoảng cách từ Thứ 2 (1) là: 5 - 1 = 4.
     */
    getDaysToAddForLastWorkingDay: () => {
        if (WORKING_DAYS.length === 0) return 4; // fallback
        const maxDay = Math.max(...WORKING_DAYS); // Thứ 6 là 5, Thứ 7 là 6
        return maxDay - 1; // Khoảng cách từ Thứ 2
    }
};
