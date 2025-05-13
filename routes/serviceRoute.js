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
  .get(getAdminServices);

router
  .route("/admin/service/new")
  .post(createService);

router
  .route("/admin/service/:id")
  .put(updateService)
  .delete(deleteService);

router.route("/service/:id").get(getServiceDetails);

module.exports = router; 