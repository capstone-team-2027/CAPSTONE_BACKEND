const express = require("express");

const router = express.Router();
const upload = require("../../util/upload.util");
const profileController = require("../../controller/customer/profile.controller");
const appointmentController = require("../../controller/customer/appointment.controller");
const verhicelController = require("../../controller/customer/verhicel.controller")
router.get("/profile", profileController.getProfile);
router.put("/profile", upload.single("avatar"), profileController.updateProfile);
router.put("/change-password", profileController.changePassword);

router.get("/appointment", appointmentController.getAppointment);
router.post("/appointment", appointmentController.createAppointment);
router.delete("/appointment", appointmentController.deleteAppointment);
router.put("/appointment/cancel", appointmentController.cancelAppointment);
router.post("/analyze-car-color", upload.single("image"), appointmentController.analyzeCarColor);

router.get("/vehicel", verhicelController.getVehicelByCustomer)
module.exports = router;