const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const Order = require("../models/orderModel");
const ErrorHandler = require("../utils/errorHandler");

// Create Razorpay Order
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  const { amount, currency = "INR" } = req.body;

  const options = {
    amount: amount * 100, // Razorpay expects amount in paise
    currency,
    receipt: "receipt_" + Date.now(),
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Verify Payment
exports.verifyPayment = catchAsyncErrors(async (req, res, next) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderInfo,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Create order in database
    const order = await Order.create({
      ...orderInfo,
      paymentInfo: {
        id: razorpay_payment_id,
        status: "completed",
      },
      paidAt: Date.now(),
    });

    res.status(200).json({
      success: true,
      order,
    });
  } else {
    return next(new ErrorHandler("Payment verification failed", 400));
  }
});

// Get Razorpay Key
exports.getRazorpayKey = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID,
  });
});
