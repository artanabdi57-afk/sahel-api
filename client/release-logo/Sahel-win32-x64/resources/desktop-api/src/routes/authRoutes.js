const express = require("express");
const { signup, login, oauthSession, setupShop } = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/oauth-session", oauthSession);
router.post("/setup-shop", authenticate, setupShop);

module.exports = router;
