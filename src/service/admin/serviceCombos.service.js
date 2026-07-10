const { Op } = require("sequelize");
const db = require("../../../models");
const Service_Combo = db.Service_Combo;
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

const buildComboInclude = () => [
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
        model: db.Service_Categories,
        as: "category",
        attributes: ["id", "category_name"],
      },
    ],
  },
];

const buildComboWhere = ({ q, is_active } = {}) => {
  const where = {};

  const normalizedIsActive = normalizeBoolean(is_active);
  if (normalizedIsActive !== undefined) {
    where.is_active = normalizedIsActive;
  }

  if (q) {
    const keyword = q.toString().trim();
    if (keyword) {
      where[Op.or] = [
        { combo_name: { [Op.iLike]: `%${keyword}%` } },
        { description: { [Op.iLike]: `%${keyword}%` } },
      ];
    }
  }

  return where;
};

module.exports.createServiceCombo = async (
  combo_name,
  description,
  serviceCatalogIds,
  is_active = true
) => {
  const normalizedCatalogIds = [...new Set((serviceCatalogIds || []).map(Number))].filter(
    (id) => Number.isInteger(id) && id > 0
  );

  if (!normalizedCatalogIds.length) {
    throw { status: 400, message: "Danh sách dịch vụ không hợp lệ" };
  }

  const activeServices = await Service_Catalog.findAll({
    where: {
      id: normalizedCatalogIds,
      is_active: true,
    },
  });

  if (activeServices.length !== normalizedCatalogIds.length) {
    throw {
      status: 400,
      message: "Một hoặc nhiều dịch vụ được chọn không tồn tại hoặc không hoạt động",
    };
  }

  const existingCombo = await Service_Combo.findOne({
    where: { combo_name },
  });
  if (existingCombo) {
    throw { status: 400, message: "Tên combo dịch vụ đã tồn tại" };
  }

  const serviceCombo = await Service_Combo.create({
    combo_name,
    description,
    is_active,
  });

  await serviceCombo.setCatalogs(normalizedCatalogIds);

  const createdCombo = await Service_Combo.findOne({
    where: { id: serviceCombo.id },
    attributes: ["id", "combo_name", "description", "is_active", "createdAt", "updatedAt"],
    include: buildComboInclude(),
  });

  return createdCombo;
};

module.exports.listServiceCombos = async (options = {}) => {
  const { page, limit, q, all, is_active } = options;

  const where = buildComboWhere({ q, is_active });

  const queryOptions = {
    where,
    attributes: ["id", "combo_name", "description", "is_active", "createdAt", "updatedAt"],
    include: buildComboInclude(),
    order: [["createdAt", "DESC"]],
    distinct: true,
  };

  if (all || !page) {
    const combos = await Service_Combo.findAll(queryOptions);
    return combos;
  }

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 20;
  const offsetNum = (pageNum - 1) * limitNum;

  queryOptions.limit = limitNum;
  queryOptions.offset = offsetNum;

  const { count, rows } = await Service_Combo.findAndCountAll(queryOptions);

  const activeCount = await Service_Combo.count({
    where: {
      ...where,
      is_active: true
    }
  });

  return {
    page: pageNum,
    limit: limitNum,
    total: count,
    totalActive: activeCount,
    items: rows,
  };
};

module.exports.updateServiceCombo = async (
  serviceComboId,
  combo_name,
  description,
  serviceCatalogIds,
  is_active
) => {
  const serviceCombo = await Service_Combo.findOne({
    where: { id: serviceComboId },
  });

  if (!serviceCombo) {
    throw { status: 404, message: "Service combo không tồn tại" };
  }

  const existingComboWithName = await Service_Combo.findOne({
    where: {
      combo_name,
      id: { [db.Sequelize.Op.ne]: serviceComboId },
    },
  });

  if (existingComboWithName) {
    throw { status: 400, message: "Tên combo dịch vụ đã tồn tại" };
  }

  const normalizedCatalogIds = [...new Set((serviceCatalogIds || []).map(Number))].filter(
    (id) => Number.isInteger(id) && id > 0
  );

  if (!normalizedCatalogIds.length) {
    throw { status: 400, message: "Phải chọn ít nhất một dịch vụ" };
  }

  const activeServices = await Service_Catalog.findAll({
    where: {
      id: normalizedCatalogIds,
      is_active: true,
    },
  });

  if (activeServices.length !== normalizedCatalogIds.length) {
    throw {
      status: 400,
      message: "Một hoặc nhiều dịch vụ được chọn không tồn tại hoặc không hoạt động",
    };
  }

  await serviceCombo.update({
    combo_name,
    description,
    is_active,
  });

  await serviceCombo.setCatalogs(normalizedCatalogIds);

  const updatedCombo = await Service_Combo.findOne({
    where: { id: serviceCombo.id },
    attributes: ["id", "combo_name", "description", "is_active", "createdAt", "updatedAt"],
    include: buildComboInclude(),
  });

  return updatedCombo;
};
