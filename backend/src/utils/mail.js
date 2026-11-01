const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });
const nodeDns = require("node:dns");
if (nodeDns && nodeDns.setDefaultResultOrder) {
  nodeDns.setDefaultResultOrder("ipv4first");
}
const dns = nodeDns.promises;

let pool = null;
try {
  pool = require("../db");
} catch (_) {}

// In-memory caches to prevent repeated slow queries / DNS lookups
const domainMxCache = new Map(); // domain -> { valid: boolean, errorType?: string, message?: string, expiresAt: number }
const inMemorySuppressionCache = new Map(); // normalizedEmail -> { reason: string, errorType: string, timestamp: number }

const MX_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const SUPPRESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Fictitious / placeholder / reserved test domains that cannot receive real emails
const KNOWN_PLACEHOLDER_DOMAINS = new Set([
  "police.mcrn.org",
  "mcrn.org",
  "mcrn-test.org",
  "testmcrn.org",
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "invalid",
  "localhost"
]);

function maskEmail(email) {
  if (!email || typeof email !== "string") return "[invalid-recipient]";
  const parts = email.trim().split("@");
  if (parts.length !== 2) return "[malformed-recipient]";
  const [local, domain] = parts;
  if (local.length <= 2) {
    return `*@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

function isPlaceholderOrTestDomain(domain) {
  if (!domain || typeof domain !== "string") return false;
  const d = domain.trim().toLowerCase();
  if (KNOWN_PLACEHOLDER_DOMAINS.has(d)) return true;
  if (d.endsWith(".mcrn.org")) return true;
  if (d.endsWith(".test") || d.endsWith(".example") || d.endsWith(".invalid") || d.endsWith(".localhost")) return true;
  return false;
}

function isTestRecipient(email) {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  const domain = normalized.split("@")[1] || "";

  if (isPlaceholderOrTestDomain(domain)) return true;
  if (/^test(_otp)?_/i.test(normalized)) return true;
  if (/^officer(_[a-z0-9]+)*_\d+/i.test(normalized)) return true;
  if (/^citizen(_[a-z0-9]+)*_\d+/i.test(normalized)) return true;
  if (/^(user|test|mock)_\d+@/i.test(normalized)) return true;

  return false;
}

function isTestEnvironment() {
  return (
    process.env.NODE_ENV === "test" ||
    String(process.env.MCRN_DEV_OTP_MODE || "").toLowerCase() === "true" ||
    String(process.env.TEST_MODE || "").toLowerCase() === "true"
  );
}

// ----------------------------------------------------
// PERMANENT FAILURE SUPPRESSION
// ----------------------------------------------------

async function isSuppressed(email) {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();

  // 1. Check in-memory suppression
  const cached = inMemorySuppressionCache.get(normalized);
  if (cached) {
    if (cached.cleared) return false;
    if (Date.now() - cached.timestamp < SUPPRESSION_TTL_MS) {
      return cached;
    }
    inMemorySuppressionCache.delete(normalized);
  }

  // 2. Check DB suppression table if available
  if (pool && typeof pool.query === "function") {
    try {
      const [rows] = await pool.query(
        "SELECT reason, failure_type, suppressed_at FROM email_suppressions WHERE email = ? AND suppressed_at > NOW() - INTERVAL '24 HOUR' LIMIT 1",
        [normalized]
      );
      const row = Array.isArray(rows) ? rows[0] : rows;
      if (row) {
        const result = {
          reason: row.reason,
          errorType: row.failure_type,
          timestamp: new Date(row.suppressed_at).getTime()
        };
        inMemorySuppressionCache.set(normalized, result);
        return result;
      }
    } catch (_) {}
  }

  return false;
}

async function recordPermanentFailure(email, reason, errorType = "PERMANENT_DELIVERY_FAILURE") {
  if (!email || typeof email !== "string") return;
  const normalized = email.trim().toLowerCase();

  inMemorySuppressionCache.set(normalized, {
    reason,
    errorType,
    timestamp: Date.now()
  });

  if (pool && typeof pool.query === "function") {
    try {
      await pool.query(
        `INSERT INTO email_suppressions (email, reason, failure_type, suppressed_at)
         VALUES (?, ?, ?, NOW())
         ON CONFLICT (email) DO UPDATE SET reason = EXCLUDED.reason, failure_type = EXCLUDED.failure_type, suppressed_at = NOW()`,
        [normalized, reason, errorType]
      );
    } catch (_) {}
  }
}

function clearSuppression(email) {
  if (!email || typeof email !== "string") return;
  const normalized = email.trim().toLowerCase();
  inMemorySuppressionCache.set(normalized, { cleared: true, timestamp: Date.now() });
  if (pool && typeof pool.query === "function") {
    return pool.query("DELETE FROM email_suppressions WHERE email = ?", [normalized])
      .then(() => {
        const current = inMemorySuppressionCache.get(normalized);
        if (current && current.cleared) {
          inMemorySuppressionCache.delete(normalized);
        }
      })
      .catch(() => {});
  }
}

// ----------------------------------------------------
// DOMAIN DELIVERABILITY & DNS MX VERIFICATION
// ----------------------------------------------------

async function checkDomainDeliverability(domain) {
  if (!domain || typeof domain !== "string") {
    return { deliverable: false, errorType: "INVALID_DOMAIN", message: "Domain name is missing or invalid." };
  }
  const d = domain.trim().toLowerCase();

  const cached = domainMxCache.get(d);
  if (cached && Date.now() < cached.expiresAt) {
    return cached;
  }

  // Placeholder / internal test domain check
  if (isPlaceholderOrTestDomain(d)) {
    const res = {
      deliverable: false,
      errorType: "RESERVED_PLACEHOLDER_DOMAIN",
      message: `Domain "${d}" is a reserved placeholder domain and cannot receive external email.`,
      expiresAt: Date.now() + MX_CACHE_TTL_MS
    };
    domainMxCache.set(d, res);
    return res;
  }

  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error("DNS MX lookup timed out");
      err.code = "ETIMEOUT";
      reject(err);
    }, 4500);
  });

  try {
    const mxRecords = await Promise.race([dns.resolveMx(d), timeoutPromise]);
    clearTimeout(timer);

    // Check for RFC 7505 Null MX record (single record with exchange = "")
    if (Array.isArray(mxRecords) && mxRecords.length === 1 && (!mxRecords[0].exchange || mxRecords[0].exchange.trim() === "")) {
      const res = {
        deliverable: false,
        errorType: "NULL_MX_RECORD",
        message: `Domain "${d}" explicitly rejects email (RFC 7505 Null MX record).`,
        expiresAt: Date.now() + MX_CACHE_TTL_MS
      };
      domainMxCache.set(d, res);
      return res;
    }

    if (Array.isArray(mxRecords) && mxRecords.length > 0) {
      const res = { deliverable: true, expiresAt: Date.now() + MX_CACHE_TTL_MS };
      domainMxCache.set(d, res);
      return res;
    }

    // Fallback A record check per RFC 5321
    try {
      const aRecords = await dns.resolve4(d);
      if (Array.isArray(aRecords) && aRecords.length > 0) {
        const res = { deliverable: true, expiresAt: Date.now() + MX_CACHE_TTL_MS };
        domainMxCache.set(d, res);
        return res;
      }
    } catch (_) {}

    const res = {
      deliverable: false,
      errorType: "NO_MX_RECORDS",
      message: `Domain "${d}" has no mail exchange (MX) or address records.`,
      expiresAt: Date.now() + MX_CACHE_TTL_MS
    };
    domainMxCache.set(d, res);
    return res;
  } catch (err) {
    clearTimeout(timer);
    let errorType = "DNS_ERROR";
    let message = `DNS lookup failed for domain "${d}".`;

    if (err.code === "ENODATA") {
      try {
        const aRecords = await dns.resolve4(d);
        if (Array.isArray(aRecords) && aRecords.length > 0) {
          const res = { deliverable: true, expiresAt: Date.now() + MX_CACHE_TTL_MS };
          domainMxCache.set(d, res);
          return res;
        }
      } catch (_) {}
      errorType = "NO_MX_RECORDS";
      message = `Domain "${d}" has no mail exchange (MX) records.`;
    } else if (err.code === "ENOTFOUND") {
      errorType = "DOMAIN_NOT_FOUND";
      message = `Recipient domain "${d}" does not exist.`;
    } else if (err.code === "ETIMEOUT") {
      errorType = "DNS_TIMEOUT";
      message = `DNS resolution for domain "${d}" timed out.`;
    }

    const res = {
      deliverable: false,
      errorType,
      message,
      expiresAt: Date.now() + (errorType === "DNS_TIMEOUT" ? 60000 : MX_CACHE_TTL_MS)
    };
    domainMxCache.set(d, res);
    return res;
  }
}

// ----------------------------------------------------
// RECIPIENT VALIDATION
// ----------------------------------------------------

async function validateRecipientEmail(rawEmail, { isTestContext = false } = {}) {
  if (!rawEmail || typeof rawEmail !== "string") {
    return {
      valid: false,
      errorType: "MISSING_RECIPIENT",
      message: "Recipient email address is required and cannot be empty."
    };
  }

  const email = rawEmail.trim().toLowerCase();

  // Ensure it is not a username, badge ID, or identifier without '@'
  if (!email.includes("@")) {
    return {
      valid: false,
      errorType: "NOT_AN_EMAIL",
      message: `Recipient "${email}" is an internal identifier or username, not a valid email address.`
    };
  }

  // Basic RFC 5322 email regex check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(email) || email.length > 254) {
    return {
      valid: false,
      errorType: "INVALID_EMAIL_FORMAT",
      message: "Recipient email format is invalid."
    };
  }

  const domain = email.split("@")[1];

  // Check permanent suppression
  const suppression = await isSuppressed(email);
  if (suppression) {
    return {
      valid: false,
      isSuppressed: true,
      errorType: "PERMANENT_FAILURE_SUPPRESSED",
      message: `Delivery to this address has previously failed permanently (${suppression.reason}). Delivery is suppressed.`
    };
  }

  // Check if this is a test recipient or running in test/dev mode
  const testRecipient = isTestRecipient(email);
  const isProd = process.env.NODE_ENV === "production" && String(process.env.CLOUD_MODE || "").toLowerCase() === "true";
  const testEnv = isTestEnvironment() || isTestContext || !isProd;

  if (testRecipient && (testEnv || Boolean(process.env.TEST_EMAIL_RECIPIENT))) {
    return {
      valid: true,
      email,
      domain,
      isTestIsolated: true
    };
  }

  if (isPlaceholderOrTestDomain(domain)) {
    return {
      valid: false,
      errorType: "PLACEHOLDER_DOMAIN",
      message: `Domain "${domain}" is a placeholder domain and cannot receive real emails.`
    };
  }

  // Perform DNS MX deliverability check for live recipients
  const domainCheck = await checkDomainDeliverability(domain);
  if (!domainCheck.deliverable) {
    await recordPermanentFailure(email, domainCheck.message, domainCheck.errorType);
    return {
      valid: false,
      errorType: domainCheck.errorType,
      message: domainCheck.message
    };
  }

  return {
    valid: true,
    email,
    domain,
    isTestIsolated: false
  };
}

// ----------------------------------------------------
// GOOGLE APPS SCRIPT API CONFIGURATION
// ----------------------------------------------------

const GOOGLE_APPS_SCRIPT_REQUEST_TIMEOUT_MS = 15000;

function getGoogleAppsScriptConfig() {
  const url = (process.env.GOOGLE_APPS_SCRIPT_URL || "").trim();
  const secret = (process.env.MCRN_SECRET || "").trim();
  if (!url || !secret) return null;

  try {
    if (new URL(url).protocol !== "https:") return null;
  } catch (_) {
    return null;
  }

  return { url, secret };
}

async function verifyMailer() {
  if (!getGoogleAppsScriptConfig()) {
    console.log("[EMAIL] Google Apps Script email delivery is not configured; set GOOGLE_APPS_SCRIPT_URL and MCRN_SECRET.");
    return false;
  }
  console.log("[EMAIL] Google Apps Script email delivery is configured.");
  return true;
}

function getEmailErrorCode(error) {
  const code = error?.code || error?.name || "EMAIL_DELIVERY_ERROR";
  return String(code).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64) || "EMAIL_DELIVERY_ERROR";
}

function getSafeLogValue(value) {
  return String(value || "none").replace(/[^A-Za-z0-9_.-]/g, "").slice(0, 64) || "none";
}

function isRetryableConnectFailure(error) {
  const failures = error?.cause instanceof AggregateError ? error.cause.errors : null;
  return Array.isArray(failures) && failures.length > 0 && failures.every((failure) =>
    failure?.syscall === "connect" &&
    ["ETIMEDOUT", "ECONNREFUSED", "EHOSTUNREACH", "ENETUNREACH"].includes(failure.code)
  );
}

function getSafeNetworkDetails(error, url) {
  const cause = error?.cause;
  const endpointHost = (() => {
    try {
      const hostname = new URL(url).hostname;
      return hostname === "script.google.com" || hostname.endsWith(".googleusercontent.com")
        ? hostname
        : "configured-endpoint";
    } catch (_) {
      return "configured-endpoint";
    }
  })();
  const causeHost = typeof cause?.hostname === "string" &&
    (cause.hostname === "script.google.com" || cause.hostname.endsWith(".googleusercontent.com"))
    ? cause.hostname
    : endpointHost;
  const attempts = Array.isArray(cause?.errors)
    ? cause.errors.slice(0, 4).map((attempt) => [
      `code=${getSafeLogValue(attempt?.code)}`,
      `syscall=${["connect", "getaddrinfo", "read", "write"].includes(attempt?.syscall) ? attempt.syscall : "unknown"}`,
      `family=${[4, 6].includes(attempt?.family) ? attempt.family : "unknown"}`,
      `port=${Number.isInteger(attempt?.port) && attempt.port > 0 && attempt.port <= 65535 ? attempt.port : "unknown"}`
    ].join(" ")).join(";")
    : "none";

  return [
    `name=${getSafeLogValue(error?.name)}`,
    `code=${getSafeLogValue(error?.code)}`,
    `cause=${getSafeLogValue(cause?.name)}`,
    `causeCode=${getSafeLogValue(cause?.code)}`,
    `syscall=${["connect", "getaddrinfo", "read", "write"].includes(cause?.syscall) ? cause.syscall : "unknown"}`,
    `host=${causeHost}`,
    `attempts=${attempts}`
  ].join(" ");
}

// ----------------------------------------------------
// EMAIL HTML TEMPLATES
// ----------------------------------------------------

function htmlOtp(title, otp, copy) {
  return `<!doctype html>
<html>
<body style="margin:0;background:#080b12;color:#eef2ff;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:40px auto;padding:32px;background:#111827;border:1px solid #283449;border-radius:24px">
<div style="color:#e85d4f;font-weight:700;letter-spacing:2px;font-size:12px">MCRN • SECURE ACCESS</div>
<h1 style="font-size:28px">${title}</h1>
<p style="color:#aab4c6">${copy}</p>
<div style="margin:32px 0;padding:24px;border-radius:18px;background:#0d131f;text-align:center;border:1px dashed #374662">
  <span style="font-size:36px;letter-spacing:10px;font-weight:800;color:#ffffff">${otp}</span>
</div>
<p style="color:#7d899d;font-size:13px">Valid for 10 minutes. Never share this code with anyone.</p>
</div>
</body>
</html>`;
}

// ----------------------------------------------------
// CORE SAFE MAIL SENDER
// ----------------------------------------------------

async function sendMailSafe({ to, subject, html, text, from, isTestContext = false, purpose = "GENERAL" }) {
  // 1. Validate recipient
  const validation = await validateRecipientEmail(to, { isTestContext });
  if (!validation.valid) {
    console.warn(`[EMAIL] Delivery rejected for ${maskEmail(to)}: [${validation.errorType}] ${validation.message}`);
    const err = new Error(validation.message);
    err.code = validation.errorType;
    err.status = validation.isSuppressed ? 409 : 400;
    throw err;
  }

  // 2. Handle isolated development / test mode
  if (validation.isTestIsolated) {
    const testRecipientOverride = (process.env.TEST_EMAIL_RECIPIENT || "").trim();

    if (testRecipientOverride && testRecipientOverride.includes("@")) {
      console.log(`[EMAIL_TEST_REDIRECT] Redirecting test email for ${maskEmail(to)} to real inbox ${maskEmail(testRecipientOverride)}`);
      // Recursively send to real test recipient with explicit subject tag
      return sendMailSafe({
        to: testRecipientOverride,
        subject: `[TEST FOR ${maskEmail(to)}] ${subject}`,
        html,
        text,
        from,
        isTestContext: false,
        purpose
      });
    }

    // Isolated in-memory dev mode (no remote API call)
    console.log(`[EMAIL_DEV_ISOLATED] Test address ${maskEmail(to)} handled in isolated development mode. Remote delivery suppressed.`);
    return {
      accepted: true,
      status: "ISOLATED_DEV_SIMULATED",
      recipient: maskEmail(to),
      purpose
    };
  }

  // 3. Remote Google Apps Script delivery for real deliverable recipient
  const config = getGoogleAppsScriptConfig();
  if (!config) {
    console.error("[EMAIL] Google Apps Script URL or secret is not configured; delivery was not attempted.");
    const error = new Error("Email delivery is not configured. Please contact support.");
    error.code = "GOOGLE_APPS_SCRIPT_NOT_CONFIGURED";
    error.status = 503;
    throw error;
  }

  const body = text || (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");
  const payload = {
    secret: config.secret,
    to: validation.email,
    subject,
    body,
    ...(html ? { htmlBody: html } : {})
  };

  const requestStartedAt = Date.now();
  try {
    const requestBody = JSON.stringify(payload);
    let response;
    for (let attempt = 0; ; attempt++) {
      try {
        response = await fetch(config.url, {
          method: "POST",
          redirect: "follow",
          headers: { "content-type": "application/json" },
          body: requestBody,
          signal: AbortSignal.timeout(GOOGLE_APPS_SCRIPT_REQUEST_TIMEOUT_MS)
        });
        break;
      } catch (error) {
        if (attempt !== 0 || !isRetryableConnectFailure(error)) throw error;
        console.warn(`[EMAIL] Retrying Google Apps Script request once after a connection failure (${getSafeNetworkDetails(error, config.url)}).`);
      }
    }

    let result;
    try {
      result = await response.json();
    } catch (_) {
      const error = new Error("Email service returned an invalid response.");
      error.code = "GOOGLE_APPS_SCRIPT_INVALID_RESPONSE";
      error.status = 503;
      throw error;
    }

    if (!response.ok || !result || result.success !== true) {
      console.error(`[EMAIL] Google Apps Script rejected dispatch for ${maskEmail(to)} [HTTP ${response.status}].`);
      const error = new Error("Email delivery could not be completed. Please try again later.");
      error.code = "GOOGLE_APPS_SCRIPT_REJECTED";
      error.status = 503;
      throw error;
    }

    console.log(`[EMAIL] Google Apps Script accepted email request for ${maskEmail(to)}.`);
    return {
      accepted: true,
      status: "ACCEPTED_BY_GOOGLE_APPS_SCRIPT",
      recipient: maskEmail(to)
    };
  } catch (err) {
    if (err.status && err.code) throw err;

    const code = getEmailErrorCode(err?.cause || err);
    const elapsedMs = Date.now() - requestStartedAt;
    console.error(`[EMAIL] Google Apps Script request failed for ${maskEmail(to)} [${code}] after ${elapsedMs}ms (${getSafeNetworkDetails(err, config.url)}).`);
    const dispatchError = new Error("Email delivery could not be completed. Please try again later.");
    dispatchError.code = [
      "TypeError", "TimeoutError", "ETIMEDOUT", "ECONNRESET", "ECONNREFUSED", "EAI_AGAIN",
      "ENOTFOUND", "EHOSTUNREACH", "ENETUNREACH", "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_HEADERS_TIMEOUT"
    ].includes(code)
      ? "GOOGLE_APPS_SCRIPT_NETWORK_ERROR"
      : code;
    dispatchError.status = 503;
    throw dispatchError;
  }
}

// ----------------------------------------------------
// PUBLIC HELPERS
// ----------------------------------------------------

async function sendOtp(to, otp, purpose, options = {}) {
  const isReset = purpose === "PASSWORD_RESET";
  const title = isReset ? "Reset Your Password" : "Verify Your Account";
  const copy = isReset
    ? "Use the verification code below to complete your password reset request:"
    : "Welcome to MCRN. Use the verification code below to verify your email address:";

  return sendMailSafe({
    to,
    subject: `[MCRN] ${title}`,
    html: htmlOtp(title, otp, copy),
    text: `${title}\n\n${copy}\n\nVerification Code: ${otp}\n\nValid for 10 minutes. Never share this code.`,
    isTestContext: options.isTestContext || isTestRecipient(to),
    purpose
  });
}

async function sendAdminPasswordReset(to, resetLink) {
  const subject = "Reset Your Admin Portal Password";
  const text = `Hello,\n\nYou requested to reset your Admin Portal password.\n\nClick the link below to create a new password:\n${resetLink}\n\nThis link will expire in 15 minutes.\n\nIf you did not request this password reset, you can ignore this email.\n\nMissing Child Rescue Network`;
  const html = `<!doctype html>
<html>
<body style="margin:0;background:#080b12;color:#eef2ff;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:40px auto;padding:32px;background:#111827;border:1px solid #283449;border-radius:24px">
<div style="color:#e85d4f;font-weight:700;letter-spacing:2px;font-size:12px">MCRN • ADMIN PORTAL</div>
<h1 style="font-size:24px">Reset Your Admin Password</h1>
<p style="color:#aab4c6">You requested to reset your Admin Portal password. Click the button below:</p>
<div style="margin:24px 0;text-align:center">
  <a href="${resetLink}" style="display:inline-block;padding:12px 28px;background:#e85d4f;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:bold">Reset Password</a>
</div>
<p style="color:#7d899d;font-size:12px">Link: ${resetLink}</p>
<p style="color:#7d899d;font-size:12px">This link expires in 15 minutes.</p>
</div>
</body>
</html>`;

  return sendMailSafe({
    to,
    subject,
    text,
    html,
    purpose: "ADMIN_PASSWORD_RESET"
  });
}

async function sendPoliceNotification({ officerId, officerEmail, subject, text, html }) {
  let recipient = officerEmail;

  // If officerEmail was provided but is an identifier without @, reject immediately with clear error
  if (recipient && typeof recipient === "string" && !recipient.includes("@")) {
    const err = new Error(`Recipient "${recipient}" is an internal identifier or username, not a valid email address.`);
    err.code = "NOT_AN_EMAIL";
    err.status = 400;
    throw err;
  }

  // If only officerId is provided (or recipient is not set), look up the officer's verified email from database
  if (!recipient && officerId && pool && typeof pool.query === "function") {
    try {
      const [rows] = await pool.query(
        "SELECT email FROM users WHERE id = ? AND role = 'POLICE' AND verified = true LIMIT 1",
        [officerId]
      );
      const row = Array.isArray(rows) ? rows[0] : rows;
      if (row && row.email && row.email.includes("@")) {
        const domain = row.email.split("@")[1];
        if (!isPlaceholderOrTestDomain(domain)) {
          recipient = row.email;
        }
      }
    } catch (_) {}
  }

  // Fallback to configured police notification email if recipient is missing or placeholder
  if (!recipient || (recipient.includes("@") && isPlaceholderOrTestDomain(recipient.split("@")[1]))) {
    const fallback = (process.env.POLICE_NOTIFICATION_EMAIL || "").trim();
    if (fallback && fallback.includes("@")) {
      recipient = fallback;
    }
  }

  if (!recipient || !recipient.includes("@")) {
    const err = new Error("No valid deliverable email address configured for police notifications.");
    err.code = "NO_POLICE_RECIPIENT";
    err.status = 400;
    throw err;
  }

  return sendMailSafe({
    to: recipient,
    subject: `[MCRN Police Alert] ${subject}`,
    text,
    html,
    purpose: "POLICE_NOTIFICATION"
  });
}

module.exports = {
  verifyMailer,
  sendOtp,
  sendMailSafe,
  sendAdminPasswordReset,
  sendPoliceNotification,
  validateRecipientEmail,
  checkDomainDeliverability,
  isPlaceholderOrTestDomain,
  isTestRecipient,
  maskEmail,
  isSuppressed,
  recordPermanentFailure,
  clearSuppression
};
