const express = require("express");

const router = express.Router();
const sparePartManagementController = require("../../controller/inventory/sparePartManagement.controller");
const sparePartCategoryManagementController = require("../../controller/inventory/sparePartCategoryManagement.controller");
const supplierManagementController = require("../../controller/inventory/supplierManagement.controller");
const importAndExportManagementController = require("../../controller/inventory/importAndExportManagement.controller");

router.get("/part", sparePartManagementController.getSpareParts);
router.patch("/part", sparePartManagementController.updateSparePart);

router.post("/import", importAndExportManagementController.importSparePart);

router.get("/part-category", sparePartCategoryManagementController.getPartCategory);
router.post("/part-category", sparePartCategoryManagementController.createPartCategory);
router.patch("/part-category/:id", sparePartCategoryManagementController.updatePartCategory);

router.get("/supplier", supplierManagementController.getSupplier);
router.post("/supplier", supplierManagementController.createSupplier);
router.patch("/supplier/:id", supplierManagementController.updateSupplier);

module.exports = router;