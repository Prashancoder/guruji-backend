const express = require("express");
const {
  createOrder,
  verifyPayment,
  getRazorpayKey,
} = require("../controllers/paymentController");
const router = express.Router();
const { isAuthenticatedUser } = require("../middleware/auth");

router.route("/payment/create-order").post(isAuthenticatedUser, createOrder);
router.route("/payment/verify").post(isAuthenticatedUser, verifyPayment);
router.route("/payment/key").get(isAuthenticatedUser, getRazorpayKey);

module.exports = router;
