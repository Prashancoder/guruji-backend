const express = require("express");
const {
  createService,
  getAllServices,
  getServiceDetails,
  updateService,
  deleteService,
  getAdminServices,
} = require("../controllers/serviceController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/services").get(getAllServices);

router
  .route("/admin/services")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminServices);

router
  .route("/admin/service/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createService);

router
  .route("/admin/service/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateService)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteService);

router.route("/service/:id").get(getServiceDetails);

module.exports = router; 