#!/bin/bash
set -euo pipefail

DOMAIN="${CERTBOT_DOMAIN:-tasks.sayedsohail.com}"
EMAIL="${CERTBOT_EMAIL:?Set CERTBOT_EMAIL in EB -> Configuration -> Software}"

ACME_WEBROOT="/var/www/letsencrypt"
NGINX_DIR="/etc/nginx/conf.d"

HTTP_TMPL="/var/app/current/.platform/nginx/conf.d/00_http.conf.template"
HTTPS_TMPL="/var/app/current/.platform/nginx/conf.d/10_https.conf.template"
HTTP_CONF="${NGINX_DIR}/00_http.conf"
HTTPS_CONF="${NGINX_DIR}/10_https.conf"

echo "[HTTPS] Domain: $DOMAIN"

# 0) Figure out which port your app actually listens on.
# Prefer $PORT if set; otherwise probe 8080 then 8081 (healthz or /).
BACKEND_PORT=""
# Load EB environment vars if available
if [ -f /opt/elasticbeanstalk/support/envvars ]; then
  # shellcheck disable=SC1091
  source /opt/elasticbeanstalk/support/envvars || true
fi

probe_port() {
  local p="$1"
  # try /healthz then /
  if curl -sS -I "http://127.0.0.1:${p}/healthz" >/dev/null 2>&1; then return 0; fi
  if curl -sS -I "http://127.0.0.1:${p}/"       >/dev/null 2>&1; then return 0; fi
  return 1
}

if [ -n "${PORT:-}" ] && probe_port "$PORT"; then
  BACKEND_PORT="$PORT"
elif probe_port 8080; then
  BACKEND_PORT="8080"
elif probe_port 8081; then
  BACKEND_PORT="8081"
else
  # fallback (most EB Node single-instance use 8080)
  BACKEND_PORT="${PORT:-8080}"
fi

echo "[HTTPS] Using backend port: ${BACKEND_PORT}"

# 1) Ensure ACME webroot exists
mkdir -p "$ACME_WEBROOT"
chown -R nginx:nginx "$ACME_WEBROOT" || true

# 2) Render HTTP conf (always present)
sed -e "s/__DOMAIN__/${DOMAIN}/g" -e "s/__PORT__/${BACKEND_PORT}/g" "$HTTP_TMPL" > "$HTTP_CONF"
echo "[HTTPS] Wrote $HTTP_CONF"
nginx -t
systemctl reload nginx || systemctl restart nginx

# 3) Install certbot if missing (AL2023/AL2)
if ! command -v certbot >/dev/null 2>&1; then
  echo "[HTTPS] Installing certbot"
  if command -v dnf >/dev/null 2>&1; then
    dnf install -y certbot || dnf install -y python3-certbot
  elif command -v yum >/dev/null 2>&1; then
    yum install -y epel-release || true
    amazon-linux-extras enable epel || true
    yum clean metadata || true
    yum install -y certbot || yum install -y python3-certbot
  else
    echo "[HTTPS] No dnf/yum found"; exit 1
  fi
fi

# 4) Obtain certificate if not present
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
  echo "[HTTPS] Obtaining certificate for ${DOMAIN}"
  certbot certonly --non-interactive --agree-tos --email "$EMAIL" \
    --webroot -w "$ACME_WEBROOT" -d "$DOMAIN"
fi

# 5) Render HTTPS conf and reload
sed -e "s/__DOMAIN__/${DOMAIN}/g" -e "s/__PORT__/${BACKEND_PORT}/g" "$HTTPS_TMPL" > "$HTTPS_CONF"
echo "[HTTPS] Wrote $HTTPS_CONF"
nginx -t
systemctl reload nginx

echo "[HTTPS] Done."
