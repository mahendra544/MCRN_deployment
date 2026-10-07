const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomInt } = require("crypto");
const { z } = require("zod");
const rateLimit = require("express-rate-limit");
const pool = require("../db");
const { sendOtp } = require("../utils/mail");
const { requireAuth } = require("../middleware");

const router = express.Router();
const profileRouter = express.Router();

const getAuthSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const isProd = process.env.NODE_ENV === "production" || String(process.env.CLOUD_MODE || "").toLowerCase() === "true";
  if (isProd) {
    throw new Error("FATAL: JWT_SECRET environment variable must be set in production mode.");
  }
  return "MCRN_LOCAL_DEVELOPMENT_SECRET_32_CHARS_CHANGE_ME_2026";
};
const jwtSecret = getAuthSecret();
const adminUsername = (process.env.ADMIN_USERNAME || "mcrn_admin").trim();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." }
});

const password = z.string().min(8).max(72).regex(
  /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])/,
  "Password must include upper, lower, number and special character"
);
const email = z.string().email().max(254).transform((v) => v.trim().toLowerCase());
const username = z.string().trim().min(3).max(50);
const otp = z.string().regex(/^\d{6}$/);

const parse = (schema) => (req, res, next) => {
  const out = schema.safeParse(req.body);
  if (!out.success) return res.status(400).json({ message: out.error.issues[0].message });
  req.body = out.data;
  next();
};

const schemas = {
  user: z.object({
    username,
    email,
    password,
    confirmPassword: z.string().min(1).max(72)
  }).refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  }),
  police: z.object({
    name: z.string().trim().min(2).max(100),
    username,
    email,
    password,
    confirmPassword: z.string().min(1).max(72),
    officialId: z.string().trim().min(3).max(80)
  }).refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  }),
  login: z.object({ username, password: z.string().min(1).max(72) }),
  policeLogin: z.object({ username, password: z.string().min(1).max(72), officialId: z.string().trim().min(3).max(80) }),
  verify: z.object({ email, otp }),
  forgot: z.object({ email }),
  reset: z.object({ email, otp, newPassword: password }),
  resend: z.object({
    email,
    purpose: z.enum(["REGISTRATION_VERIFICATION", "PASSWORD_RESET"]).default("REGISTRATION_VERIFICATION")
  }),
  profile: z.object({
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().max(20).optional().or(z.literal("")),
    profilePhotoUrl: z.string().trim().max(500).optional().or(z.literal(""))
  }),
  changePassword: z.object({ currentPassword: z.string().min(1).max(72), newPassword: password })
};

