const { createPartCategorySchema, updatePartCategorySchema } = require("../../validation/inventory/sparePartCategory.validation");
const partCategory = require("../../service/inventory/sparePartCategory.service");

module.exports.createPartCategory = async (req, res) => {
    try {
        const { category_name, description, is_active } = req.body;
        const validation = createPartCategorySchema.safeParse({ category_name, description, is_active });
        if (!validation.success) {
            return res.status(400).json({
                message: validation.error.issues[0].message,
            });
        }
        const result = await partCategory.createPartCategory(category_name, description, is_active);
        return res.status(201).json({
            message: "Tạo danh mục thành công",
            data: result,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

module.exports.getPartCategory = async (req, res) => {
    try {
        const result = await partCategory.getPartCategory();
        return res.status(200).json({
            data: result,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

module.exports.updatePartCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name, description, is_active } = req.body;
        const validation = updatePartCategorySchema.safeParse({ category_name, description, is_active });
        if (!validation.success) {
            return res.status(400).json({
                message: validation.error.issues[0].message,
            });
        }
        const result = await partCategory.updatePartCategory(id, category_name, description, is_active);
        return res.status(200).json({
            message: "Cập nhật danh mục thành công",
            data: result,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
        });
    }
};
