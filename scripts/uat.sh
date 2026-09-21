#!/usr/bin/env bash
# End-to-end UAT against a running server with the mock gateway + dev OTP enabled.
#   ALLOW_MOCK_GATEWAY=true ALLOW_DEV_OTP=true CRON_SECRET=x npm start   # or npm run dev
#   CRON_SECRET=x bash scripts/uat.sh http://localhost:3000
#   bash scripts/uat.sh http://localhost:3000
set -u
H=${1:-http://localhost:3000}
J="Content-Type: application/json"
TMP=$(mktemp -d)
pass=0; fail=0
ok()   { echo "  PASS $1"; pass=$((pass+1)); }
bad()  { echo "  FAIL $1"; fail=$((fail+1)); }
json() { python -c "import sys,json;d=json.load(sys.stdin);print($1)" 2>/dev/null; }

login() { # $1 jar, $2 identifier
  local code
  code=$(curl -s -c "$1" -b "$1" -H "$J" -X POST "$H/api/auth/request-otp" -d "{\"identifier\":\"$2\"}" | json "d['devCode']")
  curl -s -c "$1" -b "$1" -H "$J" -X POST "$H/api/auth/verify-otp" -d "{\"identifier\":\"$2\",\"code\":\"$code\"}" | json "d['role']"
}

echo "1. Gate"
r=$(curl -s -c "$TMP/g" -H "$J" -X POST "$H/api/gate/verify" -d '{"code":"CUST-DEMO-2026","role":"customer"}' | json "d['redirect']"); [ "$r" = "/home" ] && ok "customer gate code -> /home" || bad "customer gate code ($r)"
r=$(curl -s -c "$TMP/gr" -H "$J" -X POST "$H/api/gate/verify" -d '{"code":"RSL-DEMO-2026","role":"reseller"}' | json "d['redirect']"); [ "$r" = "/login?next=/reseller" ] && ok "reseller gate code -> login" || bad "reseller gate code ($r)"
r=$(curl -s -H "$J" -X POST "$H/api/gate/verify" -d '{"code":"SHPC-AAAA-BBBB","role":"customer"}' | json "d['error']"); [[ "$r" == *typo* ]] && ok "check-digit rejects typo" || bad "typo check ($r)"

echo "2. OTP sign-in"
role=$(login "$TMP/c" "9876543210"); [ "$role" = "customer" ] && ok "new customer via phone OTP" || bad "customer login ($role)"
r=$(curl -s -b "$TMP/c" -H "$J" -X POST "$H/api/auth/verify-otp" -d '{"identifier":"9876543210","code":"000000"}' | json "d['error']"); [[ "$r" == *expired* || "$r" == *Wrong* ]] && ok "stale/wrong OTP rejected" || bad "otp reuse ($r)"
code=$(curl -s -o /dev/null -w "%{http_code}" "$H/account"); [ "$code" = "307" ] && ok "/account requires session (307)" || bad "/account guard ($code)"
code=$(curl -s -b "$TMP/c" -o /dev/null -w "%{http_code}" "$H/account"); [ "$code" = "200" ] && ok "/account with session (200)" || bad "/account session ($code)"
code=$(curl -s -b "$TMP/c" -o /dev/null -w "%{http_code}" "$H/admin"); [ "$code" = "307" ] && ok "customer cannot open /admin" || bad "/admin rbac ($code)"

echo "3. Direct purchase (mock gateway)"
o=$(curl -s -b "$TMP/c" -H "$J" -X POST "$H/api/orders/direct" -d '{"tier":"pro","idempotencyKey":"uat-direct-1","name":"UAT Buyer","gstin":"29ABCDE1234F1Z5"}'); gw=$(echo "$o" | json "d['gatewayOrderId']"); [ -n "$gw" ] && ok "order created ($gw)" || bad "order create: $o"
gw2=$(curl -s -b "$TMP/c" -H "$J" -X POST "$H/api/orders/direct" -d '{"tier":"pro","idempotencyKey":"uat-direct-1"}' | json "d['gatewayOrderId']"); [ "$gw2" = "$gw" ] && ok "idempotency key returns the same order" || bad "idempotency ($gw2)"
c=$(curl -s -b "$TMP/c" -H "$J" -X POST "$H/api/payments/mock-capture" -d "{\"gatewayOrderId\":\"$gw\"}"); oid=$(echo "$c" | json "d['orderId']"); st=$(echo "$c" | json "d['status']"); [ "$st" = "fulfilled" ] && ok "capture -> fulfilled (code allocated)" || bad "capture: $c"
c2=$(curl -s -b "$TMP/c" -H "$J" -X POST "$H/api/payments/mock-capture" -d "{\"gatewayOrderId\":\"$gw\"}" | json "d['ok']"); [ "$c2" = "True" ] && ok "duplicate capture is idempotent" || bad "dup capture"
codeplain=$(curl -s -b "$TMP/c" "$H/checkout/success?order=$oid" | grep -oE "SHP-P-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}" | head -1); [ -n "$codeplain" ] && ok "success page reveals code once: $codeplain" || bad "code reveal"
again=$(curl -s -b "$TMP/c" "$H/checkout/success?order=$oid" | grep -c "already shown"); [ "$again" = "1" ] && ok "second visit does not reveal again" || bad "reveal twice"
inv=$(curl -s -b "$TMP/c" "$H/account/orders" | grep -oE "SHP-[0-9]{4}-[0-9]{6}" | head -1); [ -n "$inv" ] && ok "GST invoice issued: $inv" || bad "invoice"

echo "4. Redeem + claim"
r=$(curl -s -b "$TMP/c" -H "$J" -X POST "$H/api/codes/redeem" -d "{\"bundle_code\":\"$codeplain\"}" | json "d['ok']"); [ "$r" = "True" ] && ok "bundle code redeemed -> pass" || bad "redeem"
r=$(curl -s -b "$TMP/c" -H "$J" -X POST "$H/api/codes/redeem" -d "{\"bundle_code\":\"$codeplain\"}" | json "d['error']"); [[ "$r" == *already* ]] && ok "re-redeem blocked" || bad "re-redeem ($r)"
claims=$(curl -s -b "$TMP/c" "$H/account" | grep -oE 'Claim</button>' | wc -l | tr -d ' '); [ "$claims" -ge 30 ] && ok "My Pass shows $claims claimable tools" || bad "claims ($claims)"

echo "5. Pool (escrow) - 5 seats (configured minimum), five members, auto-fulfil"
role=$(login "$TMP/r" "reseller@softwarehubpool.example"); [ "$role" = "reseller" ] && ok "reseller signed in" || bad "reseller login ($role)"
p=$(curl -s -b "$TMP/r" -H "$J" -X POST "$H/api/pools" -d '{"tier":"starter","seats":5,"name":"UAT pool","splitMode":"share_equal","asReseller":true}'); pid=$(echo "$p" | json "d['pool']['id']"); [ -n "$pid" ] && ok "reseller pool created ($pid, 5 seats)" || bad "pool create: $p"
for i in 1 2 3 4 5; do
  login "$TMP/m$i" "member-uat-$i@example.com" >/dev/null
  j=$(curl -s -b "$TMP/m$i" -H "$J" -X POST "$H/api/pools/$pid/join"); g=$(echo "$j" | json "d['gatewayOrderId']")
  s=$(curl -s -b "$TMP/m$i" -H "$J" -X POST "$H/api/payments/mock-capture" -d "{\"gatewayOrderId\":\"$g\"}" | json "d['status']")
  [ "$s" = "fulfilled" ] && ok "member $i paid seat" || bad "member $i seat ($s)"
done
st=$(curl -s "$H/api/pools/$pid" | json "d['pool']['status']"); [ "$st" = "fulfilled" ] && ok "pool auto-fulfilled after last seat" || bad "pool status ($st)"
r=$(curl -s -b "$TMP/m1" -H "$J" -X POST "$H/api/pools/$pid/join" | json "d['error']"); [ -n "$r" ] && ok "join closed pool rejected: $r" || bad "join closed"
claims=$(curl -s -b "$TMP/m2" "$H/account" | grep -oE 'Claim</button>' | wc -l | tr -d ' '); [ "$claims" -ge 20 ] && ok "member 2 has $claims starter claims" || bad "member claims ($claims)"
csv=$(curl -s -b "$TMP/r" "$H/api/reseller/pools/$pid/statement" | head -2 | tail -1); [[ "$csv" == *gross* ]] && ok "settlement CSV: $csv" || bad "statement ($csv)"
rev=$(curl -s -b "$TMP/r" "$H/api/reseller/revenue" | json "d['earnedPaise']"); ok "reseller earned paise: $rev"

echo "6. Expiry cron"
r=$(curl -s -H "Authorization: Bearer ${CRON_SECRET:-}" "$H/api/cron/pools-expire" | json "d['ok']"); [ "$r" = "True" ] && ok "cron endpoint runs (nothing due yet)" || bad "cron ($r)"

echo "7. Admin"
role=$(login "$TMP/a" "admin@softwarehubpool.example"); [ "$role" = "admin" ] && ok "admin signed in" || bad "admin login ($role)"
n=$(curl -s -b "$TMP/a" -H "$J" -X POST "$H/api/admin/codes/generate" -d '{"kind":"bundle","tier":"pro","count":3,"batch":"uat"}' | json "len(d['codes'])"); [ "$n" = "3" ] && ok "admin generated 3 pro codes" || bad "generate ($n)"
r=$(curl -s -b "$TMP/c" -H "$J" -X POST "$H/api/admin/codes/generate" -d '{"kind":"bundle","tier":"pro","count":1}' | json "d['error']"); [ -n "$r" ] && ok "customer blocked from admin API" || bad "admin rbac"
r=$(curl -s -b "$TMP/a" -H "$J" -X PATCH "$H/api/admin/settings" -d '{"settings":{"usdInrRate":85}}' | json "d['settings']['usdInrRate']"); [ "$r" = "85" ] && ok "exchange rate updated to 85" || bad "settings ($r)"
r=$(curl -s "$H/api/pricing" | json "d['pro']['usdInrRate']"); [ "$r" = "85" ] && ok "public pricing reflects new rate" || bad "pricing rate ($r)"
curl -s -b "$TMP/a" -H "$J" -X PATCH "$H/api/admin/settings" -d '{"settings":{"usdInrRate":84}}' >/dev/null
code=$(curl -s -b "$TMP/a" -o /dev/null -w "%{http_code}" "$H/admin"); [ "$code" = "200" ] && ok "/admin renders" || bad "/admin ($code)"
code=$(curl -s -b "$TMP/r" -o /dev/null -w "%{http_code}" "$H/reseller/pools/$pid"); [ "$code" = "200" ] && ok "/reseller/pools/$pid renders" || bad "/reseller pool ($code)"

echo "8. Webhook signature"
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$H/api/webhooks/razorpay" -d '{}'); [ "$code" = "401" ] && ok "unsigned webhook rejected (401)" || bad "webhook ($code)"

echo; echo "UAT: $pass passed, $fail failed"
rm -rf "$TMP"
[ "$fail" = "0" ]
