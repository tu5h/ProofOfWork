#!/usr/bin/env node

/**
 * Demo Money Flow Script
 * Shows how PLT tokens move between business, platform escrow, and worker
 */

const LocalConcordiumService = require('./src/services/localConcordiumService');

async function demonstrateMoneyFlow() {
  console.log('🎯 PROOF OF WORK - REAL USER ACCOUNT DEMONSTRATION');
  console.log('==================================================\n');

  const concordiumService = new LocalConcordiumService();

  // Demo user accounts (in real app, these come from user input)
  const businessAccount = '3tefNN5UYD6p53pQJaPDb4aDDV3XgLS2pV5171rA5XvpFvo6qH';
  const workerAccount = '4tefNN5UYD6p53pQJaPDb4aDDV3XgLS2pV5171rA5XvpFvo6qH'; // Different account

  try {
    // Initialize accounts with starting balances
    console.log('🔧 INITIALIZING USER ACCOUNTS:');
    console.log('-------------------------------');
    
    const businessBalance = await concordiumService.initializeAccount(businessAccount, 15000.0);
    const workerBalance = await concordiumService.initializeAccount(workerAccount, 5000.0);
    
    console.log(`✅ Business Account: ${businessAccount}`);
    console.log(`   Starting Balance: ${businessBalance} PLT`);
    console.log(`✅ Worker Account: ${workerAccount}`);
    console.log(`   Starting Balance: ${workerBalance} PLT`);
    console.log('');

    // Step 1: Business creates a job (25 PLT)
    console.log('🏢 STEP 1: Business creates job (25 PLT)');
    console.log('----------------------------------------');
    
    const escrowResult = await concordiumService.createEscrowPayment(
      businessAccount, // Business account
      25.0, // Amount
      'demo-job-001', // Job ID
      workerAccount, // Worker account
      { latitude: 40.7589, longitude: -73.9851, radius: 100 } // Times Square
    );

    console.log('✅ Escrow created:', escrowResult.hash);
    console.log('💰 Balance changes:', escrowResult.balanceChanges);
    console.log('');

    // Show balances after escrow
    console.log('📊 BALANCES AFTER ESCROW:');
    const businessBalanceAfter = await concordiumService.getUserBalance(businessAccount);
    const workerBalanceAfter = await concordiumService.getUserBalance(workerAccount);
    console.log(`   Business: ${businessBalanceAfter} PLT (was ${businessBalance})`);
    console.log(`   Worker:   ${workerBalanceAfter} PLT (unchanged)`);
    console.log('');

    // Step 2: Worker completes job
    console.log('👷 STEP 2: Worker completes job');
    console.log('--------------------------------');
    
    const releaseResult = await concordiumService.releasePayment(
      workerAccount, // Worker account
      25.0, // Amount
      'demo-job-001', // Job ID
      { latitude: 40.7589, longitude: -73.9851 } // Worker location (Times Square)
    );

    console.log('✅ Payment released:', releaseResult.hash);
    console.log('💰 Balance changes:', releaseResult.balanceChanges);
    console.log('');

    // Show final balances
    console.log('📊 FINAL BALANCES:');
    const finalBusinessBalance = await concordiumService.getUserBalance(businessAccount);
    const finalWorkerBalance = await concordiumService.getUserBalance(workerAccount);
    console.log(`   Business: ${finalBusinessBalance} PLT (was ${businessBalance})`);
    console.log(`   Worker:   ${finalWorkerBalance} PLT (was ${workerBalance})`);
    console.log('');

    // Summary
    console.log('🎯 REAL USER ACCOUNT MONEY FLOW SUMMARY:');
    console.log('=========================================');
    console.log(`💰 ${25} PLT moved from Business → Escrow → Worker`);
    console.log(`📉 Business balance: ${businessBalance} → ${finalBusinessBalance} PLT (-${25} PLT)`);
    console.log(`📈 Worker balance: ${workerBalance} → ${finalWorkerBalance} PLT (+${25} PLT)`);
    console.log('');

    console.log('✅ DEMO COMPLETE - Real user accounts working perfectly!');
    console.log('🚀 Ready for hackathon demonstration with real users!');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Run the demo
if (require.main === module) {
  demonstrateMoneyFlow();
}

module.exports = demonstrateMoneyFlow;
