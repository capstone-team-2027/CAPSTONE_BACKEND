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

async function listCombos({ page = 1, limit = 50, include_services = false }) {
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

async function createCombo({
  category_name,
  is_active = true,
  service_ids = [],
  new_services = [],
}) {
  const t = await db.sequelize.transaction();
  try {
    const category = await ServiceCategory.create(
      { category_name, is_active },
      { transaction: t }
    );

    // Attach existing services by id
    if (Array.isArray(service_ids) && service_ids.length && ServiceCatalog) {
      await ServiceCatalog.update(
        { category_id: category.id },
        { where: { id: { [Op.in]: service_ids } }, transaction: t }
      );
    }

    // Create new service records under this category
    if (Array.isArray(new_services) && new_services.length) {
      const createPayload = new_services.map((s) => ({
        category_id: category.id,
        service_name: s.service_name,
        estimated_duration: s.estimated_duration ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      if (ServiceCatalog)
        await ServiceCatalog.bulkCreate(createPayload, { transaction: t });
    }

    await t.commit();

    const result = await ServiceCategory.findByPk(category.id, {
      include: ServiceCatalog
        ? [{ model: ServiceCatalog, as: "services" }]
        : [],
    });
    return result;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

async function updateCombo(
  id,
  {
    category_name,
    is_active,
    service_ids,
    new_services,
    remove_service_ids = [],
  }
) {
  const t = await db.sequelize.transaction();
  try {
    const category = await ServiceCategory.findByPk(id, { transaction: t });
    if (!category) throw new Error("Category not found");

    // update basic fields
    await category.update(
      {
        ...(category_name !== undefined ? { category_name } : {}),
        ...(is_active !== undefined ? { is_active } : {}),
      },
      { transaction: t }
    );

    // If service_ids provided: set those services to this category
    if (Array.isArray(service_ids)) {
      if (service_ids.length && ServiceCatalog) {
        await ServiceCatalog.update(
          { category_id: id },
          { where: { id: { [Op.in]: service_ids } }, transaction: t }
        );
      }

      if (ServiceCatalog) {
        // find services currently in this category but NOT in provided list
        const toHandle = await ServiceCatalog.findAll({
          where: {
            category_id: id,
            id: { [Op.notIn]: service_ids.length ? service_ids : [0] },
          },
          attributes: ["id"],
          transaction: t,
        });
        const toIds = toHandle.map((r) => r.id);
        if (toIds.length) {
          if (categoryIdAllowsNull) {
            await ServiceCatalog.update(
              { category_id: null },
              { where: { id: { [Op.in]: toIds } }, transaction: t }
            );
          } else {
            // if category_id cannot be null, remove those services (alternatively reassign)
            await ServiceCatalog.destroy({
              where: { id: { [Op.in]: toIds } },
              transaction: t,
            });
          }
        }
      }
    }

    // Explicitly remove some services (delete)
    if (
      Array.isArray(remove_service_ids) &&
      remove_service_ids.length &&
      ServiceCatalog
    ) {
      await ServiceCatalog.destroy({
        where: { id: { [Op.in]: remove_service_ids }, category_id: id },
        transaction: t,
      });
    }

    // Create new services under this category
    if (Array.isArray(new_services) && new_services.length && ServiceCatalog) {
      const createPayload = new_services.map((s) => ({
        category_id: id,
        service_name: s.service_name,
        estimated_duration: s.estimated_duration ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await ServiceCatalog.bulkCreate(createPayload, { transaction: t });
    }

    await t.commit();

    const result = await ServiceCategory.findByPk(id, {
      include: ServiceCatalog
        ? [{ model: ServiceCatalog, as: "services" }]
        : [],
    });
    return result;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

async function deleteCombo(id) {
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

module.exports = { listCombos, createCombo, updateCombo, deleteCombo };
