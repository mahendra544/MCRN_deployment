const dns = require("node:dns");
if (dns && dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}
const path = require("path");
const fs = require("fs");
const backendModules = path.resolve(__dirname, "../backend/node_modules");
if (fs.existsSync(backendModules)) {
  module.paths.unshift(backendModules);
}
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const http = require("http");
const bcrypt = require("bcryptjs");
const pool = require("../backend/src/db");

function post(endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: 5000,
        path: endpoint,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data)
        }
      },
      (res) => {
        let resBody = "";
        res.on("data", (chunk) => (resBody += chunk));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(resBody);
          } catch (_) {}
          resolve({ status: res.statusCode, data: json, raw: resBody });
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("==================================================");
  console.log("       MCRN FULL OTP LIFECYCLE TEST SUITE         ");
  console.log("==================================================\n");

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

  const ts = Date.now();
  const testEmail1 = `test_otp_verify_${ts}@mcrn-test.org`;
  const testUsername1 = `user_otp_${ts}`;
  const password = "ValidPassword123!";
  const knownOtp = "789123";

  try {
    // 1. Citizen Registration creates user & OTP token record
    console.log("--- 1. Registration & OTP Generation ---");
    const regRes = await post("/api/auth/register/user", {
      username: testUsername1,
      email: testEmail1,
      password,
      confirmPassword: password
    });
    assert("1.1 Citizen registration returns 201 Created", regRes.status === 201);

    const [tokenRows] = await pool.query(
      "SELECT id, code_hash, purpose, consumed_at, (expires_at > NOW()) as not_expired FROM otp_tokens WHERE email = ? ORDER BY id DESC LIMIT 1",
      [testEmail1]
    );
    const otpRecord = tokenRows && tokenRows[0];
    assert("1.2 OTP record created in PostgreSQL", !!otpRecord);
    assert("1.3 OTP record has secure code_hash", !!otpRecord?.code_hash);
    assert("1.4 OTP record consumed_at is NULL initially", otpRecord?.consumed_at === null);
    assert("1.5 OTP not_expired is true", otpRecord?.not_expired === true);

    // 2. Unverified citizen login rejected with 403 EMAIL_NOT_VERIFIED
    console.log("\n--- 2. Unverified User Login Handling ---");
    const unverifiedLogin = await post("/api/auth/login", {
      username: testUsername1,
      password
    });
    assert("2.1 Unverified login returns 403 EMAIL_NOT_VERIFIED", unverifiedLogin.status === 403 && unverifiedLogin.data?.message === "EMAIL_NOT_VERIFIED");

    // 3. Invalid OTP code rejection
    console.log("\n--- 3. Invalid OTP Rejection ---");
    const badOtpRes = await post("/api/auth/verify-email", {
      email: testEmail1,
      otp: "000000"
    });
    assert("3.1 Invalid OTP code rejected with 400 Bad Request", badOtpRes.status === 400);

    // 4. Verification with valid OTP
    console.log("\n--- 4. Correct OTP Verification ---");
    // Inject known bcrypt hash into the active token row to verify exact OTP comparison
    const knownHash = await bcrypt.hash(knownOtp, 12);
    await pool.query("UPDATE otp_tokens SET code_hash = ? WHERE id = ?", [knownHash, otpRecord.id]);

    const goodOtpRes = await post("/api/auth/verify-email", {
      email: testEmail1,
      otp: knownOtp
    });
    assert("4.1 Valid OTP verification succeeds with 200 OK", goodOtpRes.status === 200);

    const [userRows] = await pool.query("SELECT verified FROM users WHERE email = ?", [testEmail1]);
    assert("4.2 User verified status updated to TRUE in PostgreSQL", userRows && userRows[0]?.verified === true);

    const [tokenCheckRows] = await pool.query("SELECT consumed_at FROM otp_tokens WHERE id = ?", [otpRecord.id]);
    assert("4.3 OTP token marked consumed_at in PostgreSQL", tokenCheckRows && tokenCheckRows[0]?.consumed_at !== null);

    // 5. Replay attack rejection: consumed OTP cannot be reused
    console.log("\n--- 5. OTP Reuse / Replay Attack Prevention ---");
    const replayRes = await post("/api/auth/verify-email", {
      email: testEmail1,
      otp: knownOtp
    });
    assert("5.1 Replayed / consumed OTP rejected with 400", replayRes.status === 400);

    // 6. Verified user can now log in
    console.log("\n--- 6. Post-Verification Login ---");
    const verifiedLogin = await post("/api/auth/login", {
      username: testUsername1,
      password
    });
    assert("6.1 Verified citizen login succeeds (200) with JWT session token", verifiedLogin.status === 200 && !!verifiedLogin.data?.token);

    // 7. Resend OTP cooldown and superseding flow
    console.log("\n--- 7. Resend OTP Cooldown & Superseding ---");
    const testEmail2 = `test_otp_resend_${ts}@mcrn-test.org`;
    const testUsername2 = `user_resend_${ts}`;

    await post("/api/auth/register/user", {
      username: testUsername2,
      email: testEmail2,
      password,
      confirmPassword: password
    });

    // Immediate resend should trigger 429 rate limit / cooldown (< 60s)
    const earlyResend = await post("/api/auth/resend-otp", {
      email: testEmail2,
      purpose: "REGISTRATION_VERIFICATION"
    });
    assert("7.1 Early resend within 60s cooldown returns 429", earlyResend.status === 429);

    // Advance created_at past cooldown window in DB
    await pool.query("UPDATE otp_tokens SET created_at = NOW() - INTERVAL '70 SECOND' WHERE email = ?", [testEmail2]);

    const [firstTokenRows] = await pool.query("SELECT id FROM otp_tokens WHERE email = ? AND consumed_at IS NULL", [testEmail2]);
    const firstTokenId = firstTokenRows && firstTokenRows[0]?.id;

    const resendSuccess = await post("/api/auth/resend-otp", {
      email: testEmail2,
      purpose: "REGISTRATION_VERIFICATION"
    });
    assert("7.2 Resend after cooldown succeeds with 200", resendSuccess.status === 200);

    // Verify first token was marked consumed when second token was issued
    const [supersededRows] = await pool.query("SELECT consumed_at FROM otp_tokens WHERE id = ?", [firstTokenId]);
    assert("7.3 Old unconsumed OTP was superseded and marked consumed", supersededRows && supersededRows[0]?.consumed_at !== null);

    // 8. Expired OTP rejection
    console.log("\n--- 8. Expired OTP Handling ---");
    const testEmail3 = `test_otp_expired_${ts}@mcrn-test.org`;
    const testUsername3 = `user_exp_${ts}`;

    await post("/api/auth/register/user", {
      username: testUsername3,
      email: testEmail3,
      password,
      confirmPassword: password
    });

    const [expTokenRows] = await pool.query("SELECT id FROM otp_tokens WHERE email = ? ORDER BY id DESC LIMIT 1", [testEmail3]);
    const expTokenId = expTokenRows && expTokenRows[0]?.id;

    // Set known hash and expire in DB
    const expOtp = "654321";
    const expHash = await bcrypt.hash(expOtp, 12);
    await pool.query(
      "UPDATE otp_tokens SET code_hash = ?, expires_at = NOW() - INTERVAL '5 MINUTE' WHERE id = ?",
      [expHash, expTokenId]
    );

    const expVerify = await post("/api/auth/verify-email", {
      email: testEmail3,
      otp: expOtp
    });
    assert("8.1 Expired OTP verification rejected with 400", expVerify.status === 400);

    // 9. Password Reset OTP Flow
    console.log("\n--- 9. Password Reset OTP Lifecycle ---");
    const testEmail4 = `test_otp_reset_${ts}@mcrn-test.org`;
    const testUsername4 = `user_reset_${ts}`;
    const initialPass = "InitialPass123!";
    const newPass = "NewValidPass456!";

    // Create verified account
    const initHash = await bcrypt.hash(initialPass, 12);
    await pool.query(
      "INSERT INTO users (username, name, email, password_hash, role, verified, active) VALUES (?, ?, ?, ?, 'USER', true, true)",
      [testUsername4, testUsername4, testEmail4, initHash]
    );

    const forgotRes = await post("/api/auth/forgot-password", { email: testEmail4 });
    assert("9.1 Forgot password request succeeds (200)", forgotRes.status === 200);

    const [resetOtpRows] = await pool.query(
      "SELECT id FROM otp_tokens WHERE email = ? AND purpose = 'PASSWORD_RESET' ORDER BY id DESC LIMIT 1",
      [testEmail4]
    );
    assert("9.2 PASSWORD_RESET OTP record created in PostgreSQL", resetOtpRows && resetOtpRows.length === 1);

    const resetTokenId = resetOtpRows && resetOtpRows[0]?.id;
    const resetOtp = "456789";
    const resetHash = await bcrypt.hash(resetOtp, 12);
    await pool.query("UPDATE otp_tokens SET code_hash = ? WHERE id = ?", [resetHash, resetTokenId]);

    // Invalid reset OTP
    const badReset = await post("/api/auth/reset-password", {
      email: testEmail4,
      otp: "111111",
      newPassword: newPass
    });
    assert("9.3 Invalid reset OTP rejected with 400", badReset.status === 400);

    // Valid reset OTP
    const goodReset = await post("/api/auth/reset-password", {
      email: testEmail4,
      otp: resetOtp,
      newPassword: newPass
    });
    assert("9.4 Valid reset OTP succeeds with 200", goodReset.status === 200);

    // Old password fails
    const oldLogin = await post("/api/auth/login", {
      username: testUsername4,
      password: initialPass
    });
    assert("9.5 Old password rejected after reset (401)", oldLogin.status === 401);

    // New password succeeds
    const newLogin = await post("/api/auth/login", {
      username: testUsername4,
      password: newPass
    });
    assert("9.6 New password login succeeds (200)", newLogin.status === 200 && !!newLogin.data?.token);

    // Cleanup all test records
    await pool.query("DELETE FROM otp_tokens WHERE email IN (?, ?, ?, ?)", [testEmail1, testEmail2, testEmail3, testEmail4]);
    await pool.query("DELETE FROM users WHERE email IN (?, ?, ?, ?)", [testEmail1, testEmail2, testEmail3, testEmail4]);
  } catch (err) {
    console.error("Test execution error:", err);
  }

  console.log("\n==================================================");
  console.log(`LIFECYCLE RESULTS: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log("==================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runTests };
