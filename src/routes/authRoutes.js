// routes/authRoutes.js — FULL REPLACEMENT
const express = require("express");
const {
  changePassword,
  signup,
  login,
  oauthSession,
  setupShop,
  switchShop,   // ← new
  staffLogin,   // ← new
} = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/signup",        signup);
router.post("/login",         login);
router.post("/oauth-session", oauthSession);
router.post("/setup-shop",    authenticate, setupShop);
router.put("/change-password",authenticate, changePassword);
router.post("/switch-shop",   authenticate, switchShop);  // ← new: needs valid token
router.post("/staff-login",   staffLogin);                // ← new: public endpoint

module.exports = router;
