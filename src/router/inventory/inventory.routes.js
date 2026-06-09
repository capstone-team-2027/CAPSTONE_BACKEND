const express = require("express");

const router = express.Router();
const partController = require("../../controller/inventory/sparePart.controller");
const partCategoryController = require("../../controller/inventory/sparePartCategory.controller");

router.get("/part", partController.getSpareParts);
router.post("/part", partController.createSpareParts);
router.patch("/part", partController.updateSparePart);

router.get("/part-category", partCategoryController.getPartCategory);
router.post("/part-category", partCategoryController.createPartCategory);
router.patch("/part-category/:id", partCategoryController.updatePartCategory);

module.exports = router;