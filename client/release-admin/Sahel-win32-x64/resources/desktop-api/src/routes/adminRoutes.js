const express = require("express");
const {
  deleteClientShop,
  getAdminOverview,
  resetClientPassword,
  setShopStatus
} = require("../controllers/adminController");
const verifyOwner = require("../middleware/ownerMiddleware");

const router = express.Router();

router.use(verifyOwner);
router.get("/overview", getAdminOverview);
router.put("/shops/:id/status", setShopStatus);
router.put("/shops/:id/password", resetClientPassword);
router.delete("/shops/:id", deleteClientShop);

module.exports = router;
