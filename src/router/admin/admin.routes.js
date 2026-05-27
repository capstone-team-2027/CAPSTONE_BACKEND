const express = require("express");

const router = express.Router();
const pricingRulesController = require("../../controller/admin/pricingRules.controller");
const controller = require("../../controller/admin/serviceCombos.controller");
const serviceCatalogController = require("../../controller/admin/serviceCatalog.controller.");
const staffController = require("../../controller/admin/manageStaff.controller");

router.get("/role", staffController.getRoles)
router.get("/staff", staffController.getStaffList);
router.post("/staff", staffController.createStaff);
router.put("/staff/:userId", staffController.updateStaff);

router.get("/service-categories", serviceCatalogController.getServiceCategories);
router.post("/service-catalog", serviceCatalogController.createServiceCatalog);
router.get("/service-catalog", serviceCatalogController.getServiceCatalog);
router.patch("/service-catalog/:id", serviceCatalogController.updateServiceCatalog);

router.get("/pricing-rules", pricingRulesController.getAllPricingRules);
router.post("/pricing-rules", pricingRulesController.createPricingRules);
router.get('/pricing-rules/:id', pricingRulesController.getPricingRuleById);
router.put('/pricing-rules/:id', pricingRulesController.updatePricingRule);
router.delete('/pricing-rules/:id', pricingRulesController.deletePricingRule);

router.get("/serviceCombos", controller.listServiceCombos);
router.post("/serviceCombos", controller.createServiceCombos);
router.put("/serviceCombos/:id", controller.updateServiceCombos);
router.delete("/serviceCombos/:id", controller.removeServiceCombos);
module.exports = router;