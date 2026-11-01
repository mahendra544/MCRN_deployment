const { verifyMailer, sendMailSafe, validateRecipientEmail, isTestRecipient, maskEmail } = require("../src/utils/mail");
const pool = require("../src/db");

async function main() {
  const recipient = (process.env.EMAIL_DIAGNOSTIC_RECIPIENT || "").trim();
  if (!recipient) {
    throw new Error("Set EMAIL_DIAGNOSTIC_RECIPIENT to the one inbox allowed to receive a diagnostic email.");
  }
  if (isTestRecipient(recipient)) {
    throw new Error("EMAIL_DIAGNOSTIC_RECIPIENT must be a real test inbox, not a placeholder or generated test address.");
  }
  if (!(await verifyMailer())) {
    throw new Error("Google Apps Script email delivery is not configured.");
  }

  const validation = await validateRecipientEmail(recipient);
  if (!validation.valid) {
    throw new Error(`Diagnostic recipient is invalid [${validation.errorType}].`);
  }

  const delivery = await sendMailSafe({
    to: recipient,
    subject: "[MCRN] Email delivery diagnostic",
    text: "This is a test message from the explicitly configured MCRN email diagnostic.",
    isTestContext: false,
    purpose: "EMAIL_DIAGNOSTIC"
  });
  if (!delivery.accepted) {
    throw new Error("Google Apps Script did not confirm diagnostic email delivery.");
  }
  console.log(`[EMAIL_DIAGNOSTIC] Delivery confirmed for ${maskEmail(recipient)}.`);
}

main()
  .catch((error) => {
    console.error(`[EMAIL_DIAGNOSTIC] Failed [${error.code || "diagnostic_error"}].`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