function sign(u) {
  return jwt.sign(
    { sub: String(u.id), username: u.username, role: u.role },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
}

function publicUser(u) {
  return { id: u.id, username: u.username, name: u.name, email: u.email, role: u.role };
}

async function issueOtp(emailAddr, purpose, { enforceCooldown = true } = {}) {
  console.log(`[AUTH] OTP generation started for purpose=${purpose}`);
  const conn = await pool.getConnection();
  let code;
  try {
    await conn.beginTransaction();
    const [recent] = await conn.query(
      `SELECT created_at, (created_at > NOW() - INTERVAL '60 SECOND') as in_cooldown FROM otp_tokens WHERE email=? AND purpose=? AND consumed_at IS NULL ORDER BY created_at DESC LIMIT 1`,
      [emailAddr, purpose]
    );
    const recentRow = Array.isArray(recent) ? recent[0] : recent;
    if (enforceCooldown && recentRow && (recentRow.in_cooldown || (Date.now() - new Date(recentRow.created_at).getTime() < 60 * 1000))) {
      const err = new Error("Please wait before requesting another code.");
      err.status = 429;
      throw err;
    }
    await conn.query(
      `UPDATE otp_tokens SET consumed_at=NOW() WHERE email=? AND purpose=? AND consumed_at IS NULL`,
      [emailAddr, purpose]
    );
    code = String(randomInt(100000, 1000000));
    console.log("[AUTH] OTP generated");
    const hash = await bcrypt.hash(code, 12);
    await conn.query(
      `INSERT INTO otp_tokens(email, purpose, code_hash, expires_at) VALUES(?, ?, ?, NOW() + INTERVAL '10 MINUTE')`,
      [emailAddr, purpose, hash]
    );
    await conn.commit();
    console.log("[AUTH] OTP stored");
    console.log(`[OTP] Created OTP record`);
    console.log(`[OTP] Purpose=${purpose}`);
    console.log(`[OTP] Active=true`);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  await sendOtp(emailAddr, code, purpose);
}

// ----------------------------------------------------
// AUTH ROUTES (/api/auth)
// ----------------------------------------------------

router.use(authLimiter);

router.post("/register/user", parse(schemas.user), async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const conn = await pool.getConnection();
    let id;
    try {
      await conn.beginTransaction();
      const [exists] = await conn.query("SELECT id FROM users WHERE username=? OR email=? LIMIT 1", [username, email]);
      if (exists && exists.length > 0) {
        await conn.rollback();
        return res.status(409).json({ message: "Username or email is already registered" });
      }
      const [r] = await conn.query(
        "INSERT INTO users(username, name, email, password_hash, role) VALUES(?, ?, ?, ?, 'USER')",
        [username, username, email, hash]
      );
      id = r.insertId || (r.rows && r.rows[0] && r.rows[0].id);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
    await issueOtp(email, "REGISTRATION_VERIFICATION", { enforceCooldown: false });
    res.status(201).json({ message: "Registration successful. Check your email for the verification code.", id });
  } catch (e) {
    next(e);
  }
});

router.post("/register/police", parse(schemas.police), async (req, res, next) => {
  try {
    const { name, username, email, password, officialId } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const conn = await pool.getConnection();
    let id;
    try {
      await conn.beginTransaction();
      const [exists] = await conn.query("SELECT id FROM users WHERE username=? OR email=? LIMIT 1", [username, email]);
      if (exists && exists.length > 0) {
        await conn.rollback();
        return res.status(409).json({ message: "Username or email is already registered" });
      }
      const [oid] = await conn.query("SELECT user_id FROM police_profiles WHERE badge_number=? OR official_id=? LIMIT 1", [officialId, officialId]);
      if (oid && oid.length > 0) {
        await conn.rollback();
        return res.status(409).json({ message: "Official ID is already registered" });
      }
      const [r] = await conn.query(
        "INSERT INTO users(username, name, email, password_hash, role) VALUES(?, ?, ?, ?, 'POLICE')",
        [username, name, email, hash]
      );
      id = r.insertId || (r.rows && r.rows[0] && r.rows[0].id);
      await conn.query("INSERT INTO police_profiles(user_id, official_id, badge_number) VALUES(?, ?, ?)", [id, officialId, officialId]);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
    await issueOtp(email, "REGISTRATION_VERIFICATION", { enforceCooldown: false });
    res.status(201).json({ message: "Police registration successful. Check your email for the verification code.", id });
  } catch (e) {
    next(e);
  }
});

router.post("/login", loginLimiter, parse(schemas.login), async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE username=? AND role='USER' LIMIT 1", [req.body.username]);
    const u = Array.isArray(rows) ? rows[0] : rows;
    if (!u) return res.status(401).json({ message: "Invalid user username or password" });
    if (!(await bcrypt.compare(req.body.password, u.password_hash))) {
      return res.status(401).json({ message: "Invalid user username or password" });
    }
    if (!u.verified) {
      console.log("[AUTH] Account not verified, issuing new OTP for login verification");
      try {
        await issueOtp(u.email, "REGISTRATION_VERIFICATION", { enforceCooldown: true });
      } catch (otpErr) {
        console.warn("[AUTH] Notice on login OTP issuance:", otpErr.message);
      }
      return res.status(403).json({ message: "EMAIL_NOT_VERIFIED", email: u.email });
    }
    res.json({ ...publicUser(u), token: sign(u) });
  } catch (e) {
    next(e);
  }
});

