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

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return undefined;
};

const buildCategoryWhere = ({ q, is_active } = {}) => {
  const where = {};

  const normalizedIsActive = normalizeBoolean(is_active);
  if (normalizedIsActive !== undefined) {
    where.is_active = normalizedIsActive;
  }

  if (q) {
    const keyword = q.toString().trim();
    if (keyword) {
      where[Op.or] = [{ category_name: { [Op.iLike]: `%${keyword}%` } }];
    }
  }

  return where;
};

module.exports.listCategories = async ({ page = 1, limit = 50, include_services = false, q, is_active } = {}) => {
  const offset = (page - 1) * limit;
  const include =
    include_services && ServiceCatalog
      ? [{ model: ServiceCatalog, as: "services" }]
      : [];

  const where = buildCategoryWhere({ q, is_active });
  const total = await ServiceCategory.count({ where });
  const items = await ServiceCategory.findAll({
    where,
    attributes: ["id", "category_name", "is_active", "createdAt", "updatedAt"],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    include,
  });

  return { page, limit, total, items };
};

module.exports.createCategories = async ({
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

module.exports.updateCategories = async (id, { category_name, is_active }) => {
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

module.exports.deleteCategories = async (id) => {
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

