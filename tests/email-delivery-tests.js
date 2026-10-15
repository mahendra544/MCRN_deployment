const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const assert = require("assert");
const {
  validateRecipientEmail,
  checkDomainDeliverability,
  isPlaceholderOrTestDomain,
  isTestRecipient,
  maskEmail,
  createTransporter,
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
  // Test address in test context should be accepted for simulated dispatch WITHOUT calling SMTP
  const isolatedResult = await sendOtp("test_otp_verify_99999@mcrn-test.org", "654321", "REGISTRATION_VERIFICATION", { isTestContext: true });
  test("Test address handled via isolated dev mode", isolatedResult.accepted === true && (isolatedResult.status === "ISOLATED_DEV_SIMULATED" || isolatedResult.status === "TEST_DELIVERY_REDIRECTED"));

  const officerIsolatedResult = await sendOtp("officer_b_1791351349128@police.mcrn.org", "123456", "REGISTRATION_VERIFICATION", { isTestContext: true });
  test("Generated officer address handled via isolated dev mode", officerIsolatedResult.accepted === true && (officerIsolatedResult.status === "ISOLATED_DEV_SIMULATED" || officerIsolatedResult.status === "TEST_DELIVERY_REDIRECTED"));

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
  // TEST 7: SMTP Transporter Configuration & Connection Verification
  // ----------------------------------------------------
  console.log("\n--- 7. SMTP Transporter & Connection Verification ---");
  const transporterInstance = createTransporter();
  test("Creates valid transporter from environment variables", transporterInstance !== null);

  const verifySuccess = await verifyMailer();
  test("SMTP connection verification executes safely", typeof verifySuccess === "boolean");

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
