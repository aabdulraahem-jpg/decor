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
