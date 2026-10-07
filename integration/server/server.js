const dns = require("node:dns");
if (dns && dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const ROOT = path.resolve(__dirname, "../..");
const CLOUD_MODE = String(process.env.CLOUD_MODE || "false").toLowerCase() === "true";
const isProd = CLOUD_MODE || process.env.NODE_ENV === "production";
const PORT = Number(process.env.INTEGRATION_PORT || (isProd ? process.env.PORT : null) || process.env.PORT || 5173);
const API_PORT = Number(process.env.BACKEND_PORT || process.env.API_GATEWAY_PORT || 5000);
const HOST = process.env.HOST || "0.0.0.0";

const BACKEND_URL = process.env.BACKEND_URL || `http://127.0.0.1:${API_PORT}`;
const FRONTEND_DIST = path.join(ROOT, "frontend", "dist");
const UPLOADS_DIR = path.join(ROOT, "backend", "uploads");

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  return ({
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2"
  }[ext] || "application/octet-stream");
}

function serveFile(res, file) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return false;
  res.writeHead(200, { "Content-Type": contentType(file), "Cache-Control": "no-cache" });
  fs.createReadStream(file).pipe(res);
  return true;
}

function proxyTo(req, res, targetUrlStr) {
  try {
    const targetUrl = new URL(targetUrlStr);
    const isHttps = targetUrl.protocol === "https:";
    const client = isHttps ? https : http;

    const targetPath = (targetUrl.pathname === "/" ? "" : targetUrl.pathname) + req.url;
    const headers = { ...req.headers, host: targetUrl.host };

    const options = {
      hostname: targetUrl.hostname,
      port: targetUrl.port || (isHttps ? 443 : 80),
      path: targetPath,
      method: req.method,
      headers
    };

    const upstream = client.request(options, (r) => {
      res.writeHead(r.statusCode || 502, r.headers);
      r.pipe(res);
    });

    upstream.on("error", (err) => {
      if (!res.headersSent) res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: `Integration gateway could not reach backend at ${targetUrlStr}`, error: err.message }));
    });

    req.pipe(upstream);
  } catch (err) {
    if (!res.headersSent) res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Invalid target backend URL", error: err.message }));
  }
}

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

const handler = (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const p = url.pathname;

  if (p === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true, service: "MCRN integration gateway" }));
  }

  // API Requests -> Forward to Unified Backend
  if (p.startsWith("/api/")) {
    return proxyTo(req, res, BACKEND_URL);
  }

  // Uploads Serving
  if (p.startsWith("/uploads/")) {
    const filename = decodeURIComponent(p.slice("/uploads/".length));
    const localFile = path.join(UPLOADS_DIR, filename);
    if (serveFile(res, localFile)) return;
    return proxyTo(req, res, BACKEND_URL);
  }

  // Direct Static File from frontend/dist (e.g. /assets/*, /logo.png, etc.)
  const directPath = path.join(FRONTEND_DIST, p.slice(1));
  if (p !== "/" && serveFile(res, directPath)) {
    return;
  }

  // Legacy prefix static asset mapping (e.g. /admin/assets/*, /__user/assets/*)
  for (const prefix of ["/__user/", "/__police/", "/__reporting/", "/__contact/", "/admin/"]) {
    if (p.startsWith(prefix)) {
      const rel = p.slice(prefix.length);
      if (serveFile(res, path.join(FRONTEND_DIST, rel))) return;
    }
  }

  // Multi-Page SPA Route Resolver
  const targetHtml = getHtmlFileForRoute(p);
  if (!fs.existsSync(targetHtml)) {
    // If specific HTML not found, fallback to index.html
    const indexFallback = path.join(FRONTEND_DIST, "index.html");
    if (fs.existsSync(indexFallback)) {
      return serveFile(res, indexFallback);
    }
    res.writeHead(503, { "Content-Type": "text/plain" });
    return res.end("Build missing for MCRN frontend. Run npm run build or ./setup.sh first.");
  }

  return serveFile(res, targetHtml);
};

if (CLOUD_MODE) {
  const publicServer = http.createServer(handler);
  publicServer.listen(PORT, HOST, () => {
    console.log(`MCRN cloud server listening on ${HOST}:${PORT}`);
  });
} else {
  const webServer = http.createServer(handler);
  webServer.listen(PORT, HOST, () => {
    console.log(`MCRN web server running: http://${HOST}:${PORT}`);
  });
}
