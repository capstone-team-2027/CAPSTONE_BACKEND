const express = require("express");
const router = express.Router();

const controller = require("../../controller/admin/serviceCombos.controller");

router.get("/serviceCombos", controller.list);
router.post("/serviceCombos", controller.create);
router.put("/serviceCombos/:id", controller.update);
router.delete("/serviceCombos/:id", controller.remove);

module.exports = router;
