#!/bin/bash
set -euo pipefail

DOMAIN="tasks.sayedsohail.com"
EMAIL="sohail.aws.peerzade@gmail.com"  

echo "[HTTPS] Preparing ACME webroot"
mkdir -p /var/www/letsencrypt
chown -R nginx:nginx /var/www/letsencrypt || true

echo "[HTTPS] Installing certbot (Amazon Linux 2)"
yum install -y epel-release || true
amazon-linux-extras enable epel || true
yum clean metadata || true
yum install -y certbot || yum install -y python3-certbot || true

echo "[HTTPS] Ensuring nginx is running with our HTTP server for challenge"
nginx -t
systemctl reload nginx || systemctl restart nginx

# If certs already exist, try renew; otherwise obtain new
if [ -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
  echo "[HTTPS] Renewing existing certificate"
  certbot renew --quiet --no-random-sleep-on-renew --deploy-hook "systemctl reload nginx"
else
  echo "[HTTPS] Obtaining new certificate for $DOMAIN"
  certbot certonly --non-interactive --agree-tos --email "$EMAIL" \
    --webroot -w /var/www/letsencrypt -d "$DOMAIN"
  echo "[HTTPS] Reloading nginx with new certificate"
  nginx -t
  systemctl reload nginx
fi

echo "[HTTPS] Done."
