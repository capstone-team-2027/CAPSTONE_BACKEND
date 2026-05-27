const express = require("express");

const router = express.Router();
const pricingRulesController = require("../../controller/admin/pricingRules.controller");
const controller = require("../../controller/admin/serviceCombos.controller");
const controllerServiceBays = require("../../controller/admin/serviceBays.controller")
router.get("/pricing-rules", pricingRulesController.getAllPricingRules);
router.post("/pricing-rules", pricingRulesController.createPricingrules);
router.get('/pricing-rules/:id', pricingRulesController.getPricingRuleById);
router.put('/pricing-rules/:id', pricingRulesController.updatePricingRule);
router.delete('/pricing-rules/:id', pricingRulesController.deletePricingRule);

router.get("/serviceCombos", controller.listServiceCombos);
router.post("/serviceCombos", controller.createServiceCombos);
router.put("/serviceCombos/:id", controller.updateServiceCombos);
router.delete("/serviceCombos/:id", controller.removeServiceCombos);

//service bay 
router.get("/serviceBays", controllerServiceBays.listServiceBays);
router.post("/serviceBay", controllerServiceBays.createServiceBay);
router.put("/serviceBay/:id", controllerServiceBays.updateServiceBay);
router.delete("/serviceBay/:id", controllerServiceBays.removeServiceBay);
module.exports = router;