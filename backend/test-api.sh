#!/bin/bash

echo "🧪 Testing Our ProofOfWork Backend API"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_endpoint() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL (got $response, expected $expected_status)${NC}"
        return 1
    fi
}

test_post_endpoint() {
    local url=$1
    local data=$2
    local expected_status=$3
    local description=$4
    
    echo -n "Testing $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$url")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL (got $response, expected $expected_status)${NC}"
        return 1
    fi
}

# Check if server is running
echo "🔍 Checking if server is running..."
if ! curl -s http://localhost:5000/health > /dev/null; then
    echo -e "${RED}❌ Server is not running. Please start it with 'npm run dev'${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Run tests
echo "🚀 Running API Tests..."
echo ""

passed=0
total=0

# Health check
test_endpoint "http://localhost:5000/health" "200" "Health check"
((total++))
if [ $? -eq 0 ]; then ((passed++)); fi

# Root endpoint
test_endpoint "http://localhost:5000/" "200" "Root endpoint"
((total++))
if [ $? -eq 0 ]; then ((passed++)); fi

# Profiles endpoint
test_endpoint "http://localhost:5000/api/v1/profiles" "200" "Get profiles"
((total++))
if [ $? -eq 0 ]; then ((passed++)); fi

# Create profile
test_post_endpoint "http://localhost:5000/api/v1/profiles" '{"role":"business","display_name":"Test Business","concordium_account":"test_account","concordium_did":true}' "201" "Create profile"
((total++))
if [ $? -eq 0 ]; then ((passed++)); fi

# Jobs endpoint
test_endpoint "http://localhost:5000/api/v1/jobs" "200" "Get jobs"
((total++))
if [ $? -eq 0 ]; then ((passed++)); fi

# Nearby jobs endpoint
test_endpoint "http://localhost:5000/api/v1/jobs/nearby?latitude=40.7589&longitude=-73.9851&radius=5000" "200" "Get nearby jobs"
((total++))
if [ $? -eq 0 ]; then ((passed++)); fi

# 404 test
test_endpoint "http://localhost:5000/api/v1/nonexistent" "404" "404 handling"
((total++))
if [ $? -eq 0 ]; then ((passed++)); fi

echo ""
echo "📊 Test Results:"
echo "================"
echo -e "Passed: ${GREEN}$passed${NC}/$total"

if [ $passed -eq $total ]; then
    echo -e "${GREEN}🎉 All tests passed! Our API is working correctly.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Check the output above.${NC}"
    exit 1
fi
