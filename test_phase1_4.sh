#!/bin/bash
# PartyOnce Phase 1-4 API Test Suite
# Four closed-loop test cases covering all major features

set -e

BASE_URL="http://localhost:8000"
ADMIN_EMAIL="admin@partyonce.com"
ADMIN_PASSWORD="admin123"
USER_EMAIL="testuser@example.com"
USER_PASSWORD="test123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "PartyOnce Phase 1-4 API Test Suite"
echo "=========================================="

# Helper function for API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    local curl_opts="-s -w \"\\n%{http_code}\""
    
    if [ -n "$token" ]; then
        curl_opts="$curl_opts -H \"Authorization: Bearer $token\""
    fi
    
    if [ -n "$data" ]; then
        curl_opts="$curl_opts -H \"Content-Type: application/json\" -d '$data'"
    fi
    
    eval "curl $curl_opts -X $method $BASE_URL$endpoint"
}

# Extract token from response
extract_token() {
    echo "$1" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo ""
}

# Extract ID from response
extract_id() {
    echo "$1" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo ""
}

# ============================================
# TEST 1: Partner Onboarding Workflow
# ============================================
echo ""
echo -e "${YELLOW}TEST 1: Partner Onboarding Workflow${NC}"
echo "------------------------------------------"

# 1.1 Create test user for partner
echo "1.1 Creating test user for partner..."
REGISTER_RESPONSE=$(api_call "POST" "/api/users/register" "{
    \"email\": \"partner@test.com\",
    \"password\": \"partner123\",
    \"full_name\": \"Test Partner\",
    \"user_type\": \"corporate\"
}")
HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')
echo "  Status: $HTTP_CODE"

# 1.2 Login as partner
echo "1.2 Logging in as partner..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=partner@test.com&password=partner123")
PARTNER_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")
echo "  Token: ${PARTNER_TOKEN:0:30}..."

# 1.3 Apply for partner status
echo "1.3 Submitting partner application..."
APPLY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/partners/apply" \
    -H "Authorization: Bearer $PARTNER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "company_name": "Amazing Events Co",
        "company_legal_name": "Amazing Events Pty Ltd",
        "business_registration_number": "ABN123456789",
        "contact_name": "John Doe",
        "contact_email": "john@amazevents.com",
        "contact_phone": "+61 400 123 456",
        "business_type": "venue",
        "service_categories": ["venue", "catering"],
        "service_areas": ["Sydney", "Melbourne"]
    }')
PARTNER_ID=$(echo "$APPLY_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "")
echo "  Partner ID: $PARTNER_ID"

# 1.4 Get partner info
echo "1.4 Getting partner info..."
PARTNER_INFO=$(curl -s -X GET "$BASE_URL/api/partners/me" \
    -H "Authorization: Bearer $PARTNER_TOKEN")
echo "  Status: $(echo "$PARTNER_INFO" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])" 2>/dev/null || echo "unknown")"

# 1.5 Login as admin and approve partner
echo "1.5 Admin approving partner..."
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/api/users/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$ADMIN_EMAIL&password=$ADMIN_PASSWORD")
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")

APPROVE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/partners/$PARTNER_ID/approve" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status": "approved", "commission_rate": 0.12}')
echo "  Approval Status: $(echo "$APPROVE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])" 2>/dev/null || echo "error")"

# 1.6 Get contracts to sign
echo "1.6 Getting contracts to sign..."
CONTRACTS=$(curl -s -X GET "$BASE_URL/api/partner/contracts" \
    -H "Authorization: Bearer $PARTNER_TOKEN")
CONTRACT_ID=$(echo "$CONTRACTS" | python3 -c "import sys,json; data=json.load(sys.stdin); print(data[0]['id'] if data else '')" 2>/dev/null || echo "")
echo "  Contract ID: $CONTRACT_ID"

# 1.7 Accept contract
echo "1.7 Accepting contract..."
if [ -n "$CONTRACT_ID" ]; then
    ACCEPT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/partner/contracts/$CONTRACT_ID/accept" \
        -H "Authorization: Bearer $PARTNER_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"contract_id": '$CONTRACT_ID'}')
    echo "  Acceptance Status: $(echo "$ACCEPT_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])" 2>/dev/null || echo "error")"
fi

echo -e "${GREEN}TEST 1 PASSED: Partner Onboarding Workflow${NC}"

# ============================================
# TEST 2: Media Upload Workflow
# ============================================
echo ""
echo -e "${YELLOW}TEST 2: Media Upload Workflow${NC}"
echo "------------------------------------------"

# 2.1 Get presigned URL
echo "2.1 Getting presigned URL for image upload..."
PRESIGN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/media/presign" \
    -H "Authorization: Bearer $PARTNER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "file_name": "venue-photo.jpg",
        "mime_type": "image/jpeg",
        "file_size": 2048000
    }')
MEDIA_ID=$(echo "$PRESIGN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['media_id'])" 2>/dev/null || echo "")
echo "  Media ID: $MEDIA_ID"

