const PricingRulesService = require("../../service/admin/pricingRules.service");
const { createPricingRuleSchema, updatePricingRuleSchema } = require("./../../validation/admin/pricingRule.validator")

module.exports.createPricingRules = async (req, res) => {
    try {
        const parsed = createPricingRuleSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: parsed.error.issues.map((e) => ({
                    field: e.path.join('.') || 'general',
                    message: e.message,
                })),
            });
            return null;
        }

        const pricingRule = await PricingRulesService.createPricingRule(parsed.data);
        return res.status(201).json({
            success: true,
            message: 'Pricing rule created successfully',
            data: pricingRule,
        });
    } catch (error) {
        console.error('createPricingRules error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
}

// view 
module.exports.getAllPricingRules = async (req, res) => {
    try {
        const rules = await PricingRulesService.getAllPricingRules();

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách quy tắc giá thành công',
            data: rules,
        });
    } catch (error) {
        console.error('getAllPricingRules error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: error.message,
        });
    }
};

// get id to update 
module.exports.getPricingRuleById = async (req, res) => {
    try {
        const { id } = req.params;

        const rule = await PricingRulesService.getPricingRuleById(id);

        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy quy tắc giá',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy quy tắc giá thành công',
            data: rule,
        });
    } catch (error) {
        console.error('getPricingRuleById error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: error.message,
        });
    }
};

module.exports.updatePricingRule = async (req, res) => {
    try {
        const { id } = req.params;

        const parsed = updatePricingRuleSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: parsed.error.issues.map((e) => ({
                    field: e.path.join('.') || 'general',
                    message: e.message,
                })),
            });
        }

        const rule = await PricingRulesService.updatePricingRule(id, parsed.data);

        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy quy tắc giá',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Cập nhật quy tắc giá thành công',
            data: rule,
        });
    } catch (error) {
        console.error('updatePricingRule error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: error.message,
        });
    }
};

module.exports.deletePricingRule = async (req, res) => {
    try {
        const { id } = req.params;

        const rule = await PricingRulesService.deletePricingRule(id);

        if (!rule) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy quy tắc giá hoặc đã bị xóa',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Xóa quy tắc giá thành công',
        });
    } catch (error) {
        console.error('deletePricingRule error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ',
            error: error.message,
        });
    }
};