const express = require("express");
const router = express.Router();

const lowStockController = require("../../controller/admin/lowStock.controller");

router.get("/low-stock", lowStockController.getLowStock);
router.put("/low-stock/:partId", lowStockController.updateLowStock);

module.exports = router;
