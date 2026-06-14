const express = require("express");
const router = express.Router();
const guestController = require("../../controller/common/guest.controller.js");
const configController = require("../../controller/common/garageConfigurations.controller");
const vehicleMakeController = require("../../controller/customer/vehicleMake.controller.js");
const vehicleModelController = require("../../controller/customer/vehicleModel.controller.js");
// Get all service categories (danh mục dịch vụ)
router.get("/service-categories", guestController.getServiceCategories);

// Get all service catalogs (dịch vụ lẻ)
router.get("/service-catalogs", guestController.getServiceCatalog);

// Get all service combos (gói combo dịch vụ)
router.get("/service-combos", guestController.getServiceCombos);

// Vehicle makes and models (Autocomplete)
router.post("/vehicle_make", vehicleMakeController.getVehicleMake);
router.post("/vehicle_model", vehicleModelController.getVehicleModel);

//garage-configurations
router.get("/garage-configurations", configController.getConfigurations);
router.get("/garage-configurations/shifts", configController.getShifts); // Đặt trước route :key để tránh trùng khớp
router.get("/garage-configurations/:key", configController.getConfigurationByKey);

module.exports = router;
