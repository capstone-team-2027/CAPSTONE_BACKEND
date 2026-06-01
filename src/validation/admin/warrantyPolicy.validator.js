const { z } = require('zod');

const createWarrantyPolicySchema = z.object({
    policy_code: z.string({ required_error: 'Mã chính sách bảo hành là bắt buộc' })
        .min(1, 'Mã chính sách bảo hành không được để trống')
        .max(50, 'Mã chính sách bảo hành không được quá 50 ký tự'),

    policy_name: z.string({ required_error: 'Tên chính sách bảo hành là bắt buộc' })
        .min(1, 'Tên chính sách bảo hành không được để trống')
        .max(255, 'Tên chính sách bảo hành không được quá 255 ký tự'),

    warranty_type: z.enum(['TIME', 'DISTANCE', 'BOTH', 'NONE'], {
        errorMap: () => ({ message: 'Loại bảo hành phải là TIME, DISTANCE, BOTH, hoặc NONE' })
    }),

    duration_months: z.number().int().nonnegative().nullable().optional(),
    distance_km: z.number().int().nonnegative().nullable().optional(),
    description: z.string().nullable().optional(),
    is_active: z.boolean().default(true)
});

const updateWarrantyPolicySchema = z.object({
    policy_code: z.string().min(1, 'Mã chính sách bảo hành không được để trống').max(50).optional(),
    policy_name: z.string().min(1, 'Tên chính sách bảo hành không được để trống').max(255).optional(),
    warranty_type: z.enum(['TIME', 'DISTANCE', 'BOTH', 'NONE']).optional(),
    duration_months: z.number().int().nonnegative().nullable().optional(),
    distance_km: z.number().int().nonnegative().nullable().optional(),
    description: z.string().nullable().optional(),
    is_active: z.boolean().optional()
});

module.exports = { createWarrantyPolicySchema, updateWarrantyPolicySchema };
