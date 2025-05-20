const mongoose = require("mongoose");

const appointmentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  service: {
    type: String,
    required: [true, "Please select a service"],
  },
  date: {
    type: Date,
    required: [true, "Please select a date"],
  },
  time: {
    type: String,
    required: [true, "Please select a time"],
  },
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
  },
  phone: {
    type: String,
    required: [true, "Please enter your phone number"],
  },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled"],
    default: "Pending",
  },
  paymentStatus: {
    type: String,
    enum: ["Non-Paid", "Paid"],
    default: "Non-Paid",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Appointment", appointmentSchema); 