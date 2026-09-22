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

echo "==> Detecting your Traefik setup"
# Detection must never abort the script — guard everything and keep going.
set +e
netsOf() { docker inspect "$1" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{"\n"}}{{end}}' 2>/dev/null; }
labels() { docker inspect "$1" --format '{{json .Config.Labels}}' 2>/dev/null | tr ',' '\n'; }
pick() { labels "$1" | grep -iE "$2" | head -1 | sed -E 's/.*: *"?([^"]+)"?.*/\1/'; }
realnet() { grep -vE '^(bridge|host|none)$'; }

# Copy the wiring from a container that ALREADY works behind Traefik
# (has traefik.http.routers.* labels) — e.g. seekhbo. That's the ground truth.
EXAMPLE=""
for c in $(docker ps -q); do
  if labels "$c" | grep -qi 'traefik\.http\.routers'; then EXAMPLE="$c"; break; fi
done

if [ -n "$EXAMPLE" ]; then
  TRAEFIK_NETWORK=$(netsOf "$EXAMPLE" | realnet | head -1)
  TRAEFIK_ENTRYPOINT=$(pick "$EXAMPLE" 'routers\..*\.entrypoints')
  CERT_RESOLVER=$(pick "$EXAMPLE" 'routers\..*\.(tls\.)?certresolver')
fi
# Fallbacks from the known Hostinger n8n template
[ -z "$TRAEFIK_ENTRYPOINT" ] && TRAEFIK_ENTRYPOINT=websecure
[ -z "$CERT_RESOLVER" ] && CERT_RESOLVER=letsencrypt
set -e

echo "    example app       : ${EXAMPLE:-<none>}"
echo "    network           : ${TRAEFIK_NETWORK:-<none>}"
echo "    entrypoint        : $TRAEFIK_ENTRYPOINT"
echo "    certresolver      : $CERT_RESOLVER"
if [ -z "$TRAEFIK_NETWORK" ]; then
  echo "!! Could not find the Traefik network from an existing app."
  echo "   Docker networks available:"; docker network ls | sed 's/^/      /'
  echo "   Set TRAEFIK_NETWORK in deploy/.env and re-run."
  exit 1
fi

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

if [ -z "$CERT_RESOLVER" ]; then
  echo "!! Could not auto-detect the Let's Encrypt cert-resolver name."
  echo "   Open deploy/.env and set CERT_RESOLVER to the same value n8n uses, then re-run."
  echo "   Find it with:  docker inspect $SRC --format '{{json .Config.Labels}}' | tr ',' '\\n' | grep certresolver"
  exit 1
fi

echo "==> Building and starting (this does not touch n8n)"
docker compose --env-file "$ENV" up -d --build

echo
echo "Done. Give it a minute for the image build + first request, then open:"
echo "    https://$DOMAIN"
echo "  logs   : docker compose logs -f shp-app"
echo "  update : git pull && docker compose --env-file deploy/.env up -d --build"
