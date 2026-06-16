const express = require("express");
const { changePassword, signup, login, oauthSession, setupShop } = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/oauth-session", oauthSession);
router.post("/setup-shop", authenticate, setupShop);
router.put("/change-password", authenticate, changePassword);

module.exports = router;
