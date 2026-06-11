const express = require("express");

const router = express.Router();

const authController = require("../../controller/auth/auth.controller");
const { authenticate } = require("../../middleware/auth.middleware");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);

module.exports = router;
