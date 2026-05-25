const express = require("express");
const router = express.Router();
const staffController = require("../../controller/admin/staff.controller");

router.get("/staff", staffController.getStaffList);
router.post("/staff", staffController.createStaff);
router.put("/staff/:userId", staffController.updateStaff);

module.exports = router;
