const WarrantyPoliciesService = require("./../../service/admin/warrantyPolicies.service");
const { createWarrantyPolicySchema, updateWarrantyPolicySchema } = require("./../../validation/admin/warrantyPolicy.validator");
const { uploadToCloudinary } = require("./../../helper/uploadToCloudinary.helper");

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
        if (req.body.is_active === 'true') req.body.is_active = true;
        if (req.body.is_active === 'false') req.body.is_active = false;
        if (req.body.image_cover_url === 'null' || req.body.image_cover_url === '') req.body.image_cover_url = null;
        if (req.body.pdf_document_url === 'null' || req.body.pdf_document_url === '') req.body.pdf_document_url = null;
        if (req.body.description === 'null' || req.body.description === '') req.body.description = null;

        // Upload image cover if uploaded
        if (req.files && req.files['image_cover'] && req.files['image_cover'][0]) {
            const file = req.files['image_cover'][0];
            const uploadResult = await uploadToCloudinary(file.buffer, "WDP301", false);
            req.body.image_cover_url = uploadResult.secure_url;
        }

        // Upload PDF document if uploaded
        if (req.files && req.files['pdf_document'] && req.files['pdf_document'][0]) {
            const file = req.files['pdf_document'][0];
            const uploadResult = await uploadToCloudinary(file.buffer, "WDP301", true);
            req.body.pdf_document_url = uploadResult.secure_url;
        }

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

        if (req.body.is_active === 'true') req.body.is_active = true;
        if (req.body.is_active === 'false') req.body.is_active = false;
        if (req.body.image_cover_url === 'null' || req.body.image_cover_url === '') req.body.image_cover_url = null;
        if (req.body.pdf_document_url === 'null' || req.body.pdf_document_url === '') req.body.pdf_document_url = null;
        if (req.body.description === 'null' || req.body.description === '') req.body.description = null;

        // Upload image cover if uploaded
        if (req.files && req.files['image_cover'] && req.files['image_cover'][0]) {
            const file = req.files['image_cover'][0];
            const uploadResult = await uploadToCloudinary(file.buffer, "WDP301", false);
            req.body.image_cover_url = uploadResult.secure_url;
        }

        // Upload PDF document if uploaded
        if (req.files && req.files['pdf_document'] && req.files['pdf_document'][0]) {
            const file = req.files['pdf_document'][0];
            const uploadResult = await uploadToCloudinary(file.buffer, "WDP301", true);
            req.body.pdf_document_url = uploadResult.secure_url;
        }

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