const { z } = require("zod");

const createServiceOrderSchema = z.object({
    vehicle_id: z.number({ required_error: "Vui lòng chọn xe" }).positive("ID xe không hợp lệ"),
    bay_id: z.number({ required_error: "Vui lòng chọn cầu nâng" }).positive("ID cầu nâng không hợp lệ"),
    current_odo: z.number({ required_error: "Vui lòng nhập số km hiện tại" }).min(0, "Số ODO không hợp lệ"),
    appointment_id: z.number().positive("ID lịch hẹn không hợp lệ").optional(),
    estimated_finish_time: z.string().datetime("Thời gian dự kiến hoàn thành không hợp lệ").optional()
});

module.exports = {
    createServiceOrderSchema
};
