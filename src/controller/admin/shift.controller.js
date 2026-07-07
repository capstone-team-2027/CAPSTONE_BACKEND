const shiftService = require('../../service/admin/shift.service');
const { 
    createShiftSlotSchema, 
    updateShiftSlotSchema, 
    dateRangeSchema, 
    assignShiftSchema 
} = require('../../validation/admin/shift.validation');

module.exports.getAllShiftSlots = async (req, res) => {
    try {
        const slots = await shiftService.getAllShiftSlots();
        res.status(200).json({ success: true, data: slots });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.createShiftSlot = async (req, res) => {
    try {
        const validation = createShiftSlotSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: validation.error.issues[0].message });
        }

        const slot = await shiftService.createShiftSlot(validation.data);
        res.status(201).json({ success: true, data: slot, message: "Tạo khung ca thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.updateShiftSlot = async (req, res) => {
    try {
        const validation = updateShiftSlotSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: validation.error.issues[0].message });
        }

        const slot = await shiftService.updateShiftSlot(req.params.id, validation.data);
        res.status(200).json({ success: true, data: slot, message: "Cập nhật khung ca thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};




module.exports.getShiftTemplates = async (req, res) => {
    try {
        const validation = dateRangeSchema.safeParse(req.query);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: validation.error.issues[0].message });
        }
        const { startDate, endDate } = validation.data;
        const templates = await shiftService.getShiftTemplates(startDate, endDate);
        res.status(200).json({ success: true, data: templates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.assignShift = async (req, res) => {
    try {
        const validation = assignShiftSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: validation.error.issues[0].message });
        }
        const { userId, slotIds, workDate } = validation.data;
        const result = await shiftService.assignShift(userId, slotIds, workDate);
        res.status(200).json({ success: true, data: result, message: "Đã cập nhật lịch làm việc" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.autoGenerateSchedule = async (req, res) => {
    try {
        const validation = dateRangeSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: validation.error.issues[0].message });
        }
        const { startDate, endDate } = validation.data;
        const result = await shiftService.autoGenerateSchedule(startDate, endDate);
        res.status(200).json({ success: true, message: result.message, totalGenerated: result.totalGenerated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports.confirmSchedule = async (req, res) => {
    try {
        const validation = dateRangeSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: validation.error.issues[0].message });
        }
        const { startDate, endDate } = validation.data;
        await shiftService.confirmSchedule(startDate, endDate);
        res.status(200).json({ success: true, message: "Chốt lịch thành công! Nhân viên có thể thấy lịch này." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
