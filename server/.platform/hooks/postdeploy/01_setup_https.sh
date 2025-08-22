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

# 0) Find the backend port (prefer $PORT, else probe 8081/8080)
BACKEND_PORT=""
# Source EB env vars if available
if [ -f /opt/elasticbeanstalk/support/envvars ]; then
  # shellcheck disable=SC1091
  source /opt/elasticbeanstalk/support/envvars || true
fi
CANDIDATES=()
[ -n "${PORT:-}" ] && CANDIDATES+=("$PORT")
CANDIDATES+=("8081" "8080")
for p in "${CANDIDATES[@]}"; do
  if curl -sSf -I "http://127.0.0.1:${p}/healthz" >/dev/null 2>&1; then
    BACKEND_PORT="$p"
    break
  fi
done
BACKEND_PORT="${BACKEND_PORT:-${PORT:-8081}}"
echo "[HTTPS] Using backend port: ${BACKEND_PORT}"

# 1) Ensure ACME webroot
mkdir -p "$ACME_WEBROOT"
chown -R nginx:nginx "$ACME_WEBROOT" || true

# 2) Render HTTP conf with correct port + domain (always present)
sed -e "s/__PORT__/${BACKEND_PORT}/g" -e "s/__DOMAIN__/${DOMAIN}/g" "$HTTP_TMPL" > "$HTTP_CONF"
echo "[HTTPS] Wrote $HTTP_CONF"

# 3) Validate + (re)load HTTP-only config so ACME can work
nginx -t
systemctl reload nginx || systemctl restart nginx

# 4) Install certbot if missing (AL2023 or AL2)
install_certbot() {
  if command -v certbot >/dev/null 2>&1; then return; fi
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
}
install_certbot

# 5) Obtain or ensure certificate, then render HTTPS conf
if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
  echo "[HTTPS] Cert already exists"
else
  echo "[HTTPS] Obtaining new certificate for ${DOMAIN}"
  certbot certonly --non-interactive --agree-tos --email "$EMAIL" \
    --webroot -w "$ACME_WEBROOT" -d "$DOMAIN"
fi

# Render HTTPS conf with correct port + domain
sed -e "s/__PORT__/${BACKEND_PORT}/g" -e "s/__DOMAIN__/${DOMAIN}/g" "$HTTPS_TMPL" > "$HTTPS_CONF"
echo "[HTTPS] Wrote $HTTPS_CONF"

# 6) Validate + reload with HTTPS enabled
nginx -t
systemctl reload nginx

echo "[HTTPS] Done."
