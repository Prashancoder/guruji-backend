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

dotenv.config();

connectDatabase();

// ✅ Enable CORS for frontend
app.use(cors({
  origin: true,           // <- This will reflect the request origin dynamically
  credentials: true,      // <- Important if you are sending cookies or auth headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// ✅ Increase payload limit to avoid "request entity too large" error
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(fileUpload());


// Route Imports
const product = require("../routes/productRoute");
const user = require("../routes/userRoute");
const order = require("../routes/orderRoute");
const payment = require("../routes/paymentRoute");
const service = require("../routes/serviceRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);
app.use("/api/v1", service);

// Middleware for Errors
app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`Server is working on http://localhost:${process.env.PORT}`);
});

module.exports = app;
