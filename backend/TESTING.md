# Testing Our ProofOfWork Backend API

Here are several ways we can test our backend API to ensure everything works correctly.

## 🚀 Quick Start Testing

### 1. Start the Server
```bash
cd backend
npm run dev
```

### 2. Basic Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "ProofOfWork API is running",
  "timestamp": "2025-01-24T...",
  "environment": "development",
  "concordium": {
    "network": "testnet",
    "nodeUrl": "https://testnet.concordium.com"
  }
}
```

## 📊 Manual API Testing

### Test Profile Creation
```bash
# Create a business profile
curl -X POST http://localhost:5000/api/v1/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "role": "business",
    "display_name": "CleanPro Services",
    "concordium_account": "concordium_business_123",
    "concordium_did": true
  }'
```

### Test Job Creation
```bash
# Create a job (replace BUSINESS_ID with actual ID from profile creation)
curl -X POST http://localhost:5000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "BUSINESS_ID_HERE",
    "title": "Office Cleaning - Downtown",
    "description": "Deep clean office space including floors, windows, and bathrooms",
    "amount_plt": 25.0,
    "location": {"latitude": 40.7589, "longitude": -73.9851},
    "radius_m": 150
  }'
```

### Test Job Completion
```bash
# Complete a job with location verification
curl -X PATCH http://localhost:5000/api/v1/jobs/JOB_ID_HERE/complete \
  -H "Content-Type: application/json" \
  -d '{
    "position": {"latitude": 40.7589, "longitude": -73.9851}
  }'
```

## 🧪 Automated Testing

### Run Our Test Suite
```bash
cd backend
npm test
```

Our test suite covers:
- Health check endpoints
- Profile CRUD operations
- Job management workflows
- Location verification
- Error handling
- Rate limiting

### Test Coverage
```bash
# Install test coverage tool
npm install --save-dev jest-coverage

# Run tests with coverage
npm test -- --coverage
```

## 🔍 API Endpoint Testing

### Profiles Endpoints
```bash
# Get all profiles
curl http://localhost:5000/api/v1/profiles

# Get specific profile
curl http://localhost:5000/api/v1/profiles/PROFILE_ID

# Get profile balance
curl http://localhost:5000/api/v1/profiles/PROFILE_ID/balance

# Verify Concordium identity
curl -X POST http://localhost:5000/api/v1/profiles/PROFILE_ID/verify-identity
```

### Jobs Endpoints
```bash
# Get all jobs
curl http://localhost:5000/api/v1/jobs

# Get jobs by status
curl "http://localhost:5000/api/v1/jobs?status=open"

# Get jobs by business
curl "http://localhost:5000/api/v1/jobs?business_id=BUSINESS_ID"

# Get nearby jobs
curl "http://localhost:5000/api/v1/jobs/nearby?latitude=40.7589&longitude=-73.9851&radius=5000"

# Assign job to worker
curl -X PATCH http://localhost:5000/api/v1/jobs/JOB_ID/assign \
  -H "Content-Type: application/json" \
  -d '{"worker_id": "WORKER_ID"}'
```

## 🌐 Database Testing

### Test Supabase Connection
```bash
# Check if our seeding script works
npm run seed
```

### Verify Database Records
```bash
# Test profile creation and retrieval
curl -X POST http://localhost:5000/api/v1/profiles \
  -H "Content-Type: application/json" \
  -d '{"role": "worker", "display_name": "Test Worker", "concordium_account": "test_worker", "concordium_did": true}'

# Then retrieve it
curl http://localhost:5000/api/v1/profiles
```

## ⛓️ Concordium Integration Testing

### Test Blockchain Connection
```bash
# Check Concordium network status
curl http://localhost:5000/health | jq '.concordium'
```

### Test Identity Verification
```bash
# Create profile with Concordium account
curl -X POST http://localhost:5000/api/v1/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "role": "business",
    "display_name": "Blockchain Test Business",
    "concordium_account": "concordium_test_account",
    "concordium_did": false
  }'

# Verify the identity
curl -X POST http://localhost:5000/api/v1/profiles/PROFILE_ID/verify-identity
```

## 🛡️ Security Testing

### Test Rate Limiting
```bash
# Make multiple requests quickly
for i in {1..10}; do
  curl http://localhost:5000/health &
done
wait
```

### Test CORS
```bash
# Test from different origin
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:5000/api/v1/profiles
```

## 📱 Frontend Integration Testing

### Test API from Frontend
```javascript
// Test from browser console or frontend app
fetch('http://localhost:5000/api/v1/profiles')
  .then(response => response.json())
  .then(data => console.log(data));

// Test job creation
fetch('http://localhost:5000/api/v1/jobs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    business_id: 'your-business-id',
    title: 'Test Job',
    description: 'Test description',
    amount_plt: 10.0,
    location: { latitude: 40.7589, longitude: -73.9851 },
    radius_m: 100
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## 🐛 Debugging Tips

### Check Server Logs
```bash
# Run with debug logging
DEBUG=* npm run dev
```

### Test Database Queries
```bash
# Check Supabase logs in dashboard
# Verify environment variables
echo $SUPABASE_URL
echo $CONCORDIUM_NODE_URL
```

### Common Issues
1. **Port already in use**: Kill process on port 5000
2. **Supabase connection failed**: Check credentials in .env
3. **Concordium connection failed**: Verify node URL
4. **CORS errors**: Check CORS_ORIGIN setting

## 📊 Performance Testing

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/health"
      - get:
          url: "/api/v1/profiles"
EOF

# Run load test
artillery run load-test.yml
```

## ✅ Testing Checklist

- [ ] Server starts without errors
- [ ] Health check returns success
- [ ] Profile creation works
- [ ] Job creation works
- [ ] Location verification works
- [ ] Database operations succeed
- [ ] Concordium integration works
- [ ] Rate limiting functions
- [ ] CORS is configured
- [ ] Error handling works
- [ ] API responses are properly formatted

## 🎯 Next Steps

After testing:
1. Deploy to production environment
2. Set up monitoring and logging
3. Configure CI/CD pipeline
4. Set up automated testing in deployment
5. Monitor API performance and usage
