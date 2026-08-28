# Missing Child Rescue Network — Authentication Module

Tech stack:
- **Frontend:** React.js + Tailwind CSS (Vite)
- **Backend:** Spring Boot 3.5 / Java 21, Spring Security + JWT
- **Database:** MySQL + Spring Data JPA
- Password hashing: BCrypt
- Email OTP verification and password reset
- Roles: USER, POLICE, ADMIN

## What was fixed in this pass

1. **Case-sensitive login bug** — registration checked username uniqueness
   case-insensitively (`existsByUsernameIgnoreCase`), but login/profile
   lookups were case-sensitive (`findByUsername`). A user could fail to log
   in if they typed their username in different casing than they registered
   with. Fixed by adding `findByUsernameIgnoreCase` and using it everywhere
   a username is looked up (`AuthService`, `UserDetailsServiceImpl`).

2. **Plain-text API responses breaking the frontend** — `/verify-email`,
   `/forgot-password`, `/reset-password`, and `/change-password` returned
   raw `String` bodies instead of JSON. Since the frontend always calls
   `response.json()`, this silently failed and could crash the UI trying to
   render a JS object as text. All of these now return `{ "message": "..." }`.

3. **Wrong email used on the "verify your email" redirect** — when login
   failed because the account wasn't verified yet, the frontend redirected
   to the OTP screen using the **username** as if it were the email. If they
   differ, OTP verification silently failed. Added a dedicated
   `EmailNotVerifiedException` that carries the account's real email, which
   `GlobalExceptionHandler` now returns in the response body.

4. **Fake read-only email field** — the "Verify email" screen displayed the
   email in a field whose `onChange` was a no-op, so it looked editable but
   silently ignored input. It's now a real controlled input.

5. **Lost session on page refresh** — a hard refresh always dropped back to
   the logged-out home page even though the JWT was still in `localStorage`.
   `App.jsx` now checks for a stored token on load and restores the session
   by fetching `/user/profile`.

6. **Profile page stuck on "Loading..." forever** — if the profile fetch
   failed (missing/expired token), the page had no fallback and just sat on
   the loading state indefinitely. It now redirects to the login page.

7. **Missing Vite/Tailwind config** — the original zip had no
   `vite.config.js`, `tailwind.config.js`, or `postcss.config.js`, and the
   frontend was a single 63-line file with everything crammed together
   using a separate custom stylesheet instead of Tailwind. The frontend has
   been restructured into `components/`, `pages/`, and an `api/` client, and
   now genuinely uses Tailwind utility classes (brand red `#e02323` is
   defined as the `brand` color in `tailwind.config.js`).

## 1. Database

Make sure MySQL is running. Default configuration:
- database: `mcrn_auth` (created automatically)
- username: `root`
- password: `root`

Override with environment variables: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.

## 2. Run backend

```bash
cd backend
./mvnw spring-boot:run
```
If there is no Maven wrapper: `mvn spring-boot:run`

Backend: http://localhost:8080

## 3. Run frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

Copy `.env.example` to `.env` if your backend runs somewhere other than
`http://localhost:8080/api`.

## 4. Admin

An admin account is automatically seeded on first startup.
Defaults: username `admin`, password `Admin@12345`.
Change with `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL`.
There is deliberately no public admin registration endpoint.

## 5. Email OTP

If SMTP variables are not configured, OTPs are printed in the backend
console for development: `[MCRN DEV] OTP for ...`

For real email, configure: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`.

## 6. Main endpoints

```
POST /api/auth/register/user
POST /api/auth/register/police
POST /api/auth/login
POST /api/auth/verify-email
POST /api/auth/forgot-password
POST /api/auth/reset-password

GET  /api/user/profile
PUT  /api/user/profile
PUT  /api/user/change-password
```

Role-specific application endpoints can be added later and protected with
`hasRole` / `hasAnyRole`.

## Important

This is a college-project development baseline. Before real deployment, add
server-side rate limiting, a refresh-token/revocation strategy, stronger
secret management, audit logging, HTTPS, production email configuration,
and automated tests.
