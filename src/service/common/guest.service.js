const { Op } = require("sequelize");
const db = require("../../../models");

const Service_Categories = db.Service_Categories;
const Service_Catalog = db.Service_Catalog;
const Service_Combo = db.Service_Combo;

const getCatalogSearchCondition = (keyword) => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const dialect = db.sequelize.getDialect();

  if (dialect === "postgres") {
    return {
      [Op.or]: [
        { service_name: { [Op.iLike]: `%${normalizedKeyword}%` } },
        { description: { [Op.iLike]: `%${normalizedKeyword}%` } },
      ],
    };
  }

  return {
    [Op.or]: [
      db.sequelize.where(
        db.sequelize.fn("LOWER", db.sequelize.col("Service_Catalog.service_name")),
        { [Op.like]: `%${normalizedKeyword}%` }
      ),
      db.sequelize.where(
        db.sequelize.fn("LOWER", db.sequelize.col("Service_Catalog.description")),
        { [Op.like]: `%${normalizedKeyword}%` }
      ),
    ],
  };
};

module.exports.getServiceCategories = async () => {
  const categories = await Service_Categories.findAll({
    attributes: ["id", "category_name"],
  });

  return categories;
};

module.exports.getServiceCatalog = async () => {
  const serviceCatalog = await Service_Catalog.findAll({
    where: {
      is_active: true,
    },
    attributes: ["id", "category_id", "service_name", "description", "estimated_duration", "is_active"],
    include: [
      {
        model: Service_Categories,
        as: "category",
        attributes: ["category_name"],
      },
    ],
  });

  return serviceCatalog;
};

module.exports.searchServiceCatalog = async ({ q = "", category_id, page = 1, limit = 8 } = {}) => {
  const where = {
    is_active: true,
  };

  if (category_id) {
    where.category_id = category_id;
  }

  const keyword = typeof q === "string" ? q.trim() : "";
  if (keyword) {
    Object.assign(where, getCatalogSearchCondition(keyword));
  }

  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 8;
  const offset = (safePage - 1) * safeLimit;

  const { count, rows } = await Service_Catalog.findAndCountAll({
    where,
    attributes: ["id", "category_id", "service_name", "description", "estimated_duration", "is_active"],
    include: [
      {
        model: Service_Categories,
        as: "category",
        attributes: ["id", "category_name"],
      },
    ],
    order: [["createdAt", "DESC"], ["id", "DESC"]],
    limit: safeLimit,
    offset,
    distinct: true,
  });

  const total = Number(count) || 0;

  return {
    items: rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / safeLimit),
    },
  };
};

module.exports.getServiceCatalogDetail = async (serviceCatalogId) => {
  const serviceCatalog = await Service_Catalog.findOne({
    where: {
      id: serviceCatalogId,
      is_active: true,
    },
    attributes: ["id", "category_id", "service_name", "description", "estimated_duration", "is_active"],
    include: [
      {
        model: Service_Categories,
        as: "category",
        attributes: ["id", "category_name"],
      },
    ],
  });

  if (!serviceCatalog) {
    throw { status: 404, message: "Dịch vụ không tồn tại" };
  }

  return serviceCatalog;
};

module.exports.getServiceCombos = async () => {
  const combos = await Service_Combo.findAll({
    where: {
      is_active: true,
    },
    attributes: ["id", "combo_name", "description", "is_active", "createdAt", "updatedAt"],
    include: [
      {
        model: Service_Catalog,
        as: "catalogs",
        attributes: [
          "id",
          "category_id",
          "service_name",
          "description",
          "estimated_duration",
          "is_active",
        ],
        through: { attributes: [] },
        include: [
          {
            model: Service_Categories,
            as: "category",
            attributes: ["id", "category_name"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return combos;
};
