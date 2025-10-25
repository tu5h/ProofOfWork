const concordiumService = require('../services/concordiumService');

async function testRealConcordiumAccount() {
  console.log('🔍 Testing Real Concordium Account Integration');
  console.log('==============================================\n');

  // Your real Concordium testnet account address
  const testAccountAddress = '3tQNXbUExDuZMK4YDhMVTQNAcQqGPxrrnQkBMppHMN3sWG5z6c';

  try {
    console.log('🔗 Testing account:', testAccountAddress);
    
    // Test account verification
    const verification = await concordiumService.verifyIdentity(testAccountAddress);
    
    if (verification.verified) {
      console.log('✅ Account verification: SUCCESS');
      console.log('📊 Account info:', verification.accountInfo);
      
      // Test PLT escrow creation
      console.log('\n🔒 Testing PLT Escrow Creation...');
      const escrowResult = await concordiumService.createEscrowPayment(
        testAccountAddress,
        25.50,
        'test-job-123'
      );
      
      if (escrowResult.hash) {
        console.log('✅ PLT Escrow created:', escrowResult.hash);
        console.log('💰 Amount: 25.50 PLT');
        console.log('🌐 Network: testnet');
      }
      
      // Test PLT payment release
      console.log('\n💰 Testing PLT Payment Release...');
      const paymentResult = await concordiumService.releasePayment(
        testAccountAddress,
        25.50,
        'test-job-123'
      );
      
      if (paymentResult.hash) {
        console.log('✅ PLT Payment released:', paymentResult.hash);
        console.log('🎉 Payment successful!');
      }
      
      console.log('\n🎉 Real Concordium Integration Test Complete!');
      console.log('✅ Your account is ready for the hackathon demo');
      
    } else {
      console.log('❌ Account verification failed:', verification.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  testRealConcordiumAccount().then(() => process.exit(0));
}

module.exports = testRealConcordiumAccount;
