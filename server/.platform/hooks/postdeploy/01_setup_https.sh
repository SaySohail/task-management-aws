#!/bin/bash
set -euo pipefail

DOMAIN="tasks.sayedsohail.com"
EMAIL="sohail.aws.peerzade@gmail.com"

HTTP_CONF_DIR="/etc/nginx/conf.d"
TEMPLATE="/var/app/current/.platform/nginx/conf.d/10_https.conf.template"
TARGET="${HTTP_CONF_DIR}/10_https.conf"
ACME_WEBROOT="/var/www/letsencrypt"

echo "[HTTPS] Domain: $DOMAIN"
echo "[HTTPS] Preparing ACME webroot at ${ACME_WEBROOT}"
mkdir -p "$ACME_WEBROOT"
chown -R nginx:nginx "$ACME_WEBROOT" || true

install_certbot() {
  if command -v certbot >/dev/null 2>&1; then
    echo "[HTTPS] certbot already installed"
    return
  fi
  echo "[HTTPS] Installing certbot"
  if command -v dnf >/dev/null 2>&1; then
    dnf install -y certbot || dnf install -y python3-certbot
  elif command -v yum >/dev/null 2>&1; then
    yum install -y epel-release || true
    amazon-linux-extras enable epel || true
    yum clean metadata || true
    yum install -y certbot || yum install -y python3-certbot
  else
    echo "[HTTPS] Could not find dnf or yum. Aborting."
    exit 1
  fi
}

render_https_conf() {
  if [ ! -f "$TEMPLATE" ]; then
    echo "[HTTPS] Template not found at $TEMPLATE"; exit 1
  fi
  sed "s/__DOMAIN__/${DOMAIN}/g" "$TEMPLATE" > "$TARGET"
  echo "[HTTPS] Wrote $TARGET"
}

# Always ensure nginx can load HTTP config before ACME
echo "[HTTPS] Validating nginx config (HTTP only)"
nginx -t
systemctl reload nginx || systemctl restart nginx

install_certbot

if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
  echo "[HTTPS] Existing certificate found; ensuring HTTPS conf is in place"
  render_https_conf
  nginx -t
  systemctl reload nginx
  exit 0
fi

echo "[HTTPS] Obtaining new certificate for ${DOMAIN}"
certbot certonly --non-interactive --agree-tos --email "$EMAIL" \
  --webroot -w "$ACME_WEBROOT" -d "$DOMAIN"

echo "[HTTPS] Rendering HTTPS nginx conf and reloading"
render_https_conf
nginx -t
systemctl reload nginx

echo "[HTTPS] Done."
