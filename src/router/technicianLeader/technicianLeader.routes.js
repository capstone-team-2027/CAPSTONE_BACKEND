const express = require("express");
const taskAssignmentController = require("../../controller/technicianLeader/taskAssignmentManagement.controller")
const router = express.Router();

router.get("/tasks", taskAssignmentController.getAllTasks);
router.get("/technicians", taskAssignmentController.getAllTechnician);
router.post("/assign", taskAssignmentController.assignTask);

module.exports = router;