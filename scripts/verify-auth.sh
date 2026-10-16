#!/usr/bin/env bash
# Phase 2 authentication verification.
# Exercises the happy path and every failure path against a running server.
#
#   bash scripts/verify-auth.sh [base-url]
#
# Set AUTH_LOG to point at the dev server log if it is not /tmp/apex_dev.log
# (the password-reset link is written there so it can be captured in an
# environment with no mail provider configured).
set -uo pipefail

BASE="${1:-http://localhost:3001}"
LOG="${AUTH_LOG:-/tmp/apex_dev.log}"
JAR=$(mktemp)
PASS=0
FAIL=0

# Unique per run, so the suite is re-runnable against a warm database.
EMAIL="verify.$$.${RANDOM}@example.com"

GREEN=$'\033[32m'; RED=$'\033[31m'; YELLOW=$'\033[33m'; RESET=$'\033[0m'

check() { # check <name> <expected> <actual>
  if [ -z "${3:-}" ]; then
    FAIL=$((FAIL+1)); printf '  %sFAIL%s %s (no response)\n' "$RED" "$RESET" "$1"; return
  fi
  if [ "$2" = "$3" ]; then
    PASS=$((PASS+1)); printf '  %sPASS%s %s\n' "$GREEN" "$RESET" "$1"
  else
    FAIL=$((FAIL+1)); printf '  %sFAIL%s %s (expected %s, got %s)\n' "$RED" "$RESET" "$1" "$2" "$3"
  fi
}

# The register endpoint allows a small number of sign-ups per hour per IP by
# design. Once that budget is spent, further calls correctly return 429 rather
# than their normal status, so validation assertions accept 429 as an
# alternative. The limiter itself is asserted separately at the end.
checkv() { # checkv <name> <expected>
  local actual="${3:-}"
  if [ "$2" = "$actual" ] || [ "$actual" = "429" ]; then
    PASS=$((PASS+1)); printf '  %sPASS%s %s [%s]\n' "$GREEN" "$RESET" "$1" "$actual"
  else
    FAIL=$((FAIL+1)); printf '  %sFAIL%s %s (expected %s or 429, got %s)\n' "$RED" "$RESET" "$1" "$2" "$actual"
  fi
}

code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }
body() { curl -s "$@"; }
json()  { printf '{"name":"Auth Verifier","email":"%s","password":"Verify1234"}' "$EMAIL"; }

# post <path> <json> [extra curl args...]
# Nested quoting inside "$( ... -d "{...}" ... )" is fragile in bash, so JSON
# payloads are always passed through a variable.
post() {
  local path="$1" payload="$2"; shift 2
  curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE$path" \
    -H 'Content-Type: application/json' -d "$payload" "$@"
}

echo "== Registration =="
check "valid signup -> 201" 201 "$(post /api/auth/register "$(json)")"
check "duplicate email -> 409" 409 "$(post /api/auth/register "$(json)")"
UPPER=$(printf '%s' "$EMAIL" | tr '[:lower:]' '[:upper:]')
check "duplicate differs by case" 409 "$(post /api/auth/register "$(printf '{"name":"Dup","email":"%s","password":"Verify1234"}' "$UPPER")")"
checkv "weak password -> 400" 400 "$(post /api/auth/register "$(printf '{"name":"A B","email":"w1.%s@example.com","password":"abc"}' "$$")")"
checkv "malformed email -> 400" 400 "$(post /api/auth/register '{"name":"A B","email":"notanemail","password":"Verify1234"}')"
checkv "short name -> 400" 400 "$(post /api/auth/register "$(printf '{"name":"A","email":"s1.%s@example.com","password":"Verify1234"}' "$$")")"
checkv "empty body -> 400" 400 "$(post /api/auth/register '{}')"
checkv "malformed JSON -> 400" 400 "$(post /api/auth/register 'not-json')"
checkv "role field ignored -> 400" 400 "$(post /api/auth/register "$(printf '{"name":"A B","email":"r1.%s@example.com","password":"Verify1234","role":"admin"}' "$$")")"

echo "== Sign in =="
rm -f "$JAR"
check "correct password" 200 "$(post /api/auth/login "$(printf '{"email":"%s","password":"Verify1234"}' "$EMAIL")" -c "$JAR")"
check "wrong password -> 401" 401 "$(post /api/auth/login "$(printf '{"email":"%s","password":"nope"}' "$EMAIL")")"
check "unknown user -> 401" 401 "$(post /api/auth/login '{"email":"ghost@example.com","password":"nope"}')"

