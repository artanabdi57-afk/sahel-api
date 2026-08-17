require("dotenv").config();
const express = require("express");
const compression = require('compression');
const cors = require("cors");
const healthRoutes   = require("./routes/healthRoutes");
const authRoutes     = require("./routes/authRoutes");
const productRoutes  = require("./routes/productRoutes");
const orderRoutes    = require("./routes/orderRoutes");
const salesRoutes    = require("./routes/salesRoutes");
const reportRoutes   = require("./routes/reportRoutes");
const creditRoutes   = require("./routes/creditRoutes");
const expenseRoutes  = require("./routes/expenseRoutes");
const adminRoutes    = require("./routes/adminRoutes");
const shopRoutes     = require("./routes/shopRoutes");
const gymRoutes      = require("./routes/gymRoutes");
const schoolRoutes   = require("./routes/schoolRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const staffRoutes    = require("./routes/staffRoutes");
const notFound       = require("./middleware/notFound");
const errorHandler   = require("./middleware/errorHandler");
const authenticate   = require("./middleware/authMiddleware");

const app = express();
const HOSPITAL_SYSTEM_ENABLED = process.env.HOSPITAL_SYSTEM_ENABLED === "true";

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://sahel-api.vercel.app',
  'https://sahel-lrd7c2oc5-sahel-s-projects21.vercel.app',
  'https://mysahelapp.com',
  'https://www.mysahelapp.com',
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

const isVercelOrigin = (origin) => {
  if (!origin) return false;
  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith('.vercel.app');
  } catch (error) {
    return false;
  }
};

const isSahelDomain = (origin) => {
  if (!origin) return false;
  try {
    const { hostname } = new URL(origin);
    return hostname === "mysahelapp.com" || hostname.endsWith(".mysahelapp.com");
  } catch (error) {
    return false;
  }
};

app.use(
  cors({
    origin(origin, callback) {
      if (
        allowedOrigins.includes(origin) ||
        isLocalOrigin(origin) ||
        isVercelOrigin(origin) ||
        isSahelDomain(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-owner-code"]
  })
);

app.options("*", cors());
app.use(compression());
app.use(express.json());

app.use("/api/health",   healthRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/auth",         authRoutes);
app.use("/api/auth",     authRoutes);
app.use("/api/shops",    shopRoutes);
app.use("/products",     authenticate, productRoutes);
app.use("/api/products", authenticate, productRoutes);
app.use("/sales",        authenticate, salesRoutes);
app.use("/api/sales",    authenticate, salesRoutes);
app.use("/credits",      authenticate, creditRoutes);
app.use("/api/credits",  authenticate, creditRoutes);
app.use("/expenses",     authenticate, expenseRoutes);
app.use("/api/expenses", authenticate, expenseRoutes);
app.use("/orders",       authenticate, orderRoutes);
app.use("/api/orders",   authenticate, orderRoutes);
app.use("/reports",      authenticate, reportRoutes);
app.use("/api/reports",  authenticate, reportRoutes);
app.use("/gym",          authenticate, gymRoutes);
app.use("/api/gym",      authenticate, gymRoutes);
app.use("/school",       authenticate, schoolRoutes);
app.use("/api/school",   authenticate, schoolRoutes);

// Hospital remains in the repository for future rebuilding, but its API is
// disabled by default. Set HOSPITAL_SYSTEM_ENABLED=true only when the rebuilt
// module is ready to be brought back online.
if (HOSPITAL_SYSTEM_ENABLED) {
  app.use("/hospital",    authenticate, hospitalRoutes);
  app.use("/api/hospital", authenticate, hospitalRoutes);
}

app.use("/staff",        authenticate, staffRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
