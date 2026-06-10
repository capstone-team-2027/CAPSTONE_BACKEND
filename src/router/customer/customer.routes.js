const express = require("express");

const router = express.Router();
const upload = require("../../util/upload.util");
const profileController = require("../../controller/customer/profile.controller");
const appointmentController = require("../../controller/customer/appointment.controller");
const vehicleMakeController = require("../../controller/customer/vehicleMake.controller");
const vehicleModelController = require("../../controller/customer/vehicleModel.controller");
router.get("/profile", profileController.getProfile);
router.put("/profile", upload.single("avatar"), profileController.updateProfile);
router.put("/change-password", profileController.changePassword);

router.get("/appointment", appointmentController.getAppointment);
router.post("/appointment", appointmentController.createAppointment);
router.delete("/appointment", appointmentController.deleteAppointment);

module.exports = router;