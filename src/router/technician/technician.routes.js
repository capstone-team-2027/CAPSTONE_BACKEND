const express = require("express");

const router = express.Router();
const taskAssignment = require("./../../controller/technician/taskAssignment.controller");
const notificationController = require("./../../controller/technician/notification.controller");
const quoteManagementController = require("./../../controller/technician/quoteManagement.controller");
const techShiftController = require("./../../controller/technician/shift.controller")

router.post("/quote", quoteManagementController.createQuotation);
router.patch("/quote/:id", quoteManagementController.updateQuotation);
router.get("/quote", quoteManagementController.getQuoteHistory);
router.get("/spare-parts", quoteManagementController.getSpareParts);

router.get("/task-assignments", taskAssignment.getTaskAssignment);
router.get("/service-orders/:id", taskAssignment.getServiceOrderDetail);
router.put("/task-assignments/start", taskAssignment.startTask);
router.put("/task-assignments/complete", taskAssignment.completeTask);

router.get("/notifications", notificationController.getNotifications);
router.get("/notifications/unread-count", notificationController.getUnreadCount);
router.put("/notifications/read-all", notificationController.markAllAsRead);
router.put("/notifications/:id/read", notificationController.markAsRead);

//shift-slot 
router.get("/shifts", techShiftController.getMyShifts);

module.exports = router;