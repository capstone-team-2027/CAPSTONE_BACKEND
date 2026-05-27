const svc = require("../../service/admin/serviceCombos.service");
const { createComboSchema, updateComboSchema, viewCombosQuerySchema } = require("./../../validation/admin/serviceCombos.validation")
module.exports.listServiceCombos = async (req, res) => {
  try {
    const result = viewCombosQuerySchema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const { page, limit, include_services } = result.data;

    const data = await svc.listCombos({ page, limit, include_services });
    return res.json({ success: true, data });
  } catch (err) {
    console.error("SERVICE COMBOS LIST ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports.createServiceCombos = async (req, res) => {
  try {
    const result = createComboSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const { category_name, is_active } = result.data;

    const created = await svc.createCombo({
      category_name,
      is_active,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("SERVICE COMBOS CREATE ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports.updateServiceCombos = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0)
      return res.status(400).json({ success: false, message: "invalid id" });

    const result = updateComboSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({ success: false, errors });
    }

    const { category_name, is_active } = result.data;
    const updated = await svc.updateCombo(id, {
      category_name,
      is_active,
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("SERVICE COMBOS UPDATE ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports.removeServiceCombos = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id)
      return res.status(400).json({ success: false, message: "invalid id" });

    await svc.deleteCombo(id);
    return res.json({ success: true, data: { id } });
  } catch (err) {
    console.error("SERVICE COMBOS DELETE ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}


