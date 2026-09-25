#!/usr/bin/env bash
# Runs from cron every few minutes. If GitHub has new commits on main, pull them
# and rebuild/restart the app. Does nothing when there's no change, so it's cheap.
# No terminal needed by a human — this is the "it deploys itself" loop.
set -euo pipefail
cd "$(dirname "$0")/.."
LOG=/var/log/shp-autodeploy.log

git fetch --quiet origin main || { echo "$(date) fetch failed" >> "$LOG"; exit 0; }
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
[ "$LOCAL" = "$REMOTE" ] && exit 0   # up to date, nothing to do

echo "$(date) deploying $LOCAL -> $REMOTE" >> "$LOG"
git reset --hard origin/main >> "$LOG" 2>&1
if [ -f deploy/.env ]; then
  docker compose --env-file deploy/.env up -d --build >> "$LOG" 2>&1
  echo "$(date) done: $(git rev-parse --short HEAD)" >> "$LOG"
else
  echo "$(date) deploy/.env missing — run deploy/vps-docker.sh once first" >> "$LOG"
fi
