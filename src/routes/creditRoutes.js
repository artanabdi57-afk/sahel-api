const express = require("express");
const {
  getCredits,
  getCreditSummary,
  markCreditPaid,
  recordPartialPayment
} = require("../controllers/creditController");

const router = express.Router();

router.get("/", getCredits);
router.get("/summary", getCreditSummary);
router.put("/:id/paid", markCreditPaid);
router.put("/:id/partial", recordPartialPayment);

module.exports = router;
