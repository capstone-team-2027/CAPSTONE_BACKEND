// validators/pricingRule.validator.js

const { z } = require('zod');

const createPricingRuleSchema = z.object({
    category: z
        .string({ required_error: 'Danh mục là bắt buộc' })
        .min(1, 'Danh mục không được để trống'),
    markup_rate: z
        .number({ invalid_type_error: 'Tỉ lệ tăng giá phải là số' })
        .min(0, 'Tỉ lệ tăng giá phải >= 0')
        .max(1000, 'Tỉ lệ tăng giá phải <= 1000')
        .default(0),
    discount_rate: z
        .number({ invalid_type_error: 'Tỉ lệ giảm giá phải là số' })
        .min(0, 'Tỉ lệ giảm giá phải >= 0')
        .max(100, 'Tỉ lệ giảm giá phải <= 100 (100 = miễn phí)')
        .default(0),
    start_date: z.coerce.date({ invalid_type_error: 'Ngày bắt đầu không hợp lệ' }).nullable().optional(),
    end_date: z.coerce.date({ invalid_type_error: 'Ngày kết thúc không hợp lệ' }).nullable().optional(),
    is_active: z.boolean().optional(),
}).refine(
    (data) => {
        if (data.start_date && data.end_date) return data.start_date < data.end_date;
        return true;
    },
    { message: 'Ngày bắt đầu phải trước ngày kết thúc', path: ['start_date'] }
);

const updatePricingRuleSchema = z.object({
    category: z
        .string({ invalid_type_error: 'Danh mục phải là chuỗi' })
        .min(1, 'Danh mục không được để trống')
        .optional(),
    markup_rate: z
        .number({ invalid_type_error: 'Tỉ lệ tăng giá phải là số' })
        .min(0, 'Tỉ lệ tăng giá phải >= 0')
        .max(1000, 'Tỉ lệ tăng giá phải <= 1000')
        .optional(),
    discount_rate: z
        .number({ invalid_type_error: 'Tỉ lệ giảm giá phải là số' })
        .min(0, 'Tỉ lệ giảm giá phải >= 0')
        .max(100, 'Tỉ lệ giảm giá phải <= 100 (100 = miễn phí)')
        .optional(),
    start_date: z.coerce.date({ invalid_type_error: 'Ngày bắt đầu không hợp lệ' }).nullable().optional(),
    end_date: z.coerce.date({ invalid_type_error: 'Ngày kết thúc không hợp lệ' }).nullable().optional(),
    is_active: z.boolean().optional(),
}).refine(
    (data) => {
        if (data.start_date && data.end_date) return data.start_date < data.end_date;
        return true;
    },
    { message: 'Ngày bắt đầu phải trước ngày kết thúc', path: ['start_date'] }
);

module.exports = { createPricingRuleSchema, updatePricingRuleSchema };