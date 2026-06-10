const appointmentService = require("../../service/customer/appointment.service");
const { createAppointmentSchema } = require("../../validation/customer/appointment.validation");

module.exports.getAppointment = async (req, res) => {
    try {
        const requestUser = res.locals.user;
        if (!requestUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const result = await appointmentService.getAppointments(requestUser.id);
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách lịch hẹn thành công",
            data: result
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

module.exports.createAppointment = async (req, res) => {
    try {
        const requestUser = res.locals.user;
        if (!requestUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const validation = createAppointmentSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: validation.error.issues[0].message
            });
        }

        const result = await appointmentService.createAppointment(requestUser.id, validation.data);
        return res.status(201).json({
            success: true,
            message: "Đặt lịch hẹn thành công",
            data: result
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

module.exports.deleteAppointment = async (req, res) => {
    try {
        const requestUser = res.locals.user;
        if (!requestUser) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const id = req.query.id || req.body.id;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp ID lịch hẹn cần xóa"
            });
        }

        const appointmentId = parseInt(id);
        if (isNaN(appointmentId)) {
            return res.status(400).json({
                success: false,
                message: "ID lịch hẹn phải là một số nguyên"
            });
        }

        const result = await appointmentService.deleteAppointment(requestUser.id, appointmentId);
        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};