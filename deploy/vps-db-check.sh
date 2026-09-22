#!/usr/bin/env bash
# Read-only: prints what the app's database actually holds for prices.
set +e
DB=$(docker ps --format '{{.Names}}' | grep -E 'shp.*db' | head -1)
echo "db container: $DB"
docker exec "$DB" psql -U shp -d shp -P pager=off \
  -c "select key, value from settings;" \
  -c "select count(*) as tool_count from tools;" \
  -c "select id, name, value_usd from tools order by value_usd asc limit 5;" \
  -c "select id, name, value_usd from tools order by value_usd desc limit 3;" \
  -c "select id, name, price_paise from tiers;"
