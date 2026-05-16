const express = require("express");

const router = express.Router();
const { authenticate } = require("../middleware/auth.middleware");

const authController = require("../controller/auth/auth.controller");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/change-password", authenticate, authController.changePassword);

module.exports = router;
