# Missing Child Rescue Network (MCRN)

Missing Child Rescue Network (MCRN) is a full-stack platform dedicated to rapid reporting, investigation tracking, and recovery of missing children. The platform bridges citizens, law enforcement officers, and network administrators through real-time notifications, sighting verifications, and cross-departmental coordination.

---

## Architecture Overview

MCRN is organized into a clean, conventional full-stack architecture:

- **Frontend**: Single unified React application housing all user experiences (Citizen Portal, Police Operations Portal, Admin Management Portal, and Public Reporting). Built with Vite and Tailwind CSS.
- **Backend**: Unified Node.js / Express API service consolidating Authentication, User Dashboard, Citizen Reporting, Police Operations, and Admin Controls.
- **Database**: PostgreSQL database hosting relational models for user credentials, role profiles, missing child cases, sightings, and administrative audit trails.
- **Integration**: Lightweight high-performance Gateway serving the compiled web application and proxying API traffic.

---

## Directory Structure

```text
mahendra_project/
├── frontend/                     # Unified React + Vite frontend application
│   ├── src/
│   │   ├── auth/                 # Login, Registration, OTP Verification, Citizen Profile
│   │   ├── user/                 # Citizen Dashboard, Child Details, Search, Sighting Reports
│   │   ├── reporting/            # Citizen Missing Child Reporting form & synchronization
│   │   ├── police/               # Police Operations Dashboard, Verification, Case Records
│   │   ├── contact/              # Emergency Helpline and Contact Us page
│   │   ├── admin/                # Administrator Portal, Case Assignment, Audit Logs, Analytics
│   │   ├── App.jsx               # Centralized React Router configuration
│   │   ├── main.jsx              # Application entry point with global auth token interceptor
│   │   └── index.css             # Base application stylesheet
│   ├── public/                   # Shared static assets (logos, default avatar, icons)
│   ├── package.json              # Frontend dependencies and build scripts
│   └── vite.config.js            # Vite configuration and dev proxy settings
│
├── backend/                      # Unified Express backend service
│   ├── src/
│   │   ├── auth/                 # JWT authentication, registration, password recovery
│   │   ├── user/                 # Children directory queries & citizen dashboard data
│   │   ├── reporting/            # Report submission, Multer & Supabase Storage upload, dual-table sync
│   │   ├── police/               # Police case investigations, sightings verification, alerts
│   │   ├── admin/                # Case assignment, officer & citizen management, audit logs
│   │   ├── middleware/           # Role-based authorization & JWT verification
│   │   ├── utils/                # Email utilities (Nodemailer) & helper routines
│   │   ├── db/                   # PostgreSQL connection pool & SQL query wrappers
│   │   └── server.js             # Master Express server entry point
│   ├── uploads/                  # Local media upload storage
│   └── package.json              # Backend dependencies and run scripts
│
├── database/                     # Database migrations, schema, and seed routines
│   ├── schema/                   # PostgreSQL DDL definitions and column migrations
│   ├── seed/                     # Default officer and administrator seed records
│   └── scripts/                  # Unified database initialization script (init-db.js)
│
├── integration/                  # Integration & Web Serving Gateway
│   └── server/                   # Express / HTTP static server and API proxy
│
├── docs/                         # Extended deployment and configuration guides
│   ├── CLOUD_DEPLOYMENT.md
│   ├── SMTP_SETUP.md
│   └── FIXES_INCLUDED.txt
│
├── scripts/                      # Build, startup, and automation scripts
│   ├── cloud-build.sh
│   └── cloud-start.sh
│
├── tests/                        # Verification and integration tests
│   ├── api-tests.js
│   └── db-test.js
│
├── .env                          # Centralized active environment configuration (uncommitted)
├── .env.example                  # Template with safe placeholder keys
├── .gitignore                    # Git ignore rules for node_modules, dist, and secrets
├── setup.sh                      # One-click dependency installation, migration, and build
└── start.sh                      # One-click unified system launcher
```

---

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher (or cloud PostgreSQL instance e.g., Supabase / Neon / AWS RDS)

---

## Environment Configuration

All environment configuration is centralized in **one root file**: `.env`.

Copy the template file:
```bash
cp .env.example .env
```

Configure your parameters:
- `DATABASE_URL`: PostgreSQL connection string (`postgresql://USER:PASSWORD@HOST:PORT/DBNAME`).
- `PG_SSL`: Set to `true` for cloud-hosted databases requiring SSL, or `false` for local databases.
- `JWT_SECRET`: Random secret string (minimum 32 characters) used to sign session tokens.
- `MAIL_USERNAME` / `MAIL_PASSWORD`: SMTP credentials for OTP account verification emails.
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_STORAGE_BUCKET`: Supabase Storage credentials for photos.

---

## Quick Start (One-Click Setup)

Run the automated setup script to install dependencies across modules, initialize database tables, and produce the frontend bundle:

```bash
./setup.sh
```

Launch the complete platform:

```bash
./start.sh
```

Once started:
- **Website**: http://localhost:5173
- **API Gateway**: http://localhost:5000
- **API Health**: http://localhost:5000/health

---

## Module Details

### 1. Citizen Portal
- **Login / Register**: `/login` and `/register`
- **Dashboard**: `/user-dashboard`
- **Search Missing Children**: `/search-children`
- **File a Report**: `/report-child`
- **Submit Sighting**: `/report-sighting`
- **Helpline**: `/contact-us`

### 2. Police Operations Portal
- **Officer Login**: `/login` (Select "Police" tab) or `/police-login`
- **Dashboard & Case Feed**: `/police-dashboard`
- **Sighting Verification**: `/police-verify`
- **Search Records**: `/police-search`
- **Profile & Logout**: `/police-profile`

### 3. Administrator Portal
- **Admin Access**: `/admin`
- **Default Credentials**: Default password configured in `.env` (`ADMIN_DEFAULT_PASSWORD`).
- **Features**: Case verification, priority assigning, officer case delegation, user accounts management, system audit logs, metrics and analytics.

---

## Testing & Validation

Verify database connectivity and schema tables:
```bash
node tests/db-test.js
```

Verify backend APIs while services are running:
```bash
node tests/api-tests.js
```

---

## Troubleshooting

- **Port in Use**: If ports 5173 or 5000 are already bound, run `killall node` or stop the conflicting process before restarting `./start.sh`.
- **Database Connection Error**: Verify that `DATABASE_URL` is accessible from your network and that `PG_SSL` is set to `true` for cloud database providers.
- **Upload Errors**: Verify Supabase Storage credentials (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) in `.env`.
deployment setup for missing child rescue network
