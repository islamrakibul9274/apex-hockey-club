#!/usr/bin/env bash
# Phase 3 verification — repairs to previously broken features.
#   bash scripts/verify-features.sh [base-url]
set -uo pipefail

BASE="${1:-http://localhost:3001}"
LOG="${AUTH_LOG:-/tmp/apex_dev.log}"
JAR=$(mktemp)
PASS=0
FAIL=0
EMAIL="p3.$$.${RANDOM}@example.com"

GREEN=$'\033[32m'; RED=$'\033[31m'; RESET=$'\033[0m'

check() {
  if [ -z "${3:-}" ]; then FAIL=$((FAIL+1)); printf '  %sFAIL%s %s (no response)\n' "$RED" "$RESET" "$1"; return; fi
  if [ "$2" = "$3" ]; then PASS=$((PASS+1)); printf '  %sPASS%s %s\n' "$GREEN" "$RESET" "$1"
  else FAIL=$((FAIL+1)); printf '  %sFAIL%s %s (expected %s, got %s)\n' "$RED" "$RESET" "$1" "$2" "$3"; fi
}

# Checks a JSON body contains a substring.
contains() { # contains <name> <needle> <json>
  if printf '%s' "$3" | grep -q "$2"; then PASS=$((PASS+1)); printf '  %sPASS%s %s\n' "$GREEN" "$RESET" "$1"
  else FAIL=$((FAIL+1)); printf '  %sFAIL%s %s (missing %s in: %s)\n' "$RED" "$RESET" "$1" "$2" "$(printf '%s' "$3" | head -c 140)"; fi
}

# Checks a JSON body does NOT contain a substring.
omits() {
  if printf '%s' "$3" | grep -q "$2"; then FAIL=$((FAIL+1)); printf '  %sFAIL%s %s (unexpectedly found %s)\n' "$RED" "$RESET" "$1" "$2"
  else PASS=$((PASS+1)); printf '  %sPASS%s %s\n' "$GREEN" "$RESET" "$1"; fi
}

