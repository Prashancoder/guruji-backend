const Service = require("../models/serviceModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
// const ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");

// Create Service -- Admin
exports.createService = catchAsyncErrors(async (req, res, next) => {
  try {
    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      // Use default image if Cloudinary is not configured
      imagesLinks.push({
        public_id: `service_${Date.now()}_${i}`,
        url: images[i] || "https://res.cloudinary.com/demo/image/upload/v1674042682/default_service.png"
      });
    }

    req.body.images = imagesLinks;
    
    // Convert price to number
    if (req.body.price) {
      req.body.price = Number(req.body.price);
    }

    const service = await Service.create(req.body);
    
    res.status(201).json({
      success: true,
      service,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get All Services
exports.getAllServices = catchAsyncErrors(async (req, res, next) => {
  try {
    const services = await Service.find();
    res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get All Services (Admin)
exports.getAdminServices = catchAsyncErrors(async (req, res, next) => {
  try {
    const services = await Service.find();
    res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// Get Service Details
exports.getServiceDetails = catchAsyncErrors(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorHandler("Service not found", 404));
  }

  res.status(200).json({
    success: true,
    service,
  });
});

// Update Service -- Admin
exports.updateService = catchAsyncErrors(async (req, res, next) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorHandler("Service not found", 404));
  }

  // Images Start Here
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < service.images.length; i++) {
      await cloudinary.v2.uploader.destroy(service.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "services",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    service,
  });
});

// Delete Service
exports.deleteService = catchAsyncErrors(async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return next(new ErrorHandler("Service not found", 404));
    }

    await service.remove();

    res.status(200).json({
      success: true,
      message: "Service Deleted Successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}); 