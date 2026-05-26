const express = require("express");

const router = express.Router();
const pricingRulesController = require("../../controller/admin/pricingRules.controller");
const controller = require("../../controller/admin/serviceCombos.controller");

router.get("/pricing-rules", pricingRulesController.getAllPricingRules);
router.post("/pricing-rules", pricingRulesController.createPricingrules);
router.get('/pricing-rules/:id', pricingRulesController.getPricingRuleById);
router.put('/pricing-rules/:id', pricingRulesController.updatePricingRule);
router.delete('/pricing-rules/:id', pricingRulesController.deletePricingRule);

router.get("/serviceCombos", controller.listServiceCombos);
router.post("/serviceCombos", controller.createServiceCombos);
router.put("/serviceCombos/:id", controller.updateServiceCombos);
router.delete("/serviceCombos/:id", controller.removeServiceCombos);
module.exports = router;