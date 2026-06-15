const express = require("express");
const router = express.Router();
const appointmentController = require("../../controller/receptionist/appointment.controller");
const serviceOrderController = require("../../controller/receptionist/serviceOrder.controller");
const notificationController = require("../../controller/receptionist/notification.controller");
const searchController = require("../../controller/receptionist/search.controller");
router.get("/appointments", appointmentController.getAppointment);
router.get("/appointment/:key", appointmentController.getAppointmentByKey);
router.put("/appointment/:key/receive", appointmentController.receiveAppointment);
// thêm số khung xe
router.post("/appointment/:key/vin", appointmentController.updateVehicleVin);
// check số khung và số odd có chưa 
router.get("/appointment/:key/vehicle-info", appointmentController.checkVehicleInfo);
// Lấy thông tin khách hàng từ số điện thoại
router.post("/customer-info-by-phone", searchController.getCustomerInfoByPhone);

// service-order
router.post("/service-order", serviceOrderController.createServiceOrder)
router.get("/service-orders", serviceOrderController.getServiceOrders)
router.get("/service-order/:id", serviceOrderController.getServiceOrderById)
router.put("/service-order/:id/odo", serviceOrderController.updateServiceOrderOdo)

// notification
router.get("/notifications", notificationController.getNotification)
// đếm số thông báo chưa đọc 
router.get("/notifications/unread-count", notificationController.getUnreadCount)
router.get("/notification/:id", notificationController.getNotificationById)
router.put("/notification/:id/read", notificationController.markAsRead)



module.exports = router;
