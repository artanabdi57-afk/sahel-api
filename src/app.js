require("dotenv").config();

const express = require("express");
const compression = require('compression');
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const salesRoutes = require("./routes/salesRoutes");
const reportRoutes = require("./routes/reportRoutes");
const creditRoutes = require("./routes/creditRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const authenticate = require("./middleware/authMiddleware");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

const isLocalOrigin = (origin) => {
  if (!origin) return true;

  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch (error) {
    return false;
  }
};

app.use(
  cors({
    origin(origin, callback) {
      if (allowedOrigins.includes(origin) || isLocalOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.options("*", cors());
app.use(compression());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/products", authenticate, productRoutes);
app.use("/api/products", authenticate, productRoutes);
app.use("/sales", authenticate, salesRoutes);
app.use("/api/sales", authenticate, salesRoutes);
app.use("/credits", authenticate, creditRoutes);
app.use("/api/credits", authenticate, creditRoutes);
app.use("/expenses", authenticate, expenseRoutes);
app.use("/api/expenses", authenticate, expenseRoutes);
app.use("/orders", authenticate, orderRoutes);
app.use("/api/orders", authenticate, orderRoutes);
app.use("/reports", authenticate, reportRoutes);
app.use("/api/reports", authenticate, reportRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
