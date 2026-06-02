const express = require("express");
const router = express.Router();
const pricingRulesController = require("../../controller/admin/pricingRules.controller");
const controllerCatagories = require("../../controller/admin/serviceCategories.controller");
const serviceCatalogController = require("../../controller/admin/serviceCatalog.controller.");
const staffController = require("../../controller/admin/manageStaff.controller");
const controllerServiceBays = require("../../controller/admin/serviceBays.controller");
const warrantyController = require("../../controller/admin/warrantyPolicies.controller");

router.get("/role", staffController.getRoles);
router.get("/staff", staffController.getStaffList);
router.post("/staff", staffController.createStaff);
router.put("/staff/:userId", staffController.updateStaff);

router.get(
  "/service-categories",
  serviceCatalogController.getServiceCategories
);
router.post("/service-catalog", serviceCatalogController.createServiceCatalog);
router.get("/service-catalog", serviceCatalogController.getServiceCatalog);
router.patch(
  "/service-catalog/:id",
  serviceCatalogController.updateServiceCatalog
);

router.get("/pricing-rules", pricingRulesController.getAllPricingRules);
router.post("/pricing-rules", pricingRulesController.createPricingRules);
router.get("/pricing-rules/:id", pricingRulesController.getPricingRuleById);
router.put("/pricing-rules/:id", pricingRulesController.updatePricingRule);
router.delete("/pricing-rules/:id", pricingRulesController.deletePricingRule);

router.get("/service-category", controllerCatagories.listServiceCategories);
router.post("/service-category", controllerCatagories.createServiceCategories);
router.put("/service-category/:id", controllerCatagories.updateServiceCategories);
router.delete("/service-category/:id", controllerCatagories.removeServiceCategories);

router.get("/service-bay", controllerServiceBays.listServiceBays);
router.post("/service-bay", controllerServiceBays.createServiceBay);
router.put("/service-bay/:id", controllerServiceBays.updateServiceBay);
router.delete("/service-bay/:id", controllerServiceBays.removeServiceBay);

const warrantyUpload = require("../../util/warrantyUpload.util");

router.get("/warranty-policies", warrantyController.getWarrantyPolicies);
router.post(
  "/warranty-policy",
  warrantyUpload.fields([
    { name: "image_cover", maxCount: 1 },
    { name: "pdf_document", maxCount: 1 }
  ]),
  warrantyController.createWarrantyPolicy
);
router.put(
  "/warranty-policy/:id",
  warrantyUpload.fields([
    { name: "image_cover", maxCount: 1 },
    { name: "pdf_document", maxCount: 1 }
  ]),
  warrantyController.updateWarrantyPolicy
);

module.exports = router;
