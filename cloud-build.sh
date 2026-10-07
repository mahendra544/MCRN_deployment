#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR"

if [ -d "/home/user/anaconda3/bin" ]; then
  export PATH="/home/user/anaconda3/bin:$PATH"
fi

echo "== Installing backend =="
(cd "$ROOT/backend" && npm install)

echo "== Installing frontend =="
(cd "$ROOT/frontend" && npm install)

echo "== Installing integration gateway =="
(cd "$ROOT/integration/server" && npm install)

echo "== Building frontend =="
(cd "$ROOT/frontend" && npm run build)

echo "Cloud build completed."
