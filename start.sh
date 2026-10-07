#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

if [ -d "/home/user/anaconda3/bin" ]; then
  export PATH="/home/user/anaconda3/bin:$PATH"
fi

cleanup(){ kill 0 2>/dev/null || true; }
trap cleanup INT TERM EXIT

# Ensure frontend build exists
if [ ! -f "$ROOT/frontend/dist/index.html" ]; then
  echo "Building MCRN frontend..."
  (cd "$ROOT/frontend" && npm run build)
fi

export NODE_OPTIONS="${NODE_OPTIONS:-} --dns-result-order=ipv4first"

# Gracefully free ports if held by old local MCRN processes
for port in 5173 5000; do
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" 2>/dev/null || true
  elif command -v lsof >/dev/null 2>&1; then
    old_pid=$(lsof -ti ":$port" 2>/dev/null || true)
    if [ -n "$old_pid" ]; then
      kill -TERM "$old_pid" 2>/dev/null || true
      sleep 1
    fi
  fi
done

# Initialize/verify database
(cd "$ROOT" && node database/scripts/init-db.js)

# Start Unified Backend
(cd "$ROOT/backend" && npm start) &

sleep 2

# Start Integration Web Gateway
(cd "$ROOT/integration/server" && node server.js) &

echo ""
echo "MCRN System is running!"
echo "Website:      http://localhost:5173"
echo "API Gateway:  http://localhost:5000"
echo "Health:       http://localhost:5000/health"
echo "Press Ctrl+C to stop all services."
wait
