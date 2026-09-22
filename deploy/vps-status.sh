#!/usr/bin/env bash
# Read-only: shows whether the app container is up and on the right Traefik network.
set +e
cd "$(dirname "$0")/.."
echo "===== deploy/.env ====="
grep -E 'DOMAIN|TRAEFIK_NETWORK|ENTRYPOINT|CERT' deploy/.env 2>/dev/null

echo; echo "===== containers (name | status | networks) ====="
docker ps --format '{{.Names}} | {{.Status}} | {{.Networks}}' | grep -Ei 'shp|traefik|seekhbo|n8n'

echo; echo "===== app container labels ====="
APP=$(docker ps -qf name=shp-app)
[ -n "$APP" ] && docker inspect "$APP" --format '{{range $k,$v := .Config.Labels}}{{$k}}={{$v}}{{println}}{{end}}' | grep -i traefik

echo; echo "===== app networks ====="
[ -n "$APP" ] && docker inspect "$APP" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{println}}{{end}}'

echo; echo "===== seekhbo networks (the working example) ====="
SK=$(docker ps -qf name=seekhbo)
[ -n "$SK" ] && docker inspect "$SK" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{println}}{{end}}'

echo; echo "===== app logs (last 20) ====="
[ -n "$APP" ] && docker logs "$APP" --tail 20 2>&1
[ -z "$APP" ] && echo "!! No shp-app container is running."
