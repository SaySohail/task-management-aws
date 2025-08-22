#!/bin/bash
set -euo pipefail

DOMAIN="tasks.sayedsohail.com"
EMAIL="sohail.aws.peerzade@gmail.com"
ACME_WEBROOT="/var/www/letsencrypt"
NGINX_DIR="/etc/nginx/conf.d"
HTTPS_TMPL="/var/app/current/.platform/nginx/conf.d/10_https.conf.template"
HTTPS_CONF="${NGINX_DIR}/10_https.conf"

echo "[HTTPS] Domain: $DOMAIN"

# ACME webroot
mkdir -p "$ACME_WEBROOT"
chown -R nginx:nginx "$ACME_WEBROOT" || true

# Ensure HTTP config (00_http.conf) is already in place from the repo, then reload
nginx -t
systemctl reload nginx || systemctl restart nginx

# Install certbot if missing (AL2023/AL2)
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

# Obtain cert if not present
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
  echo "[HTTPS] Obtaining certificate for ${DOMAIN}"
  certbot certonly --non-interactive --agree-tos --email "$EMAIL" \
    --webroot -w "$ACME_WEBROOT" -d "$DOMAIN"
fi

# Render HTTPS conf (domain only) and reload
sed "s/__DOMAIN__/${DOMAIN}/g" "$HTTPS_TMPL" > "$HTTPS_CONF"
nginx -t
systemctl reload nginx

echo "[HTTPS] Done."
