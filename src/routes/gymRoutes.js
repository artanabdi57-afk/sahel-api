const express = require("express");
const {
  getMembers, createMember, updateMember, deleteMember,
  getCheckins, createCheckin,
  getPayments, createPayment,
  getSettings, updateSettings,
  getExpenses, createExpense, deleteExpense,
  getStaffPayments, createStaffPayment,
} = require("../controllers/gymController");

const router = express.Router();

router.get("/members", getMembers);
router.post("/members", createMember);
router.put("/members/:id", updateMember);
router.delete("/members/:id", deleteMember);
router.get("/checkins", getCheckins);
router.post("/checkins", createCheckin);
router.get("/payments", getPayments);
router.post("/payments", createPayment);
router.get("/settings", getSettings);
router.put("/settings", updateSettings);
router.get("/expenses", getExpenses);
router.post("/expenses", createExpense);
router.delete("/expenses/:id", deleteExpense);
router.get("/staff-payments", getStaffPayments);
router.post("/staff-payments", createStaffPayment);

module.exports = router;
