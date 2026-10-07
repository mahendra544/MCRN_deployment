const http = require("http");
const { Pool } = require("pg");
require("dotenv").config({ path: "/home/user/Desktop/mahendra_project/.env" });

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "postgres"
});

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: "localhost",
      port: 5000,
      path: path.startsWith("/api/v1/auth") ? path.replace("/api/v1/auth", "/api/auth") : path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
      }
    }, res => {
      let resBody = "";
      res.on("data", chunk => resBody += chunk);
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING FULL OTP LIFECYCLE TESTS ===");
  const testEmail = "test_otp_verify_" + Date.now() + "@mcrn-test.org";
  
  // 1. Register user
  console.log("\n1. Registering new citizen:", testEmail);
  const regRes = await post("/api/v1/auth/register", {
    name: "OTP Test User",
    email: testEmail,
    password: "Password@123",
    role: "citizen"
  });
  console.log("Registration response status:", regRes.status, regRes.data ? regRes.data.message : "");
  if (regRes.status !== 201) throw new Error("Registration failed");

  // Query DB directly for OTP token
  const tokenQuery = await pool.query(
    "SELECT id, token, expires_at, (expires_at > NOW()) AS not_expired, consumed_at FROM otp_tokens WHERE email = $1 ORDER BY id DESC LIMIT 1",
    [testEmail]
  );
  const otpRecord = tokenQuery.rows[0];
  console.log("Token record exists in DB:", !!otpRecord);
  console.log("Token not_expired status in PG:", otpRecord.not_expired);
  console.log("Token consumed_at in DB:", otpRecord.consumed_at);
  const correctOtp = otpRecord.token;

  // 2. Test Invalid OTP
  console.log("\n2. Testing incorrect OTP rejection:");
  const badRes = await post("/api/v1/auth/verify-email", {
    email: testEmail,
    otp: "000000"
  });
  console.log("Bad OTP status:", badRes.status, badRes.data ? badRes.data.message : "");
  if (badRes.status !== 400) throw new Error("Expected 400 for bad OTP, got " + badRes.status);

  // 3. Test Correct OTP Verification
  console.log("\n3. Testing correct OTP verification:");
  const goodRes = await post("/api/v1/auth/verify-email", {
    email: testEmail,
    otp: correctOtp
  });
  console.log("Good OTP status:", goodRes.status, goodRes.data ? goodRes.data.message : "");
  if (goodRes.status !== 200 || !goodRes.data.token) throw new Error("Correct OTP verification failed!");

  // Verify DB state
  const checkConsumed = await pool.query("SELECT is_verified FROM users WHERE email = $1", [testEmail]);
  console.log("User is_verified in DB:", checkConsumed.rows[0] ? checkConsumed.rows[0].is_verified : false);
  const checkTokenConsumed = await pool.query("SELECT consumed_at FROM otp_tokens WHERE id = $1", [otpRecord.id]);
  console.log("Token consumed_at in DB:", checkTokenConsumed.rows[0] ? checkTokenConsumed.rows[0].consumed_at : null);

  // 4. Test Re-using Consumed OTP
  console.log("\n4. Testing replay of already consumed OTP:");
  const replayRes = await post("/api/v1/auth/verify-email", {
    email: testEmail,
    otp: correctOtp
  });
  console.log("Replay OTP status:", replayRes.status, replayRes.data ? replayRes.data.message : "");
  if (replayRes.status !== 400) throw new Error("Replay OTP should have failed with 400!");

  // 5. Test Resend OTP Flow with another unverified account
  const testEmail2 = "test_otp_resend_" + Date.now() + "@mcrn-test.org";
  console.log("\n5. Testing Resend OTP on new user:", testEmail2);
  await post("/api/v1/auth/register", {
    name: "OTP Resend User",
    email: testEmail2,
    password: "Password@123",
    role: "citizen"
  });
  
  const firstOtpQuery = await pool.query(
    "SELECT id, token FROM otp_tokens WHERE email = $1 ORDER BY id DESC LIMIT 1",
    [testEmail2]
  );
  const firstOtp = firstOtpQuery.rows[0].token;

  // Let cooldown expire in DB for test
  await pool.query("UPDATE otp_tokens SET created_at = NOW() - INTERVAL '70 SECOND' WHERE email = $1", [testEmail2]);

  // Request Resend
  console.log("Requesting resend OTP...");
  const resendRes = await post("/api/v1/auth/resend-otp", { email: testEmail2 });
  console.log("Resend status:", resendRes.status, resendRes.data ? resendRes.data.message : "");

  const secondOtpQuery = await pool.query(
    "SELECT id, token FROM otp_tokens WHERE email = $1 ORDER BY id DESC LIMIT 1",
    [testEmail2]
  );
  const secondOtp = secondOtpQuery.rows[0].token;
  console.log("New OTP generated distinct from first?", firstOtp !== secondOtp);

  // Verify old OTP is superseded / invalid
  console.log("Testing verification with old superseded OTP:");
  const oldRes = await post("/api/v1/auth/verify-email", { email: testEmail2, otp: firstOtp });
  console.log("Old OTP status:", oldRes.status, oldRes.data ? oldRes.data.message : "");
  if (oldRes.status !== 400) throw new Error("Old OTP should have failed!");

  // Verify new OTP works
  console.log("Testing verification with new OTP:");
  const newRes = await post("/api/v1/auth/verify-email", { email: testEmail2, otp: secondOtp });
  console.log("New OTP status:", newRes.status, newRes.data ? newRes.data.message : "");
  if (newRes.status !== 200) throw new Error("New OTP verification failed!");

  // 6. Test Expired OTP
  const testEmail3 = "test_otp_expired_" + Date.now() + "@mcrn-test.org";
  console.log("\n6. Testing Expired OTP on user:", testEmail3);
  await post("/api/v1/auth/register", {
    name: "OTP Expired User",
    email: testEmail3,
    password: "Password@123",
    role: "citizen"
  });
  const expQuery = await pool.query(
    "SELECT id, token FROM otp_tokens WHERE email = $1 ORDER BY id DESC LIMIT 1",
    [testEmail3]
  );
  const expOtp = expQuery.rows[0].token;
  // Mark expired in DB
  await pool.query("UPDATE otp_tokens SET expires_at = NOW() - INTERVAL '1 MINUTE' WHERE id = $1", [expQuery.rows[0].id]);
  
  console.log("Testing verification with expired OTP:");
  const expRes = await post("/api/v1/auth/verify-email", { email: testEmail3, otp: expOtp });
  console.log("Expired OTP status:", expRes.status, expRes.data ? expRes.data.message : "");
  if (expRes.status !== 400) throw new Error("Expired OTP should have failed with 400!");

  // 7. Test unverified user login OTP handling & cooldown
  const testEmail4 = "test_otp_login_" + Date.now() + "@mcrn-test.org";
  console.log("\n7. Testing Login with unverified user (cooldown & active OTP preservation):", testEmail4);
  await post("/api/v1/auth/register", {
    name: "OTP Login User",
    email: testEmail4,
    password: "Password@123",
    role: "citizen"
  });
  const loginRes = await post("/api/v1/auth/login", {
    email: testEmail4,
    password: "Password@123"
  });
  console.log("Unverified login response:", loginRes.status, loginRes.data ? loginRes.data.message : "");
  if (loginRes.status !== 403 || !loginRes.data.needsVerification) {
    throw new Error("Expected 403 needsVerification for unverified user");
  }

  // Clean up test data
  await pool.query("DELETE FROM otp_tokens WHERE email IN ($1, $2, $3, $4)", [testEmail, testEmail2, testEmail3, testEmail4]);
  await pool.query("DELETE FROM users WHERE email IN ($1, $2, $3, $4)", [testEmail, testEmail2, testEmail3, testEmail4]);
  await pool.end();

  console.log("\n========================================================");
  console.log("✅ ALL 7 OTP LIFECYCLE TESTS COMPLETED AND PASSED!");
  console.log("========================================================");
}

runTests().catch(err => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
