const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAllAppointments,
  getSingleAppointment,
  myAppointments,
  updateAppointmentStatus,
  updatePaymentStatus,
  getAvailableTimeSlots,
} = require("../controllers/appointmentController");

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/appointment/new").post(isAuthenticatedUser, createAppointment);
router.route("/appointment/:id").get(isAuthenticatedUser, getSingleAppointment);
router.route("/appointments/me").get(isAuthenticatedUser, myAppointments);
router.route("/appointment/slots").get(getAvailableTimeSlots);

// Admin routes
router
  .route("/admin/appointments")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllAppointments);

router
  .route("/admin/appointment/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateAppointmentStatus);

router
  .route("/admin/appointment/payment/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updatePaymentStatus);

module.exports = router; 