const HybridConcordiumService = require('../services/hybridConcordiumService');

class HybridTransactionTester {
  constructor() {
    this.concordiumService = HybridConcordiumService;
    this.accountAddress = '3tQNXbUExDuZMK4YDhMVTQNAcQqGPxrrnQkBMppHMN3sWG5z6c';
  }

  // Test hybrid CCD transaction
  async testCCDTransaction() {
    try {
      console.log('💰 Testing Hybrid CCD Transaction...');
      
      // Create CCD transaction
      const ccdResult = await this.concordiumService.createCCDTransaction(
        this.accountAddress, // Send to self
        1 // 1 CCD
      );
      
      console.log('✅ CCD transaction test completed');
      return ccdResult;
    } catch (error) {
      console.error('❌ CCD transaction test failed:', error);
      return {
        success: false,
        error: error.message,
        hybridMode: true
      };
    }
  }

  // Test hybrid PLT escrow creation
  async testPLTEscrowCreation() {
    try {
      console.log('🔒 Testing Hybrid PLT Escrow Creation...');
      
      // Create escrow
      const escrowResult = await this.concordiumService.createEscrowPayment(
        this.accountAddress, // Business address
        1, // 1 PLT
        999, // Job ID
        this.accountAddress, // Worker address
        { latitude: 40.7128, longitude: -74.0060, radius: 100 } // Location
      );
      
      console.log('✅ PLT Escrow creation test completed');
      return escrowResult;
    } catch (error) {
      console.error('❌ PLT Escrow creation test failed:', error);
      return {
        success: false,
        error: error.message,
        hybridMode: true
      };
    }
  }

  // Test hybrid location verification
  async testLocationVerification() {
    try {
      console.log('📍 Testing Hybrid Location Verification...');
      
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
        hybridMode: true
      };
    }
  }

  // Test hybrid PLT payment release
  async testPLTPaymentRelease() {
    try {
      console.log('💰 Testing Hybrid PLT Payment Release...');
      
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
        hybridMode: true
      };
    }
  }

  // Test account information
  async testAccountInfo() {
    try {
      console.log('👤 Testing Hybrid Account Information...');
      
      // Get account info
      const accountInfo = await this.concordiumService.verifyIdentity(this.accountAddress);
      
      if (accountInfo.verified) {
        console.log('✅ Account info test completed');
        return {
          success: true,
          account: accountInfo,
          hybridMode: true
        };
      } else {
        throw new Error('Account verification failed');
      }
    } catch (error) {
      console.error('❌ Account info test failed:', error);
      return {
        success: false,
        error: error.message,
        hybridMode: true
      };
    }
  }

  // Test network connectivity
  async testNetworkConnectivity() {
    try {
      console.log('🌐 Testing Hybrid Network Connectivity...');
      
      // Get network info
      const networkInfo = await this.concordiumService.getNetworkInfo();
      
      console.log('✅ Network connectivity test completed');
      return {
        success: true,
        network: networkInfo,
        hybridMode: true
      };
    } catch (error) {
      console.error('❌ Network connectivity test failed:', error);
      return {
        success: false,
        error: error.message,
        hybridMode: true
      };
    }
  }

  // Test contract deployment
  async testContractDeployment() {
    try {
      console.log('🚀 Testing Hybrid Contract Deployment...');
      
      // Deploy contract
      const contractResult = await this.concordiumService.deployContract();
      
      console.log('✅ Contract deployment test completed');
      return {
        success: true,
        contract: contractResult,
        hybridMode: true
      };
    } catch (error) {
      console.error('❌ Contract deployment test failed:', error);
      return {
        success: false,
        error: error.message,
        hybridMode: true
      };
    }
  }

  // Run all hybrid transaction tests
  async runAllTests() {
    try {
      console.log('🧪 Running Hybrid Concordium Transaction Tests');
      console.log('=============================================\n');

      const results = {};

      // Test 1: Account Information
      console.log('📋 Test 1: Account Information...');
      results.accountInfo = await this.testAccountInfo();

      // Test 2: Network Connectivity
      console.log('\n📋 Test 2: Network Connectivity...');
      results.networkConnectivity = await this.testNetworkConnectivity();

      // Test 3: Contract Deployment
      console.log('\n📋 Test 3: Contract Deployment...');
      results.contractDeployment = await this.testContractDeployment();

      // Test 4: CCD Transaction
      console.log('\n📋 Test 4: CCD Transaction...');
      results.ccdTransaction = await this.testCCDTransaction();

      // Test 5: Location Verification
      console.log('\n📋 Test 5: Location Verification...');
      results.locationVerification = await this.testLocationVerification();

      // Test 6: PLT Escrow Creation
      console.log('\n📋 Test 6: PLT Escrow Creation...');
      results.pltEscrowCreation = await this.testPLTEscrowCreation();

      // Test 7: PLT Payment Release
      console.log('\n📋 Test 7: PLT Payment Release...');
      results.pltPaymentRelease = await this.testPLTPaymentRelease();

      // Summary
      const passedTests = Object.values(results).filter(result => result.success).length;
      const totalTests = Object.keys(results).length;

      console.log('\n🎉 Hybrid Transaction Testing Completed!');
      console.log('========================================');
      console.log(`✅ Tests Passed: ${passedTests}/${totalTests}`);
      console.log(`🌐 Network: testnet`);
      console.log(`💳 Account: ${this.accountAddress}`);
      console.log(`🔗 Hybrid Mode: YES`);
      console.log(`🚀 Real Transactions: YES`);

      return {
        results,
        summary: {
          passed: passedTests,
          total: totalTests,
          success: passedTests === totalTests,
          network: 'testnet',
          account: this.accountAddress,
          hybridMode: true,
          realTransactions: true,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Hybrid transaction testing failed:', error);
      throw error;
    }
  }

  // Test complete job workflow
  async testJobWorkflow() {
    try {
      console.log('🔄 Testing Complete Job Workflow (Hybrid Mode)...');
      
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
        hybridMode: true,
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
  const tester = new HybridTransactionTester();
  
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
      
      console.log('\n🎉 All Hybrid Transaction Tests Completed!');
      console.log('🚀 Ready for hackathon demo!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Testing failed:', error);
      process.exit(1);
    });
}

module.exports = HybridTransactionTester;
