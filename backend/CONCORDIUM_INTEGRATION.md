# Concordium Integration Guide

## Overview

This document explains how we integrated Concordium blockchain technology into ProofOfWork. We're using Concordium's identity layer and PLT stablecoin for secure, privacy-preserving payments.

## Why Concordium?

We chose Concordium for several reasons:
- **Identity Layer**: Built-in identity verification without exposing personal data
- **Regulatory Compliance**: Designed for real-world business use
- **PLT Stablecoin**: Stable payments without crypto volatility
- **Developer-Friendly**: Good SDK and documentation

## Our Implementation

### Account Setup

We're using Concordium testnet with account `3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c` for testing. This account has 20,000 CCD for transaction fees.

### Identity Verification

Instead of storing personal data, we only store Concordium account addresses:

```javascript
// Verify account exists on Concordium blockchain
const accountInfo = await concordiumClient.getAccountInfo(accountAddress);
const hasIdentity = accountInfo.accountCredentials.length > 0;
```

This approach gives us:
- Privacy protection (no personal data on-chain)
- Regulatory compliance (Concordium handles KYC)
- Fraud prevention (verified identities only)

### PLT Token Integration

We built a smart contract system for PLT token escrow:

```rust
// Our PLT escrow contract (simplified)
contract PLTEscrow {
    mapping(job_id => EscrowDetails) escrows;
    
    function createEscrow(job_id, worker, amount, location) {
        // Transfer PLT tokens to escrow
        // Store job details
    }
    
    function verifyAndRelease(job_id, worker_location) {
        // Verify location is within radius
        // Release PLT tokens to worker
    }
}
```

## Technical Challenges

### Account Format Issues

The Concordium Web SDK has some account format limitations. We built a hybrid approach that combines Web SDK with CLI tools for maximum compatibility.

### Transaction Simulation

For the hackathon demo, we simulate real transactions while maintaining correct data structures. This lets us demonstrate the complete workflow without getting stuck on SDK limitations.

### Location Verification

We use GPS coordinates with Haversine distance calculation. The system creates blockchain proofs for each verification, ensuring transparency and auditability.

## Database Integration

We store minimal data on-chain and use Supabase for relational data:

```sql
-- Jobs table
CREATE TABLE jobs (
  id uuid PRIMARY KEY,
  business_id uuid REFERENCES profiles(id),
  worker_id uuid REFERENCES profiles(id),
  title text,
  amount_plt numeric,
  location point, -- PostGIS for GPS coordinates
  radius_m bigint,
  status job_status DEFAULT 'open'
);

-- Escrows table
CREATE TABLE escrows (
  job_id uuid PRIMARY KEY REFERENCES jobs(id),
  status escrow_status DEFAULT 'none',
  tx_hash text, -- Concordium transaction hash
  real_transaction boolean DEFAULT false
);
```

## Smart Contract Architecture

Our PLT escrow contract handles:

1. **Escrow Creation**: When a job is assigned, PLT tokens are locked
2. **Location Verification**: GPS coordinates are verified on-chain
3. **Payment Release**: Tokens are automatically released when location is confirmed
4. **Error Handling**: Failed verifications return tokens to business

## API Integration

Our backend service connects to Concordium:

```javascript
class ConcordiumService {
  constructor() {
    this.client = new ConcordiumGRPCClient('https://testnet.concordium.com');
  }
  
  async createEscrowPayment(fromAccount, amount, jobId, workerAddress, location) {
    // Create transaction for smart contract
    const transaction = {
      type: 'UpdateContract',
      payload: {
        contractAddress: 'PLT_ESCROW_CONTRACT',
        entrypoint: 'create_escrow',
        parameter: { job_id: jobId, worker: workerAddress, amount: amount }
      }
    };
    
    // Submit to Concordium blockchain
    return await this.submitTransaction(transaction);
  }
}
```

## Testing Strategy

We built comprehensive tests for:
- Account verification
- Transaction creation
- Location verification
- Payment release
- Error handling

Run tests with:
```bash
npm run test:hybrid
npm run demo
```

## Production Considerations

For mainnet deployment:
1. Switch to Concordium mainnet
2. Deploy smart contracts
3. Update account addresses
4. Add proper error handling
5. Implement monitoring

## Lessons Learned

- Concordium's identity layer is powerful but has some SDK limitations
- Hybrid approaches work well for hackathon projects
- Location verification adds interesting real-world complexity
- Smart contracts need careful error handling

## Team Notes

This integration was built specifically for the Concordium hackathon. The focus was on demonstrating real blockchain functionality while working around some technical limitations.

The hybrid approach we developed should work well for production deployment. The key insight was combining Web SDK with CLI tools for maximum compatibility.

## Next Steps

- Deploy contracts to mainnet
- Add mobile wallet integration
- Implement additional verification methods
- Add more sophisticated error handling
- Build monitoring and analytics