# Missing Child Rescue Network (MCRN)

Missing Child Rescue Network (MCRN) is a mission-critical full-stack platform dedicated to the rapid reporting, investigation tracking, and safe recovery of missing children. The platform unites citizens, law enforcement officers, and administrative coordinators through real-time alert notifications, sighting verifications, and cross-departmental response workflows.

---

## Architecture Overview

MCRN is engineered as a unified, production-ready full-stack application deployable on **Vercel** or cloud/container environments:

- **Frontend**: High-performance multi-entry React 18 application built with Vite and Tailwind CSS. Provides dedicated, secure experiences for Citizens, Law Enforcement, and System Administrators:
  - Landing & Authentication (`/`, `/login`, `/register`, `/verify`, `/forgot`, `/reset`)
  - Citizen Portal (`/user-dashboard`, `/search-children`, `/child/:caseId`, `/report-sighting`, `/about-us`, `/my-cases`)
  - Police Operations Portal (`/police-dashboard`, `/police-cases`, `/police-verify`, `/police-search`, `/police-notifications`, `/police-profile`)
  - Administrator Portal (`/admin`, `/admin/*`)
  - Citizen Reporting Portal (`/reporting`, `/report-child`, `/reports`)
  - Emergency Helpline (`/contact-us`)
- **Backend API**: Unified Express service modularized by domain (`auth`, `user`, `police`, `admin`, `reporting`), executed as a serverless API function on Vercel (`api/index.js`) or as an HTTP daemon locally/in cloud containers (`backend/src/server.js`).
- **Database**: PostgreSQL database hosting normalized relational schemas for users, police profiles, missing cases, citizen reports, sightings, notifications, audit trails, and OTP verification tokens.
- **Storage**: Supabase Storage (`missing-child-images` bucket) providing resilient cross-device media delivery for missing child photographs and investigation evidence.
- **Email Service**: SMTP email delivery powered by Nodemailer with isolated development mode safety controls, automated address masking, and deliverability verification.

---

## Directory Structure

