const express = require("express");
const router = express.Router();
const serviceCatalogController = require("../../controller/admin/serviceCatalog.controller.");

router.get("/service-catalog", serviceCatalogController.getServiceCatalog);
router.get("/service-categories", serviceCatalogController.getServiceCategories);

module.exports = router;
