# ProofOfWork

A location-verified payment platform built for the Concordium hackathon.

## The Problem

Traditional gig work has a trust problem. How do you know if someone actually showed up to clean your office or deliver your package? Manual verification is time-consuming and prone to disputes.

## Our Solution

ProofOfWork uses blockchain technology to automatically verify worker locations and release payments. No manual verification needed - the system handles everything.

## How It Works

1. **Businesses** post jobs with specific GPS coordinates and payment amounts
2. **Workers** accept jobs and travel to the location
3. **GPS verification** confirms the worker is within the required radius
4. **PLT tokens** are automatically released from escrow

## Tech Stack

- **Frontend**: Next.js (in development)
- **Backend**: Node.js with Express
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Concordium testnet
- **Smart Contracts**: Rust-based PLT escrow system

## Project Structure

```
ProofOfWork/
├── frontend/          # Next.js dashboard
├── backend/           # Node.js API
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Blockchain integration
│   │   └── scripts/  # Demo and testing
│   └── contracts/     # Rust smart contracts
└── README.md
```

## Getting Started

### Backend Setup

```bash
cd backend
npm install
cp env.example .env
# Edit .env with your credentials
npm run dev
```

### Deploy Contracts

```bash
cd backend
npm run deploy:contracts
```

## Features

- **Real Concordium Integration**: Connected to testnet with actual transactions
- **GPS Location Verification**: Accurate distance calculation with blockchain proof
- **Smart Contract Escrow**: PLT tokens held in escrow until location verified
- **Automatic Payments**: No manual intervention needed
- **Complete Workflow**: End-to-end job lifecycle management

## Production Ready

Our system handles:
- Job creation and assignment
- Real escrow creation on Concordium blockchain
- GPS verification with accuracy reporting
- Automatic payment release
- Error handling for location failures

## Team

Built for the Concordium hackathon. The focus was on demonstrating real blockchain integration with practical location verification.

## Next Steps

- Complete Next.js frontend
- Deploy to Concordium mainnet
- Add mobile app integration
- Implement additional job types
- Add more sophisticated verification

## License

MIT License - Built for Concordium Hackathon