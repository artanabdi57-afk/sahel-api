// routes/shopRoutes.js
const express = require("express");
const {
  createShop,
  getMyShops,
  deleteShop,
} = require("../controllers/shopController");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/",        authenticate, getMyShops);   // GET  /api/shops
router.post("/",       authenticate, createShop);   // POST /api/shops
router.delete("/:id",  authenticate, deleteShop);   // DELETE /api/shops/:id

module.exports = router;
