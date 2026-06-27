const { z } = require("zod");

const receiveAppointmentSchema = z.object({
    key: z.string().min(1, "Mã lịch hẹn không được để trống")
});

const updateVehicleVinSchema = z.object({
    key: z.string().min(1, "Mã lịch hẹn không được để trống"),
    vin_number: z.string().min(1, "Vui lòng cung cấp số khung").max(20, "Số khung không được vượt quá 20 ký tự")
});

module.exports = {
    receiveAppointmentSchema,
    updateVehicleVinSchema
};