code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }
body() { curl -s "$@"; }
post() { local p="$1" d="$2"; shift 2; curl -s -X POST "$BASE$p" -H 'Content-Type: application/json' -d "$d" "$@"; }
pcode() { local p="$1" d="$2"; shift 2; curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE$p" -H 'Content-Type: application/json' -d "$d" "$@"; }

echo "== Setup: create a session =="
rm -f "$JAR"
check "register" 201 "$(pcode /api/auth/register "$(printf '{"name":"Feature Check","email":"%s","password":"Verify1234"}' "$EMAIL")" -c "$JAR")"
AUTH="-b $JAR"

echo "== Bookings: no longer a public data leak =="
check "anonymous list -> 401" 401 "$(code $BASE/api/bookings)"
check "anonymous create -> 401" 401 "$(pcode /api/bookings '{"bookingType":"program","itemId":"prog-junior","itemTitle":"Junior","seatsCount":1}')"
OUT=$(post /api/bookings '{"bookingType":"program","itemId":"prog-junior","itemTitle":"Junior Development","seatsCount":2}' $AUTH)
check "owner can create" 201 "$(pcode /api/bookings '{"bookingType":"program","itemId":"prog-junior","itemTitle":"Junior Development","seatsCount":2}' $AUTH)"
omits "totalAmount cannot be supplied by client" '"totalAmount"' "$(post /api/bookings '{"bookingType":"program","itemId":"prog-junior","itemTitle":"J","seatsCount":1,"totalAmount":1}' $AUTH)"
omits "userId cannot be spoofed" '"userId"' "$(post /api/bookings '{"bookingType":"program","itemId":"prog-junior","itemTitle":"J","seatsCount":1,"userId":"6ad1193d19cf45761914fbae"}' $AUTH)"
contains "amount computed server-side" '"totalAmount":360' "$OUT"
contains "payment not assumed paid" '"paymentStatus":"pending"' "$OUT"

echo "== Checkout: prices are server-side, failures are honest =="
omits "client price rejected" 'checkout.stripe.com' "$(post /api/checkout '{"type":"membership","planName":"Teen Academy","price":1}' $AUTH)"
contains "membership priced server-side" 'checkout.stripe.com' "$(post /api/checkout '{"type":"membership","planName":"Teen Academy"}' $AUTH)"
check "unknown plan rejected" 400 "$(pcode /api/checkout '{"type":"membership","planName":"Free Forever"}' $AUTH)"
check "empty cart rejected" 400 "$(pcode /api/checkout '{"type":"cart","items":[]}' $AUTH)"
check "unknown item rejected" 400 "$(pcode /api/checkout '{"type":"cart","items":[{"id":"nope","quantity":1}]}' $AUTH)"
omits "over-capacity seats rejected" 'checkout.stripe.com' "$(post /api/checkout '{"type":"ticket","matchId":"match-1","tier":"VIP Glass & Lounge","seats":20}' $AUTH)"
contains "over-capacity seats explained" 'remain' "$(post /api/checkout '{"type":"ticket","matchId":"match-1","tier":"VIP Glass & Lounge","seats":20}' $AUTH)"
check "absurd seat count rejected by schema" 400 "$(pcode /api/checkout '{"type":"ticket","matchId":"match-1","tier":"VIP Glass & Lounge","seats":99}' $AUTH)"
contains "valid ticket checkout works" 'checkout.stripe.com' "$(post /api/checkout '{"type":"ticket","matchId":"match-1","tier":"VIP Glass & Lounge","seats":2}' $AUTH)"
omits "no simulated success URL" 'simulation=true' "$(post /api/checkout '{"type":"cart","items":[{"id":"nope","quantity":1}]}' $AUTH)"

echo "== Seed endpoint is no longer public =="
check "GET not allowed" 405 "$(code $BASE/api/seed)"
check "POST without secret -> 403" 403 "$(pcode /api/seed '{}')"
check "POST with wrong secret -> 403" 403 "$(pcode /api/seed '{}' -H 'x-seed-secret: wrong')"

echo "== Product search: regex injection closed =="
check "?search=.* matches nothing" 0 "$(body "$BASE/api/products?search=.*" | python3 -c 'import sys,json;print(len(json.load(sys.stdin).get("products",[])))')"
check "real search still matches" 1 "$(body "$BASE/api/products?search=skate" | python3 -c 'import sys,json;print(1 if len(json.load(sys.stdin).get("products",[]))>0 else 0)')"

echo "== Contact validation =="
check "missing fields -> 400" 400 "$(pcode /api/contact '{"name":"A"}')"
check "bad email -> 400" 400 "$(pcode /api/contact '{"name":"Real Name","email":"nope","message":"Hello there friend"}')"
check "short message -> 400" 400 "$(pcode /api/contact '{"name":"Real Name","email":"a@b.com","message":"hi"}')"

echo "== Blog reads from the database =="
check "blog api returns posts" 3 "$(body "$BASE/api/blog" | python3 -c 'import sys,json;print(len(json.load(sys.stdin).get("posts",[])))')"

echo "== Dynamic routes 404 correctly =="
check "/blog/<real-slug>" 200 "$(code "$BASE/blog/mastering-the-wrist-shot")"
check "/blog/<bad-slug> -> 404" 404 "$(code "$BASE/blog/does-not-exist")"
check "/legal/terms" 200 "$(code "$BASE/legal/terms")"
check "/legal/<bad> -> 404" 404 "$(code "$BASE/legal/nonsense")"
check "/services/branding" 200 "$(code "$BASE/services/branding")"
check "/services/<bad> -> 404" 404 "$(code "$BASE/services/not-a-service")"

echo "== Preferences persist =="
OUT=$(curl -s $AUTH -X PUT "$BASE/api/auth/profile" -H 'Content-Type: application/json' \
  -d '{"name":"Feature Check","phone":"+1 555 0100","preferences":{"matchAlerts":false,"trainingReminders":true,"gearDrops":true}}')
contains "preferences written" '"matchAlerts":false' "$OUT"
contains "preferences readable" '"gearDrops":true' "$(body $AUTH "$BASE/api/auth/me")"

echo "== AI coach =="
COACH=$(post /api/ai-coach '{"messages":[{"role":"user","content":"What is a proper wrist shot?"}]}')
contains "returns a real reply" '"success":true' "$COACH"
omits "no leaked provider error" 'model_not_found' "$COACH"
omits "no canned fallback masquerading as advice" 'knees bent' "$COACH"

rm -f "$JAR"
# These suites create real accounts, so remove them again. Uses the local tsx
# binary rather than `command -v tsx`, which is false here because tsx is a
# project dependency and not on PATH. Never fails the suite on cleanup.
if [ -x "node_modules/.bin/tsx" ]; then
  node_modules/.bin/tsx -e "import('./tests/helpers/fixtures').then(m => m.cleanupFixtures()).then(r => console.log('  cleanup:', JSON.stringify(r)))" \
    || echo "  cleanup: skipped"
else
  echo "  cleanup: skipped (tsx not installed)"
fi

echo
echo "  passed: $PASS   failed: $FAIL"
[ "$FAIL" -eq 0 ] || exit 1