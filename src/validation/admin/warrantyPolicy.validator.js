const { z } = require('zod');

const createWarrantyPolicySchema = z.object({
    policy_code: z.string({ required_error: 'Mã chính sách bảo hành là bắt buộc' })
        .min(1, 'Mã chính sách bảo hành không được để trống')
        .max(50, 'Mã chính sách bảo hành không được quá 50 ký tự'),

    policy_name: z.string({ required_error: 'Tên chính sách bảo hành là bắt buộc' })
        .min(1, 'Tên chính sách bảo hành không được để trống')
        .max(255, 'Tên chính sách bảo hành không được quá 255 ký tự'),

    description: z.string().nullable().optional(),
    image_cover_url: z.string().max(255, 'Ảnh cover không được quá 255 ký tự').nullable().optional(),
    pdf_document_url: z.string().max(255, 'Tài liệu PDF không được quá 255 ký tự').nullable().optional(),
    is_active: z.boolean().default(true)
});

const updateWarrantyPolicySchema = z.object({
    policy_code: z.string().min(1, 'Mã chính sách bảo hành không được để trống').max(50).optional(),
    policy_name: z.string().min(1, 'Tên chính sách bảo hành không được để trống').max(255).optional(),
    description: z.string().nullable().optional(),
    image_cover_url: z.string().max(255).nullable().optional(),
    pdf_document_url: z.string().max(255).nullable().optional(),
    is_active: z.boolean().optional()
});

module.exports = { createWarrantyPolicySchema, updateWarrantyPolicySchema };
