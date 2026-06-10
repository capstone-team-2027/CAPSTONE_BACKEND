const express = require("express");
const router = express.Router();
const configController = require("../../controller/common/garageConfigurations.controller");

router.get("/", configController.getConfigurations);
router.get("/shifts", configController.getShifts); // Đặt trước route :key để tránh trùng khớp
router.get("/:key", configController.getConfigurationByKey);

module.exports = router;
