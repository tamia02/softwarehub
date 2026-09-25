#!/usr/bin/env bash
# Deploy Software Hub Pool as a container behind an EXISTING Traefik (the one
# already serving n8n). n8n is never modified. Run from the repo root on the VPS:
#
#   DOMAIN=app.yourdomain.com bash deploy/vps-docker.sh
#
# It auto-detects Traefik's network / entrypoint / cert-resolver from the
# running n8n + Traefik containers, generates secrets, then builds and starts
# the app (+ its own Postgres). Safe to re-run.
set -euo pipefail
cd "$(dirname "$0")/.."
ENV=deploy/.env
: "${DOMAIN:?Set DOMAIN=app.yourdomain.com}"

need() { command -v "$1" >/dev/null 2>&1 || { echo "!! '$1' not found"; exit 1; }; }
need docker
docker compose version >/dev/null 2>&1 || { echo "!! 'docker compose' plugin not found"; exit 1; }

echo "==> Detecting your Traefik entrypoint / cert-resolver"
# The app runs on its OWN network (shp_web); Traefik's Docker provider finds it
# by label. We only need to copy the entrypoint + cert-resolver names from an
# app that already works behind your Traefik (e.g. seekhbo).
set +e
labels() { docker inspect "$1" --format '{{json .Config.Labels}}' 2>/dev/null | tr ',' '\n'; }
pick() { labels "$1" | grep -iE "$2" | head -1 | sed -E 's/.*: *"?([^"]+)"?.*/\1/'; }
EXAMPLE=""
for c in $(docker ps -q); do
  if labels "$c" | grep -qi 'traefik\.http\.routers'; then EXAMPLE="$c"; break; fi
done
if [ -n "$EXAMPLE" ]; then
  TRAEFIK_ENTRYPOINT=$(pick "$EXAMPLE" 'routers\..*\.entrypoints')
  CERT_RESOLVER=$(pick "$EXAMPLE" 'routers\..*\.(tls\.)?certresolver')
fi
[ -z "$TRAEFIK_ENTRYPOINT" ] && TRAEFIK_ENTRYPOINT=websecure
[ -z "$CERT_RESOLVER" ] && CERT_RESOLVER=letsencrypt
TRAEFIK_NETWORK=shp_web
set -e

echo "    example app  : ${EXAMPLE:-<none, using defaults>}"
echo "    entrypoint   : $TRAEFIK_ENTRYPOINT"
echo "    certresolver : $CERT_RESOLVER"
echo "    app network  : shp_web (created for this app)"

echo "==> Writing $ENV"
gen() { openssl rand -hex 32; }
keep() { [ -f "$ENV" ] && grep -E "^$1=" "$ENV" | head -1 | cut -d= -f2- || true; }
DB_PASSWORD=$(keep DB_PASSWORD); DB_PASSWORD=${DB_PASSWORD:-$(openssl rand -hex 24)}
CODE_HASH_SALT=$(keep CODE_HASH_SALT); CODE_HASH_SALT=${CODE_HASH_SALT:-$(gen)}
CODE_ENCRYPTION_KEY=$(keep CODE_ENCRYPTION_KEY); CODE_ENCRYPTION_KEY=${CODE_ENCRYPTION_KEY:-$(gen)}
AUTH_SECRET=$(keep AUTH_SECRET); AUTH_SECRET=${AUTH_SECRET:-$(gen)}
CRON_SECRET=$(keep CRON_SECRET); CRON_SECRET=${CRON_SECRET:-$(gen)}
ROOT_DOMAIN=$(echo "$DOMAIN" | sed -E 's/^[^.]+\.//')

cat > "$ENV" <<ENVFILE
DOMAIN=$DOMAIN
SUPPORT_EMAIL=support@$ROOT_DOMAIN
TRAEFIK_NETWORK=$TRAEFIK_NETWORK
TRAEFIK_ENTRYPOINT=$TRAEFIK_ENTRYPOINT
CERT_RESOLVER=$CERT_RESOLVER
DB_PASSWORD=$DB_PASSWORD
CODE_HASH_SALT=$CODE_HASH_SALT
CODE_ENCRYPTION_KEY=$CODE_ENCRYPTION_KEY
AUTH_SECRET=$AUTH_SECRET
CRON_SECRET=$CRON_SECRET
ENVFILE
chmod 600 "$ENV"

echo "==> Building and starting (this does not touch n8n)"
if [ "${RESET:-0}" = "1" ]; then
  echo "   RESET=1 → wiping this app's database volume for a clean reseed"
  docker compose --env-file "$ENV" down -v --remove-orphans 2>/dev/null || true
else
  # Clear any earlier/broken definition of THIS project only (keeps the db volume).
  docker compose --env-file "$ENV" down --remove-orphans 2>/dev/null || true
fi
docker compose --env-file "$ENV" up -d --build

# --- Auto-deploy: check GitHub every 5 min and redeploy on new commits ---
REPO_DIR=$(pwd)
if command -v crontab >/dev/null 2>&1 || [ -d /etc/cron.d ]; then
  cat > /etc/cron.d/shp-autodeploy <<CRON
*/5 * * * * root cd $REPO_DIR && bash deploy/autodeploy.sh >> /var/log/shp-autodeploy.log 2>&1
CRON
  chmod 644 /etc/cron.d/shp-autodeploy
  touch /var/log/shp-autodeploy.log
  echo "==> Auto-deploy installed: this server now updates itself from GitHub every 5 min."
fi

echo
echo "Done. Give it a minute for the image build + first request, then open:"
echo "    https://$DOMAIN"
echo "  This server now AUTO-DEPLOYS: any push to GitHub goes live within ~5 min,"
echo "  no terminal needed. Watch it:  tail -f /var/log/shp-autodeploy.log"
