const { createTransporter } = require("../src/utils/mail");
const pool = require("../src/db");

async function main() {
  let transporter;
  try {
    transporter = createTransporter();
    if (!transporter) {
      console.error("SMTP is not configured. Set MAIL_USERNAME/MAIL_USER/EMAIL_USER and MAIL_PASSWORD/EMAIL_PASS.");
      process.exitCode = 1;
      return;
    }

    await transporter.verify();
    console.log("SMTP configuration and connectivity verified. No email was sent.");
  } catch (error) {
    console.error(
      `SMTP diagnostic failed${error.code ? ` (${error.code})` : ""}. Check the configured host, port, TLS settings, and app password.`
    );
    process.exitCode = 1;
  } finally {
    transporter?.close();
    await pool.end();
  }
}

main();
