const express = require("express");
const router = express.Router();
const serviceCatalogController = require("../../controller/admin/serviceCatalog.controller..js");
const serviceCombosController = require("../../controller/admin/serviceCombos.controller.js");
const serviceCategoriesController = require("../../controller/admin/serviceCategories.controller.js");
const configController = require("../../controller/common/garageConfigurations.controller");
const vehicleMakeController = require("../../controller/customer/vehicleMake.controller.js");
const vehicleModelController = require("../../controller/customer/vehicleModel.controller.js");
// Get all service categories (danh mục dịch vụ)
router.get("/service-categories", serviceCatalogController.getServiceCategories);
router.get("/categories", serviceCategoriesController.listServiceCategories);

// Get all service catalogs (dịch vụ lẻ)
router.get("/service-catalogs", serviceCatalogController.getServiceCatalog);
router.get("/services", serviceCatalogController.getServiceCatalog);

// Get all service combos (gói combo dịch vụ)
router.get("/service-combos", serviceCombosController.getServiceCombos);
router.get("/combos", serviceCombosController.getServiceCombos);

// Vehicle makes and models (Autocomplete)
router.post("/vehicle_make", vehicleMakeController.getVehicleMake);
router.post("/vehicle_model", vehicleModelController.getVehicleModel);

//garage-configurations
router.get("/garage-configurations", configController.getConfigurations);
router.get("/garage-configurations/shifts", configController.getShifts); // Đặt trước route :key để tránh trùng khớp
router.get("/garage-configurations/:key", configController.getConfigurationByKey);

module.exports = router;
