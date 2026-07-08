const svc = require("../../service/admin/serviceCategory.service");
const { createCategorySchema, updateCategorySchema, viewCategorySchema } = require("../../validation/admin/serviceCategory.validation")

module.exports.listServiceCategories = async (req, res) => {
  try {
    const result = viewCategorySchema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const { page, limit, include_services, q, is_active } = result.data;

    const data = await svc.listCategories({ page, limit, include_services, q, is_active });
    return res.json({ success: true, data });
  } catch (err) {
    console.error("SERVICE COMBOS LIST ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports.createServiceCategories = async (req, res) => {
  try {
    const result = createCategorySchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const { category_name, is_active } = result.data;

    const created = await svc.createCategories({
      category_name,
      is_active,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("SERVICE COMBOS CREATE ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports.updateServiceCategories = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
      return res.status(400).json({ success: false, message: "invalid id" });

    const result = updateCategorySchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const { category_name, is_active } = result.data;
    const updated = await svc.updateCategories(id, {
      category_name,
      is_active,
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("SERVICE COMBOS UPDATE ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports.removeServiceCategories = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id)
      return res.status(400).json({ success: false, message: "invalid id" });

    await svc.deleteCategories(id);
    return res.json({ success: true, data: { id } });
  } catch (err) {
    console.error("SERVICE COMBOS DELETE ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}


