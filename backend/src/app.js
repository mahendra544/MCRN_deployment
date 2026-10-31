const dns = require("node:dns");
if (dns && dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const db = require("./db");
const { authRouter, profileRouter } = require("./auth/routes");
const childrenRoutes = require("./user/routes/childrenroutes");
const dashboardRoutes = require("./user/routes/dashboardroutes");
const reportingRouter = require("./reporting/routes");
const policeRouter = require("./police/routes");
const adminRouter = require("./admin/routes");
const { requireAuth } = require("./middleware");
const { ensurePoliceSchema } = require("./police/schema");
const { verifyMailer } = require("./utils/mail");
const { ensureBucketExists, BUCKET_NAME } = require("./config/supabase");

const app = express();

const FRONTEND_DIST = path.resolve(__dirname, "../../frontend/dist");

function getHtmlFileForRoute(pathname) {
  if (/^\/(user-dashboard|search-children|child\/|report-sighting|report-child|about-us|my-cases|notifications)(\/|$)/.test(pathname) || pathname.startsWith("/__user/")) {
    return path.join(FRONTEND_DIST, "user.html");
  }
  if (/^\/(police-dashboard|police-cases|police-verify|police-search|police-notifications|police-profile)(\/|$)/.test(pathname) || pathname.startsWith("/__police/")) {
    return path.join(FRONTEND_DIST, "police.html");
  }
  if (/^\/contact-us(\/|$)/.test(pathname) || pathname.startsWith("/__contact/")) {
    return path.join(FRONTEND_DIST, "contact.html");
  }
  if (/^\/admin(\/|$)/.test(pathname) || pathname.startsWith("/__admin/")) {
    return path.join(FRONTEND_DIST, "admin.html");
  }
  if (/^\/report-child(\/|$)/.test(pathname) || pathname.startsWith("/__reporting/")) {
    return path.join(FRONTEND_DIST, "user.html");
  }
  return path.join(FRONTEND_DIST, "index.html");
}

// Security & Parsing Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const isProduction = process.env.NODE_ENV === "production" ||
  String(process.env.CLOUD_MODE || "").toLowerCase() === "true";
const defaultOrigins = isProduction
  ? ""
  : "http://localhost:5173,http://127.0.0.1:5173";
const origins = (process.env.CORS_ORIGINS || defaultOrigins)
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);
const allowAllOrigins = origins.includes("*");
if (isProduction && (!origins.length || allowAllOrigins)) {
  throw new Error("Set CORS_ORIGINS to explicit frontend origins before starting in production.");
}

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowAllOrigins || origins.includes(origin)) return cb(null, true);
    cb(new Error("Origin not allowed"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Uploads Static Serving (local/VPS fallback)
const uploadsDir = path.resolve(__dirname, "../uploads");
if (fs.existsSync(uploadsDir)) {
  app.use("/uploads", express.static(uploadsDir));
}

// Frontend Static Assets Serving (used when running as standalone Express server)
if (fs.existsSync(FRONTEND_DIST)) {
  // Explicit Multi-Page SPA entry points
  app.get(["/admin", "/admin/*"], (req, res, next) => {
    if (req.path.includes(".")) return next();
    res.sendFile(path.join(FRONTEND_DIST, "admin.html"));
  });
  app.get(["/user-dashboard", "/user-dashboard/*", "/search-children", "/search-children/*", "/my-cases", "/my-cases/*"], (req, res, next) => {
    if (req.path.includes(".")) return next();
    res.sendFile(path.join(FRONTEND_DIST, "user.html"));
  });
  app.get(["/police-dashboard", "/police-dashboard/*", "/police-cases", "/police-cases/*", "/police-verify", "/police-verify/*"], (req, res, next) => {
    if (req.path.includes(".")) return next();
    res.sendFile(path.join(FRONTEND_DIST, "police.html"));
  });
  app.get(["/contact-us", "/contact-us/*"], (req, res, next) => {
    if (req.path.includes(".")) return next();
    res.sendFile(path.join(FRONTEND_DIST, "contact.html"));
  });
  app.get(["/reporting", "/reporting/*"], (req, res, next) => {
    if (req.path.includes(".")) return next();
    res.sendFile(path.join(FRONTEND_DIST, "reporting.html"));
  });

  // Serve static assets without index.html hijacking
  app.use(express.static(FRONTEND_DIST, { index: false }));
  for (const prefix of ["/__user/", "/__police/", "/__reporting/", "/__contact/", "/admin/"]) {
    app.use(prefix, express.static(FRONTEND_DIST, { index: false }));
  }
}

// System Health & Info
app.get(["/health", "/api/health", "/api", "/api/"], (req, res) => {
  res.json({ ok: true, service: "MCRN Unified Backend", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  if (req.accepts("html") && fs.existsSync(path.join(FRONTEND_DIST, "index.html"))) {
    return res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  }
  res.json({
    success: true,
    message: "Missing Child Rescue Network (MCRN) Unified Backend is running.",
    timestamp: new Date().toISOString()
  });
});

// Database Connectivity Test
app.get(["/api/test-db", "/test-db"], async (req, res) => {
  try {
    const [result] = await db.query("SELECT 1 AS connected");
    res.json({
      success: true,
      message: "PostgreSQL connected successfully",
      data: result
    });
  } catch (error) {
    console.error("Database connection error:", error.message);
    res.status(500).json({
      success: false,
      message: "PostgreSQL connection failed",
      error: error.message
    });
  }
});

// Supabase Storage Connectivity Test
app.get(["/api/test-storage", "/test-storage"], async (req, res) => {
  try {
    const isReady = await ensureBucketExists();
    if (!isReady) {
      return res.status(503).json({
        success: false,
        bucket: BUCKET_NAME,
        message: "Supabase Storage is not configured or the bucket could not be verified."
      });
    }
    res.json({
      success: true,
      bucket: BUCKET_NAME,
      message: "Supabase Storage connected and bucket verified"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Supabase Storage check failed",
      error: error.message
    });
  }
});

// ----------------------------------------------------
// MOUNT MODULE ROUTERS
// ----------------------------------------------------

// 1. Auth & User Profile
app.use("/api/auth", authRouter);
app.use("/api/user", profileRouter);

// 2. User Portal (Children Search & Dashboard)
app.use("/api/children", requireAuth(["USER", "ADMIN"]), childrenRoutes);
app.use("/api/dashboard", requireAuth(["USER", "ADMIN"]), dashboardRoutes);

// 3. Reporting (Citizen Report Filing)
app.use("/api", reportingRouter);

// 4. Police (Sightings & Police Cases & Notifications)
app.use(policeRouter);

// 5. Admin (Verification, Assignments, Management, Logs)
app.use(adminRouter);

// Multi-Page SPA Route Resolver Fallback for non-API routes (standalone server mode)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/") || req.path === "/health") {
    return next();
  }
  const targetHtml = getHtmlFileForRoute(req.path);
  if (fs.existsSync(targetHtml)) {
    return res.sendFile(targetHtml);
  }
  const indexFallback = path.join(FRONTEND_DIST, "index.html");
  if (fs.existsSync(indexFallback)) {
    return res.sendFile(indexFallback);
  }
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("API Error:", err.stack || err.message);
  const status = err.status || (res.statusCode >= 400 ? res.statusCode : 500);
  res.status(status).json({
    success: false,
    message: err.message || "An unexpected error occurred. Please try again."
  });
});

module.exports = app;
