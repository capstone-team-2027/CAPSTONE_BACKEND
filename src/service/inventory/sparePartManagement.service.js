const { Op } = require("sequelize");
const db = require("../../../models");
const SparePart = db.Spare_Parts;

module.exports.createSparePart = async (
  name,
  brand,
  category_id,
  warranty_period_months,
  warranty_km_limit,
  transaction = null,
) => {
  const category = await db.Part_Categories.findByPk(
  category_id,
  { transaction }
);
if (!category) {
  throw {
    status: 404,
    message: "Danh mục không tồn tại"
  };
};
  const year = new Date().getFullYear();
  const prefix = `${category.code}-${year}-`;
  const last = await SparePart.findOne({
    where: { sku: { [Op.like]: `${prefix}%` } },
    order: [["sku", "DESC"]],
    transaction,
  });
  let next = 1;
  if (last) {
    const lastNumber = parseInt(last.sku.split("-")[2], 10);
    next = lastNumber + 1;
  }
  const sku = `${prefix}${String(next).padStart(4, "0")}`;
  const part = await SparePart.create(
    {
      sku: sku,
      name: name,
      brand: brand,
      category_id: category_id,
      warranty_period_months: warranty_period_months,
      warranty_km_limit: warranty_km_limit,
    },
    { transaction },
  );
  return part;
};

module.exports.getSpareParts = async () => {
  const part = await SparePart.findAll({
    attributes: [
      "id",
      "name",
      "brand",
      "cogs",
      "retail_price",
      "category_id",
      "warranty_type",
      "warranty_km_limit",
      "warranty_period_months",
    ],
    include: [
      {
        model: PartCategory, 
        as: "category",
        attributes: ["category_name"],
      },
    ],
  });
  return part;
};
module.exports.updateSparePart = async (
  id,
  name,
  brand,
  cogs,
  retail_price,
  category_id,
  warranty_type,
  warranty_period_months,
  warranty_km_limit,
) => {
  const part = await SparePart.findOne({
    where: { id: id },
  });
  if (!part) {
    throw { status: 404, message: "Phụ tùng không tồn tại" };
  }
  const updatePart = await part.update({
    name: name,
    brand: brand,
    cogs: cogs,
    retail_price: retail_price,
    category_id: category_id,
    warranty_type: warranty_type,
    warranty_period_months: warranty_period_months,
    warranty_km_limit: warranty_km_limit,
  });
  return updatePart;
};
