const express = require("express");

const router = express.Router();

const authController = require("../../controller/auth/auth.controller");

router.post("/login", authController.login);
router.post("/register",authController.register);
router.post("/phone", authController.checkPhone);
module.exports = router;