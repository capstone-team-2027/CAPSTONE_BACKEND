const express = require("express");
const router = express.Router();

const { sepayWebhook, checkPaymentStatus } = require("../../controller/payment/payment.controller");

router.post("/sepay-webhook", sepayWebhook);
router.get("/check-status", checkPaymentStatus);

module.exports = router;