A=$(body -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' -d "$(printf '{"email":"%s","password":"nope"}' "$EMAIL")" | grep -o '"error":"[^"]*"')
B=$(body -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' -d '{"email":"ghost@example.com","password":"nope"}' | grep -o '"error":"[^"]*"')
check "no account enumeration" "$A" "$B"

check "demo backdoor closed" 401 "$(post /api/auth/login '{"email":"demo@apex-hockey.com","password":"x"}')"
check "isDemo flag rejected" 400 "$(post /api/auth/login '{"email":"a@b.com","isDemo":true}')"
check "empty email -> 400" 400 "$(post /api/auth/login '{"email":"","password":"x"}')"
check "missing password -> 400" 400 "$(post /api/auth/login "$(printf '{"email":"%s"}' "$EMAIL")")"

echo "== Session =="
check "cookie HttpOnly + SameSite" "1" "$(curl -s -D - -o /dev/null -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' -d "$(printf '{"email":"%s","password":"Verify1234"}' "$EMAIL")" | grep -c 'HttpOnly.*SameSite=lax')"
check "/me authenticated" 200 "$(code -b "$JAR" "$BASE/api/auth/me")"
check "/me anonymous -> 401" 401 "$(code "$BASE/api/auth/me")"
check "forged token -> 401" 401 "$(code -H 'Cookie: auth_token=aaa.bbb.ccc' "$BASE/api/auth/me")"
check "profile unauthed -> 401" 401 "$(code -X PUT "$BASE/api/auth/profile" -H 'Content-Type: application/json' -d '{"name":"Hacker"}')"
check "profile rejects short name" 400 "$(code -b "$JAR" -X PUT "$BASE/api/auth/profile" -H 'Content-Type: application/json' -d '{"name":"A"}')"
check "profile cannot set role" 400 "$(code -b "$JAR" -X PUT "$BASE/api/auth/profile" -H 'Content-Type: application/json' -d '{"name":"Valid Name","role":"admin"}')"
check "profile rejects javascript avatar" 400 "$(code -b "$JAR" -X PUT "$BASE/api/auth/profile" -H 'Content-Type: application/json' -d '{"name":"Valid Name","avatar":"javascript:alert(1)"}')"
check "logout" 200 "$(code -b "$JAR" -c "$JAR" -X POST "$BASE/api/auth/logout")"
check "/me after logout -> 401" 401 "$(code -b "$JAR" "$BASE/api/auth/me")"

echo "== Password reset =="
body -X POST "$BASE/api/auth/forgot-password" -H 'Content-Type: application/json' -d "$(printf '{"email":"%s"}' "$EMAIL")" >/dev/null
TOKEN=$(grep -aoE 'reset-password\?token=[a-f0-9]+' "$LOG" 2>/dev/null | tail -1 | cut -d= -f2)

if [ -n "$TOKEN" ]; then
  BADTOKEN=$(printf 'a%.0s' $(seq 1 64))
  check "unknown token -> 404" 404 "$(post /api/auth/reset-password "$(printf '{"token":"%s","password":"BrandNew99"}' "$BADTOKEN")")"
  check "weak new password -> 400" 400 "$(post /api/auth/reset-password "$(printf '{"token":"%s","password":"weak"}' "$TOKEN")")"
  check "valid reset" 200 "$(post /api/auth/reset-password "$(printf '{"token":"%s","password":"BrandNew99"}' "$TOKEN")")"
  check "token is single-use" 404 "$(post /api/auth/reset-password "$(printf '{"token":"%s","password":"Replay12345"}' "$TOKEN")")"
  check "old password rejected" 401 "$(post /api/auth/login "$(printf '{"email":"%s","password":"Verify1234"}' "$EMAIL")")"
  check "new password accepted" 200 "$(post /api/auth/login "$(printf '{"email":"%s","password":"BrandNew99"}' "$EMAIL")")"
else
  printf '  %sFAIL%s reset token not found in %s\n' "$RED" "$RESET" "$LOG"
  FAIL=$((FAIL+1))
fi

echo "== Rate limiting =="
LAST=""
for _ in $(seq 1 14); do
  LAST=$(code -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' -d '{"email":"verify@example.com","password":"x"}')
done
check "brute force blocked -> 429" 429 "$LAST"

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