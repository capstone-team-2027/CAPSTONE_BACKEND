const db = require("../../../models");
const PartCategory = db.Part_Categories;

module.exports.createPartCategory = async (category_name, description, is_active) => {
  const category = await PartCategory.create({
    category_name: category_name,
    is_active: is_active,
    description: description,
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
    description: description
  });
  return category;
};

module.exports.getPartCategory = async () => {
  const category = await PartCategory.findAll({});
  return category;
};