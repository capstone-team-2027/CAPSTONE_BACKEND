const db = require("../../../models");
const Warranty_Policies = db.Warranty_Policies;
const { Op } = require("sequelize");

module.exports.listWarrantyPolicies = async () => {
    const rows = await Warranty_Policies.findAll({
        order: [['id', 'ASC']]
    });
    return rows;
};

module.exports.createWarrantyPolicy = async (body) => {
    const { policy_code, policy_name, image_cover_url, pdf_document_url, description, is_active } = body;

    const existing = await Warranty_Policies.findOne({ where: { policy_code } });
    if (existing) throw new Error('Mã chính sách bảo hành đã tồn tại');

    const newPolicy = await Warranty_Policies.create({
        policy_code,
        policy_name,
        image_cover_url,
        pdf_document_url,
        description,
        is_active: is_active !== undefined ? is_active : true
    });

    return newPolicy;
};

module.exports.updateWarrantyPolicy = async (id, body) => {
    const policy = await Warranty_Policies.findByPk(id);
    if (!policy) throw new Error('Không tìm thấy chính sách bảo hành');

    if (body.policy_code && body.policy_code !== policy.policy_code) {
        const existing = await Warranty_Policies.findOne({ where: { policy_code: body.policy_code } });
        if (existing) throw new Error('Mã chính sách bảo hành đã tồn tại');
    }

    await policy.update(body);
    return policy;
};
