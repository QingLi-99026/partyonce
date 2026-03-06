#!/bin/sh
# PartyOnce Production Smoke Test
# 检查 5 个关键端点

BASE_URL="https://partyonce-prod.onrender.com"
FRONTEND_URL="https://partyonce-a4iw.vercel.app"

echo "========================================"
echo "PartyOnce Production Smoke Test"
echo "========================================"
echo ""

PASSED=0
FAILED=0

check_endpoint() {
    name="$1"
    url="$2"
    echo -n "Testing $name ... "
    
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$url" 2>/dev/null)
    
    if [ "$status" = "200" ]; then
        echo "PASS (200)"
        PASSED=$((PASSED + 1))
    else
        echo "FAIL ($status)"
        FAILED=$((FAILED + 1))
    fi
}

check_endpoint "Frontend" "$FRONTEND_URL"
check_endpoint "Health" "$BASE_URL/api/health"
check_endpoint "Swagger" "$BASE_URL/docs"
check_endpoint "Venues" "$BASE_URL/api/venues"
check_endpoint "Templates" "$BASE_URL/api/templates"

echo ""
echo "========================================"
echo "Results: $PASSED PASS, $FAILED FAIL"
echo "========================================"

if [ "$FAILED" -eq 0 ]; then
    echo "All checks passed!"
    exit 0
else
    echo "Some checks failed."
    exit 1
fi
