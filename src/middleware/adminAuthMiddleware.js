const jwt = require("jsonwebtoken");

/**
 * Protects the Sahel platform-admin API with a server-issued JWT.
 * The browser never receives a Supabase service/secret key.
 */
module.exports = function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Admin authentication is required." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload?.scope !== "platform_admin") {
      return res.status(403).json({ message: "Platform-admin access required." });
    }
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Admin session is invalid or expired." });
  }
};
