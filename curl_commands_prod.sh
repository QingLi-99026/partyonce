#!/bin/sh
set -eu

FRONTEND="https://partyonce-a4iw.vercel.app"
API="https://partyonce-prod.onrender.com"
API_BASE="$API/api"
SWAGGER="$API/docs"

check() {
  name="$1"
  url="$2"
  expected="${3:-200}"
  code=$(curl -sSL -o /dev/null -w "%{http_code}" "$url" || true)
  if [ "$code" = "$expected" ]; then
    echo "✅ $name  $code  $url"
  else
    echo "❌ $name  $code  $url (expected $expected)"
    exit 1
  fi
}

echo "== PartyOnce Production Smoke Test =="

check "Frontend"  "$FRONTEND" 200
check "Health"    "$API_BASE/health" 200
check "Swagger"   "$SWAGGER" 200
check "Venues"    "$API_BASE/venues" 200
check "Templates" "$API_BASE/templates" 200

echo "🎉 Production smoke test PASSED"