```text
MCRN/
├── api/
│   └── index.js                      # Vercel serverless API entry point
│
├── frontend/                         # Unified multi-entry React + Vite application
│   ├── public/                       # Shared public assets (logos, avatars, icons)
│   │   ├── assets/                   # Branding graphics (mcrn-logo.jpeg)
│   │   ├── default-child.jpg         # Default placeholder child avatar
│   │   ├── favicon.svg               # Web favicon
│   │   ├── icons.svg                 # SVG sprite icons
│   │   ├── logo.png                  # Navigation logo
│   │   └── mcrn-logo.png             # Alternate logo branding
│   ├── src/
│   │   ├── admin/                    # Admin portal pages, case assignments, audit logs
│   │   ├── auth/                     # Citizen auth, OTP verification, login, profile
│   │   ├── contact/                  # Contact Us & Emergency Helpline portal
│   │   ├── police/                   # Police investigation portal, case row, verify
│   │   ├── reporting/                # Missing child report submission & sync
│   │   ├── user/                     # Citizen dashboard, search children, sightings
│   │   ├── App.jsx                   # Root application router component
│   │   ├── main.jsx                  # Root client bootstrap
│   │   └── index.css                 # Global styling & Tailwind base
│   ├── admin.html                    # Admin entry HTML
│   ├── contact.html                  # Contact Us entry HTML
│   ├── index.html                    # Landing / Auth entry HTML
│   ├── police.html                   # Police entry HTML
│   ├── reporting.html                # Reporting entry HTML
│   ├── user.html                     # Citizen portal entry HTML
│   ├── package.json                  # Frontend dependencies & build scripts
│   ├── postcss.config.js             # PostCSS configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   └── vite.config.js                # Multi-page Rollup input configuration
│
├── backend/                          # Unified Node.js / Express backend service
│   ├── src/
│   │   ├── admin/                    # Admin controllers, case delegation, audit logging
│   │   ├── auth/                     # Authentication routes, password recovery, OTP logic
│   │   ├── config/                   # Supabase Storage client configuration
│   │   ├── db/                       # PostgreSQL connection pool & SQL query wrappers
│   │   ├── middleware/               # Role-based authorization & JWT verification
│   │   ├── police/                   # Police investigation routes & schema migrations
│   │   ├── reporting/                # Report submission routes & dual-table sync
│   │   ├── user/                     # Citizen dashboard & child directory routes
│   │   ├── utils/                    # Email delivery & safety utilities (Nodemailer)
│   │   ├── app.js                    # Master Express application definition
│   │   └── server.js                 # Standalone HTTP server runner (local & container)
│   ├── uploads/                      # Local media storage fallback (with .gitkeep)
│   └── package.json                  # Backend dependencies & runtime scripts
│
├── database/                         # Database migrations, schema, and seed scripts
│   ├── schema/                       # PostgreSQL DDL definitions (schema.sql, schema.js)
│   ├── scripts/                      # Database initialization script (init-db.js)
│   └── seed/                         # Police & administrative account seeders
│
├── docs/                             # Extended deployment and setup documentation
│   ├── CLOUD_DEPLOYMENT.md           # Cloud container hosting instructions
│   ├── SMTP_SETUP.md                 # Gmail SMTP & application password configuration
│   └── FIXES_INCLUDED.txt            # Architecture history & changelog
│
├── integration/                      # Lightweight local web gateway
│   └── server/                       # Static serving & API proxy server (port 5173)
│
├── scripts/                          # Automation, build, and lifecycle scripts
│   ├── cloud-build.sh                # Monorepo installation & build script
│   ├── cloud-start.sh                # Cloud container runtime launcher
│   ├── setup.sh                      # Automated local setup & database initialization
│   └── start.sh                      # Local development runtime launcher
│
├── tests/                            # Comprehensive automated testing suite
│   ├── api-tests.js                  # End-to-end API, health, and portal tests
│   ├── db-test.js                    # Database connectivity & table schema verification
│   ├── email-delivery-tests.js       # Email masking, safety, and SMTP tests
│   ├── otp-lifecycle-tests.js        # Registration, login, OTP, and reset lifecycle
│   ├── supabase-storage-e2e.js       # Cross-device report image upload verification
│   └── workflow-tests.js             # Full cross-role workflow verification suite
│
├── .env.example                      # Local development environment template
├── .env.cloud.example                # Cloud / Vercel production environment template
├── .gitignore                        # Git ignore rules for node_modules, dist, and secrets
├── package.json                      # Monorepo root package.json (workspaces & scripts)
├── package-lock.json                 # Monorepo lockfile
├── vercel.json                       # Vercel deployment configuration & route rewrites
└── README.md                         # Project documentation
```

---

## Technologies Used

- **Frontend**: React 18, Vite 5, React Router DOM 7, Tailwind CSS, Lucide React
- **Backend**: Node.js 22/24, Express 4, Helmet, CORS, Zod, BcryptJS, JSONWebToken, Multer
- **Database**: PostgreSQL (Supabase / Neon / AWS RDS / Local), `pg` driver with connection pooling
- **Storage**: Supabase Storage (`@supabase/supabase-js`)
- **Email Delivery**: Nodemailer with SMTP TLS/SSL transport
- **Deployment**: Vercel Serverless Functions (`api/index.js`) + Vercel Edge Static CDN

---

## Local Installation & Setup

### Prerequisites

- **Node.js**: v18.0.0 or higher (v22/v24 recommended)
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher (or cloud instance)

### 1. Clone & Configure Environment

```bash
git clone https://github.com/lavanyatangellapalli24/Missing_child_Rescue_Network.git
cd Missing_child_Rescue_Network
cp .env.example .env
```

Edit `.env` to configure your PostgreSQL credentials, JWT secret, Supabase credentials, and SMTP credentials.

### 2. One-Click Setup

