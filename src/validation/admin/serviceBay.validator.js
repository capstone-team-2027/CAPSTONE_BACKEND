const { z } = require('zod');

const createServiceBaySchema = z.object({
    bay_name: z.string({ required_error: 'Tên cầu sửa chữa là bắt buộc' })
        .min(1, 'Tên cầu sửa chữa không được để trống'),

    status: z.enum(['available', 'in_use', 'maintenance'], {
        message: 'Status phải là available | in_use | maintenance'
    }).default('available'),

    is_active: z.boolean().default(true)
});
const updateServiceBaySchema = z.object({
    bay_name: z.string().min(1, 'Tên cầu sửa chữa không được để trống').optional(),
    status: z.enum(['available', 'in_use', 'maintenance'], {
        message: 'Status phải là available | in_use | maintenance'
    }).optional(),
    is_active: z.boolean().optional()
});
module.exports = { createServiceBaySchema, updateServiceBaySchema };