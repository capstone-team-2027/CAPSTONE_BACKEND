const ImportAndExportManagement = require("../../service/inventory/importAndExportManagement.service");
const {
  importSparePartSchema,
} = require("../../validation/inventory/importAndExportManagement.validation");

module.exports.importSparePart = async (req, res) => {
  try {
    const manager_id = res.locals.user.id;
    const {
      supplier_id,
      quantity,
      unit_price,
      retail_price,
      part_id,
      name,
      brand,
      category_id,
      warranty_period_months,
      warranty_km_limit,
    } = req.body;
    const validation = importSparePartSchema.safeParse({
      manager_id,
      supplier_id,
      quantity,
      unit_price,
      retail_price,
      part_id,
      name,
      brand,
      category_id,
      warranty_period_months,
      warranty_km_limit,
    });
    if (!validation.success) {
       console.log(validation.error.issues);
      return res.status(400).json({
        message: validation.error.issues[0].message,
      });
    }
    const result = await ImportAndExportManagement.importSparePart(
      manager_id,
      supplier_id,
      quantity,
      unit_price,
      retail_price,
      part_id,
      name,
      brand,
      category_id,
      warranty_period_months,
      warranty_km_limit,
    );
    return res.status(201).json({
      message: "Tạo phiếu nhập kho thành công",
      data: result,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error",
      part: error.part,
    });
  }
};

module.exports.viewImportHistory = async (req,res) => {
  try {
    const result = await ImportAndExportManagement.viewImportHistory();
    return res.status(200).json({
      data: result,
    });
  } catch (error) {
       return res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};
