const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const assert = require("assert");
const {
  validateRecipientEmail,
  checkDomainDeliverability,
  isPlaceholderOrTestDomain,
  isTestRecipient,
  maskEmail,
  verifyMailer,
  sendOtp,
  sendMailSafe,
  sendAdminPasswordReset,
  sendPoliceNotification,
  isSuppressed,
  recordPermanentFailure,
  clearSuppression
} = require("../backend/src/utils/mail");

async function runEmailTests() {
  console.log("==================================================");
  console.log("   MCRN EMAIL DELIVERY & RECIPIENT SAFETY SUITE   ");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function test(name, condition, details = "") {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] ${name}`);
    } else {
      console.error(`  ❌ [FAIL] ${name} ${details ? `(${details})` : ""}`);
    }
  }

  // ----------------------------------------------------
  // TEST 1: Email Masking & Secret Protection
  // ----------------------------------------------------
  console.log("--- 1. Email Masking & Secret Protection ---");
  const masked1 = maskEmail("officer_b_1791351349128@police.mcrn.org");
  test("Masks generated police address local part", masked1.startsWith("o***8@police.mcrn.org"));

  const masked2 = maskEmail("test_otp_verify_12345@mcrn-test.org");
  test("Masks test OTP address", masked2.startsWith("t***5@mcrn-test.org"));

  const maskedInvalid = maskEmail("not-an-email");
  test("Handles malformed email safely in mask", maskedInvalid.includes("malformed") || maskedInvalid.includes("invalid"));

  // ----------------------------------------------------
  // TEST 2: Recipient Type Classification
  // ----------------------------------------------------
  console.log("\n--- 2. Placeholder & Test Domain Classification ---");
  test("Identifies police.mcrn.org as placeholder domain", isPlaceholderOrTestDomain("police.mcrn.org"));
  test("Identifies mcrn-test.org as placeholder domain", isPlaceholderOrTestDomain("mcrn-test.org"));
  test("Identifies example.com as placeholder domain", isPlaceholderOrTestDomain("example.com"));
  test("Identifies gmail.com as real domain", !isPlaceholderOrTestDomain("gmail.com"));

  test("Identifies officer_b_1791351349128@police.mcrn.org as test recipient",
    isTestRecipient("officer_b_1791351349128@police.mcrn.org"));
  test("Identifies test_otp_verify_12345@mcrn-test.org as test recipient",
    isTestRecipient("test_otp_verify_12345@mcrn-test.org"));
  test("Identifies regular user as non-test recipient",
    !isTestRecipient("regular_user@gmail.com"));

  // ----------------------------------------------------
  // TEST 3: Recipient Validation & Identifier Rejection
  // ----------------------------------------------------
  console.log("\n--- 3. Recipient Selection & Identifier Rejection ---");
  const missingCheck = await validateRecipientEmail("");
  test("Rejects empty recipient with MISSING_RECIPIENT", !missingCheck.valid && missingCheck.errorType === "MISSING_RECIPIENT");

  const nullCheck = await validateRecipientEmail(null);
  test("Rejects null recipient safely", !nullCheck.valid && nullCheck.errorType === "MISSING_RECIPIENT");

  const badgeCheck = await validateRecipientEmail("BADGE_12345");
  test("Rejects badge identifier without @", !badgeCheck.valid && badgeCheck.errorType === "NOT_AN_EMAIL");

  const usernameCheck = await validateRecipientEmail("officer_b_1791351349128");
  test("Rejects raw username without @", !usernameCheck.valid && usernameCheck.errorType === "NOT_AN_EMAIL");

  const formatCheck = await validateRecipientEmail("not-an-email@");
  test("Rejects malformed email string", !formatCheck.valid && formatCheck.errorType === "INVALID_EMAIL_FORMAT");

  // ----------------------------------------------------
  // TEST 4: DNS MX Deliverability & Null MX Handling
  // ----------------------------------------------------
  console.log("\n--- 4. DNS MX Deliverability Verification ---");
  const nullMxCheck = await checkDomainDeliverability("example.com");
  test("Detects undeliverable placeholder / null MX on example.com", !nullMxCheck.deliverable && (nullMxCheck.errorType === "NULL_MX_RECORD" || nullMxCheck.errorType === "RESERVED_PLACEHOLDER_DOMAIN"));

  const placeholderCheck = await checkDomainDeliverability("police.mcrn.org");
  test("Detects placeholder domain on police.mcrn.org", !placeholderCheck.deliverable && placeholderCheck.errorType === "RESERVED_PLACEHOLDER_DOMAIN");

  const nonExistentCheck = await checkDomainDeliverability("this-domain-definitely-does-not-exist-9876543210.com");
  test("Detects non-existent domain", !nonExistentCheck.deliverable && (nonExistentCheck.errorType === "DOMAIN_NOT_FOUND" || nonExistentCheck.errorType === "NO_MX_RECORDS"));

  const validDomainCheck = await checkDomainDeliverability("gmail.com");
  test("Validates deliverability for gmail.com", validDomainCheck.deliverable === true);

  // ----------------------------------------------------
  // TEST 5: Isolated Development OTP Mechanism
  // ----------------------------------------------------
  console.log("\n--- 5. Isolated Development Mode Delivery ---");
  const previousTestRecipient = process.env.TEST_EMAIL_RECIPIENT;
  delete process.env.TEST_EMAIL_RECIPIENT;
  // Test address in test context should be accepted for simulated dispatch without calling the remote email service
  const isolatedResult = await sendOtp("test_otp_verify_99999@mcrn-test.org", "654321", "REGISTRATION_VERIFICATION", { isTestContext: true });
  test("Test address handled via isolated dev mode", isolatedResult.accepted === true && (isolatedResult.status === "ISOLATED_DEV_SIMULATED" || isolatedResult.status === "TEST_DELIVERY_REDIRECTED"));

  const officerIsolatedResult = await sendOtp("officer_b_1791351349128@police.mcrn.org", "123456", "REGISTRATION_VERIFICATION", { isTestContext: true });
  test("Generated officer address handled via isolated dev mode", officerIsolatedResult.accepted === true && (officerIsolatedResult.status === "ISOLATED_DEV_SIMULATED" || officerIsolatedResult.status === "TEST_DELIVERY_REDIRECTED"));
  if (previousTestRecipient === undefined) delete process.env.TEST_EMAIL_RECIPIENT;
  else process.env.TEST_EMAIL_RECIPIENT = previousTestRecipient;

  // ----------------------------------------------------
  // TEST 6: Permanent Failure Suppression
  // ----------------------------------------------------
  console.log("\n--- 6. Permanent Failure Suppression ---");
  const testFailEmail = "bounced_user_test_999@bad-domain-fail.com";
  clearSuppression(testFailEmail);

  test("Initially not suppressed", !(await isSuppressed(testFailEmail)));

  await recordPermanentFailure(testFailEmail, "Mailbox does not exist (550 User Unknown)", "RECIPIENT_MAILBOX_ERROR");
  const suppressedNow = await isSuppressed(testFailEmail);
  test("Recognized as suppressed after permanent failure", Boolean(suppressedNow) && suppressedNow.errorType === "RECIPIENT_MAILBOX_ERROR");

  const validationUnderSuppression = await validateRecipientEmail(testFailEmail);
  test("Validation rejects suppressed address early", !validationUnderSuppression.valid && validationUnderSuppression.isSuppressed === true);

  clearSuppression(testFailEmail);
  test("Can clear suppression after resolution", !(await isSuppressed(testFailEmail)));

  // ----------------------------------------------------
  // TEST 7: Google Apps Script Configuration, Redirects, Responses, and Failures
  // ----------------------------------------------------
  console.log("\n--- 7. Google Apps Script Configuration & Delivery ---");
  const previousUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const previousSecret = process.env.MCRN_SECRET;
  const previousFetch = global.fetch;
  process.env.GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/test-deployment/exec";
  process.env.MCRN_SECRET = "test-google-apps-script-secret";

  try {
    test("Google Apps Script configuration verification executes safely", await verifyMailer() === true);
    process.env.GOOGLE_APPS_SCRIPT_URL = "http://script.google.com/macros/s/test-deployment/exec";
    test("Rejects non-HTTPS Apps Script configuration", await verifyMailer() === false);
    process.env.GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/test-deployment/exec";

    const recipient = "mcrn_google_apps_script_test_2026@gmail.com";
    let capturedRequest;
    global.fetch = async (url, options) => {
      capturedRequest = { url, options, body: JSON.parse(options.body) };
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    };
    const delivered = await sendMailSafe({
      to: recipient,
      subject: "Google Apps Script success test",
      text: "MCRN email body test",
      html: "<p>MCRN HTML body test</p>",
      purpose: "EMAIL_DELIVERY_TEST"
    });
    test("Accepts final successful Google Apps Script JSON response", delivered.accepted === true
      && delivered.status === "ACCEPTED_BY_GOOGLE_APPS_SCRIPT");
    test("POSTs to the configured endpoint and follows Apps Script redirects", Boolean(capturedRequest)
      && capturedRequest.url === process.env.GOOGLE_APPS_SCRIPT_URL
      && capturedRequest.options.method === "POST"
      && capturedRequest.options.redirect === "follow");
    test("Sends configured secret, recipient, subject, body, and HTML body", Boolean(capturedRequest)
      && capturedRequest.body.secret === process.env.MCRN_SECRET
      && capturedRequest.body.to === recipient
      && capturedRequest.body.subject === "Google Apps Script success test"
      && capturedRequest.body.body === "MCRN email body test"
      && capturedRequest.body.htmlBody === "<p>MCRN HTML body test</p>");

    await sendMailSafe({
      to: recipient,
      subject: "Google Apps Script text-only test",
      text: "MCRN text-only body test",
      purpose: "EMAIL_DELIVERY_TEST"
    });
    test("Omits htmlBody when no HTML template is available", !Object.hasOwn(capturedRequest.body, "htmlBody")
      && capturedRequest.body.body === "MCRN text-only body test");

    global.fetch = async (url, options) => {
      capturedRequest = { url, options, body: JSON.parse(options.body) };
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    };
    const otpResult = await sendOtp(recipient, "123456", "PASSWORD_RESET");
    test("Sends forgot-password OTP with the existing template", otpResult.accepted === true
      && capturedRequest.body.subject === "[MCRN] Reset Your Password"
      && capturedRequest.body.body.includes("Verification Code: 123456")
      && capturedRequest.body.htmlBody.includes("123456"));

    await sendOtp(recipient, "654321", "REGISTRATION_VERIFICATION");
    test("Sends registration OTP with the existing template", capturedRequest.body.subject === "[MCRN] Verify Your Account"
      && capturedRequest.body.body.includes("Verification Code: 654321")
      && capturedRequest.body.htmlBody.includes("654321"));

    await sendAdminPasswordReset(recipient, "https://mcrn.example/admin/reset-password/token");
    test("Sends admin password-reset email with its existing content", capturedRequest.body.subject === "Reset Your Admin Portal Password"
      && capturedRequest.body.body.includes("https://mcrn.example/admin/reset-password/token")
      && capturedRequest.body.htmlBody.includes("https://mcrn.example/admin/reset-password/token"));

    await sendPoliceNotification({
      officerEmail: recipient,
      subject: "New Case Assignment: Case #1",
      text: "Case #1 has been assigned.",
      html: "<p>Case #1 has been assigned.</p>"
    });
    test("Sends police notification with its existing content", capturedRequest.body.subject === "[MCRN Police Alert] New Case Assignment: Case #1"
      && capturedRequest.body.body === "Case #1 has been assigned."
      && capturedRequest.body.htmlBody === "<p>Case #1 has been assigned.</p>");

    const makeConnectTimeoutError = () => {
      const attempts = [
        Object.assign(new Error("Hidden connection detail"), {
          code: "ETIMEDOUT", syscall: "connect", family: 4, port: 443, address: "203.0.113.10"
        })
      ];
      const cause = new AggregateError(attempts, "Network failure details must not be logged");
      cause.code = "ETIMEDOUT";
      cause.hostname = "script.google.com";
      const error = new TypeError("fetch failed");
      error.cause = cause;
      return error;
    };

    let retryCount = 0;
    global.fetch = async () => {
      retryCount++;
      if (retryCount === 1) throw makeConnectTimeoutError();
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      };
    };
    const retriedDelivery = await sendMailSafe({
      to: recipient,
      subject: "Google Apps Script connection retry test",
      text: "MCRN retry test",
      purpose: "EMAIL_DELIVERY_TEST"
    });
    test("Retries a confirmed pre-connection failure once", retryCount === 2
      && retriedDelivery.accepted === true
      && retriedDelivery.status === "ACCEPTED_BY_GOOGLE_APPS_SCRIPT");

    global.fetch = async () => new Response(JSON.stringify({
      success: false
    }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
    try {
      await sendMailSafe({ to: recipient, subject: "Script failure test", text: "Not delivered" });
      test("Rejects HTTP 200 with unsuccessful JSON without claiming delivery", false);
    } catch (error) {
      test("Rejects HTTP 200 with unsuccessful JSON without claiming delivery", error.status === 503
        && error.code === "GOOGLE_APPS_SCRIPT_REJECTED");
    }

    global.fetch = async () => new Response("not JSON", {
      status: 200,
      headers: { "content-type": "text/plain" }
    });
    try {
      await sendMailSafe({ to: recipient, subject: "Invalid response test", text: "Not delivered" });
      test("Rejects non-JSON final response without claiming delivery", false);
    } catch (error) {
      test("Rejects non-JSON final response without claiming delivery", error.status === 503
        && error.code === "GOOGLE_APPS_SCRIPT_INVALID_RESPONSE");
    }

    global.fetch = async () => new Response(JSON.stringify({ success: true }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
    try {
      await sendMailSafe({ to: recipient, subject: "HTTP failure test", text: "Not delivered" });
      test("Rejects non-2xx response without claiming delivery", false);
    } catch (error) {
      test("Rejects non-2xx response without claiming delivery", error.status === 503
        && error.code === "GOOGLE_APPS_SCRIPT_REJECTED");
    }

    let failedAttemptCount = 0;
    global.fetch = async () => {
      failedAttemptCount++;
      throw makeConnectTimeoutError();
    };
    const previousConsoleError = console.error;
    const previousConsoleWarn = console.warn;
    const errorLogs = [];
    const warningLogs = [];
    console.error = (...args) => errorLogs.push(args.join(" "));
    console.warn = (...args) => warningLogs.push(args.join(" "));
    try {
      await sendMailSafe({ to: recipient, subject: "Network timeout test", text: "Not delivered" });
      test("Handles network timeout without claiming delivery", false);
    } catch (error) {
      test("Handles persistent fetch network errors without claiming delivery", error.status === 503
        && error.code === "GOOGLE_APPS_SCRIPT_NETWORK_ERROR"
        && !error.message.includes(recipient)
        && failedAttemptCount === 2);
    } finally {
      console.error = previousConsoleError;
      console.warn = previousConsoleWarn;
    }
    const networkLog = errorLogs.join("\n");
    const retryLog = warningLogs.join("\n");
    test("Logs safe network cause details", networkLog.includes("name=TypeError")
      && networkLog.includes("causeCode=ETIMEDOUT")
      && networkLog.includes("host=script.google.com")
      && networkLog.includes("attempts=code=ETIMEDOUT syscall=connect family=4 port=443"));
    test("Retries at most once and logs only safe connection metadata", failedAttemptCount === 2
      && retryLog.includes("Retrying Google Apps Script request once")
      && !retryLog.includes(recipient)
      && !retryLog.includes(process.env.MCRN_SECRET)
      && !retryLog.includes("203.0.113.10"));
    test("Network diagnostics omit endpoint path, secret, recipient, and error message", !networkLog.includes(recipient)
      && !networkLog.includes(process.env.MCRN_SECRET)
      && !networkLog.includes("test-deployment")
      && !networkLog.includes("Network failure details must not be logged")
      && !networkLog.includes("Hidden connection detail")
      && !networkLog.includes("203.0.113.10"));
  } finally {
    global.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.GOOGLE_APPS_SCRIPT_URL;
    else process.env.GOOGLE_APPS_SCRIPT_URL = previousUrl;
    if (previousSecret === undefined) delete process.env.MCRN_SECRET;
    else process.env.MCRN_SECRET = previousSecret;
  }

  // ----------------------------------------------------
  // TEST 8: Police Notification Recipient Selection
  // ----------------------------------------------------
  console.log("\n--- 8. Police Notification Recipient Selection ---");
  try {
    await sendPoliceNotification({ officerId: null, officerEmail: "not-an-email-badge-123" });
    test("Rejects invalid officer email format", false);
  } catch (err) {
    test("Rejects invalid officer email format with error", err.code === "NOT_AN_EMAIL" || err.status === 400);
  }

  try {
    await sendPoliceNotification({ officerId: "nonexistent-officer-999999", officerEmail: null });
    test("Handles unconfigured officer notification safely", false);
  } catch (err) {
    test("Handles unconfigured officer notification safely", err.code === "NO_POLICE_RECIPIENT" || err.status === 400);
  }

  console.log("\n==================================================");
  console.log(`RESULTS: ${passed} / ${total} tests passed (${Math.round((passed / total) * 100)}%)`);
  console.log("==================================================");

  let pool;
  try { pool = require("../backend/src/db"); } catch (_) {}
  if (pool && typeof pool.end === "function") {
    await pool.end().catch(() => {});
  }

  if (passed !== total) {
    process.exit(1);
  }
}

if (require.main === module) {
  runEmailTests().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  });
}

module.exports = { runEmailTests };
