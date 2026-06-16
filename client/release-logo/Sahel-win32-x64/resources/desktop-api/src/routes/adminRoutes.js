const express = require("express");
const { getAdminOverview } = require("../controllers/adminController");
const verifyOwner = require("../middleware/ownerMiddleware");

const router = express.Router();

router.use(verifyOwner);
router.get("/overview", getAdminOverview);

module.exports = router;
