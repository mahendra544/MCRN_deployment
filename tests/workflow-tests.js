const path = require("path");
const fs = require("fs");
const backendModules = path.resolve(__dirname, "../backend/node_modules");
if (fs.existsSync(backendModules)) {
  module.paths.unshift(backendModules);
}
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const http = require("http");
const { Pool } = require("pg");

function request(url, method = "GET", postData = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: { ...headers }
    };

    if (postData) {
      if (typeof postData === "object" && !(postData instanceof Buffer)) {
        postData = JSON.stringify(postData);
        options.headers["Content-Type"] = "application/json";
      }
      options.headers["Content-Length"] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        let json = null;
        try { json = JSON.parse(data); } catch (_) {}
        resolve({ status: res.statusCode, data, json });
      });
    });

    req.on("error", (err) => resolve({ status: 500, error: err.message }));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runWorkflows() {
  console.log("==================================================");
  console.log("       MCRN FULL WORKFLOW VERIFICATION SUITE      ");
  console.log("==================================================\n");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let passed = 0;
  let total = 0;

  function assert(name, condition, details = "") {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] ${name}`);
    } else {
      console.error(`  ❌ [FAIL] ${name} ${details ? `(${details})` : ""}`);
    }
  }

  try {
    // ----------------------------------------------------
    // WORKFLOW 1: CITIZEN REGISTRATION -> VERIFICATION -> DASHBOARD
    // ----------------------------------------------------
    console.log("--- WORKFLOW 1: Citizen Lifecycle ---");
    const ts = Date.now();
    const citizenEmail = `citizen_${ts}@testmcrn.org`;
    const citizenUsername = `citizen_${ts}`;
    const password = "ValidPassword123!";

    const reg = await request("http://127.0.0.1:5000/api/auth/register/user", "POST", {
      username: citizenUsername,
      email: citizenEmail,
      password,
      confirmPassword: password
    });
    assert("1.1 Citizen registration returns 201", reg.status === 201);

    // Verify OTP was saved in DB
    const otpRow = await pool.query(
      "SELECT id, code_hash FROM otp_tokens WHERE email=$1 AND purpose='REGISTRATION_VERIFICATION' ORDER BY id DESC LIMIT 1",
      [citizenEmail]
    );
    assert("1.2 OTP record exists with code_hash", otpRow.rows.length === 1 && !!otpRow.rows[0].code_hash);

    // Directly set verified in DB to simulate OTP confirmation
    await pool.query("UPDATE users SET verified=true WHERE email=$1", [citizenEmail]);

    // Citizen Login
    const login = await request("http://127.0.0.1:5000/api/auth/login", "POST", {
      username: citizenUsername,
      password
    });
    assert("1.3 Citizen login succeeds (200)", login.status === 200 && !!login.json?.token);
    const citizenToken = login.json?.token;

    // Citizen Dashboard Access
    const dash = await request("http://127.0.0.1:5000/api/dashboard", "GET", null, {
      Authorization: `Bearer ${citizenToken}`
    });
    assert("1.4 Citizen dashboard returns 200 data", dash.status === 200);

    // Citizen Report Filing
    const reportRes = await request("http://127.0.0.1:5000/api/report-child", "POST", {
      child_name: "Test Child " + ts,
      age: 8,
      gender: "Male",
      date_missing: "2026-09-01",
      time_missing: "14:30:00",
      last_seen_location: "Metro Station North",
      parent_name: "Test Parent",
      parent_phone: "9876543210",
      parent_email: citizenEmail,
      address: "123 Safe St"
    }, {
      Authorization: `Bearer ${citizenToken}`
    });
    assert("1.5 Citizen missing-child report filed (201)", reportRes.status === 201);

    // Verify report persisted in PostgreSQL
    const savedReport = await pool.query(
      "SELECT id, child_name, status FROM missing_child_reports WHERE parent_email=$1 ORDER BY id DESC LIMIT 1",
      [citizenEmail]
    );
    assert("1.6 Report verified in database", savedReport.rows.length === 1 && savedReport.rows[0].child_name.includes("Test Child"));

    // ----------------------------------------------------
    // WORKFLOW 2: ADMIN OPERATIONS
    // ----------------------------------------------------
    console.log("\n--- WORKFLOW 2: Admin Operations ---");
    const adminLogin = await request("http://127.0.0.1:5000/api/admin/login", "POST", {
      email: "osurimahendra1@gmail.com", password: process.env.ADMIN_DEFAULT_PASSWORD || "Admin@123"
    });
    assert("2.1 Admin login succeeds (200)", adminLogin.status === 200 && !!adminLogin.json?.token);
    const adminToken = adminLogin.json?.token;

    const adminCases = await request("http://127.0.0.1:5000/api/admin/cases", "GET", null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert("2.2 Admin cases list returns 200", adminCases.status === 200);

    const adminUsers = await request("http://127.0.0.1:5000/api/admin/users", "GET", null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert("2.3 Admin users list returns 200", adminUsers.status === 200);

    const adminAudit = await request("http://127.0.0.1:5000/api/admin/audit-logs", "GET", null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert("2.4 Admin audit logs endpoint returns 200 without schema errors", adminAudit.status === 200);

    const adminAnalytics = await request("http://127.0.0.1:5000/api/admin/analytics", "GET", null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert("2.5 Admin analytics query executes without boolean casting errors", adminAnalytics.status === 200);

    // ----------------------------------------------------
    // WORKFLOW 3: POLICE OPERATIONS
    // ----------------------------------------------------
    console.log("\n--- WORKFLOW 3: Police Operations ---");
    const policeBadge = `BADGE_${ts}`;
    const policeUsername = `officer_${ts}`;
    const policeEmail = `officer_${ts}@police.mcrn.org`;

    const policeReg = await request("http://127.0.0.1:5000/api/auth/register/police", "POST", {
      name: "Officer Test",
      username: policeUsername,
      email: policeEmail,
      password,
      confirmPassword: password,
      officialId: policeBadge
    });
    assert("3.1 Police registration returns 201", policeReg.status === 201);

    // Mark police user verified
    await pool.query("UPDATE users SET verified=true WHERE email=$1", [policeEmail]);

    // Police Login
    const policeLogin = await request("http://127.0.0.1:5000/api/auth/police/login", "POST", {
      username: policeUsername,
      officialId: policeBadge,
      password
    });
    assert("3.2 Police login succeeds (200)", policeLogin.status === 200 && !!policeLogin.json?.token);
    const policeToken = policeLogin.json?.token;

    // Police Cases List
    const policeCases = await request("http://127.0.0.1:5000/api/police/cases", "GET", null, {
      Authorization: `Bearer ${policeToken}`
    });
    assert("3.3 Police cases endpoint returns 200", policeCases.status === 200);

    // Police Notifications
    const policeNotif = await request("http://127.0.0.1:5000/api/notifications", "GET", null, {
      Authorization: `Bearer ${policeToken}`
    });
    assert("3.4 Police notifications returns 200", policeNotif.status === 200);

    // Clean up test data
    await pool.query("DELETE FROM users WHERE email IN ($1, $2)", [citizenEmail, policeEmail]);
    await pool.query("DELETE FROM otp_tokens WHERE email IN ($1, $2)", [citizenEmail, policeEmail]);
    if (savedReport.rows.length > 0) {
      await pool.query("DELETE FROM missing_child_reports WHERE id=$1", [savedReport.rows[0].id]);
    }

  } finally {
    await pool.end();
  }

  console.log("\n==================================================");
  console.log(`WORKFLOW RESULTS: ${passed} / ${total} passed (${Math.round((passed/total)*100)}%)`);
  console.log("==================================================");

  if (passed !== total) process.exit(1);
}

if (require.main === module) {
  runWorkflows();
}

module.exports = { runWorkflows };
