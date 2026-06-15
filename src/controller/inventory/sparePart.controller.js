const { createSparePart, updateSparePart } = require("../../validation/inventory/sparePart.validation");
const manageSparePart = require("../../service/inventory/sparePart.service");

module.exports.createSpareParts = async (req, res) => {
    try {
        const { name, brand, cogs, retail_price, category_id, warranty_type, warranty_period_months, warranty_km_limit } = req.body;
        const validation = createSparePart.safeParse({ name, brand, cogs, retail_price, category_id });
        if (!validation.success) {
            return res.status(400).json({
                message: validation.error.issues[0].message,
            });
        }
        const result = await manageSparePart.createSpareParts(name, brand, cogs, retail_price, category_id, warranty_type, warranty_period_months, warranty_km_limit);
        return res.status(201).json({
            message: "Tạo phụ tùng thành công",
            data: result,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

module.exports.getSpareParts = async (req, res) => {
    try {
        const result = await manageSparePart.getSpareParts();
        return res.status(200).json({
            data: result,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
        });
    }
};

module.exports.updateSparePart = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, brand, cogs, retail_price, warranty_type, warranty_period_months, warranty_km_limit } = req.body;
        const validation = updateSparePart.safeParse({ name, brand, cogs, retail_price });
        if (!validation.success) {
            return res.status(400).json({
                message: validation.error.issues[0].message,
            });
        }
        const result = await manageSparePart.updateSparePart(id, name, brand, cogs, retail_price, warranty_type, warranty_period_months, warranty_km_limit);
        return res.status(200).json({
            message: "Cập nhật phụ tùng thành công",
            data: result,
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            message: error.message || "Internal server error",
        });
    }
};
