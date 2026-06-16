const verifyOwner = (req, res, next) => {
  const requiredCode = String(process.env.ACCOUNT_SETUP_CODE || "").trim();
  const submittedCode = String(req.headers["x-owner-code"] || req.body?.owner_code || "").trim();

  if (!requiredCode) {
    return res.status(503).json({ message: "Owner access is not configured." });
  }

  if (submittedCode !== requiredCode) {
    return res.status(403).json({ message: "Owner code is invalid." });
  }

  next();
};

module.exports = verifyOwner;
