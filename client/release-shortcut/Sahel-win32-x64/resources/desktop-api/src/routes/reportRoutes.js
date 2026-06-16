const express = require("express");
const {
  getSalesReport,
  getTopProducts,
  getSlowMovingProducts,
  getExpensesReport,
  getProfitReport,
  getDailySales
} = require("../controllers/reportController");

const router = express.Router();

router.get("/sales", getSalesReport);
router.get("/top-products", getTopProducts);
router.get("/slow-moving", getSlowMovingProducts);
router.get("/expenses", getExpensesReport);
router.get("/profit", getProfitReport);
router.get("/daily", getDailySales);

module.exports = router;
