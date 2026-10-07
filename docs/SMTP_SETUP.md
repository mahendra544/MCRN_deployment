# MCRN SMTP / Nodemailer Configuration

## User + Police authentication

File:
`backends/auth-backend/.env`

Required Gmail settings:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_REQUIRE_TLS=true
MAIL_USERNAME=yourgmail@gmail.com
MAIL_PASSWORD=YOUR_GOOGLE_APP_PASSWORD
MAIL_FROM=MCRN Security <yourgmail@gmail.com>
```

The auth backend sends OTPs for:
- User registration verification
- Police registration verification
- User password reset
- Police password reset

## Admin forgot password

File:
`backends/admin-backend/.env`

Required settings:

```env
EMAIL_USER=admin-gmail@gmail.com
EMAIL_PASS=YOUR_GOOGLE_APP_PASSWORD
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_REQUIRE_TLS=true
```

The Admin backend uses Nodemailer to send the password-reset link.

## Gmail App Password

Use a Google App Password, not the normal Gmail password.

Google Account -> Security -> 2-Step Verification -> App passwords.

If Google displays the app password with spaces, the Admin backend removes whitespace automatically.

## Run

```bash
chmod +x *.sh integration/*.sh
./setup.sh
./start.sh
```

`setup.sh` preserves existing `backends/auth-backend/.env` and `backends/admin-backend/.env`, so it does not erase the SMTP credentials already configured in this project.
