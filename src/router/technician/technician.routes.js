const express = require("express");

const router = express.Router();
const taskAssignment = require("./../../controller/technician/taskAssignment.controller");
const notificationController = require("./../../controller/technician/notification.controller");

router.get("/task-assignments", taskAssignment.getTaskAssignment);
router.get("/service-orders/:id", taskAssignment.getServiceOrderDetail);
router.put("/task-assignments/start", taskAssignment.startTask);
router.put("/task-assignments/complete", taskAssignment.completeTask);

// Notification
router.get("/notifications", notificationController.getNotifications);
router.get("/notifications/unread-count", notificationController.getUnreadCount);
router.put("/notifications/read-all", notificationController.markAllAsRead);
router.put("/notifications/:id/read", notificationController.markAsRead);

module.exports = router;