#!/bin/bash

# 🧪 QoffeRun - Script Test Accessi Automatico
# Esegue test completi di tutti i sistemi di autenticazione

echo "🚀 QOFFERUN - TEST SISTEMA AUTENTICAZIONE"
echo "════════════════════════════════════════════════"

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per test HTTP
test_endpoint() {
    local url=$1
    local method=$2
    local data=$3
    local description=$4
    
    echo -e "${BLUE}Testing: $description${NC}"
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -H "Accept: application/json" \
            -d "$data" \
            -k)
    else
        response=$(curl -s -w "%{http_code}" "$url" -k)
    fi
    
    # Estrai status code
    status_code="${response: -3}"
    body="${response%???}"
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✅ SUCCESS${NC} - Status: $status_code"
        if echo "$body" | grep -q "token\|success"; then
            echo -e "${GREEN}   🔑 Token/Success found in response${NC}"
        fi
    else
        echo -e "${RED}❌ FAILED${NC} - Status: $status_code"
        echo -e "${YELLOW}   Response: ${body:0:100}...${NC}"
    fi
    echo ""
}

# Test 1: Backend Health Check
echo -e "${YELLOW}📡 1. BACKEND API HEALTH CHECK${NC}"
test_endpoint "https://api.qofferun.com" "GET" "" "Backend API Health"

# Test 2: Bar Panel Login
echo -e "${YELLOW}🏪 2. BAR PANEL AUTHENTICATION${NC}"
test_endpoint "https://api.qofferun.com/api/bar-panel/login" "POST" \
    '{"email":"luca@barista.it","password":"admin123"}' \
    "Bar Panel Login"

# Test 3: Admin Panel Login  
echo -e "${YELLOW}🛡️  3. ADMIN PANEL AUTHENTICATION${NC}"
test_endpoint "https://api.qofferun.com/api/admin-panel/login" "POST" \
    '{"email":"admin@qofferun.com","password":"admin123"}' \
    "Admin Panel Login"

# Test 4: Bar Forgot Password
echo -e "${YELLOW}🔐 4. BAR FORGOT PASSWORD${NC}"
test_endpoint "https://api.qofferun.com/api/bar-panel/forgot-password" "POST" \
    '{"email":"luca@barista.it"}' \
    "Bar Forgot Password"

# Test 5: Admin Forgot Password  
echo -e "${YELLOW}🔐 5. ADMIN FORGOT PASSWORD${NC}"
test_endpoint "https://api.qofferun.com/api/admin-panel/forgot-password" "POST" \
    '{"email":"admin@qofferun.com"}' \
    "Admin Forgot Password"

# Test 6: Frontend Availability
echo -e "${YELLOW}🌐 6. FRONTEND AVAILABILITY${NC}"
test_endpoint "https://bar.qofferun.com" "GET" "" "Bar Frontend"
test_endpoint "https://controllo.qofferun.com" "GET" "" "Admin Frontend"

# Test Database Users
echo -e "${YELLOW}🗄️  7. DATABASE USERS CHECK${NC}"
echo -e "${BLUE}Checking database users...${NC}"

docker compose exec -T backend php artisan tinker --execute "
echo '👥 Users in database:' . PHP_EOL;
\$users = \App\Models\User::all();
foreach(\$users as \$user) {
    echo '  - ' . \$user->email . ' (' . \$user->role . ')' . PHP_EOL;
}
echo 'Total users: ' . \$users->count() . PHP_EOL;
" 2>/dev/null && echo -e "${GREEN}✅ Database accessible${NC}" || echo -e "${RED}❌ Database error${NC}"

echo ""

# Summary
echo -e "${BLUE}📋 SUMMARY${NC}"
echo "════════════════════════════════════════════════"
echo -e "${GREEN}✅ Tests completed!${NC}"
echo ""
echo "📱 Manual Tests:"
echo "1. Open https://bar.qofferun.com"
echo "2. Login with luca@barista.it / admin123"  
echo "3. Open https://controllo.qofferun.com"
echo "4. Login with admin@qofferun.com / admin123"
echo "5. Test forgot password functions"
echo ""
echo "📧 Check emails at: shikosoft.italia@gmail.com"
echo ""
echo -e "${YELLOW}🛠️  If tests fail:${NC}"
echo "- Check containers: docker compose ps"
echo "- Check logs: docker compose logs backend"
echo "- Rebuild frontend: npm run build"
echo ""