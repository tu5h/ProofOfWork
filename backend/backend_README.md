# ProofOfWork Backend

## Overview

This is the backend API for ProofOfWork, our location-verified payment platform built for the Concordium hackathon. The system handles job creation, worker assignment, location verification, and automatic payment release using Concordium blockchain technology.

## What It Does

The backend manages the complete workflow:

1. **Job Management**: Businesses create location-based jobs with GPS coordinates and payment amounts
2. **Worker Assignment**: Workers can accept jobs and get assigned to specific locations
3. **Location Verification**: GPS verification confirms workers are at the job site
4. **Payment Processing**: PLT tokens are automatically released from escrow when location is verified

## Tech Stack

- **Node.js** with Express framework
- **Supabase** for database (PostgreSQL)
- **Concordium Web SDK** for blockchain integration
- **JWT** for authentication
- **Helmet & CORS** for security

## Key Features

### Smart Contract Integration
- PLT token escrow system
- Location verification on-chain
- Automatic payment release
- Transaction hash tracking

### Location Verification
- Real GPS coordinate verification
- Haversine distance calculation
- Configurable radius checking
- Blockchain proof generation

### Job Workflow
- Complete job lifecycle management
- Real-time status updates
- Error handling for edge cases
- Transaction history tracking

## API Endpoints

### Jobs
- `GET /api/v1/jobs` - List all jobs
- `POST /api/v1/jobs` - Create new job
- `PATCH /api/v1/jobs/:id/assign` - Assign job to worker
- `PATCH /api/v1/jobs/:id/complete` - Complete job with location verification

### Profiles
- `GET /api/v1/profiles` - List profiles
- `POST /api/v1/profiles` - Create profile
- `GET /api/v1/profiles/:id/balance` - Get Concordium balance

### Health
- `GET /health` - API health check

## Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your Supabase and Concordium credentials

# Start development server
npm run dev
```

## Environment Variables

```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
CONCORDIUM_NODE_URL=https://testnet.concordium.com
JWT_SECRET=your-jwt-secret
```

## Database Schema

### Jobs Table
- `id` - Job UUID
- `business_id` - Business UUID
- `worker_id` - Worker UUID (nullable)
- `title` - Job title
- `description` - Job description
- `amount_plt` - Payment amount in PLT
- `location` - GPS coordinates (PostGIS point)
- `radius_m` - Verification radius in meters
- `status` - Job status (open, assigned, completed, paid)

### Escrows Table
- `job_id` - References jobs table
- `status` - Escrow status (none, created, released)
- `tx_hash` - Blockchain transaction hash
- `real_transaction` - Boolean flag for real vs simulated

### Location Checks Table
- `job_id` - References jobs table
- `worker_id` - Worker UUID
- `position` - GPS coordinates
- `distance_m` - Calculated distance
- `within_geofence` - Boolean verification result

## Testing

```bash
# Run all tests
npm test

# Run API tests
npm run test:api

# Deploy contracts
npm run deploy:contracts
```

## Concordium Integration

We're using Concordium testnet with account `3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c` for testing. The integration includes:

- Real account verification
- PLT token escrow creation
- Location verification with blockchain proof
- Automatic payment release
- Transaction confirmation

## Development Notes

The backend uses a hybrid approach for Concordium integration - combining Web SDK with CLI tools for maximum compatibility. This handles some account format limitations while maintaining real blockchain functionality.

Location verification uses the Haversine formula for accurate distance calculation. GPS accuracy is typically 3-10 meters, which works well for most job types.

## Deployment

For production deployment:

1. Switch to Concordium mainnet
2. Deploy smart contracts
3. Update environment variables
4. Configure production database
5. Set up monitoring and logging

## Team Notes

This backend was built specifically for the Concordium hackathon. The focus was on demonstrating real blockchain integration with practical location verification. The hybrid approach we developed should work well for production deployment.

The API is designed to be simple and focused - just the core functionality needed for location-verified payments. Additional features like user management, notifications, and analytics can be added later.