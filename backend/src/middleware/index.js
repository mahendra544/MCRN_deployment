require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const jwt = require("jsonwebtoken");

const getSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const isProd = process.env.NODE_ENV === "production" || String(process.env.CLOUD_MODE || "").toLowerCase() === "true";
  if (isProd) {
    throw new Error("FATAL: JWT_SECRET environment variable must be set in production mode.");
  }
  return "MCRN_LOCAL_DEVELOPMENT_SECRET_32_CHARS_CHANGE_ME_2026";
};

function requireAuth(roles = []) {
  return (req, res, next) => {
    try {
      const h = req.headers.authorization || "";
      if (!/^Bearer\s+/i.test(h)) return res.status(401).json({ success: false, message: "Authentication required" });
      const secret = getSecret();
      req.user = jwt.verify(h.replace(/^Bearer\s+/i, ""), secret);
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      next();
    } catch {
      return res.status(401).json({ success: false, message: "Invalid or expired session" });
    }
  };
}

function requirePolice(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    if (!/^Bearer\s+/i.test(h)) return res.status(401).json({ success: false, message: "Authentication required" });
    const secret = getSecret();
    req.user = jwt.verify(h.replace(/^Bearer\s+/i, ""), secret);
    if (!["POLICE", "ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Police access required" });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
}

function requireAdmin(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    if (!/^Bearer\s+/i.test(h)) return res.status(401).json({ success: false, message: "Administrator authentication required" });
    const secret = getSecret();
    const user = jwt.verify(h.replace(/^Bearer\s+/i, ""), secret);
    if (user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Administrator access required" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired administrator session" });
  }
}

function requireAnyUser(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    if (!/^Bearer\s+/i.test(h)) return res.status(401).json({ success: false, message: "Authentication required" });
    const secret = getSecret();
    req.user = jwt.verify(h.replace(/^Bearer\s+/i, ""), secret);
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired session" });
  }
}

module.exports = {
  requireAuth,
  requirePolice,
  requireAdmin,
  requireAnyUser
};