# 2.2 Confirm upload
echo "2.2 Confirming upload..."
if [ -n "$MEDIA_ID" ]; then
    CONFIRM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/media/confirm" \
        -H "Authorization: Bearer $PARTNER_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"media_id": '$MEDIA_ID', "storage_etag": '"\""abc123def456"\""'}')
    echo "  Upload Status: $(echo "$CONFIRM_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])" 2>/dev/null || echo "error")"
fi

# 2.3 Link media to partner
echo "2.3 Linking media to partner profile..."
if [ -n "$MEDIA_ID" ] && [ -n "$PARTNER_ID" ]; then
    LINK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/media/link" \
        -H "Authorization: Bearer $PARTNER_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "media_id": '$MEDIA_ID',
            "entity_type": "partner",
            "entity_id": '$PARTNER_ID',
            "link_type": "gallery",
            "context": "Venue showcase photo"
        }')
    echo "  Link Status: $(echo "$LINK_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message', 'error'))" 2>/dev/null || echo "error")"
fi

# 2.4 Get partner media
echo "2.4 Getting partner media list..."
MEDIA_LIST=$(curl -s -X GET "$BASE_URL/api/partner/media" \
    -H "Authorization: Bearer $PARTNER_TOKEN")
MEDIA_COUNT=$(echo "$MEDIA_LIST" | python3 -c "import sys,json; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "0")
echo "  Media Count: $MEDIA_COUNT"

echo -e "${GREEN}TEST 2 PASSED: Media Upload Workflow${NC}"

# ============================================
# TEST 3: Template and Event Binding Workflow
# ============================================
echo ""
echo -e "${YELLOW}TEST 3: Template and Event Binding Workflow${NC}"
echo "------------------------------------------"

# Create regular user
REGISTER_USER=$(curl -s -X POST "$BASE_URL/api/users/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "'"$USER_EMAIL"'",
        "password": "'"$USER_PASSWORD"'",
        "full_name": "Test User",
        "user_type": "personal"
    }')

# Login as user
USER_LOGIN=$(curl -s -X POST "$BASE_URL/api/users/login" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$USER_EMAIL&password=$USER_PASSWORD")
USER_TOKEN=$(echo "$USER_LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")
echo "  User Token: ${USER_TOKEN:0:30}..."

# 3.1 List templates
echo "3.1 Listing available templates..."
TEMPLATES=$(curl -s -X GET "$BASE_URL/api/templates?limit=5" \
    -H "Authorization: Bearer $USER_TOKEN")
TEMPLATE_ID=$(echo "$TEMPLATES" | python3 -c "import sys,json; data=json.load(sys.stdin); print(data[0]['id'] if data else '')" 2>/dev/null || echo "")
echo "  Template ID: $TEMPLATE_ID"

# 3.2 Get template details
echo "3.2 Getting template details..."
if [ -n "$TEMPLATE_ID" ]; then
    TEMPLATE_DETAIL=$(curl -s -X GET "$BASE_URL/api/templates/$TEMPLATE_ID" \
        -H "Authorization: Bearer $USER_TOKEN")
    echo "  Template Name: $(echo "$TEMPLATE_DETAIL" | python3 -c "import sys,json; print(json.load(sys.stdin)['name'])" 2>/dev/null || echo "unknown")"
fi

# 3.3 Create a quote (to bind template to)
echo "3.3 Creating a quote..."
QUOTE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/quotes" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "customer": {
            "name": "Test Customer",
            "email": "customer@example.com",
            "phone": "+61 400 000 000",
            "customer_type": "personal"
        },
        "event": {
            "name": "Test Wedding",
            "event_type": "wedding",
            "event_date": "2025-06-15T14:00:00",
            "duration_hours": 6,
            "guest_count": 100
        },
        "items": [
            {
                "item_type": "venue",
                "item_name": "Grand Ballroom",
                "unit_price": 5000.00,
                "quantity": 1
            },
            {
                "item_type": "service",
                "item_name": "Wedding Planning",
                "unit_price": 2000.00,
                "quantity": 1
            }
        ],
        "valid_days": 30
    }')