Run the automated setup script to install dependencies across all workspaces, initialize database schemas, and compile the frontend:

```bash
npm run setup
# Or directly: ./scripts/setup.sh
```

### 3. Start Local Development

Launch the complete platform (unified backend on `:5000` + web gateway on `:5173`):

```bash
npm run dev
# Or directly: ./scripts/start.sh
```

- **Web Application**: http://localhost:5173
- **API Gateway**: http://localhost:5000
- **API Health**: http://localhost:5000/health

---

## Database Configuration

MCRN uses PostgreSQL across all modules.

To initialize or verify the schema tables:
```bash
npm run init-db
# Or: node database/scripts/init-db.js
```

Verified schema tables:
- `users`: Citizen, police, and administrator accounts
- `police_profiles`: Law enforcement officer badge and departmental data
- `police_users`: Police credentials and official identifiers
- `children`: Centralized directory of missing children
- `missing_child_reports`: Citizen report submissions with photo URLs
- `missing_cases`: Police case investigation records
- `case_assignments`: Case delegation and tracking
- `sightings`: Public sighting submissions with verification status
- `notifications`: Broadcast alerts for cases and status updates
- `audit_logs`: Administrative activity and investigation logs
- `admin_settings`: System configuration and alert parameters
- `otp_tokens`: One-time password verification tokens with expiration and consumption tracking
- `email_suppressions`: Delivery bounce and suppression tracking
- `case_resolution_evidence`: Case closure documentation

---

## Supabase Storage Integration

Production image uploads for missing child reports and police sightings use **Supabase Storage**.

1. Create a Supabase project at https://supabase.com.
2. In the Supabase Dashboard, create a storage bucket named `missing-child-images` (or set `SUPABASE_STORAGE_BUCKET`).
3. Set bucket access to **Public** for image display.
4. Add the following to your environment:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SUPABASE_STORAGE_BUCKET=missing-child-images
   ```

When an image is submitted via `/api/report-child` or `/api/sightings`, MCRN streams the buffer directly to Supabase Storage and returns a permanent public URL, ensuring files persist across serverless restarts.

---

## SMTP & Email Service Configuration

Account verification and password recovery use SMTP email delivery.

Configure in `.env`:
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_REQUIRE_TLS=true
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
MAIL_FROM=MCRN Security <your_email@gmail.com>
```

Check SMTP configuration and connectivity without sending an email:
```bash
npm --prefix backend run smtp:check
```

### Safety Features
- **Isolated Development Mode**: Set `MCRN_DEV_OTP_MODE=true` during testing to log OTP codes to the terminal and suppress live remote transmission to fictional/placeholder addresses.
- **Recipient Domain Protection**: Delivery to known test/placeholder domains (`example.com`, `mcrn-test.org`, `police.mcrn.org`) is automatically classified and isolated.
- **Log Masking**: Recipient addresses are automatically masked in logs (e.g., `u***r@example.com`) to protect personal data.

---

## Testing Commands

MCRN includes a complete automated test suite:

```bash
# 1. Syntax check & frontend production build
npm run check

# 2. Database connectivity & schema tables check
node tests/db-test.js

# 3. Email safety, masking, and SMTP transporter tests
node tests/email-delivery-tests.js

# 4. End-to-end API, health, and multi-portal tests (requires backend running)
node tests/api-tests.js

# 5. OTP lifecycle: registration, cooldown, expiration, consumption, reset
node tests/otp-lifecycle-tests.js

# 6. Supabase Storage cross-device upload and retrieval test
node tests/supabase-storage-e2e.js

# 7. Cross-role workflow verification suite (Citizen, Admin, Police)
node tests/workflow-tests.js
```

---

## Vercel Deployment Instructions

MCRN is pre-configured for deployment as **ONE integrated project on Vercel**.

### Deployment Architecture

