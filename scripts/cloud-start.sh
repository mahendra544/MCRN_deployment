#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export CLOUD_MODE=true
export NODE_ENV="${NODE_ENV:-production}"
export NODE_OPTIONS="${NODE_OPTIONS:-} --dns-result-order=ipv4first"

if [ -d "/home/user/anaconda3/bin" ]; then
  export PATH="/home/user/anaconda3/bin:$PATH"
fi

echo "Starting MCRN in unified cloud mode..."
echo "Public port: ${PORT:-5000}"

if [ ! -f "$ROOT/frontend/dist/index.html" ]; then
  echo "Building MCRN frontend..."
  (cd "$ROOT/frontend" && npm run build)
fi

if [ "${SKIP_DB_INIT:-false}" != "true" ]; then
  (cd "$ROOT" && node database/scripts/init-db.js)
fi

exec node "$ROOT/backend/src/server.js"
