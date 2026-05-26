const svc = require("../../service/admin/serviceCombos.service");

async function list(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const include_services =
      req.query.include_services === "true" ||
      req.query.include_services === "1";
    const data = await svc.listCombos({ page, limit, include_services });
    return res.json({ success: true, data });
  } catch (err) {
    console.error("SERVICECOMBOS LIST ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function create(req, res) {
  try {
    const { category_name, is_active, service_ids, new_services } = req.body;
    if (!category_name)
      return res
        .status(400)
        .json({ success: false, message: "category_name required" });
    const created = await svc.createCombo({
      category_name,
      is_active,
      service_ids,
      new_services,
    });
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("SERVICECOMBOS CREATE ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function update(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id)
      return res.status(400).json({ success: false, message: "invalid id" });
    const {
      category_name,
      is_active,
      service_ids,
      new_services,
      remove_service_ids,
    } = req.body;
    const updated = await svc.updateCombo(id, {
      category_name,
      is_active,
      service_ids,
      new_services,
      remove_service_ids,
    });
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("SERVICECOMBOS UPDATE ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id)
      return res.status(400).json({ success: false, message: "invalid id" });

    await svc.deleteCombo(id);
    // return 200 with id info (or 204 if you prefer no-body)
    return res.json({ success: true, data: { id } });
  } catch (err) {
    console.error("SERVICECOMBOS DELETE ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { list, create, update, remove };
