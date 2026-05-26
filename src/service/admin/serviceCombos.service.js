"use strict";

const db = require("../../../models");
const { Op } = require("sequelize");

const ServiceCategory = db.Service_Categories || db.ServiceCategory;
const ServiceCatalog = db.Service_Catalog || db.ServiceCatalog;

// helper: check if category_id allows null
const categoryIdAllowsNull =
  ServiceCatalog &&
  ServiceCatalog.rawAttributes &&
  ServiceCatalog.rawAttributes.category_id &&
  ServiceCatalog.rawAttributes.category_id.allowNull === true;

module.exports.listCombos = async ({ page = 1, limit = 50, include_services = false }) => {
  const offset = (page - 1) * limit;
  const include =
    include_services && ServiceCatalog
      ? [{ model: ServiceCatalog, as: "services" }]
      : [];

  const total = await ServiceCategory.count();
  const items = await ServiceCategory.findAll({
    attributes: ["id", "category_name", "is_active", "createdAt", "updatedAt"],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    include,
  });

  return { page, limit, total, items };
}

module.exports.createCombo = async ({
  category_name,
  is_active = true,
}) => {
  const t = await db.sequelize.transaction();
  try {
    const category = await ServiceCategory.create(
      { category_name, is_active },
      { transaction: t }
    );

    await t.commit();
    return category;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

module.exports.updateCombo = async (id, { category_name, is_active }) => {
  const t = await db.sequelize.transaction();
  try {
    const category = await ServiceCategory.findByPk(id, { transaction: t });
    if (!category) throw new Error("Category not found");

    await category.update(
      {
        ...(category_name !== undefined ? { category_name } : {}),
        ...(is_active !== undefined ? { is_active } : {}),
      },
      { transaction: t }
    );

    await t.commit();
    return category;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

module.exports.deleteCombo = async (id) => {
  const t = await db.sequelize.transaction();
  try {
    const category = await ServiceCategory.findByPk(id, { transaction: t });
    if (!category) {
      throw new Error("Category not found");
    }

    // If ServiceCatalog model exists, either nullify category_id or delete services
    if (ServiceCatalog) {
      if (categoryIdAllowsNull) {
        await ServiceCatalog.update(
          { category_id: null },
          { where: { category_id: id }, transaction: t }
        );
      } else {
        await ServiceCatalog.destroy({
          where: { category_id: id },
          transaction: t,
        });
      }
    }

    // Delete the category (combo)
    await ServiceCategory.destroy({ where: { id }, transaction: t });

    await t.commit();

    return { id };
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