router.post("/police/login", loginLimiter, parse(schemas.policeLogin), async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.* FROM users u JOIN police_profiles p ON p.user_id=u.id WHERE u.username=? AND p.badge_number=? AND u.role='POLICE' LIMIT 1`,
      [req.body.username, req.body.officialId]
    );
    const u = Array.isArray(rows) ? rows[0] : rows;
    if (!u) return res.status(401).json({ message: "Invalid police username, official ID or password" });
    if (!(await bcrypt.compare(req.body.password, u.password_hash))) {
      return res.status(401).json({ message: "Invalid police username, official ID or password" });
    }
    if (!u.verified) {
      console.log("[AUTH] Police account not verified, issuing new OTP for login verification");
      try {
        await issueOtp(u.email, "REGISTRATION_VERIFICATION", { enforceCooldown: true });
      } catch (otpErr) {
        console.warn("[AUTH] Notice on police login OTP issuance:", otpErr.message);
      }
      return res.status(403).json({ message: "EMAIL_NOT_VERIFIED", email: u.email });
    }
    res.json({ ...publicUser(u), officialId: req.body.officialId, token: sign(u) });
  } catch (e) {
    next(e);
  }
});

router.post("/admin/login", (req, res) => {
  res.status(410).json({ success: false, message: "Administrator login has moved. Use the Administrator Access button to open the Admin Portal." });
});

router.post("/verify-email", parse(schemas.verify), async (req, res, next) => {
  try {
    console.log("[AUTH] OTP verification attempted");
    console.log("[OTP] Verification lookup started");
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [uRows] = await conn.query("SELECT id FROM users WHERE email=? LIMIT 1", [req.body.email]);
      const u = Array.isArray(uRows) ? uRows[0] : uRows;
      if (!u) {
        console.log("[AUTH] OTP verification failed: User not found");
        return res.status(400).json({ message: "Invalid verification request" });
      }
      const [tRows] = await conn.query(
        "SELECT id, expires_at, code_hash, (expires_at > NOW()) AS is_valid FROM otp_tokens WHERE email=? AND purpose='REGISTRATION_VERIFICATION' AND consumed_at IS NULL ORDER BY created_at DESC LIMIT 1",
        [req.body.email]
      );
      const t = Array.isArray(tRows) ? tRows[0] : tRows;
      if (!t) {
        console.log("[OTP] Matching active record not found");
        console.log("[AUTH] OTP verification failed: Record not found");
        const err = new Error("OTP expired or not found");
        err.status = 400;
        throw err;
      }
      console.log("[OTP] Matching active record found");
      const isExpired = t.is_valid !== undefined && t.is_valid !== null ? !t.is_valid : new Date(t.expires_at).getTime() < Date.now();
      if (isExpired) {
        console.log("[OTP] Record expired");
        console.log("[AUTH] OTP verification failed: OTP expired");
        const err = new Error("OTP has expired. Please request a new code.");
        err.status = 400;
        throw err;
      }
      if (!(await bcrypt.compare(req.body.otp, t.code_hash))) {
        console.log("[AUTH] OTP verification failed: Invalid OTP");
        const err = new Error("Invalid OTP");
        err.status = 400;
        throw err;
      }
      await conn.query("UPDATE otp_tokens SET consumed_at=NOW() WHERE id=?", [t.id]);
      await conn.query("UPDATE users SET verified=TRUE WHERE id=?", [u.id]);
      await conn.commit();
      console.log("[OTP] OTP verification succeeded");
      console.log("[AUTH] OTP verification succeeded");
      res.json({ message: "Email verified successfully. You can now log in." });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (e) {
    next(e);
  }
});

router.post("/resend-otp", parse(schemas.resend), async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT id, verified FROM users WHERE email=?", [req.body.email]);
    const u = Array.isArray(rows) ? rows[0] : rows;
    if (!u) return res.json({ message: "If the account is eligible, a new code has been sent." });
    if (req.body.purpose === "REGISTRATION_VERIFICATION" && u.verified) {
      return res.status(400).json({ message: "This email is already verified" });
    }
    await issueOtp(req.body.email, req.body.purpose);
    res.json({ message: "A new verification code has been sent." });
  } catch (e) {
    next(e);
  }
});

router.post("/forgot-password", parse(schemas.forgot), async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT email FROM users WHERE email=?", [req.body.email]);
    const u = Array.isArray(rows) ? rows[0] : rows;
    if (u) await issueOtp(u.email, "PASSWORD_RESET");
    res.json({ message: "If an account exists for that email, a password reset code has been sent." });
  } catch (e) {
    next(e);
  }
});

router.post("/reset-password", parse(schemas.reset), async (req, res, next) => {
  try {
    console.log("[AUTH] Password reset verification attempted");
    console.log("[OTP] Verification lookup started");
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [uRows] = await conn.query("SELECT id FROM users WHERE email=? LIMIT 1", [req.body.email]);
      const u = Array.isArray(uRows) ? uRows[0] : uRows;
      const [tRows] = await conn.query(
        "SELECT id, expires_at, code_hash, (expires_at > NOW()) AS is_valid FROM otp_tokens WHERE email=? AND purpose='PASSWORD_RESET' AND consumed_at IS NULL ORDER BY created_at DESC LIMIT 1",
        [req.body.email]
      );
      const t = Array.isArray(tRows) ? tRows[0] : tRows;
      if (!u || !t) {
        console.log("[OTP] Matching active record not found");
        const err = new Error("OTP expired or not found");
        err.status = 400;
        throw err;
      }
      console.log("[OTP] Matching active record found");
      const isExpired = t.is_valid !== undefined && t.is_valid !== null ? !t.is_valid : new Date(t.expires_at).getTime() < Date.now();
      if (isExpired) {
        console.log("[OTP] Record expired");
        const err = new Error("OTP has expired. Please request a new code.");
        err.status = 400;
        throw err;
      }
      if (!(await bcrypt.compare(req.body.otp, t.code_hash))) {
        console.log("[AUTH] OTP verification failed: Invalid OTP");
        const err = new Error("Invalid OTP");
        err.status = 400;
        throw err;
      }
      const hash = await bcrypt.hash(req.body.newPassword, 12);
      await conn.query("UPDATE otp_tokens SET consumed_at=NOW() WHERE id=?", [t.id]);
      await conn.query("UPDATE users SET password_hash=? WHERE id=?", [hash, u.id]);
      await conn.commit();
      console.log("[OTP] OTP verification succeeded");
      console.log("[AUTH] Password reset verification succeeded");
      res.json({ message: "Password reset successfully." });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (e) {
    next(e);
  }
});

// ----------------------------------------------------
// PROFILE ROUTES (/api/user)
// ----------------------------------------------------

profileRouter.get("/profile", requireAuth(["USER", "POLICE", "ADMIN"]), async (req, res, next) => {
  try {
    if (req.user.role === "ADMIN" && req.user.sub === "admin-fixed") {
      return res.json({
        id: "admin-fixed",
        username: adminUsername,
        name: "MCRN Administrator",
        email: "",
        phone: "",
        profilePhotoUrl: "",
        role: "ADMIN",
        verified: true
      });
    }
    const [rows] = await pool.query(
      "SELECT id, username, name, email, phone, profile_photo_url, role, verified FROM users WHERE id=?",
      [req.user.sub]
    );
    const u = Array.isArray(rows) ? rows[0] : rows;
    if (!u) return res.status(401).json({ message: "Unauthorized" });
    res.json({
      id: u.id,
      username: u.username,
      name: u.name,
      email: u.email,
      phone: u.phone,
      profilePhotoUrl: u.profile_photo_url,
      role: u.role,
      verified: Boolean(u.verified)
    });
  } catch (e) {
    next(e);
  }
});

profileRouter.put("/profile", requireAuth(["USER", "POLICE"]), parse(schemas.profile), async (req, res, next) => {
  try {
    if (req.user.role === "ADMIN") {
      return res.status(403).json({ message: "Administrator profile is fixed and cannot be edited here." });
    }
    await pool.query(
      "UPDATE users SET name=?, phone=?, profile_photo_url=? WHERE id=?",
      [req.body.name, req.body.phone || null, req.body.profilePhotoUrl || null, req.user.sub]
    );
    res.json({ message: "Profile updated" });
  } catch (e) {
    next(e);
  }
});

profileRouter.put("/change-password", requireAuth(["USER", "POLICE"]), parse(schemas.changePassword), async (req, res, next) => {
  try {
    if (req.user.role === "ADMIN") {
      return res.status(403).json({ message: "Administrator password is fixed and managed by the server configuration." });
    }
    const [rows] = await pool.query("SELECT password_hash FROM users WHERE id=?", [req.user.sub]);
    const u = Array.isArray(rows) ? rows[0] : rows;
    if (!u || !(await bcrypt.compare(req.body.currentPassword, u.password_hash))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    await pool.query("UPDATE users SET password_hash=? WHERE id=?", [
      await bcrypt.hash(req.body.newPassword, 12),
      req.user.sub
    ]);
    res.json({ message: "Password changed successfully." });
  } catch (e) {
    next(e);
  }
});

module.exports = {
  authRouter: router,
  profileRouter
};
