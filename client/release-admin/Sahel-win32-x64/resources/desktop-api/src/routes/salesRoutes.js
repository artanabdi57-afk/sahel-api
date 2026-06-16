const express = require("express");
const { getCustomers, getSales, recordSales, deleteSale } = require("../controllers/salesController");

const router = express.Router();

router.get("/", getSales);
router.get("/customers", getCustomers);
router.post("/", recordSales);
router.delete("/:id", deleteSale);

module.exports = router;
