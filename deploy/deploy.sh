#!/usr/bin/env bash
# Redeploy the latest main on the VPS: pull, install, build, reload PM2.
#   bash /var/www/shp/deploy/deploy.sh
set -euo pipefail
APP_DIR=${APP_DIR:-/var/www/shp}
BRANCH=${BRANCH:-main}

run() {
  if [ "$(id -un)" = "shp" ]; then bash -c "$1"; else sudo -u shp bash -c "$1"; fi
}

run "cd '$APP_DIR' && git fetch --depth=1 origin '$BRANCH' && git reset --hard 'origin/$BRANCH'"
run "cd '$APP_DIR' && npm ci --no-audit --no-fund"
run "cd '$APP_DIR' && npm run build"
run "cd '$APP_DIR' && pm2 startOrReload deploy/ecosystem.config.cjs --update-env && pm2 save"
echo "deployed $(git -C "$APP_DIR" rev-parse --short HEAD)"
