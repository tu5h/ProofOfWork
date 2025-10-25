const { exec } = require('child_process');
const path = require('path');

class ConcordiumContractDeployer {
  constructor() {
    this.cliPath = 'C:\\concordium\\concordium-client.exe';
    this.testnetNode = 'testnet.concordium.com:20000';
    this.accountAddress = '3tQNXbUExDuZMK4YDhMVTQNAcQqGPxrrnQkBMppHMN3sWG5z6c';
  }

  // Execute Concordium CLI command
  async executeCommand(command) {
    return new Promise((resolve, reject) => {
      console.log(`🔧 Executing: ${command}`);
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Command failed: ${error.message}`);
          reject({ error: error.message, stderr });
        } else {
          console.log(`✅ Command successful`);
          if (stdout) console.log(`📄 Output: ${stdout}`);
          if (stderr) console.log(`⚠️ Warnings: ${stderr}`);
          resolve({ stdout, stderr });
        }
      });
    });
  }

  // Check account balance
  async checkAccountBalance() {
    try {
      console.log('💰 Checking account balance...');
      const command = `${this.cliPath} account show ${this.accountAddress} --grpc-ip testnet.concordium.com --grpc-port 20000`;
      const result = await this.executeCommand(command);
      
      // Parse balance from output
      const balanceMatch = result.stdout.match(/Amount:\s*(\d+(?:\.\d+)?)\s*CCD/);
      const balance = balanceMatch ? parseFloat(balanceMatch[1]) : 0;
      
      console.log(`💳 Account balance: ${balance} CCD`);
      return balance;
    } catch (error) {
      console.error('❌ Failed to check balance:', error);
      return 0;
    }
  }

  // Deploy smart contract module
  async deployContract() {
    try {
      console.log('🚀 Deploying PLT Escrow Smart Contract...');
      
      // First, check if we have enough balance
      const balance = await this.checkAccountBalance();
      if (balance < 10) {
        throw new Error('Insufficient balance for contract deployment');
      }

      // Deploy the contract module
      const contractPath = path.join(__dirname, 'plt_escrow.wasm');
      const command = `${this.cliPath} module deploy ${contractPath} --sender ${this.accountAddress} --grpc-ip testnet.concordium.com --grpc-port 20000`;
      
      const result = await this.executeCommand(command);
      
      // Extract module reference from output
      const moduleRefMatch = result.stdout.match(/Module reference: ([a-zA-Z0-9]+)/);
      if (moduleRefMatch) {
        const moduleRef = moduleRefMatch[1];
        console.log(`✅ Contract deployed! Module reference: ${moduleRef}`);
        return moduleRef;
      } else {
        throw new Error('Could not extract module reference');
      }
    } catch (error) {
      console.error('❌ Contract deployment failed:', error);
      throw error;
    }
  }

  // Initialize the contract
  async initializeContract(moduleRef, pltTokenAddress) {
    try {
      console.log('🔧 Initializing PLT Escrow Contract...');
      
      // Create initialization parameters
      const initParams = {
        plt_token: pltTokenAddress
      };
      
      const command = `${this.cliPath} contract init ${moduleRef} --sender ${this.accountAddress} --parameter-json '${JSON.stringify(initParams)}' --grpc-ip testnet.concordium.com --grpc-port 20000`;
      
      const result = await this.executeCommand(command);
      
      // Extract contract address from output
      const contractMatch = result.stdout.match(/Contract address: ([a-zA-Z0-9,]+)/);
      if (contractMatch) {
        const contractAddress = contractMatch[1];
        console.log(`✅ Contract initialized! Address: ${contractAddress}`);
        return contractAddress;
      } else {
        throw new Error('Could not extract contract address');
      }
    } catch (error) {
      console.error('❌ Contract initialization failed:', error);
      throw error;
    }
  }

  // Test contract interaction
  async testContract(contractAddress) {
    try {
      console.log('🧪 Testing contract interaction...');
      
      // Test creating an escrow
      const escrowParams = {
        job_id: 123,
        worker: this.accountAddress,
        amount: 1000000, // 1 PLT (in micro units)
        location_lat: 407128000, // 40.7128 * 1000000
        location_lng: -74006000, // -74.0060 * 1000000
        radius: 100000 // 100 meters in centimeters
      };
      
      const command = `${this.cliPath} contract update ${contractAddress} --sender ${this.accountAddress} --parameter-json '${JSON.stringify(escrowParams)}' --grpc-ip testnet.concordium.com --grpc-port 20000`;
      
      const result = await this.executeCommand(command);
      console.log('✅ Contract test successful!');
      return result;
    } catch (error) {
      console.error('❌ Contract test failed:', error);
      throw error;
    }
  }

  // Full deployment process
  async deployFullContract() {
    try {
      console.log('🚀 Starting PLT Escrow Contract Deployment');
      console.log('==========================================\n');

      // Step 1: Check account
      console.log('📋 Step 1: Checking account...');
      const balance = await this.checkAccountBalance();
      if (balance < 10) {
        throw new Error(`Insufficient balance: ${balance} CCD. Need at least 10 CCD for deployment.`);
      }

      // Step 2: Deploy contract
      console.log('\n📋 Step 2: Deploying contract module...');
      const moduleRef = await this.deployContract();

      // Step 3: Initialize contract
      console.log('\n📋 Step 3: Initializing contract...');
      const pltTokenAddress = 'PLT_TOKEN_CONTRACT_ADDRESS'; // Replace with actual PLT token address
      const contractAddress = await this.initializeContract(moduleRef, pltTokenAddress);

      // Step 4: Test contract
      console.log('\n📋 Step 4: Testing contract...');
      await this.testContract(contractAddress);

      console.log('\n🎉 Contract deployment completed successfully!');
      console.log(`📄 Module Reference: ${moduleRef}`);
      console.log(`📍 Contract Address: ${contractAddress}`);
      console.log(`💳 Account: ${this.accountAddress}`);
      
      return {
        moduleRef,
        contractAddress,
        accountAddress: this.accountAddress
      };

    } catch (error) {
      console.error('❌ Deployment failed:', error);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const deployer = new ConcordiumContractDeployer();
  deployer.deployFullContract()
    .then((result) => {
      console.log('\n🏆 Deployment Summary:');
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Deployment failed:', error);
      process.exit(1);
    });
}

module.exports = ConcordiumContractDeployer;
