const express = require("express");

const router = express.Router();

const serviceCatalogController = require("../../controller/admin/serviceCatalog.controller.");
const { authenticate } = require("../../middleware/auth.middleware");

router.get("/service-categories", serviceCatalogController.getServiceCategories);
router.post("/service-catalog", serviceCatalogController.createServiceCatalog);
router.get("/service-catalog", serviceCatalogController.getServiceCatalog);
router.patch("/service-catalog", serviceCatalogController.updateServiceCatalog);


module.exports = router;
