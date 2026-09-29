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
  echo "$(date) frontend done: $(git rev-parse --short HEAD)" >> "$LOG"

  # Backend (bot) — its OWN compose project so a failure here can never affect
  # the frontend above. Best-effort: never aborts the deploy.
  if [ -f docker-compose.bot.yml ]; then
    if docker compose -p shp-bot -f docker-compose.bot.yml --env-file deploy/.env up -d --build >> "$LOG" 2>&1; then
      echo "$(date) backend done" >> "$LOG"
      # Put the bot on the same Docker network(s) as the Evolution API container
      # so they can talk internally (evolution_api:8080 <-> shp-bot:5000).
      if docker inspect evolution_api >/dev/null 2>&1; then
        for net in $(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' evolution_api 2>/dev/null); do
          docker network connect "$net" shp-bot >/dev/null 2>&1 \
            && echo "$(date) connected shp-bot to network $net" >> "$LOG" || true
        done
      else
        echo "$(date) note: no 'evolution_api' container found — skipping network link" >> "$LOG"
      fi
    else
      echo "$(date) backend deploy failed (frontend unaffected)" >> "$LOG"
    fi
  fi
else
  echo "$(date) deploy/.env missing — run deploy/vps-docker.sh once first" >> "$LOG"
fi
