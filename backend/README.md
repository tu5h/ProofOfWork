# ProofOfWork Backend API

Our Node.js/Express backend API for the ProofOfWork location-verified payment platform, built for the Concordium hackathon. We've integrated Supabase for database operations and Concordium blockchain for identity verification and payments.

## 🏗️ Architecture

### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Concordium SDK
- **Authentication**: JWT tokens
- **Security**: Helmet, CORS, Rate Limiting

### Database Schema (Supabase)
Our backend works with the following Supabase tables:
- `profiles` - User profiles with Concordium accounts
- `businesses` - Business entities
- `workers` - Worker entities  
- `jobs` - Location-based jobs
- `escrows` - Payment escrow records
- `location_checks` - Location verification records

## 🚀 Features

### Core Functionality
- **User Management**: Profile creation and Concordium identity verification
- **Job Management**: Create, assign, and complete location-based jobs
- **Location Verification**: GPS-based verification with radius checking
- **Payment System**: PLT token escrow and release mechanism
- **Blockchain Integration**: Real Concordium SDK integration

### API Endpoints

#### Profiles
- `GET /api/v1/profiles` - Get all profiles
- `GET /api/v1/profiles/:id` - Get profile by ID
- `POST /api/v1/profiles` - Create new profile
- `GET /api/v1/profiles/:id/balance` - Get Concordium balance
- `POST /api/v1/profiles/:id/verify-identity` - Verify Concordium identity

#### Jobs
- `GET /api/v1/jobs` - Get all jobs (with filters)
- `GET /api/v1/jobs/:id` - Get job by ID
- `POST /api/v1/jobs` - Create new job
- `PATCH /api/v1/jobs/:id/assign` - Assign job to worker
- `PATCH /api/v1/jobs/:id/complete` - Complete job with location verification
- `GET /api/v1/jobs/nearby` - Get jobs near location

#### Health
- `GET /health` - API health check with Concordium status

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+
- Supabase project with database schema
- Concordium testnet access

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy our environment template:
```bash
cp env.example .env
```

Configure the `.env` file with your credentials:
```env
# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Concordium Configuration
CONCORDIUM_NODE_URL=https://testnet.concordium.com

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# API Configuration
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

### 3. Database Setup
Make sure your Supabase project includes our required tables:
- `profiles`
- `businesses` 
- `workers`
- `jobs`
- `escrows`
- `location_checks`

### 4. Seed Demo Data (Optional)
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

Our API will be available at `http://localhost:5000`

## 📊 API Usage Examples

### Create a Profile
```bash
curl -X POST http://localhost:5000/api/v1/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "role": "business",
    "display_name": "CleanPro Services",
    "concordium_account": "concordium_business_123",
    "concordium_did": true
  }'
```

### Create a Job
```bash
curl -X POST http://localhost:5000/api/v1/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "business-uuid",
    "title": "Office Cleaning",
    "description": "Deep clean office space",
    "amount_plt": 25.0,
    "location": {"latitude": 40.7589, "longitude": -73.9851},
    "radius_m": 150
  }'
```

### Complete Job with Location Verification
```bash
curl -X PATCH http://localhost:5000/api/v1/jobs/job-uuid/complete \
  -H "Content-Type: application/json" \
  -d '{
    "position": {"latitude": 40.7589, "longitude": -73.9851}
  }'
```

## 🔐 Security Features

We've implemented several security measures:
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable origin restrictions
- **Helmet Security**: Security headers
- **Input Validation**: Joi schema validation
- **Concordium Verification**: Real blockchain identity verification

## 🌐 Concordium Integration

### Real Blockchain Features
- **Identity Verification**: Verify Concordium accounts and DIDs
- **Balance Checking**: Get real account balances
- **Transaction Simulation**: Simulate escrow and payment transactions
- **Network Status**: Monitor Concordium node connectivity

### Concordium Service Methods
```javascript
// Verify Concordium identity
const verification = await concordiumService.verifyIdentity(accountAddress);

// Get account balance
const balance = await concordiumService.getBalance(accountAddress);

// Create escrow payment
const escrow = await concordiumService.createEscrowPayment(fromAccount, amount, jobId);

// Release payment
const payment = await concordiumService.releasePayment(toAccount, amount, jobId);

// Verify location
const locationProof = await concordiumService.verifyLocation(lat, lon, targetLat, targetLon, radius);
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
SUPABASE_URL=your-production-supabase-url
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
CONCORDIUM_NODE_URL=https://mainnet.concordium.com
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Set environment variables in Vercel dashboard

### Deploy to Railway/Render
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### API Status
```bash
curl http://localhost:5000/
```

## 📝 Database Schema Reference

Here's our Supabase schema structure:

### Profiles Table
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role,
  display_name varchar,
  concordium_account varchar,
  concordium_did boolean,
  created_at timestamptz DEFAULT now()
);
```

### Jobs Table
```sql
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id),
  worker_id uuid REFERENCES workers(id),
  title text,
  description text,
  amount_plt numeric,
  location point,
  radius_m bigint,
  status job_status DEFAULT 'open',
  created_at timestamptz,
  updated_at timestamptz
);
```

### Escrows Table
```sql
CREATE TABLE escrows (
  job_id uuid PRIMARY KEY REFERENCES jobs(id),
  status escrow_status DEFAULT 'none',
  tx_hash text,
  simulated boolean,
  updated_at timestamptz DEFAULT now()
);
```

## 🆘 Troubleshooting

### Common Issues

**Supabase Connection Error**
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check Supabase project status

**Concordium Connection Error**
- Verify `CONCORDIUM_NODE_URL` is accessible
- Check Concordium testnet status

**Port Already in Use**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**Environment Variables Not Loading**
- Ensure `.env` file is in the `backend` directory
- Restart the development server

## 📄 License

MIT License - Built for Concordium Hackathon

---

**Built with ❤️ for the Concordium Hackathon**
