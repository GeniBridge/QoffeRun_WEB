#!/bin/bash

# Test Luca Ferrari's menu access

echo "🧪 Testing Luca Ferrari's Menu Access"
echo "====================================="

# Step 1: Login
echo "🔐 Step 1: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "https://qofferun.com/api/v1/login" \
-H "Content-Type: application/json" \
-d '{"email":"luca.ferrari@cafferoma.it","password":"password"}')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extract token  
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('access_token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to extract token"
    exit 1
fi

echo "✅ Token obtained: ${TOKEN:0:50}..."
echo ""

# Step 2: Test debug endpoint
echo "🔍 Step 2: Testing debug menu access endpoint..."
DEBUG_RESPONSE=$(curl -s -X GET "https://qofferun.com/api/v1/branches/16/debug-menu-access" \
-H "Authorization: Bearer $TOKEN" \
-H "Accept: application/json")

echo "Debug Response:"
echo "$DEBUG_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$DEBUG_RESPONSE"
echo ""

# Step 3: Test actual menu endpoint
echo "🍽️ Step 3: Testing actual menu endpoint..."
MENU_RESPONSE=$(curl -s -X GET "https://qofferun.com/api/v1/branches/16/menus" \
-H "Authorization: Bearer $TOKEN" \
-H "Accept: application/json" \
-w "HTTPSTATUS:%{http_code}")

HTTP_STATUS=$(echo "$MENU_RESPONSE" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
RESPONSE_BODY=$(echo "$MENU_RESPONSE" | sed 's/HTTPSTATUS:[0-9]*$//')

echo "Menu API Response (Status: $HTTP_STATUS):"
echo "$RESPONSE_BODY" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_BODY"

echo ""
echo "🎯 Summary:"
echo "- Login: $([ ! -z "$TOKEN" ] && echo "✅ Success" || echo "❌ Failed")"
echo "- Auth Status: $HTTP_STATUS"
echo "- Result: $([ "$HTTP_STATUS" = "200" ] && echo "✅ Menu Access Working" || echo "❌ Menu Access Failed")"