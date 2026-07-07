const { z } = require('zod');

const createShiftSlotSchema = z.object({
    slot_name: z.string({ required_error: 'Tên khung ca không được để trống' })
        .min(1, 'Tên khung ca không được để trống'),
    start_time: z.string({ required_error: 'Giờ bắt đầu không được để trống' })
        .regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Giờ bắt đầu không đúng định dạng HH:mm'),
    end_time: z.string({ required_error: 'Giờ kết thúc không được để trống' })
        .regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Giờ kết thúc không đúng định dạng HH:mm'),
    max_technicians: z.number({ required_error: 'Số lượng nhân viên tối đa là bắt buộc' })
        .min(1, 'Số lượng nhân viên tối đa phải lớn hơn 0'),
    min_senior: z.number().min(0, 'Tối thiểu Senior không được là số âm').default(0),
    min_mid: z.number().min(0, 'Tối thiểu Mid không được là số âm').default(0),
    prefer_senior: z.number().min(0, 'Ưu tiên Senior không được là số âm').default(0),
    prefer_mid: z.number().min(0, 'Ưu tiên Mid không được là số âm').default(0),
    prefer_junior: z.number().min(0, 'Ưu tiên Junior không được là số âm').default(0)
}).refine(data => data.start_time < data.end_time, {
    message: 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc',
    path: ['start_time']
});

const updateShiftSlotSchema = z.object({
    slot_name: z.string().min(1, 'Tên khung ca không được để trống').optional(),
    start_time: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Giờ bắt đầu không đúng định dạng HH:mm').optional(),
    end_time: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Giờ kết thúc không đúng định dạng HH:mm').optional(),
    max_technicians: z.number().min(1, 'Số lượng nhân viên tối đa phải lớn hơn 0').optional(),
    min_senior: z.number().min(0, 'Tối thiểu Senior không được là số âm').optional(),
    min_mid: z.number().min(0, 'Tối thiểu Mid không được là số âm').optional(),
    prefer_senior: z.number().min(0, 'Ưu tiên Senior không được là số âm').optional(),
    prefer_mid: z.number().min(0, 'Ưu tiên Mid không được là số âm').optional(),
    prefer_junior: z.number().min(0, 'Ưu tiên Junior không được là số âm').optional()
}).refine(data => {
    if (data.start_time && data.end_time) {
        return data.start_time < data.end_time;
    }
    return true; // Nếu chỉ update 1 trong 2 trường thì bỏ qua validate so sánh ở mức schema này
}, {
    message: 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc',
    path: ['start_time']
});

// Schema cho startDate và endDate dùng chung (VD: 2024-05-20)
const dateRangeSchema = z.object({
    startDate: z.string({ required_error: 'Vui lòng cung cấp startDate' })
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate phải có định dạng YYYY-MM-DD'),
    endDate: z.string({ required_error: 'Vui lòng cung cấp endDate' })
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate phải có định dạng YYYY-MM-DD')
});

const assignShiftSchema = z.object({
    userId: z.number({ required_error: 'userId là bắt buộc' }).int().positive('userId phải là số nguyên dương'),
    slotIds: z.array(z.number().int().positive(), { required_error: 'slotIds là bắt buộc và phải là một mảng các số nguyên' }),
    workDate: z.string({ required_error: 'workDate là bắt buộc' })
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'workDate phải có định dạng YYYY-MM-DD')
});

module.exports = { 
    createShiftSlotSchema, 
    updateShiftSlotSchema,
    dateRangeSchema,
    assignShiftSchema
};
