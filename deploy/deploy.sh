#!/bin/bash
set -euo pipefail

PROJECT_DIR="/home/sufuf/apps/sufuf-api"
TARBALL="/home/sufuf/backend.tar.gz"
ENV_FILE="/home/sufuf/.sufuf-api.env"

echo "==> Preparing project directory"
mkdir -p "$PROJECT_DIR"
mkdir -p "$PROJECT_DIR/logs"
cd "$PROJECT_DIR"

if [ ! -f "$TARBALL" ]; then
    echo "ERROR: $TARBALL not found"
    exit 1
fi

echo "==> Extracting backend"
tar -xzf "$TARBALL" -C "$PROJECT_DIR" --strip-components=0
rm "$TARBALL"

if [ -f "$ENV_FILE" ]; then
    echo "==> Linking .env"
    ln -sf "$ENV_FILE" "$PROJECT_DIR/.env"
fi

# Patch ecosystem.config.js so PM2 cwd matches the actual project directory.
# (The committed ecosystem.config.js points to /home/sufuf/web/api.sufuf.pro/public_html,
#  but we deploy to /home/sufuf/apps/sufuf-api.)
if [ -f "$PROJECT_DIR/ecosystem.config.js" ]; then
    echo "==> Patching ecosystem.config.js cwd"
    sed -i "s|cwd: '[^']*'|cwd: '$PROJECT_DIR'|" "$PROJECT_DIR/ecosystem.config.js"
fi

echo "==> Installing dependencies"
npm install --no-audit --no-fund

echo "==> Generating Prisma client"
npx prisma generate

echo "==> Running migrations (deploy, fallback to db push)"
npx prisma migrate deploy || npx prisma db push --accept-data-loss

echo "==> Building TypeScript"
npm run build

echo "==> Restarting PM2"
pm2 delete sufuf-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo "==> Quick health check"
sleep 3
if curl -sf http://localhost:4000/health > /tmp/health-check.out 2>&1; then
    echo "Health check OK:"
    cat /tmp/health-check.out
    echo ""
else
    echo "Health check failed (check logs: pm2 logs sufuf-api)"
fi

echo "OK: Deployment complete"
