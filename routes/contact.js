const express = require("express");
const router = express.Router();
const { createContact, getAllContacts, deleteContact } = require("../controllers/contactController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/contact").post(createContact);
router.route("/admin/contacts").get(isAuthenticatedUser, authorizeRoles("admin"), getAllContacts);
router.route("/admin/contact/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteContact);

module.exports = router; 