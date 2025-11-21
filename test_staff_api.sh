#!/bin/bash

# Login and get token
echo "🔐 Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "https://qofferun.com/api/v1/login" \
-H "Content-Type: application/json" \
-d '{"email":"chain_owner@test.com","password":"password"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract token using Python
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('access_token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to extract token"
    exit 1
fi

echo "✅ Token obtained: ${TOKEN:0:30}..."

# Test the staff API
echo "📊 Testing staff API..."
API_RESPONSE=$(curl -s -X GET "https://qofferun.com/api/v1/staff-management/branch/16" \
-H "Authorization: Bearer $TOKEN" \
-H "Accept: application/json" \
-w "HTTPSTATUS:%{http_code}")

HTTP_STATUS=$(echo "$API_RESPONSE" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
RESPONSE_BODY=$(echo "$API_RESPONSE" | sed 's/HTTPSTATUS:[0-9]*$//')

echo "HTTP Status: $HTTP_STATUS"
echo "Response: $RESPONSE_BODY"
