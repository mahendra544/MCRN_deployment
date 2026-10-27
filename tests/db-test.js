const dns = require("node:dns");
if (dns && dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}
const path = require("path");
const fs = require("fs");

const backendNodeModules = path.resolve(__dirname, "../backend/node_modules");
if (fs.existsSync(backendNodeModules)) {
  module.paths.unshift(backendNodeModules);
}

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { Pool } = require("pg");

async function testDatabase() {
  console.log("== Running Database Verification Test ==");
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/mcrn";
  const isSsl = String(process.env.PG_SSL || "false").toLowerCase() === "true";

  const pool = new Pool({
    connectionString,
    ssl: isSsl ? { rejectUnauthorized: false } : false
  });

  try {
    const res = await pool.query("SELECT 1 as connected");
    console.log("✅ Database connectivity: SUCCESS", res.rows[0]);

    const tablesRes = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = current_schema()
      ORDER BY table_name;
    `);

    const tableNames = tablesRes.rows.map(r => r.table_name);
    console.log(`✅ Discovered ${tableNames.length} tables:`, tableNames.join(", "));

    const requiredTables = ["users", "police_profiles", "children", "missing_cases", "sightings", "admin_settings"];
    for (const table of requiredTables) {
      if (tableNames.includes(table)) {
        console.log(`   ✓ Table [${table}] is present.`);
      } else {
        console.warn(`   ✗ Table [${table}] is NOT yet created.`);
      }
    }
  } catch (err) {
    console.error("❌ Database connection error (may need active internet/cloud access):", err.message);
  } finally {
    await pool.end();
  }
}

testDatabase();
