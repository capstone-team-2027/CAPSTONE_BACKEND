const db = require("../../../models");
const PartCategory = db.Part_Categories;

module.exports.createPartCategory = async (
  category_name,
  description,
  is_active,
) => {
  const toCode = (category_name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  if (!toCode) {
    throw { status: 400, message: "Tên danh mục không hợp lệ" };
  }
  const existed = await PartCategory.findOne({ where: { code: toCode } });
  if (existed) {
    throw {
      status: 409,
      message: `Mã danh mục "${toCode}" đã tồn tại, vui lòng đổi tên danh mục`,
    };
  };
  const category = await PartCategory.create({
    category_name: category_name,
    description: description,
    code: toCode,
    is_active: is_active,
  });
  return category;
};

module.exports.updatePartCategory = async (
  category_id,
  category_name,
  description,
  is_active,
) => {
  const category = await PartCategory.findOne({
    where: { id: category_id },
  });
  if (!category) {
    throw { status: 404, message: "Danh mục không tồn tại" };
  }
  await category.update({
    category_name: category_name,
    is_active: is_active,
    description: description,
  });
  return category;
};

module.exports.getPartCategory = async () => {
  const category = await PartCategory.findAll({
    attributes: ["id", "category_name", "description", "code", "is_active"],
  });
  return category;
};
