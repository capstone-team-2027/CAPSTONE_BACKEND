const techShiftService = require('../../service/technician/shift.service');

module.exports.getMyShifts = async (req, res) => {
    try {
        const technicianId = res.locals.user.id;
        const { startDate, endDate } = req.query;

        const shifts = await techShiftService.getMyShifts(technicianId, startDate, endDate);
        
        return res.status(200).json({
            success: true,
            data: shifts,
            message: "Lấy lịch làm việc thành công"
        });
    } catch (error) {
        console.error("Error in getMyShifts:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Đã xảy ra lỗi khi lấy lịch làm việc"
        });
    }
};
