#!/usr/bin/env bash
# Read-only: prints exactly how your Traefik is wired so the deploy can match it.
# Run:  cd ~/shp && git pull && bash deploy/vps-diagnose.sh
set +e
echo "############ RUNNING CONTAINERS ############"
docker ps --format '{{.Names}} | {{.Image}} | {{.Ports}}'

TRAEFIK=$(docker ps --format '{{.ID}} {{.Image}}' | awk 'tolower($2) ~ /traefik/ {print $1; exit}')
N8N=$(docker ps --format '{{.ID}} {{.Names}} {{.Image}}' | awk 'tolower($0) ~ /n8n/ {print $1; exit}')

echo; echo "############ TRAEFIK NETWORK MODE ############"
docker inspect "$TRAEFIK" --format 'NetworkMode={{.HostConfig.NetworkMode}}  Networks={{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}'

echo; echo "############ TRAEFIK STARTUP FLAGS (.Args) ############"
docker inspect "$TRAEFIK" --format '{{range .Args}}{{println .}}{{end}}'

echo; echo "############ TRAEFIK MOUNTS (where configs/acme live) ############"
docker inspect "$TRAEFIK" --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{println}}{{end}}'

echo; echo "############ TRAEFIK LABELS ############"
docker inspect "$TRAEFIK" --format '{{range $k,$v := .Config.Labels}}{{$k}}={{$v}}{{println}}{{end}}' | grep -i traefik

echo; echo "############ N8N LABELS ############"
docker inspect "$N8N" --format '{{range $k,$v := .Config.Labels}}{{$k}}={{$v}}{{println}}{{end}}' | grep -i traefik

echo; echo "############ TRAEFIK DYNAMIC CONFIG FILES ############"
for d in $(docker inspect "$TRAEFIK" --format '{{range .Mounts}}{{.Source}}{{println}}{{end}}'); do
  if [ -d "$d" ]; then
    find "$d" -maxdepth 3 -type f \( -name '*.yml' -o -name '*.yaml' -o -name '*.toml' \) 2>/dev/null | while read -r f; do
      echo "----- $f -----"; sed 's/^/    /' "$f"
    done
  fi
done

echo; echo "############ COMPOSE FILES ON DISK ############"
find /root /opt /home /srv -maxdepth 4 -name 'docker-compose*.y*ml' 2>/dev/null | while read -r f; do
  echo "----- $f -----"; grep -iE 'traefik|certresolver|entrypoint|network|acme|n8n' "$f" | sed 's/^/    /'
done
echo "############ END ############"
