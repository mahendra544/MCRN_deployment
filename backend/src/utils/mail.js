require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const nodemailer = require("nodemailer");

let transporter = null;

function createTransporter() {
  const user = process.env.MAIL_USERNAME || process.env.MAIL_USER || process.env.EMAIL_USER;
  const pass = process.env.MAIL_PASSWORD || process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT || process.env.SMTP_PORT || 587),
    secure: String(process.env.MAIL_SECURE || process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    requireTLS: true,
    auth: { user, pass },
    connectionTimeout: 15000,
    tls: {
      minVersion: "TLSv1.2",
      servername: process.env.MAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com"
    }
  });
}

async function verifyMailer() {
  try {
    transporter = createTransporter();
    if (!transporter) {
      console.log("ℹ️ Mailer not configured with credentials (skipping verification).");
      return;
    }
    console.log("Testing SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully.");
  } catch (err) {
    console.warn("⚠️ SMTP verification warning:", err.message);
  }
}

function html(title, otp, copy) {
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

async function sendOtp(to, otp, purpose) {
  console.log("[EMAIL] OTP send started");
  if (!transporter) {
    transporter = createTransporter();
  }
  if (!transporter) {
    console.warn("[EMAIL] Mailer not configured with credentials (skipping remote delivery).");
    return;
  }
  const isReset = purpose === "PASSWORD_RESET";
  const title = isReset ? "Reset Your Password" : "Verify Your Account";
  const copy = isReset
    ? "Use the verification code below to complete your password reset request:"
    : "Welcome to MCRN. Use the verification code below to verify your email address:";

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.EMAIL_USER || "MCRN Security <no-reply@mcrn.org>",
      to,
      subject: `[MCRN] ${title} - ${otp}`,
      html: html(title, otp, copy)
    });
    console.log("[EMAIL] OTP send succeeded");
  } catch (err) {
    console.error("[EMAIL] OTP send failed:", err.message);
    throw new Error(`Failed to dispatch verification email: ${err.message}`);
  }
}

module.exports = {
  createTransporter,
  verifyMailer,
  sendOtp
};
