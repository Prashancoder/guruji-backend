const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const errorMiddleware = require("../middleware/error");
const connectDatabase = require("../config/database");
const dotenv = require("dotenv");
const helmet = require("helmet");   // ✅ Added

dotenv.config();

connectDatabase();

app.use(cors({
  origin: "https://front2-orcin.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// ✅ Razorpay CSP fix
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": [
        "'self'",
        "'unsafe-eval'",
        "'unsafe-inline'",
        "https://checkout.razorpay.com"
      ],
      "frame-src": [
        "'self'",
        "https://api.razorpay.com",
        "https://checkout.razorpay.com"
      ],
      "connect-src": [
        "'self'",
        "https://api.razorpay.com"
      ],
      "img-src": ["'self'", "data:", "https://*"],
      "style-src": ["'self'", "'unsafe-inline'", "https://*"]
    },
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(fileUpload());

// Routes
const product = require("../routes/productRoute");
const user = require("../routes/userRoute");
const order = require("../routes/orderRoute");
const payment = require("../routes/paymentRoute");
const service = require("../routes/serviceRoute");
const contact = require("../routes/contact");
const appointment = require("../routes/appointmentRoutes");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);
app.use("/api/v1", service);
app.use("/api/v1", contact);
app.use("/api/v1", appointment);

// Error middleware
app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`Server is working on http://localhost:${process.env.PORT}`);
});

module.exports = app;
