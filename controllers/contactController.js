const Contact = require("../models/contactModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Create new contact message
exports.createContact = catchAsyncErrors(async (req, res, next) => {
  const contact = await Contact.create(req.body);

  res.status(201).json({
    success: true,
    contact,
  });
});

// ✅ Fix this export
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all contact messages (Admin)
exports.getAllContacts = catchAsyncErrors(async (req, res, next) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    contacts,
  });
});
