const express = require("express");
const {
  adminLogin,
  getAdminOverview,
  resetClientPassword,
  setShopStatus,
  updateClient
} = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuthMiddleware");

const router = express.Router();

// Platform-admin authentication is intentionally separate from customer accounts.
router.post("/session", adminLogin);
router.use(adminAuth);
router.get("/overview", getAdminOverview);
router.put("/shops/:id/status", setShopStatus);
router.put("/shops/:id/password", resetClientPassword);
router.put("/shops/:id", updateClient);

module.exports = router;
