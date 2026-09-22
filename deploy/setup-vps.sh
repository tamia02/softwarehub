#!/usr/bin/env bash
# One-shot setup for a fresh Ubuntu 22.04 / 24.04 VPS (Hostinger KVM).
# Run as root on the server:
#   DOMAIN=yourdomain.in EMAIL=you@example.com bash setup-vps.sh
#
# Installs Node 22, PostgreSQL, Nginx, Certbot and PM2; clones the repo to
# /var/www/shp; creates the database and .env.production with fresh secrets;
# builds and starts the app; installs the cron jobs; issues a Let's Encrypt cert.
# Safe to re-run: existing .env.production and database are kept.
set -euo pipefail

: "${DOMAIN:?Set DOMAIN=yourdomain.in}"
: "${EMAIL:?Set EMAIL=you@example.com (for Lets Encrypt notices)}"
REPO=${REPO:-https://github.com/tamia02/softwarehub.git}
BRANCH=${BRANCH:-main}
APP_DIR=/var/www/shp
DB_NAME=shp
DB_USER=shp
DB_PASS=$(openssl rand -hex 24)

echo "==> System packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git ufw nginx postgresql postgresql-contrib certbot python3-certbot-nginx build-essential

echo "==> Node 22"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v)" != v22* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
npm i -g pm2 >/dev/null

echo "==> Firewall (SSH + HTTP/HTTPS only)"
ufw allow OpenSSH >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw --force enable >/dev/null

echo "==> App user + checkout"
id -u shp >/dev/null 2>&1 || useradd -r -m -d /home/shp -s /bin/bash shp
mkdir -p "$APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch --depth=1 origin "$BRANCH" && git -C "$APP_DIR" reset --hard "origin/$BRANCH"
else
  git clone --depth=1 -b "$BRANCH" "$REPO" "$APP_DIR"
fi

ENV_FILE="$APP_DIR/.env.production"
if [ ! -f "$ENV_FILE" ]; then
  echo "==> PostgreSQL database"
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';" 2>/dev/null \
    || sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER ROLE ${DB_USER} WITH PASSWORD '${DB_PASS}';"
  sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 \
    || sudo -u postgres createdb -O "${DB_USER}" "${DB_NAME}"

  echo "==> Environment file"
  cat > "$ENV_FILE" <<ENV
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://${DOMAIN}
NEXT_PUBLIC_SUPPORT_EMAIL=support@${DOMAIN}
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}

# Never change CODE_HASH_SALT after codes have been issued.
CODE_HASH_SALT=$(openssl rand -hex 32)
CODE_ENCRYPTION_KEY=$(openssl rand -hex 32)
AUTH_SECRET=$(openssl rand -hex 32)
CRON_SECRET=$(openssl rand -hex 32)

# Demo switches: remove both once Razorpay and email/SMS keys are filled in.
ALLOW_MOCK_GATEWAY=true
ALLOW_DEV_OTP=true

# RAZORPAY_KEY_ID=
# RAZORPAY_KEY_SECRET=
# RAZORPAY_WEBHOOK_SECRET=
# RESEND_API_KEY=
# EMAIL_FROM="Software Hub Pool <noreply@${DOMAIN}>"
# MSG91_AUTH_KEY=
# MSG91_SENDER=SHPOOL
# MSG91_TEMPLATE_OTP=
# ADMIN_EMAIL=ops@${DOMAIN}
ENV
  chmod 600 "$ENV_FILE"
  echo "    wrote $ENV_FILE"
else
  echo "==> Keeping existing $ENV_FILE and database"
fi
chown -R shp:shp "$APP_DIR"

echo "==> Build"
sudo -u shp bash -c "cd '$APP_DIR' && npm ci --no-audit --no-fund && npm run build"

echo "==> PM2"
sudo -u shp bash -c "cd '$APP_DIR' && pm2 startOrReload deploy/ecosystem.config.cjs --update-env && pm2 save"
env PATH="$PATH" pm2 startup systemd -u shp --hp /home/shp >/dev/null

echo "==> Cron jobs (pool expiry every 15 min, pass reminders daily 09:00)"
CRON_SECRET_VAL=$(grep '^CRON_SECRET=' "$ENV_FILE" | cut -d= -f2)
cat > /etc/cron.d/shp <<CRON
*/15 * * * * shp curl -fsS -H "Authorization: Bearer ${CRON_SECRET_VAL}" http://127.0.0.1:3000/api/cron/pools-expire >/dev/null 2>&1
0 9 * * *    shp curl -fsS -H "Authorization: Bearer ${CRON_SECRET_VAL}" http://127.0.0.1:3000/api/cron/pass-reminders >/dev/null 2>&1
CRON
chmod 644 /etc/cron.d/shp

echo "==> Nginx"
sed "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" "$APP_DIR/deploy/nginx.conf" > /etc/nginx/sites-available/shp
ln -sf /etc/nginx/sites-available/shp /etc/nginx/sites-enabled/shp
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> HTTPS (Let's Encrypt)"
if certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" -m "$EMAIL" --agree-tos --redirect -n; then
  echo "    certificate issued; renewal runs automatically (certbot.timer)"
else
  echo "    !! certbot failed - usually the DNS A record has not propagated yet. Re-run later:"
  echo "       certbot --nginx -d $DOMAIN -d www.$DOMAIN -m $EMAIL --agree-tos --redirect -n"
fi

echo
echo "Done -> https://${DOMAIN}"
echo "  app dir  : $APP_DIR"
echo "  env file : $ENV_FILE   (edit, then: sudo -u shp pm2 restart shp --update-env)"
echo "  logs     : sudo -u shp pm2 logs shp"
echo "  redeploy : bash $APP_DIR/deploy/deploy.sh"
