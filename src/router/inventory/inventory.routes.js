const express = require("express");
const checkClient = require("../../middleware/auth.middleware.js");
const ROLES = require("../../constants/roles.js");

const router = express.Router();
const sparePartManagementController = require("../../controller/inventory/sparePartManagement.controller");
const sparePartCategoryManagementController = require("../../controller/inventory/sparePartCategoryManagement.controller");
const supplierManagementController = require("../../controller/inventory/supplierManagement.controller");
const importAndExportManagementController = require("../../controller/inventory/importAndExportManagement.controller");

const requireInventoryManager = [
  checkClient.authenticate,
  checkClient.authorizeRoles(ROLES.INVENTORY_MANAGER),
];

router.get("/approved-quote", requireInventoryManager, importAndExportManagementController.getApprovedQuotesWithParts);
router.post("/export/:quotationId/approve", requireInventoryManager, importAndExportManagementController.approveExportByQuotation);
router.get("/export", requireInventoryManager, importAndExportManagementController.viewExportHistory);

router.get("/part", sparePartManagementController.getSpareParts);
router.patch("/part/:id", requireInventoryManager, sparePartManagementController.updateSparePart);

router.post("/import", requireInventoryManager, importAndExportManagementController.importSparePart);
router.get("/import", requireInventoryManager, importAndExportManagementController.viewImportHistory);

router.get("/part-category", requireInventoryManager, sparePartCategoryManagementController.getPartCategory);
router.post("/part-category", requireInventoryManager, sparePartCategoryManagementController.createPartCategory);
router.patch("/part-category/:id", requireInventoryManager, sparePartCategoryManagementController.updatePartCategory);

router.get("/supplier", requireInventoryManager, supplierManagementController.getSupplier);
router.post("/supplier", requireInventoryManager, supplierManagementController.createSupplier);
router.patch("/supplier/:id", requireInventoryManager, supplierManagementController.updateSupplier);

module.exports = router;
