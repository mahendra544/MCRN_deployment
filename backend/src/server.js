const http = require("http");
const app = require("./app");
const db = require("./db");
const { ensurePoliceSchema } = require("./police/schema");
const { verifyMailer } = require("./utils/mail");
const { ensureBucketExists } = require("./config/supabase");

const isCloudOrProd = String(process.env.CLOUD_MODE || "").toLowerCase() === "true" || process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT || process.env.BACKEND_PORT || process.env.API_GATEWAY_PORT || 5000);
const HOST = process.env.HOST || "0.0.0.0";

async function startServer() {
  try {
    await ensurePoliceSchema(db);
    console.log("✅ Database schema verified.");
  } catch (schemaErr) {
    console.warn("⚠️ Schema verification warning:", schemaErr.message);
  }

  ensureBucketExists().catch((err) => {
    console.warn("⚠️ Supabase bucket check warning:", err.message);
  });

  verifyMailer().catch(() => {});

  const primaryServer = http.createServer(app);
  primaryServer.listen(PORT, HOST, () => {
    console.log(`🚀 MCRN Unified Backend running on http://${HOST}:${PORT}`);
  });

  // Optional compatibility ports for legacy direct-port callers in local development
  if (!isCloudOrProd) {
    const compatPorts = [8080, 5001, 5002, 5003, 5004];
    for (const cPort of compatPorts) {
      if (cPort !== PORT) {
        try {
          const s = http.createServer(app);
          s.on("error", () => {});
          s.listen(cPort, HOST, () => {});
        } catch (_) {}
      }
    }
  }

  return primaryServer;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
