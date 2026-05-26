const express = require("express");
const router = express.Router();

const controller = require("../../controller/admin/serviceCombos.controller");

router.get("/serviceCombos", controller.listServiceCombos);
router.post("/serviceCombos", controller.createServiceCombos);
router.put("/serviceCombos/:id", controller.updateServiceCombos);
router.delete("/serviceCombos/:id", controller.removeServiceCombos);

module.exports = router;
