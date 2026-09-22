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
TRAEFIK_CID=$(docker ps --format '{{.ID}} {{.Image}}' | awk 'tolower($2) ~ /traefik/ {print $1; exit}')
N8N_CID=$(docker ps --format '{{.ID}} {{.Image}} {{.Names}}' | awk 'tolower($0) ~ /n8n/ {print $1; exit}')
[ -z "$TRAEFIK_CID" ] && { echo "!! No Traefik container found"; exit 1; }

netsOf() { docker inspect "$1" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{"\n"}}{{end}}'; }
# Network shared by Traefik and n8n (fallback: Traefik's first non-bridge net)
TRAEFIK_NETWORK=""
if [ -n "${N8N_CID:-}" ]; then
  TRAEFIK_NETWORK=$(comm -12 <(netsOf "$TRAEFIK_CID" | sort -u) <(netsOf "$N8N_CID" | sort -u) | grep -v '^bridge$' | head -1)
fi
[ -z "$TRAEFIK_NETWORK" ] && TRAEFIK_NETWORK=$(netsOf "$TRAEFIK_CID" | grep -v '^bridge$' | head -1)

# Entrypoint + cert-resolver copied from n8n's own Traefik labels
labels() { docker inspect "$1" --format '{{json .Config.Labels}}' | tr ',' '\n'; }
pick() { labels "$1" | grep -iE "$2" | head -1 | sed -E 's/.*"([^"]+)" *$/\1/;s/.*: *"?([^"]+)"?.*/\1/'; }
SRC=${N8N_CID:-$TRAEFIK_CID}
TRAEFIK_ENTRYPOINT=$(pick "$SRC" 'routers\..*\.entrypoints'); TRAEFIK_ENTRYPOINT=${TRAEFIK_ENTRYPOINT:-websecure}
CERT_RESOLVER=$(pick "$SRC" 'routers\..*\.tls\.certresolver'); CERT_RESOLVER=${CERT_RESOLVER:-}

echo "    network    : $TRAEFIK_NETWORK"
echo "    entrypoint : $TRAEFIK_ENTRYPOINT"
echo "    certresolver: ${CERT_RESOLVER:-<none found — check .env>}"

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
