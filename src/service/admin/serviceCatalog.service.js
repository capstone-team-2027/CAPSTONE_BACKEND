/** @type {import("sequelize").ModelStatic<import("sequelize").Model>} */
const { Op } = require("sequelize");
const db = require("../../../models");
const Service_Categories = db.Service_Categories;
const Service_Catalog = db.Service_Catalog;

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return undefined;
};

const buildCatalogWhere = ({ q, category_id, is_active } = {}) => {
  const where = {};

  if (category_id !== undefined && category_id !== null && category_id !== "") {
    const parsedCategoryId = Number(category_id);
    if (Number.isInteger(parsedCategoryId) && parsedCategoryId > 0) {
      where.category_id = parsedCategoryId;
    }
  }

  const normalizedIsActive = normalizeBoolean(is_active);
  if (normalizedIsActive !== undefined) {
    where.is_active = normalizedIsActive;
  }

  if (q) {
    const keyword = q.toString().trim();
    if (keyword) {
      where[Op.or] = [
        { service_name: { [Op.iLike]: `%${keyword}%` } },
        { description: { [Op.iLike]: `%${keyword}%` } },
      ];
    }
  }

  return where;
};

module.exports.getServiceCategories = async () => {
  const categories = await Service_Categories.findAll({
    attributes: ["id", "category_name"],
  });
  return categories;
};

module.exports.createServiceCatalog = async (category_id, service_name, description, estimated_duration, is_active) => {
  const category = await Service_Categories.findOne({
    where: { id: category_id },
  });

  if (!category) {
    throw { status: 404, message: "Danh mục không tồn tại" };
  }

  const serviceCatalog = await Service_Catalog.create({
    category_id,
    service_name,
    description,
    estimated_duration,
    is_active,
  });

  return serviceCatalog;
};

module.exports.getServiceCatalog = async (filters = {}) => {
  const serviceCatalog = await Service_Catalog.findAll({
    where: buildCatalogWhere(filters),
    attributes: ["id", "category_id", "service_name", "description", "estimated_duration", "is_active"],
    include: [
      {
        model: Service_Categories,
        as: "category",
        attributes: ["category_name"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return serviceCatalog;
};

module.exports.updateServiceCatalog = async (service_catalog_id, category_id, service_name, description, estimated_duration, is_active) => {
  const category = await Service_Categories.findOne({
    where: { id: category_id },
  });

  if (!category) {
    throw { status: 404, message: "Danh mục không tồn tại" };
  }

  const serviceCatalog = await Service_Catalog.findOne({
    where: { id: service_catalog_id },
  });

  if (!serviceCatalog) {
    throw { status: 404, message: "Dịch vụ không tồn tại" };
  }

  await serviceCatalog.update({
    category_id,
    service_name,
    description,
    estimated_duration,
    is_active,
  });

  return serviceCatalog;
};

