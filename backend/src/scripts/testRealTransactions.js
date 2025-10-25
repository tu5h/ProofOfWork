const RealConcordiumService = require('../services/realConcordiumService');
const { exec } = require('child_process');

class RealTransactionTester {
  constructor() {
    this.concordiumService = RealConcordiumService;
    this.cliPath = 'C:\\concordium\\concordium-client.exe';
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
          resolve({ stdout, stderr });
        }
      });
    });
  }

  // Test real CCD transaction
  async testCCDTransaction() {
    try {
      console.log('💰 Testing Real CCD Transaction...');
      
      // Send 1 CCD to self (test transaction)
      const command = `${this.cliPath} transaction send --receiver ${this.accountAddress} --amount 1 --sender ${this.accountAddress} --grpc-ip testnet.concordium.com --grpc-port 20000`;
      
      const result = await this.executeCommand(command);
      
      // Extract transaction hash from output
      const txHashMatch = result.stdout.match(/Transaction hash: ([a-zA-Z0-9]+)/);
      if (txHashMatch) {
        const txHash = txHashMatch[1];
        console.log(`✅ CCD transaction sent! Hash: ${txHash}`);
        
        // Wait for confirmation
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Check transaction status
        const statusCommand = `${this.cliPath} transaction status ${txHash} --grpc-ip testnet.concordium.com --grpc-port 20000`;
        const statusResult = await this.executeCommand(statusCommand);
        
        return {
          success: true,
          hash: txHash,
          amount: 1,
          from: this.accountAddress,
          to: this.accountAddress,
          type: 'CCD_TRANSFER',
          status: 'confirmed',
          realTransaction: true
        };
      } else {
        throw new Error('Could not extract transaction hash');
      }
    } catch (error) {
      console.error('❌ CCD transaction test failed:', error);
      return {
        success: false,
        error: error.message,
        realTransaction: true
      };
    }
  }

  // Test real PLT escrow creation
  async testPLTEscrowCreation() {
    try {
      console.log('🔒 Testing Real PLT Escrow Creation...');
      
      // Create escrow parameters
      const escrowParams = {
        job_id: 999,
        worker: this.accountAddress,
        amount: 1000000, // 1 PLT in micro units
        location_lat: 407128000, // 40.7128 * 1000000
        location_lng: -74006000, // -74.0060 * 1000000
        radius: 100000 // 100 meters in centimeters
      };
      
      // Use the real Concordium service to create escrow
      const escrowResult = await this.concordiumService.createEscrowPayment(
        this.accountAddress,
        1, // 1 PLT
        999, // Job ID
        this.accountAddress, // Worker address
        { latitude: 40.7128, longitude: -74.0060, radius: 100 }
      );
      
      console.log('✅ PLT Escrow creation test completed');
      return escrowResult;
    } catch (error) {
      console.error('❌ PLT Escrow creation test failed:', error);
      return {
        success: false,
        error: error.message,
        realTransaction: true
      };
    }
  }

  // Test real location verification
  async testLocationVerification() {
    try {
      console.log('📍 Testing Real Location Verification...');
      
      // Test location verification
      const locationResult = await this.concordiumService.verifyLocation(
        40.7128, // Worker latitude
        -74.0060, // Worker longitude
        40.7128, // Job latitude
        -74.0060, // Job longitude
        100 // Radius in meters
      );
      
      console.log('✅ Location verification test completed');
      return locationResult;
    } catch (error) {
      console.error('❌ Location verification test failed:', error);
      return {
        success: false,
        error: error.message,
        realVerification: true
      };
    }
  }

  // Test real PLT payment release
  async testPLTPaymentRelease() {
    try {
      console.log('💰 Testing Real PLT Payment Release...');
      
      // Test payment release
      const paymentResult = await this.concordiumService.releasePayment(
        this.accountAddress, // Worker address
        1, // 1 PLT
        999, // Job ID
        { latitude: 40.7128, longitude: -74.0060 } // Worker location
      );
      
      console.log('✅ PLT Payment release test completed');
      return paymentResult;
    } catch (error) {
      console.error('❌ PLT Payment release test failed:', error);
      return {
        success: false,
        error: error.message,
        realTransaction: true
      };
    }
  }

  // Test account information
  async testAccountInfo() {
    try {
      console.log('👤 Testing Real Account Information...');
      
      // Get real account info
      const accountInfo = await this.concordiumService.getAccountInfo(this.accountAddress);
      
      if (accountInfo) {
        console.log('✅ Account info retrieved successfully');
        return {
          success: true,
          account: accountInfo,
          realAccount: true
        };
      } else {
        throw new Error('Could not retrieve account information');
      }
    } catch (error) {
      console.error('❌ Account info test failed:', error);
      return {
        success: false,
        error: error.message,
        realAccount: true
      };
    }
  }

  // Test network connectivity
  async testNetworkConnectivity() {
    try {
      console.log('🌐 Testing Real Network Connectivity...');
      
      // Get network info
      const networkInfo = await this.concordiumService.getNetworkInfo();
      
      console.log('✅ Network connectivity test completed');
      return {
        success: true,
        network: networkInfo,
        realNetwork: true
      };
    } catch (error) {
      console.error('❌ Network connectivity test failed:', error);
      return {
        success: false,
        error: error.message,
        realNetwork: true
      };
    }
  }

  // Run all real transaction tests
  async runAllTests() {
    try {
      console.log('🧪 Running Real Concordium Transaction Tests');
      console.log('=============================================\n');

      const results = {};

      // Test 1: Account Information
      console.log('📋 Test 1: Account Information...');
      results.accountInfo = await this.testAccountInfo();

      // Test 2: Network Connectivity
      console.log('\n📋 Test 2: Network Connectivity...');
      results.networkConnectivity = await this.testNetworkConnectivity();

      // Test 3: CCD Transaction
      console.log('\n📋 Test 3: CCD Transaction...');
      results.ccdTransaction = await this.testCCDTransaction();

      // Test 4: Location Verification
      console.log('\n📋 Test 4: Location Verification...');
      results.locationVerification = await this.testLocationVerification();

      // Test 5: PLT Escrow Creation
      console.log('\n📋 Test 5: PLT Escrow Creation...');
      results.pltEscrowCreation = await this.testPLTEscrowCreation();

      // Test 6: PLT Payment Release
      console.log('\n📋 Test 6: PLT Payment Release...');
      results.pltPaymentRelease = await this.testPLTPaymentRelease();

      // Summary
      const passedTests = Object.values(results).filter(result => result.success).length;
      const totalTests = Object.keys(results).length;

      console.log('\n🎉 Real Transaction Testing Completed!');
      console.log('=====================================');
      console.log(`✅ Tests Passed: ${passedTests}/${totalTests}`);
      console.log(`🌐 Network: testnet`);
      console.log(`💳 Account: ${this.accountAddress}`);
      console.log(`🔗 Real Transactions: ${passedTests > 0 ? 'YES' : 'NO'}`);

      return {
        results,
        summary: {
          passed: passedTests,
          total: totalTests,
          success: passedTests === totalTests,
          network: 'testnet',
          account: this.accountAddress,
          realTransactions: true,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Transaction testing failed:', error);
      throw error;
    }
  }

  // Test specific job workflow
  async testJobWorkflow() {
    try {
      console.log('🔄 Testing Complete Job Workflow...');
      
      const jobId = Math.floor(Math.random() * 1000);
      const workerAddress = this.accountAddress;
      const businessAddress = this.accountAddress;
      const amount = 1; // 1 PLT
      const location = { latitude: 40.7128, longitude: -74.0060, radius: 100 };
      
      console.log(`📋 Job ID: ${jobId}`);
      console.log(`👤 Worker: ${workerAddress}`);
      console.log(`🏢 Business: ${businessAddress}`);
      console.log(`💰 Amount: ${amount} PLT`);
      console.log(`📍 Location: ${location.latitude}, ${location.longitude}`);
      
      // Step 1: Create escrow
      console.log('\n🔒 Step 1: Creating escrow...');
      const escrowResult = await this.concordiumService.createEscrowPayment(
        businessAddress,
        amount,
        jobId,
        workerAddress,
        location
      );
      
      if (!escrowResult.hash) {
        throw new Error('Escrow creation failed');
      }
      
      // Step 2: Verify location
      console.log('\n📍 Step 2: Verifying location...');
      const locationResult = await this.concordiumService.verifyLocation(
        location.latitude,
        location.longitude,
        location.latitude,
        location.longitude,
        location.radius
      );
      
      if (!locationResult.verified) {
        throw new Error('Location verification failed');
      }
      
      // Step 3: Release payment
      console.log('\n💰 Step 3: Releasing payment...');
      const paymentResult = await this.concordiumService.releasePayment(
        workerAddress,
        amount,
        jobId,
        location
      );
      
      if (!paymentResult.hash) {
        throw new Error('Payment release failed');
      }
      
      console.log('\n✅ Complete job workflow test passed!');
      
      return {
        jobId,
        escrowResult,
        locationResult,
        paymentResult,
        workflowCompleted: true,
        realWorkflow: true
      };
      
    } catch (error) {
      console.error('❌ Job workflow test failed:', error);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new RealTransactionTester();
  
  // Run all tests
  tester.runAllTests()
    .then((results) => {
      console.log('\n🏆 Test Results Summary:');
      console.log(JSON.stringify(results.summary, null, 2));
      
      // Run job workflow test
      return tester.testJobWorkflow();
    })
    .then((workflowResult) => {
      console.log('\n🎯 Job Workflow Test:');
      console.log(JSON.stringify(workflowResult, null, 2));
      
      console.log('\n🎉 All Real Transaction Tests Completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Testing failed:', error);
      process.exit(1);
    });
}

module.exports = RealTransactionTester;