# Concordium Local Stack Setup Guide

## 🎯 **Perfect for Hackathon!**

The judges have provided you with the **Concordium Local Stack** - this is actually **better** than testnet for a hackathon because you have full control over your own blockchain!

## 🚀 **Why Local Stack is Better:**

- ✅ **Your own blockchain** - no network issues
- ✅ **Instant transactions** - no waiting for confirmations
- ✅ **Free CCD tokens** - request as many as you need
- ✅ **Create your own PLT tokens** - full control
- ✅ **Local explorer** - see all transactions instantly
- ✅ **No external dependencies** - works offline

## 📋 **Prerequisites**

### **1. Install Docker Desktop**
- Download from [docker.com](https://docker.com)
- **For Apple Silicon Macs**: Enable Rosetta emulation in Docker Desktop settings

### **2. Install jq**
```bash
# macOS
brew install jq

# Windows (using Chocolatey)
choco install jq

# Verify installation
jq --version
```

### **3. Install concordium-client**
- Download from [Concordium Developer Documentation](https://developer.concordium.software/)
- **Windows**: Download `concordium-client.exe`
- **macOS**: Download `concordium-client` binary
- **Linux**: Download `concordium-client` binary

### **4. Install genesis-creator**
```bash
# Install Rust first
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install genesis-creator
cargo install --git https://github.com/Concordium/concordium-misc-tools genesis-creator

# Verify installation
genesis-creator --version
```

## 🛠️ **Setup Instructions**

### **Step 1: Clone and Setup Local Stack**

```bash
# Clone the repository
git clone https://github.com/Concordium/concordium-local-stack.git
cd concordium-local-stack

# Initialize the genesis block
./initialise.sh

# Start all services
docker compose up --detach

# Verify all services are running
docker compose ps
```

### **Step 2: Configure Concordium Wallet**

1. **Install Concordium Wallet for Web** from Chrome Web Store
2. **Configure custom network BEFORE creating account**:
   - **Node Address**: `http://localhost`
   - **Node Port**: `20100`
   - **Wallet Proxy**: `http://localhost:7013`
   - **CCDscan URL**: `http://localhost:7016`
3. **Create your seed phrase**
4. **Request identity** from test identity provider
5. **Create account**
6. **Request CCD tokens** (you'll get 20,000 CCD)

### **Step 3: Create Your Own PLT Token**

```bash
# Run the PLT creation script
./make-plts.sh
```

**Follow the prompts:**
- **Token ID**: `proofofwork-plt` (or your choice)
- **Token Name**: `ProofOfWork PLT`
- **Token Description**: `Location-verified payment token for ProofOfWork platform`
- **Number of Decimals**: `6`
- **Initial Supply**: `1000000` (1 million tokens)
- **Governance Address**: Copy from your wallet

### **Step 4: Configure Your Backend**

1. **Update your `.env` file**:
```env
# Concordium Local Stack Configuration
CONCORDIUM_NODE_URL=http://localhost:20100
USE_LOCAL_STACK=true
USE_REAL_TRANSACTIONS=true

# Your Local Account Details
CONCORDIUM_ACCOUNT_ADDRESS=your_local_account_address
CONCORDIUM_PRIVATE_KEY=your_private_key

# Your PLT Token Address (from make-plts.sh output)
PLT_TOKEN_ADDRESS=your_plt_token_address
ESCROW_CONTRACT_ADDRESS=your_escrow_contract_address
```

2. **Restart your backend**:
```bash
npm run dev
```

## 🎯 **What You'll Get**

### **✅ Local Blockchain Services:**
- **Node**: `http://localhost:20100` (GRPC)
- **Wallet Proxy**: `http://localhost:7013`
- **Explorer**: `http://localhost:7016`
- **Token Metadata**: `http://localhost:7020`
- **Database**: `http://localhost:8432` (pgAdmin)

### **✅ Console Output:**
```
✅ Connected to Concordium local stack: http://localhost:20100
✅ Wallet initialized (private key available)
🔒 Local PLT Escrow Transaction Created: {
  hash: "local_1234567890_abcdef123456",
  amount: "10.5 PLT",
  jobId: "job-123",
  from: "your_account_address",
  network: "local",
  realTransaction: true,
  localStack: true
}
```

### **✅ Real Blockchain Features:**
- **Actual transaction hashes** from your local blockchain
- **Real account verification** against local blockchain
- **Live balance checking** from your local account
- **Smart contract interactions** with deployed contract
- **Location verification** with blockchain proof
- **Instant confirmations** (no waiting!)

## 🧪 **Testing Your Setup**

### **Test 1: Check Local Stack Status**
```bash
# Check if all services are running
docker compose ps

# Check logs
docker compose logs -f local-node
```

### **Test 2: Verify Account**
```bash
curl -X GET "http://localhost:5000/api/v1/profiles/your_account_address/balance"
```

### **Test 3: Create Job with Real PLT**
```bash
curl -X POST "http://localhost:5000/api/v1/jobs" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Local Blockchain Test Job",
    "description": "Testing Concordium local stack integration",
    "amount_plt": 10.5,
    "location": {
      "latitude": 40.7589,
      "longitude": -73.9851,
      "radius": 100
    },
    "business_id": "your_business_id"
  }'
```

### **Test 4: Complete Job with Location Verification**
```bash
curl -X PATCH "http://localhost:5000/api/v1/jobs/job_id/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "position": {
      "latitude": 40.7589,
      "longitude": -73.9851
    }
  }'
```

## 🎉 **Hackathon Advantages**

### **✅ Perfect for Demo:**
- **Instant transactions** - no waiting for confirmations
- **Your own PLT tokens** - create as many as needed
- **Local explorer** - show transactions in real-time
- **No network issues** - works offline
- **Full control** - reset blockchain anytime

### **✅ Impressive Features:**
- **Real blockchain technology** - not simulation
- **Smart contract integration** - actual contract calls
- **Location verification** - GPS-based proof
- **Token economics** - your own PLT token
- **Professional setup** - production-ready architecture

## 🔧 **Useful Commands**

### **Managing Local Stack:**
```bash
# Stop all services
docker compose down

# Stop and remove all data (fresh start)
docker compose down -v

# View logs from all services
docker compose logs -f

# Restart services
docker compose restart
```

### **Accessing Services:**
- **CCDScan Explorer**: http://localhost:7016
- **Wallet Proxy**: http://localhost:7013
- **pgAdmin**: http://localhost:8432 (user: test@company.com, password: password)
- **Token Metadata**: http://localhost:7020

## 🚨 **Troubleshooting**

### **Services won't start:**
```bash
# Check which containers are running
docker compose ps -a

# Check logs for errors
docker compose logs
```

### **PostgreSQL errors:**
```bash
# Restart with clean database
docker compose down -v
docker compose up --detach
```

### **Platform warnings on Apple Silicon:**
- Warnings about platform mismatch are normal
- Ensure Rosetta is enabled in Docker Desktop

## 🎯 **Next Steps**

1. **Set up local stack** using the instructions above
2. **Create your PLT token** using `make-plts.sh`
3. **Update backend configuration** to use local stack
4. **Test all functionality** with real local blockchain
5. **Prepare your demo** with instant transactions!

## 🏆 **Hackathon Success**

With the Concordium local stack, you'll have:
- ✅ **Real blockchain functionality** (not simulation)
- ✅ **Instant transactions** (perfect for demos)
- ✅ **Your own PLT token** (impressive to judges)
- ✅ **Professional setup** (production-ready)
- ✅ **Full control** (no external dependencies)

**This is exactly what the judges want to see!** 🚀

---

**🎉 You're now ready to impress the judges with real Concordium blockchain integration!**
