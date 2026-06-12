const express = require("express");
const router = express.Router();
const serviceCatalogController = require("../../controller/admin/serviceCatalog.controller");
const serviceCombosController = require("../../controller/admin/serviceCombos.controller");
const serviceCategoriesController = require("../../controller/admin/serviceCategories.controller");

// Get all service categories (danh mục dịch vụ)
router.get("/service-categories", serviceCatalogController.getServiceCategories);
router.get("/categories", serviceCategoriesController.listServiceCategories);

// Get all service catalogs (dịch vụ lẻ)
router.get("/service-catalogs", serviceCatalogController.getServiceCatalog);
router.get("/services", serviceCatalogController.getServiceCatalog);

// Get all service combos (gói combo dịch vụ)
router.get("/service-combos", serviceCombosController.getServiceCombos);
router.get("/combos", serviceCombosController.getServiceCombos);

module.exports = router;
