const express = require("express");
const router = express.Router(); const appointmentController = require("../../controller/receptionist/appointment.controller");

router.get("/appointments", appointmentController.getAppointment);
router.get("/appointment/:key", appointmentController.getAppointmentByKey);
router.put("/appointment/:key/receive", appointmentController.receiveAppointment);

module.exports = router;
