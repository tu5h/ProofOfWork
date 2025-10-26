# ProofOfWork Backend

Backend provides a robust API for managing location-based jobs with automatic payment release using Concordium blockchain technology.

## 🚀 Features

- **Real Concordium Integration**: Uses Concordium local stack for instant transactions - https://github.com/Concordium/concordium-local-stack
- **Location Verification**: GPS-based verification with blockchain proof
- **Smart Contract Integration**: PLT token escrow system
- **Comprehensive Testing**: Full test suite with Jest
- **Production Ready**: Optimized for performance and security

## 🏗️ Architecture

- **Backend**: Node.js with Express
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Concordium local stack
- **Smart Contracts**: Rust-based PLT escrow system
- **Testing**: Jest with comprehensive test coverage

## 📋 Prerequisites

- Node.js 18+
- Docker Desktop (for Concordium local stack)
- Supabase account

## 🛠️ Installation

1. **Clone and install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up Concordium local stack:**
   ```bash
   npm run setup:local
   ```

3. **Configure environment:**
   ```bash
   cp env.local.example .env
   # Update .env with your Supabase and Concordium details
   ```

4. **Seed the database:**
   ```bash
   npm run seed
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:infrastructure
npm run test:profiles
npm run test:jobs
npm run test:concordium
npm run test:security
npm run test:performance
npm run test:unit
```

## 📚 API Documentation

### Core Endpoints

- `GET /health` - Health check
- `GET /api/v1/profiles` - List profiles
- `POST /api/v1/profiles` - Create profile
- `GET /api/v1/jobs` - List jobs
- `POST /api/v1/jobs` - Create job
- `PATCH /api/v1/jobs/:id/assign` - Assign job to worker
- `PATCH /api/v1/jobs/:id/complete` - Complete job

### Concordium Integration

- **Account Verification**: Real-time account validation
- **Balance Checking**: Live balance queries
- **Escrow Creation**: PLT token escrow transactions
- **Payment Release**: Location-verified payment release
- **Location Verification**: GPS-based blockchain proof

## 🔧 Configuration

### Environment Variables

```env
# Concordium Local Stack
CONCORDIUM_NODE_URL=http://localhost:20100
USE_LOCAL_STACK=true

# Your Concordium Account
CONCORDIUM_ACCOUNT_ADDRESS=your_account_address
CONCORDIUM_PRIVATE_KEY=your_private_key

# PLT Token
PLT_TOKEN_ADDRESS=your_plt_token_address
ESCROW_CONTRACT_ADDRESS=LOCAL_ESCROW_CONTRACT

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Server
PORT=5000
NODE_ENV=development
```

## 🏆 Hackathon Ready

This backend is optimized for hackathon demonstration:

- ✅ **Real blockchain integration** (Concordium local stack)
- ✅ **Instant transactions** (no waiting for confirmations)
- ✅ **Your own PLT token** (full control)
- ✅ **Comprehensive testing** (production-level quality)
- ✅ **Professional architecture** (scalable and maintainable)

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts
│   ├── services/       # Business logic
│   ├── tests/          # Test suite
│   └── server.js       # Main server file
├── contracts/          # Smart contracts
├── docs/              # Documentation
└── package.json       # Dependencies and scripts
```

## 🚀 Getting Started

1. **Start Concordium local stack** (Docker)
2. **Configure your environment** (.env file)
3. **Run the backend** (`npm run dev`)
4. **Test the integration** (`npm test`)
5. **Create your first job** (API calls)

## 📖 Additional Documentation

- [Concordium Local Stack Setup](CONCORDIUM_LOCAL_STACK_SETUP.md)
- [Testing Guide](TESTING.md)
- [Backend Architecture](backend_README.md)

