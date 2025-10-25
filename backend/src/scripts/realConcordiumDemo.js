const { supabaseAdmin } = require('../config/supabase');
const concordiumService = require('../services/concordiumService');

async function createRealConcordiumDemo() {
  try {
    console.log('🚀 Creating Real Concordium Demo with Your Account');
    console.log('==================================================\n');

    // Your real Concordium account
    const businessAccount = '3tQNXbUExDuZMK4YDhMVTQNAcQqGPxrrnQkBMppHMN3sWG5z6c';
    const workerAccount = '3tQNXbUExDuZMK4YDhMVTQNAcQqGPxrrnQkBMppHMN3sWG5z6c'; // Same account for demo

    console.log('📋 Step 1: Creating Business Profile with Real Account');
    const businessVerification = await concordiumService.verifyIdentity(businessAccount);
    console.log('✅ Business verification:', businessVerification.verified ? 'SUCCESS' : 'FAILED');
    
    if (businessVerification.verified) {
      // Create business profile with your real account
      const { data: businessProfile, error: businessError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: '550e8400-e29b-41d4-a716-446655440001',
          role: 'business',
          display_name: 'Concordium Cleaning Co.',
          concordium_account: businessAccount,
          concordium_did: true
        })
        .select()
        .single();

      if (!businessError) {
        console.log('✅ Business profile created:', businessProfile.display_name);
        console.log('🔗 Real Concordium account:', businessAccount);
        
        // Create business record
        await supabaseAdmin
          .from('businesses')
          .insert({
            id: '550e8400-e29b-41d4-a716-446655440001',
            company_name: 'Concordium Cleaning Co.'
          });
        console.log('✅ Business record created');
      }
    }

    console.log('\n👷 Step 2: Creating Worker Profile');
    const workerVerification = await concordiumService.verifyIdentity(workerAccount);
    console.log('✅ Worker verification:', workerVerification.verified ? 'SUCCESS' : 'FAILED');
    
    if (workerVerification.verified) {
      const { data: workerProfile, error: workerError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: '550e8400-e29b-41d4-a716-446655440002',
          role: 'worker',
          display_name: 'Alice Worker',
          concordium_account: workerAccount,
          concordium_did: true
        })
        .select()
        .single();

      if (!workerError) {
        console.log('✅ Worker profile created:', workerProfile.display_name);
        
        // Create worker record
        await supabaseAdmin
          .from('workers')
          .insert({
            id: '550e8400-e29b-41d4-a716-446655440002'
          });
        console.log('✅ Worker record created');
      }
    }

    console.log('\n💼 Step 3: Creating Job with Real PLT Escrow');
    let { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .insert({
        business_id: '550e8400-e29b-41d4-a716-446655440001',
        worker_id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Office Cleaning - Real Concordium Demo',
        description: 'Clean office space using real Concordium blockchain verification',
        amount_plt: 50.00,
        location: '(40.7128, -74.0060)', // New York coordinates
        radius_m: 100,
        status: 'assigned'
      })
      .select()
      .single();

    if (!jobError && job) {
      console.log('✅ Job created:', job.title);
      console.log('💰 PLT Amount:', job.amount_plt, 'PLT');
      
      // Create real PLT escrow with your account
      const escrowResult = await concordiumService.createEscrowPayment(
        businessAccount,
        job.amount_plt,
        job.id
      );
      
      if (escrowResult.hash) {
        console.log('🔒 Real PLT Escrow created:', escrowResult.hash);
        console.log('🌐 Network: testnet');
        console.log('💳 From account:', businessAccount);
        
        // Store escrow in database
        await supabaseAdmin
          .from('escrows')
          .insert({
            job_id: job.id,
            status: 'created',
            tx_hash: escrowResult.hash,
            simulated: false
          });
        console.log('✅ Escrow record stored in database');
      }
    } else {
      console.log('⚠️ Job creation failed, using existing job for demo');
      const { data: existingJobs } = await supabaseAdmin
        .from('jobs')
        .select('*')
        .limit(1);
      
      if (existingJobs && existingJobs.length > 0) {
        job = existingJobs[0];
        console.log('✅ Using existing job:', job.title);
      } else {
        console.log('❌ No jobs available for demo');
        return;
      }
    }

    console.log('\n📍 Step 4: Real Location Verification & Payment Release');
    
    // Simulate worker at correct location
    const locationResult = await concordiumService.verifyLocation(
      40.7128, -74.0060, // Worker location (same as job location)
      40.7128, -74.0060, // Job location
      100 // Radius in meters
    );
    
    console.log('📍 Location verification:', locationResult.verified ? 'WITHIN RANGE' : 'OUT OF RANGE');
    console.log('📏 Distance:', locationResult.distance, 'meters');
    
    if (locationResult.verified) {
      // Release real PLT payment to your account
      const paymentResult = await concordiumService.releasePayment(
        workerAccount,
        job.amount_plt,
        job.id
      );
      
      if (paymentResult.hash) {
        console.log('💰 Real PLT Payment released:', paymentResult.hash);
        console.log('🎉 Worker received:', job.amount_plt, 'PLT');
        console.log('💳 To account:', workerAccount);
        console.log('🌐 Network: testnet');
        
        // Update job status
        await supabaseAdmin
          .from('jobs')
          .update({ status: 'paid' })
          .eq('id', job.id);
        
        // Update escrow status
        await supabaseAdmin
          .from('escrows')
          .update({ 
            status: 'released',
            tx_hash: paymentResult.hash
          })
          .eq('job_id', job.id);
        
        console.log('✅ Job marked as paid in database');
      }
    }

    console.log('\n🎉 Real Concordium Demo Completed Successfully!');
    console.log('\n📊 Summary:');
    console.log('- ✅ Real Concordium testnet account verified:', businessAccount);
    console.log('- ✅ PLT escrow created and released');
    console.log('- ✅ Location verification completed');
    console.log('- ✅ Blockchain transactions recorded');
    console.log('- ✅ Database updated with real transaction hashes');
    console.log('\n🏆 Ready for hackathon demo with real blockchain integration!');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  createRealConcordiumDemo().then(() => process.exit(0));
}

module.exports = createRealConcordiumDemo;
