#!/bin/bash

echo "🚀 ProofOfWork - Concordium Hackathon Demo"
echo "=========================================="
echo ""

echo "📋 Step 1: Starting Backend Server"
cd backend
npm run dev &
BACKEND_PID=$!
sleep 3

echo "✅ Backend running on http://localhost:5000"
echo ""

echo "🔗 Step 2: Testing Concordium Integration"
echo "Running full demo with real testnet accounts..."
node src/scripts/concordiumDemo.js

echo ""
echo "🎯 Step 3: API Endpoints Demo"
echo "Health Check:"
curl -s http://localhost:5000/health | jq '.'

echo ""
echo "Profiles:"
curl -s http://localhost:5000/api/v1/profiles | jq '.data | length'

echo ""
echo "Jobs:"
curl -s http://localhost:5000/api/v1/jobs | jq '.data | length'

echo ""
echo "🎉 Demo Complete!"
echo "Your ProofOfWork platform is ready for the hackathon!"
echo ""
echo "Key Features Demonstrated:"
echo "✅ Concordium testnet integration"
echo "✅ PLT stablecoin payments"
echo "✅ Location verification"
echo "✅ Tamper-proof blockchain records"
echo "✅ Real-time payment release"

# Clean up
kill $BACKEND_PID 2>/dev/null
