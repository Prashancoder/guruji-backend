const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Service Name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please Enter Service Description"],
  },
  price: {
    type: Number,
    required: [true, "Please Enter Service Price"],
    maxLength: [8, "Price cannot exceed 8 characters"],
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Service", serviceSchema); 