const express = require("express");
const router = express.Router();
const appointmentController = require("../../controller/receptionist/appointment.controller");
const serviceOrderController = require("../../controller/receptionist/serviceOrder.controller");
const notificationController = require("../../controller/receptionist/notification.controller");
const searchController = require("../../controller/receptionist/search.controller");
const technicianController = require("../../controller/receptionist/technician.controller");
// dùng tạm của admin 
const manageCustomerController = require("../../controller/admin/manageCustomer.controller");

router.get("/appointments", appointmentController.getAppointment);
router.get("/appointment/:key", appointmentController.getAppointmentByKey);
router.put("/appointment/:key/receive", appointmentController.receiveAppointment);
router.post("/appointment/:key/vin", appointmentController.updateVehicleVin);
router.get("/appointment/:key/vehicle-info", appointmentController.checkVehicleInfo);

router.post("/customer-info-by-phone", searchController.getCustomerInfoByPhone);
//router customer đang test ( test ở role lễ tân)
router.get("/customers", appointmentController.getCustomer);

router.post("/service-order", serviceOrderController.createServiceOrder)
router.get("/service-orders", serviceOrderController.getServiceOrders)
router.get("/service-order/:id", serviceOrderController.getServiceOrderById)
router.put("/service-order/:id/odo", serviceOrderController.updateServiceOrderOdo)

router.get("/notifications", notificationController.getNotification)
router.get("/notifications/unread-count", notificationController.getUnreadCount)
router.get("/notification/:id", notificationController.getNotificationById)
router.put("/notification/:id/read", notificationController.markAsRead)

// lấy ra toàn bộ technician làm hôm nay 
router.get("/technicians/working-today", technicianController.getTechniciansWorkingToday);

// Phân công technician cho 1 yêu cầu cứu hộ
router.post("/rescue/assign", technicianController.assignRescueTechnician);


module.exports = router;
