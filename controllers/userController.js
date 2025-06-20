  const ErrorHander = require("../utils/errorhander");
  const catchAsyncErrors = require("../middleware/catchAsyncErrors");
  const User = require("../models/userModel");
  const sendToken = require("../utils/jwtToken");
  const sendEmail = require("../utils/sendEmail");
  const crypto = require("crypto");
  // const cloudinary = require("cloudinary");
  const validator = require("validator");
  const cloudinary = require("../config/cloudinary"); // 👈 use this path correctly





  // Register a User
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return next(new ErrorHander("Please provide all required fields", 400));
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return next(new ErrorHander("Please enter a valid email address", 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorHander("User already exists with this email", 400));
    }

    // Set default avatar
    let avatarResult = {
      public_id: "default_avatar",
      url: "https://res.cloudinary.com/demo/image/upload/v1674042682/samples/people/boy-snow-hoodie.jpg"
    };
    // Only process avatar if it's provided and not empty
    if (req.body.avatar && req.body.avatar !== "") {
      try {
        const result = await cloudinary.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 150,
          crop: "scale",
        });

        avatarResult = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      } catch (uploadError) {
        console.error('Avatar upload error:', uploadError);
        // Continue with default avatar if upload fails
      }
    }

    // Create user with validated data
    const user = await User.create({
      name,
      email,
      password,
      avatar: avatarResult,
    });

    // Send token response
    sendToken(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      return next(new ErrorHander(error.message, 400));
    }
    return next(new ErrorHander(error.message || "Error registering user", 500));
  }
});
   
  

  // Login User
  exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // checking if user has given password and email both

    if (!email || !password) {
      return next(new ErrorHander("Please Enter Email & Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHander("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHander("Invalid email or password", 401));
    }

    sendToken(user, 200, res);
  });

  // Logout User
  exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  });

  // Forgot Password
  exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorHander("User not found", 404));
    }

    // Get ResetPassword Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `http://localhost:3000/password/reset/${resetToken}`;
    

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

    try {
      await sendEmail({
        email: user.email,
        subject: `Ecommerce Password Recovery`,
        message,
      });

      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return next(new ErrorHander(error.message, 500));
    }
  });

  // Reset Password
  exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    // creating token hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new ErrorHander(
          "Reset Password Token is invalid or has been expired",
          400
        )
      );
    }

    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHander("Password does not password", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
  });

  // Get User Detail
  exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  });

  // update User password
  exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
      return next(new ErrorHander("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      return next(new ErrorHander("password does not match", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
  });

  // update User Profile
  exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    try {
      const newUserData = {
        name: req.body.name,
        email: req.body.email,
      };

      if (req.body.avatar && req.body.avatar !== "") {
        const user = await User.findById(req.user.id);

        // Delete old avatar from cloudinary if it exists and is not the default
        if (user.avatar.public_id !== "default_avatar") {
          await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        }

        // Upload new avatar
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 150,
          crop: "scale",
        });

        newUserData.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error('Profile update error:', error);
      return next(new ErrorHander(error.message || "Error updating profile", 500));
    }
  });

  // Get all users(admin)
  exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
      success: true,
      users,
    });
  });

  // Get single user (admin)
  exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorHander(`User does not exist with Id: ${req.params.id}`)
      );
    }

    res.status(200).json({
      success: true,
      user,
    });
  });

  // update User Role -- Admin
  exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };

    await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
    });
  });

  // Delete User --Admin
  exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
      );
    }

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    await user.remove();

    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  });
