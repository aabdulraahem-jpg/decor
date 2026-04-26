#!/bin/bash
set -euo pipefail

echo "==> Sufuf API one-shot deploy"
echo "==> Host: $(hostname)  User: $(whoami)  Date: $(date)"

# Make sure target user/home exist
if ! id sufuf >/dev/null 2>&1; then
    echo "ERROR: user 'sufuf' does not exist on this host"
    exit 1
fi
mkdir -p /home/sufuf

# --- 1) Decode backend.tar.gz ---
echo "==> Writing /home/sufuf/backend.tar.gz ..."
base64 -d > /home/sufuf/backend.tar.gz <<'BACKEND_TARBALL_B64'
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
9vs+GTB5Js/k+bE//x8v9iaSACgBAA==
BACKEND_TARBALL_B64

ls -l /home/sufuf/backend.tar.gz

# --- 2) Write .sufuf-api.env ---
echo "==> Writing /home/sufuf/.sufuf-api.env ..."
cat > /home/sufuf/.sufuf-api.env <<'ENV_EOF'
NODE_ENV=production
PORT=4000

# Database — note %29 is URL-encoded ')'
DATABASE_URL="mysql://sufuf_Notouch:Notouchall0%29@localhost:3306/sufuf_sufuf_db"

# JWT
JWT_SECRET=cKSt29qlSGjUDAlEkOG1lIP78nkG1PGb24bwrF8SjQc=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth (filled later from admin panel)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://api.sufuf.pro/auth/google/callback

# Apple Sign In (later)
APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=

# CORS
CORS_ORIGINS=https://sufuf.pro,https://www.sufuf.pro,https://app.sufuf.pro,https://admin.sufuf.pro

# OpenAI (managed from admin panel, empty here)
OPENAI_API_KEY=

# APS (later)
APS_MERCHANT_ID=
APS_ACCESS_CODE=
APS_API_KEY=
APS_BASE_URL=https://sbcheckout.payfort.com/FortAPI/paymentApi
ENV_EOF

# --- 3) Write deploy.sh ---
echo "==> Writing /home/sufuf/deploy.sh ..."
cat > /home/sufuf/deploy.sh <<'DEPLOY_SH_EOF'
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
DEPLOY_SH_EOF

# --- 4) Write setup-nginx-proxy.sh ---
echo "==> Writing /root/setup-nginx-proxy.sh ..."
cat > /root/setup-nginx-proxy.sh <<'NGINX_EOF'
#!/bin/bash
set -euo pipefail

TPL_DIR="/usr/local/hestia/data/templates/web/nginx"

# Backup if exists
[ -f "$TPL_DIR/sufuf-node-proxy.tpl" ] && cp "$TPL_DIR/sufuf-node-proxy.tpl" "$TPL_DIR/sufuf-node-proxy.tpl.bak.$(date +%s)"

# HTTP template
cat > "$TPL_DIR/sufuf-node-proxy.tpl" <<'TPLEOF'
server {
    listen      %ip%:%proxy_port%;
    server_name %domain_idn% %alias_idn%;
    access_log  /var/log/nginx/domains/%domain%.log combined;
    access_log  /var/log/nginx/domains/%domain%.bytes bytes;
    error_log   /var/log/nginx/domains/%domain%.error.log error;
    client_max_body_size 50M;

    location /.well-known/acme-challenge/ {
        root %home%/%user%/web/%domain%/public_html;
    }

    location / {
        proxy_pass         http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90s;
    }
    include %home%/%user%/conf/web/%domain%/nginx.forcessl.conf*;
}
TPLEOF

# HTTPS template
cat > "$TPL_DIR/sufuf-node-proxy.stpl" <<'STPLEOF'
server {
    listen      %ip%:%proxy_ssl_port% ssl;
    http2 on;
    server_name %domain_idn% %alias_idn%;

    ssl_certificate     %ssl_pem%;
    ssl_certificate_key %ssl_key%;

    access_log  /var/log/nginx/domains/%domain%.log combined;
    access_log  /var/log/nginx/domains/%domain%.bytes bytes;
    error_log   /var/log/nginx/domains/%domain%.error.log error;
    client_max_body_size 50M;

    location / {
        proxy_pass         http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90s;
    }
}
STPLEOF

chmod 644 "$TPL_DIR/sufuf-node-proxy.tpl" "$TPL_DIR/sufuf-node-proxy.stpl"

# Apply to api.sufuf.pro
/usr/local/hestia/bin/v-change-web-domain-proxy-tpl sufuf api.sufuf.pro sufuf-node-proxy
/usr/local/hestia/bin/v-rebuild-web-domains sufuf

# Test config
nginx -t && systemctl reload nginx

echo "OK: Nginx proxy template installed and applied to api.sufuf.pro"
NGINX_EOF

# --- 5) Permissions ---
echo "==> Setting ownership and permissions ..."
chown sufuf:sufuf /home/sufuf/backend.tar.gz /home/sufuf/.sufuf-api.env /home/sufuf/deploy.sh
chmod 600 /home/sufuf/.sufuf-api.env
chmod +x /home/sufuf/deploy.sh /root/setup-nginx-proxy.sh

# --- 6) Run nginx proxy setup (root) ---
echo "==> Running nginx proxy setup ..."
bash /root/setup-nginx-proxy.sh

# --- 7) Run deploy as sufuf ---
echo "==> Running deploy as sufuf ..."
su - sufuf -c 'bash /home/sufuf/deploy.sh'

# --- 8) Local health check (best-effort) ---
echo "==> Local health check (http://localhost:4000/health) ..."
sleep 2
curl -sf http://localhost:4000/health || echo "(local health check failed; check pm2 logs)"
echo ""

echo "==> All done"
