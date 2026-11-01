# MCRN Google Apps Script Email Configuration

MCRN sends registration and password-reset OTPs, admin password-reset links, and police notifications through a Google Apps Script Web App over HTTPS.

## Configure the Web App

1. Deploy the Google Apps Script email service as a Web App and copy its deployment URL.
2. Configure the service to accept a JSON POST with `secret`, `to`, `subject`, and `body`, plus `htmlBody` when supplied. The service must return JSON containing `"success": true` only after it accepts the email for delivery.
3. Configure `GOOGLE_APPS_SCRIPT_URL` with the Web App URL and `MCRN_SECRET` with the same private secret expected by the script.

```env
GOOGLE_APPS_SCRIPT_URL=
MCRN_SECRET=
```

Set both values only in the backend environment (locally in `.env`, or in the Render backend service's Environment settings). Keep the URL and secret out of frontend configuration and source control.

Apps Script may redirect POST requests to a Google-hosted response URL. The backend follows that redirect and accepts a dispatch only when the final response is successful JSON with `success: true`; an HTTP 200 response by itself is not treated as delivery confirmation.

## Safe Diagnostic

The diagnostic sends one test message only to the explicitly configured `EMAIL_DIAGNOSTIC_RECIPIENT`. It does not derive or select any recipient from application data.

```env
EMAIL_DIAGNOSTIC_RECIPIENT=your_test_inbox@gmail.com
```

Run it only when you intend to send an actual email:

```bash
npm --prefix backend run email:diagnostic
```

The diagnostic refuses placeholder/generated test addresses. It uses the same recipient validation and delivery path as application email.
