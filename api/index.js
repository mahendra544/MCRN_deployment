const app = require("../backend/src/app");
const db = require("../backend/src/db");
const { ensurePoliceSchema } = require("../backend/src/police/schema");
const { ensureBucketExists } = require("../backend/src/config/supabase");

// Non-blocking schema and storage bucket verification on container initialization
Promise.allSettled([
  ensurePoliceSchema(db),
  ensureBucketExists()
]).catch(() => {});

module.exports = app;
