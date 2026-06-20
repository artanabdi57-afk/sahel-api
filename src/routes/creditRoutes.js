const express = require("express");
const {
  createCredit,
  getCredits,
  getCreditSummary,
  markCreditPaid,
  recordPartialPayment
} = require("../controllers/creditController");
const router = express.Router();
router.get("/", getCredits);
router.get("/summary", getCreditSummary);
router.post("/", createCredit);
router.put("/:id/paid", markCreditPaid);
router.put("/:id/partial", recordPartialPayment);
module.exports = router;
