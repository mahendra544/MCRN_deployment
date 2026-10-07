const path = require("path");
const fs = require("fs");
const backendModules = path.resolve(__dirname, "../backend/node_modules");
if (fs.existsSync(backendModules)) {
  module.paths.unshift(backendModules);
}
const rootModules = path.resolve(__dirname, "../node_modules");
if (fs.existsSync(rootModules)) {
  module.paths.unshift(rootModules);
}
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const http = require("http");
const { Pool } = require("pg");

async function checkUrl(url, method = "GET", postData = null, headers = {}, maxRedirects = 3) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: { ...headers }
    };

    if (postData) {
      options.headers["Content-Type"] = "application/json";
      options.headers["Content-Length"] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location && maxRedirects > 0) {
        const redirectUrl = new URL(res.headers.location, url).href;
        return checkUrl(redirectUrl, method, postData, headers, maxRedirects - 1).then(resolve);
      }
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        resolve({ status: res.statusCode, data });
      });
    });

    req.on("error", (err) => {
      resolve({ status: 500, error: err.message });
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log("==================================================");
  console.log("       MCRN END-TO-END VERIFICATION SUITE         ");
  console.log("==================================================\n");

  let totalPassed = 0;
  let totalTests = 0;

  function assert(name, condition, details = "") {
    totalTests++;
    if (condition) {
      totalPassed++;
      console.log(`  ✅ [PASS] ${name}`);
    } else {
      console.error(`  ❌ [FAIL] ${name} ${details ? `(${details})` : ""}`);
    }
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log("--- 1. Backend Service Verification (:5000) ---");
    const health = await checkUrl("http://127.0.0.1:5000/health");
    assert("Backend /health endpoint returns 200", health.status === 200);

    const apiHealth = await checkUrl("http://127.0.0.1:5000/api/health");
    assert("Backend /api/health endpoint returns 200", apiHealth.status === 200);

    const rootBackend = await checkUrl("http://127.0.0.1:5000/");
    assert("Backend root / returns 200 with HTML or JSON", rootBackend.status === 200 && (rootBackend.data.includes("MCRN") || rootBackend.data.includes("<!doctype html>")));

    const dbTest = await checkUrl("http://127.0.0.1:5000/api/test-db");
    assert("Backend /api/test-db reports database connected", dbTest.status === 200 && dbTest.data.includes("connected"));

    console.log("\n--- 2. Web Server & Integration Gateway / Unified Portal ---");
    let webPort = 5000;
    try {
      const probe5173 = await checkUrl("http://127.0.0.1:5173/api/health");
      if (probe5173.status === 200) {
        webPort = 5173;
      }
    } catch (_) {}
    if (process.env.FRONTEND_PORT) webPort = parseInt(process.env.FRONTEND_PORT, 10);
    console.log(`  (Testing web portal on port :${webPort})`);

    const gatewayDb = await checkUrl(`http://127.0.0.1:${webPort}/api/test-db`);
    assert("Gateway/Server serves /api/test-db", gatewayDb.status === 200 && gatewayDb.data.includes("connected"));

    const landingHtml = await checkUrl(`http://127.0.0.1:${webPort}/`);
    assert("Landing route / serves HTML bundle", landingHtml.status === 200 && landingHtml.data.includes("<!doctype html>"));

    const loginHtml = await checkUrl(`http://127.0.0.1:${webPort}/login`);
    assert("Auth route /login serves HTML bundle", loginHtml.status === 200 && loginHtml.data.includes("<!doctype html>"));

    const userHtml = await checkUrl(`http://127.0.0.1:${webPort}/user-dashboard`);
    assert("User route /user-dashboard serves user bundle", userHtml.status === 200 && (userHtml.data.includes("user") || userHtml.data.includes("<!doctype html>")));

    const policeHtml = await checkUrl(`http://127.0.0.1:${webPort}/police-dashboard`);
    assert("Police route /police-dashboard serves police bundle", policeHtml.status === 200 && (policeHtml.data.includes("police") || policeHtml.data.includes("<!doctype html>")));

    const adminHtml = await checkUrl(`http://127.0.0.1:${webPort}/admin`);
    assert("Admin route /admin serves admin bundle", adminHtml.status === 200 && (adminHtml.data.includes("admin") || adminHtml.data.includes("<!doctype html>")));

    const contactHtml = await checkUrl(`http://127.0.0.1:${webPort}/contact-us`);
    assert("Contact route /contact-us serves contact bundle", contactHtml.status === 200 && (contactHtml.data.includes("contact") || contactHtml.data.includes("<!doctype html>")));

    const reportHtml = await checkUrl(`http://127.0.0.1:${webPort}/reporting`);
    assert("Reporting route /reporting serves reporting bundle", reportHtml.status === 200 && (reportHtml.data.includes("reporting") || reportHtml.data.includes("<!doctype html>")));

    console.log("\n--- 3. Registration, OTP & Authentication Flow ---");
    const testStamp = Date.now();
    const testUsername = `user_${testStamp}`;
    const testEmail = `user_${testStamp}@example.com`;
    const testPassword = "Password123!";

    // Test Registration
    const regRes = await checkUrl(
      "http://127.0.0.1:5000/api/auth/register/user",
      "POST",
      JSON.stringify({ username: testUsername, email: testEmail, password: testPassword, confirmPassword: testPassword })
    );
    assert(
      "User registration succeeds (201 Created) without consumed_at error",
      regRes.status === 201,
      `Status: ${regRes.status}, Body: ${regRes.data}`
    );

    // Verify OTP token was created in DB
    const otpDbRes = await pool.query(
      "SELECT id, code_hash, purpose, consumed_at, expires_at FROM otp_tokens WHERE email = $1 ORDER BY id DESC LIMIT 1",
      [testEmail]
    );
    assert(
      "OTP token row successfully created in PostgreSQL with consumed_at NULL",
      otpDbRes.rows.length === 1 && otpDbRes.rows[0].consumed_at === null
    );

    // Test Unverified User Login (returns 403 EMAIL_NOT_VERIFIED)
    const unverifiedLogin = await checkUrl(
      "http://127.0.0.1:5000/api/auth/login",
      "POST",
      JSON.stringify({ username: testUsername, password: testPassword })
    );
    assert(
      "Login for unverified user returns 403 EMAIL_NOT_VERIFIED",
      unverifiedLogin.status === 403 && unverifiedLogin.data.includes("EMAIL_NOT_VERIFIED")
    );

    // Test OTP Verification with invalid code
    const invalidOtpRes = await checkUrl(
      "http://127.0.0.1:5000/api/auth/verify-email",
      "POST",
      JSON.stringify({ email: testEmail, otp: "000000" })
    );
    assert(
      "OTP verification rejects invalid code (400 Bad Request)",
      invalidOtpRes.status === 400
    );

    // Verify user by setting verified = true in DB to test verified login & session
    await pool.query("UPDATE users SET verified = true WHERE email = $1", [testEmail]);
    await pool.query("UPDATE otp_tokens SET consumed_at = NOW() WHERE email = $1", [testEmail]);

    // Test Verified User Login (returns 200 with JWT token)
    const verifiedLogin = await checkUrl(
      "http://127.0.0.1:5000/api/auth/login",
      "POST",
      JSON.stringify({ username: testUsername, password: testPassword })
    );
    let userToken = null;
    try {
      const parsed = JSON.parse(verifiedLogin.data);
      userToken = parsed.token;
    } catch (_) {}
    assert(
      "Verified user login succeeds (200 OK) and returns JWT session token",
      verifiedLogin.status === 200 && !!userToken
    );

    // Test Protected User Endpoint with JWT token
    const protectedWithToken = await checkUrl(
      "http://127.0.0.1:5000/api/children",
      "GET",
      null,
      { Authorization: `Bearer ${userToken}` }
    );
    assert(
      "Protected /api/children allows access with valid JWT token (200 OK)",
      protectedWithToken.status === 200
    );

    console.log("\n--- 4. Role Authorization & Portal Security ---");
    const authProtected = await checkUrl("http://127.0.0.1:5000/api/children");
    assert("Protected /api/children rejects unauthenticated requests (401)", authProtected.status === 401);

    const policeProtected = await checkUrl("http://127.0.0.1:5000/api/police/cases");
    assert("Police /api/police/cases rejects unauthenticated requests (401)", policeProtected.status === 401);

    const badLogin = await checkUrl(
      "http://127.0.0.1:5000/api/auth/login",
      "POST",
      JSON.stringify({ username: "nonexistent_user", password: "wrongpassword" })
    );
    assert("Auth login rejects nonexistent credentials with 401", badLogin.status === 401);

    // Clean up test user
    await pool.query("DELETE FROM users WHERE email = $1", [testEmail]);
    await pool.query("DELETE FROM otp_tokens WHERE email = $1", [testEmail]);

  } finally {
    await pool.end();
  }

  console.log("\n==================================================");
  console.log(`RESULTS: ${totalPassed} / ${totalTests} tests passed (${Math.round((totalPassed/totalTests)*100)}%)`);
  console.log("==================================================");

  if (totalPassed !== totalTests) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { checkUrl, runTests };
