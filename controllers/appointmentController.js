const Appointment = require("../models/appointmentModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Create new appointment
exports.createAppointment = catchAsyncErrors(async (req, res, next) => {
  // Check if the time slot is available
  const existingAppointment = await Appointment.findOne({
    date: req.body.date,
    time: req.body.time,
    status: { $ne: "Cancelled" }
  });

  if (existingAppointment) {
    return next(new ErrorHandler("This time slot is already booked", 400));
  }

  req.body.user = req.user.id;
  const appointment = await Appointment.create(req.body);

  res.status(201).json({
    success: true,
    appointment,
  });
});

// Get all appointments (Admin)
exports.getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await Appointment.find().populate("user", "name email");

  res.status(200).json({
    success: true,
    appointments,
  });
});

// Get single appointment
exports.getSingleAppointment = catchAsyncErrors(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!appointment) {
    return next(new ErrorHandler("Appointment not found", 404));
  }

  res.status(200).json({
    success: true,
    appointment,
  });
});

// Get logged in user appointments
exports.myAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await Appointment.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    appointments,
  });
});

// Update appointment status (Admin)
exports.updateAppointmentStatus = catchAsyncErrors(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new ErrorHandler("Appointment not found", 404));
  }

  appointment.status = req.body.status;
  await appointment.save();

  res.status(200).json({
    success: true,
    appointment,
  });
});

// Update payment status
exports.updatePaymentStatus = catchAsyncErrors(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new ErrorHandler("Appointment not found", 404));
  }

  appointment.paymentStatus = "Paid";
  await appointment.save();

  res.status(200).json({
    success: true,
    appointment,
  });
});

// Get available time slots for a date
exports.getAvailableTimeSlots = catchAsyncErrors(async (req, res, next) => {
  const { date } = req.query;
  
  if (!date) {
    return next(new ErrorHandler("Date is required", 400));
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return next(new ErrorHandler("Invalid date format. Use YYYY-MM-DD", 400));
  }

  // Convert date string to Date object
  const selectedDate = new Date(date);
  
  // Check if date is valid
  if (isNaN(selectedDate.getTime())) {
    return next(new ErrorHandler("Invalid date", 400));
  }

  const bookedSlots = await Appointment.find({
    date: selectedDate,
    status: { $ne: "Cancelled" }
  }).select("time");

  const allTimeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  const bookedTimes = bookedSlots.map(slot => slot.time);
  const availableSlots = allTimeSlots.filter(slot => !bookedTimes.includes(slot));

  res.status(200).json({
    success: true,
    availableSlots,
  });
});

// Delete Appointment -- Admin
exports.deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new ErrorHandler("Appointment not found with this Id", 404));
  }

  await appointment.deleteOne();

  res.status(200).json({
    success: true,
    message: "Appointment Deleted Successfully",
  });
}); 