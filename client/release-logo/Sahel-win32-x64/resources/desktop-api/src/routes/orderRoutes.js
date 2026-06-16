const express = require("express");
const {
  getOrders,
  createOrder,
  receiveOrder,
  cancelOrder
} = require("../controllers/orderController");

const router = express.Router();

router.get("/", getOrders);
router.post("/", createOrder);
router.put("/:id/receive", receiveOrder);
router.put("/:id/cancel", cancelOrder);

module.exports = router;
