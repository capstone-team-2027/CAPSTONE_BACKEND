const express = require("express");

const router = express.Router();
const pricingRulesController = require("../../controller/admin/pricingRules.controller");
router.get("/pricing-rules", pricingRulesController.getAllPricingRules);
router.post("/pricing-rules", pricingRulesController.createPricingrules);
router.get('/pricing-rules/:id', pricingRulesController.getPricingRuleById);
router.put('/pricing-rules/:id', pricingRulesController.updatePricingRule);
router.delete('/pricing-rules/:id', pricingRulesController.deletePricingRule);
module.exports = router;