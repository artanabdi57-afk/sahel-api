const express = require("express");
const { createExpense, deleteExpense, getExpenses } = require("../controllers/expenseController");

const router = express.Router();

router.get("/", getExpenses);
router.post("/", createExpense);
router.delete("/:id", deleteExpense);

module.exports = router;