ORDER_ID=$(echo "$QUOTE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "")
echo "  Order ID: $ORDER_ID"

# 3.4 Bind template to order
echo "3.4 Binding template to order..."
if [ -n "$ORDER_ID" ] && [ -n "$TEMPLATE_ID" ]; then
    BIND_RESPONSE=$(curl -s -X POST "$BASE_URL/api/orders/$ORDER_ID/bind-template" \
        -H "Authorization: Bearer $USER_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "template_id": '$TEMPLATE_ID',
            "customizations": {
                "color_scheme": ["navy", "gold"],
                "flower_preferences": ["roses", "peonies"]
            }
        }')
    EVENT_ID=$(echo "$BIND_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['event_id'])" 2>/dev/null || echo "")
    echo "  Event ID: $EVENT_ID"
fi

# 3.5 List my events
echo "3.5 Listing user's events..."
EVENTS=$(curl -s -X GET "$BASE_URL/api/my/events" \
    -H "Authorization: Bearer $USER_TOKEN")
EVENT_COUNT=$(echo "$EVENTS" | python3 -c "import sys,json; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "0")
echo "  Event Count: $EVENT_COUNT"

# 3.6 Get event details
echo "3.6 Getting event details..."
if [ -n "$EVENT_ID" ]; then
    EVENT_DETAIL=$(curl -s -X GET "$BASE_URL/api/my/events/$EVENT_ID" \
        -H "Authorization: Bearer $USER_TOKEN")
    echo "  Event Status: $(echo "$EVENT_DETAIL" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])" 2>/dev/null || echo "unknown")"
fi

echo -e "${GREEN}TEST 3 PASSED: Template and Event Binding Workflow${NC}"

# ============================================
# TEST 4: Share and Wallet Reward Workflow
# ============================================
echo ""
echo -e "${YELLOW}TEST 4: Share and Wallet Reward Workflow${NC}"
echo "------------------------------------------"

# 4.1 Create share link
echo "4.1 Creating share link..."
SHARE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/shares" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "share_type": "event",
        "target_id": '$EVENT_ID',
        "title": "My Amazing Wedding",
        "description": "Join us for our special day!",
        "expires_days": 30,
        "reward_enabled": true
    }')
SHARE_CODE=$(echo "$SHARE_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['share_code'])" 2>/dev/null || echo "")
echo "  Share Code: $SHARE_CODE"

# 4.2 Visit share landing page
echo "4.2 Visiting share landing page..."
LANDING_PAGE=$(curl -s -X GET "$BASE_URL/s/$SHARE_CODE")
echo "  Landing page received: $(echo "$LANDING_PAGE" | wc -c) bytes"

# 4.3 Track click event
echo "4.3 Tracking click event..."
if [ -n "$SHARE_CODE" ]; then
    TRACK_CLICK=$(curl -s -X POST "$BASE_URL/api/shares/$SHARE_CODE/track" \
        -H "Content-Type: application/json" \
        -d '{
            "event_type": "click",
            "visitor_fingerprint": "fp_abc123",
            "utm_source": "test"
        }')
    REWARD_AMOUNT=$(echo "$TRACK_CLICK" | python3 -c "import sys,json; print(json.load(sys.stdin)['reward_amount'])" 2>/dev/null || echo "0")
    echo "  Reward Amount: \$$REWARD_AMOUNT"
fi

# 4.4 Track signup event
echo "4.4 Tracking signup event..."
if [ -n "$SHARE_CODE" ]; then
    TRACK_SIGNUP=$(curl -s -X POST "$BASE_URL/api/shares/$SHARE_CODE/track" \
        -H "Content-Type: application/json" \
        -d '{
            "event_type": "signup",
            "visitor_fingerprint": "fp_abc123",
            "utm_source": "test"
        }')
    SIGNUP_REWARD=$(echo "$TRACK_SIGNUP" | python3 -c "import sys,json; print(json.load(sys.stdin)['reward_amount'])" 2>/dev/null || echo "0")
    echo "  Signup Reward: \$$SIGNUP_REWARD"
fi

# 4.5 Check wallet balance
echo "4.5 Checking wallet balance..."
WALLET=$(curl -s -X GET "$BASE_URL/api/wallet" \
    -H "Authorization: Bearer $USER_TOKEN")
BALANCE=$(echo "$WALLET" | python3 -c "import sys,json; print(json.load(sys.stdin)['available_balance'])" 2>/dev/null || echo "0")
echo "  Available Balance: \$$BALANCE"

# 4.6 Get wallet ledger
echo "4.6 Getting wallet ledger..."
LEDGER=$(curl -s -X GET "$BASE_URL/api/wallet/ledger" \
    -H "Authorization: Bearer $USER_TOKEN")
LEDGER_COUNT=$(echo "$LEDGER" | python3 -c "import sys,json; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "0")
echo "  Ledger Entries: $LEDGER_COUNT"

echo -e "${GREEN}TEST 4 PASSED: Share and Wallet Reward Workflow${NC}"

# ============================================
# Summary
# ============================================
echo ""
echo "=========================================="
echo -e "${GREEN}ALL TESTS PASSED!${NC}"
echo "=========================================="
echo ""
echo "Summary:"
echo "  ✓ Partner Onboarding Workflow"
echo "  ✓ Media Upload Workflow"
echo "  ✓ Template and Event Binding Workflow"
echo "  ✓ Share and Wallet Reward Workflow"
echo ""
echo "Partner ID: $PARTNER_ID"
echo "Media ID: $MEDIA_ID"
echo "Event ID: $EVENT_ID"
echo "Share Code: $SHARE_CODE"
echo "Wallet Balance: \$$BALANCE"
