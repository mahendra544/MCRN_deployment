#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ensure modern node and npm if present in anaconda or custom path
if [ -d "/home/user/anaconda3/bin" ]; then
  export PATH="/home/user/anaconda3/bin:$PATH"
fi

echo "============================================================"
echo " MCRN COMPLETE SETUP (POSTGRESQL - CLEAN ARCHITECTURE)"
echo "============================================================"

if [ -f "$ROOT/.env" ]; then
  echo "Existing root .env found."
else
  echo "Creating root .env from .env.example..."
  cp "$ROOT/.env.example" "$ROOT/.env"
fi

echo "== Installing Backend Dependencies =="
(cd "$ROOT/backend" && npm install)

echo "== Installing Frontend Dependencies =="
(cd "$ROOT/frontend" && npm install)

echo "== Installing Integration Server Dependencies =="
(cd "$ROOT/integration/server" && npm install)

echo "== Initializing PostgreSQL Database Schema & Seeds =="
(cd "$ROOT" && node database/scripts/init-db.js)

echo "== Building Frontend Application =="
(cd "$ROOT/frontend" && npm run build)

if [ ! -f "$ROOT/frontend/dist/index.html" ]; then
  echo "ERROR: Frontend build did not produce frontend/dist/index.html"
  exit 1
fi

echo ""
echo "============================================================"
echo " SETUP COMPLETE"
echo "============================================================"
echo "Start the MCRN system with:"
echo "  ./start.sh"
echo ""
echo "Website:      http://localhost:5173"
echo "API gateway:  http://localhost:5000"
echo "============================================================"
