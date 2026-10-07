# MCRN Cloud Deployment

## What this version changes

- Frontends use same-origin `/api` calls instead of hard-coded localhost API URLs.
- The integration gateway supports `CLOUD_MODE=true` and listens on the hosting platform's public `PORT`.
- The gateway proxies `/api/auth`, `/api/user`, `/api/children`, `/api/report-child`, `/api/reports`, `/api/sightings`, `/api/police/*`, and `/api/admin/*` to the existing internal services.
- Authentication and application data are managed in one shared Supabase PostgreSQL database, ensuring all devices see identical accounts, reports, cases, and sightings.
- Missing-child report photos are uploaded to Supabase Storage and the HTTPS URL is stored in PostgreSQL. They do not depend on the server's local disk.
- Admin password-reset links use `PUBLIC_APP_URL`, so they work from the deployed domain.
- Unified single-port deployment is supported: `backend/src/server.js` serves both API and frontend on the cloud platform's `PORT`.

## Required cloud services

1. One public Node.js web service/VM that runs the complete MCRN stack.
2. One cloud PostgreSQL database (e.g., Supabase PostgreSQL with pooler connection string).
3. One Supabase Storage bucket (`missing-child-images`) for child and sighting images.

## Cloud environment

Use `.env.cloud.example` as the environment-variable checklist. Put real values in the hosting provider's secret/environment settings; do not commit them.

## Build and start commands

Build command:

    ./cloud-build.sh

Start command:

    ./cloud-start.sh

If your database schema has already been initialized, set:

    SKIP_DB_INIT=true

The hosting provider must expose its supplied `PORT`. The application binds to `0.0.0.0` automatically.

## Important

This ZIP is cloud-ready, but it is not automatically deployed to the internet. You still must deploy the service and provide the cloud PostgreSQL and Supabase Storage credentials. Without those external services, no application code can make localhost databases or localhost URLs accessible from another device.

## Image visibility

Missing-child report images are handled through Supabase Storage:
browser -> reporting backend -> Supabase Storage -> HTTPS image URL -> PostgreSQL -> other devices.

The report listing endpoint in the current project still returns a user's own submitted reports. The public/search case data is served through the synchronized `mcrn_db`/police data. Do not expose parent phone/email/address publicly unless that is intentional for your project.