```text
ONE VERCEL PROJECT
       │
       ├── Multi-Page Vite Frontend (Static CDN)
       │   ├── /                 → index.html (Landing & Auth)
       │   ├── /login, /register → index.html
       │   ├── /user-dashboard   → user.html (Citizen Portal)
       │   ├── /police-dashboard → police.html (Police Portal)
       │   ├── /admin/*          → admin.html (Admin Portal)
       │   ├── /contact-us       → contact.html (Emergency Helpline)
       │   └── /reporting        → reporting.html (Reporting Portal)
       │
       └── Unified Express Backend (Serverless Function)
           └── /api/*, /health   → api/index.js
```

### Step-by-Step Vercel Deployment

1. **Import Repository**:
   - In Vercel, select **Add New Project** and import `lavanyatangellapalli24/Missing_child_Rescue_Network`.
   - Select branch: `vercel-deployment`.

2. **Project Settings**:
   - **Root Directory**: `.` (leave as root)
   - **Framework Preset**: `Other` (configured via `vercel.json`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`

3. **Configure Environment Variables in Vercel**:
   Add the following variables in **Project Settings > Environment Variables**:

   | Variable | Description | Example / Note |
   |---|---|---|
   | `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
   | `PG_SSL` | Enable SSL for PostgreSQL | `true` |
   | `JWT_SECRET` | Secret key for JWT session tokens | Min 32 chars random string |
   | `JWT_EXPIRES_IN` | Session expiration window | `1h` |
   | `CORS_ORIGINS` | Allowed frontend origins | Explicit Vercel domain(s), comma-separated |
   | `MAIL_HOST` | SMTP server host | `smtp.gmail.com` |
   | `MAIL_PORT` | SMTP port | `587` |
   | `MAIL_SECURE` | SSL transport | `false` |
   | `MAIL_REQUIRE_TLS` | Require TLS | `true` |
   | `MAIL_USERNAME` | SMTP account email | `your-org@gmail.com` |
   | `MAIL_PASSWORD` | SMTP application password | 16-character App Password |
   | `MAIL_FROM` | Sender display string | `MCRN Security <your-org@gmail.com>` |
   | `ADMIN_DEFAULT_PASSWORD` | Initial admin account password | Strong secret password |
   | `ADMIN_EMAILS` | Comma-separated admin emails | `admin@example.com` |
   | `RESET_SECRET` | Secret for admin password resets | Random string |
   | `SUPABASE_URL` | Supabase project URL | `https://xxxx.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role secret | Server-side only key |
   | `SUPABASE_STORAGE_BUCKET` | Storage bucket name | `missing-child-images` |

4. **Deploy**:
   - Click **Deploy**. Vercel will install dependencies, build the frontend with all 6 entry points, and bundle `api/index.js` as the serverless API handler.

### Separate Frontend and Backend Deployment

The frontend can also be deployed from the `frontend` project root to Vercel, with the Express service deployed from `backend` as a long-running Render Web Service. Set the frontend build-time variable `VITE_API_URL` to the backend origin (for example, `https://YOUR-BACKEND-DOMAIN`); the frontend adds the `/api` prefix consistently. On the backend, set `CORS_ORIGINS` to the exact frontend origin (for example, `https://YOUR-FRONTEND-DOMAIN`) and set `PORT` through the hosting platform. Keep database, SMTP, JWT, and Supabase secrets only in the backend environment. Do not include localhost origins in production configuration.

---

## Security Instructions

1. **No Credentials in Git**: Never commit `.env` or files containing live credentials. All `.env*` files except `.env.example` and `.env.cloud.example` are strictly excluded by `.gitignore`.
2. **Server-Side Secrets**: `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, and `MAIL_PASSWORD` must only be configured in server-side environment variables. They are never exposed to frontend code or client bundles.
3. **Stateless Serverless Execution**: `api/index.js` runs statelessly without relying on persistent local disk storage. All uploaded media must use Supabase Storage in production.
4. **Least-Privilege Database Access**: Use connection pooling with standard transaction timeouts for serverless PostgreSQL connectivity.
