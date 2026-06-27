const db = require("../../../models");
/** @type {import("sequelize").ModelStatic<import("sequelize").Model>} */
const Pricing_Rule = db.Pricing_Rules;

module.exports.createPricingRule = async (data) => {
    const { category, markup_rate, discount_rate, start_date, end_date } = data;
    const pricingRule = await Pricing_Rule.create({
        category,
        markup_rate,
        discount_rate,
        start_date: start_date ?? null,
        end_date: end_date ?? null,
    });
    return pricingRule;
};

module.exports.getAllPricingRules = async () => {
    const rules = await Pricing_Rule.findAll({
        where: { is_deleted: false },
        order: [['id', 'DESC']],
    });
    return rules;
};

module.exports.getPricingRuleById = async (id) => {
    const rule = await Pricing_Rule.findOne({
        where: { id, is_active: true },
    });
    return rule;
};

module.exports.updatePricingRule = async (id, data) => {
    const rule = await Pricing_Rule.findOne({
        where: { id, is_deleted: false },
    });
    if (!rule) {
        return null;
    }
    await rule.update(data);
    return rule;
};

module.exports.deletePricingRule = async (id) => {
    const rule = await Pricing_Rule.findOne({
        where: { id, is_deleted: false },
    });
    if (!rule) {
        return null;
    }
    await rule.update({ is_deleted: true });
    return rule;
};
