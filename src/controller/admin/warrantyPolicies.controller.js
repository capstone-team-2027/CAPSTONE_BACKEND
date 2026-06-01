const WarrantyPoliciesService = require("./../../service/admin/warrantyPolicies.service");
const { createWarrantyPolicySchema, updateWarrantyPolicySchema } = require("./../../validation/admin/warrantyPolicy.validator");

module.exports.getWarrantyPolicies = async (req, res) => {
    try {
        const data = await WarrantyPoliciesService.listWarrantyPolicies();
        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách chính sách bảo hành thành công',
            data
        });
    } catch (error) {
        console.error('getWarrantyPolicies error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: error.message
        });
    }
};

module.exports.createWarrantyPolicy = async (req, res) => {
    try {
        const parsed = createWarrantyPolicySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: parsed.error.issues.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
            });
        }

        const data = await WarrantyPoliciesService.createWarrantyPolicy(parsed.data);
        return res.status(201).json({
            success: true,
            message: 'Tạo chính sách bảo hành thành công',
            data
        });
    } catch (error) {
        console.error('createWarrantyPolicy error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: error.message
        });
    }
};

module.exports.updateWarrantyPolicy = async (req, res) => {
    try {
        const { id } = req.params;

        const parsed = updateWarrantyPolicySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: parsed.error.issues.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
            });
        }

        const data = await WarrantyPoliciesService.updateWarrantyPolicy(id, parsed.data);
        return res.status(200).json({
            success: true,
            message: 'Cập nhật chính sách bảo hành thành công',
            data
        });
    } catch (error) {
        console.error('updateWarrantyPolicy error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: error.message
        });
    }
};