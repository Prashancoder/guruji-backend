const express = require("express");
const {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUser,
  getSingleUser,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");


const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(logout);

router.route("/me").get(getUserDetails);

router.route("/password/update").put(updatePassword);

router.route("/me/update").put(updateProfile);

router
  .route("/admin/users")
  .get(getAllUser);

router
  .route("/admin/user/:id")
  .get(getSingleUser)
  .put(updateUserRole)
  .delete(deleteUser);

module.exports = router;
