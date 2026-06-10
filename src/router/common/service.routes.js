const express = require("express");
const router = express.Router();
const serviceCatalogController = require("../../controller/admin/serviceCatalog.controller..js");
const serviceCombosController = require("../../controller/admin/serviceCombos.controller");
const serviceCategoriesController = require("../../controller/admin/serviceCategories.controller");

// Get all service categories (danh mục dịch vụ)
router.get("/service-categories", serviceCatalogController.getServiceCategories);
router.get("/categories", serviceCategoriesController.listServiceCategories);

// Get all service catalogs (dịch vụ lẻ)
router.get("/service-catalogs", serviceCatalogController.getServiceCatalog);
router.get("/services", serviceCatalogController.getServiceCatalog);

const vehicleMakeController = require("../../controller/customer/vehicleMake.controller");
const vehicleModelController = require("../../controller/customer/vehicleModel.controller");

// Get all service combos (gói combo dịch vụ)
router.get("/service-combos", serviceCombosController.getServiceCombos);
router.get("/combos", serviceCombosController.getServiceCombos);

// Vehicle makes and models (Autocomplete)
router.post("/vehicle_make", vehicleMakeController.getVehicleMake);
router.post("/vehicle_model", vehicleModelController.getVehicleModel);

module.exports = router;
