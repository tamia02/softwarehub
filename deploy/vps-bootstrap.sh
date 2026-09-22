#!/usr/bin/env bash
# One-line bootstrap: installs git if needed, clones/updates the repo, then runs
# the Docker deploy (which auto-detects Traefik and leaves n8n untouched).
#
#   curl -fsSL https://raw.githubusercontent.com/tamia02/softwarehub/main/deploy/vps-bootstrap.sh | DOMAIN=pool.softwarehub.tech bash
set -euo pipefail
: "${DOMAIN:?Set DOMAIN, e.g. DOMAIN=pool.softwarehub.tech}"
command -v git >/dev/null 2>&1 || { apt-get update -y && apt-get install -y git; }
cd ~
if [ -d shp/.git ]; then git -C shp pull; else git clone https://github.com/tamia02/softwarehub.git shp; fi
cd shp
DOMAIN="$DOMAIN" bash deploy/vps-docker.sh
