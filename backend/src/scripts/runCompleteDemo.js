const HybridConcordiumService = require('../services/hybridConcordiumService');
const { supabaseAdmin } = require('../config/supabase');

class ProofOfWorkDemo {
  constructor() {
    this.concordiumService = HybridConcordiumService;
    this.accountAddress = '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c';
  }

  // Create demo business
  async createDemoBusiness() {
    try {
      console.log('🏢 Creating demo business...');
      
      const businessData = {
        company_name: 'CleanPro Services',
        concordium_account: this.accountAddress,
        concordium_did: true,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabaseAdmin
        .from('businesses')
        .insert(businessData)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Demo business created:', data.company_name);
      return data;
    } catch (error) {
      console.error('❌ Failed to create business:', error);
      throw error;
    }
  }

  // Create demo worker
  async createDemoWorker() {
    try {
      console.log('👷 Creating demo worker...');
      
      const workerData = {
        display_name: 'John Cleaner',
        concordium_account: this.accountAddress,
        concordium_did: true,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabaseAdmin
        .from('workers')
        .insert(workerData)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Demo worker created:', data.display_name);
      return data;
    } catch (error) {
      console.error('❌ Failed to create worker:', error);
      throw error;
    }
  }

  // Create demo job
  async createDemoJob(businessId) {
    try {
      console.log('📋 Creating demo job...');
      
      const jobData = {
        business_id: businessId,
        title: 'Office Deep Clean',
        description: 'Complete deep cleaning of office space including floors, windows, and bathrooms',
        amount_plt: 2.5, // 2.5 PLT tokens
        location: {
          latitude: 40.7589,
          longitude: -73.9851
        },
        radius_m: 150, // 150 meter radius
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseAdmin
        .from('jobs')
        .insert(jobData)
        .select()
        .single();

      if (error) throw error;

      // Create escrow record
      await supabaseAdmin
        .from('escrows')
        .insert({
          job_id: data.id,
          status: 'none',
          simulated: false,
          real_transaction: false,
          hybrid_mode: false,
          updated_at: new Date().toISOString()
        });

      console.log('✅ Demo job created:', data.title);
      return data;
    } catch (error) {
      console.error('❌ Failed to create job:', error);
      throw error;
    }
  }

  // Assign job to worker with real escrow
  async assignJobWithEscrow(jobId, workerId, businessId) {
    try {
      console.log('🔒 Assigning job with real PLT escrow...');
      
      // Get job details
      const { data: job, error: jobError } = await supabaseAdmin
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;

      // Create real PLT escrow transaction
      const escrowResult = await this.concordiumService.createEscrowPayment(
        this.accountAddress, // Business account
        job.amount_plt, // Amount in PLT
        job.id, // Job ID
        this.accountAddress, // Worker account
        { // Location
          latitude: job.location.latitude,
          longitude: job.location.longitude,
          radius: job.radius_m
        }
      );

      // Update escrow record
      await supabaseAdmin
        .from('escrows')
        .update({
          status: 'created',
          tx_hash: escrowResult.hash,
          simulated: escrowResult.simulated || false,
          real_transaction: escrowResult.realTransaction || false,
          hybrid_mode: escrowResult.hybridMode || false,
          updated_at: new Date().toISOString()
        })
        .eq('job_id', job.id);

      // Assign job to worker
      await supabaseAdmin
        .from('jobs')
        .update({
          worker_id: workerId,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      console.log('✅ Job assigned with real escrow!');
      console.log(`🔒 Escrow Hash: ${escrowResult.hash}`);
      console.log(`💰 Amount: ${job.amount_plt} PLT`);
      console.log(`📍 Location: ${job.location.latitude}, ${job.location.longitude}`);
      
      return {
        job,
        escrow: escrowResult,
        realTransaction: escrowResult.realTransaction,
        hybridMode: escrowResult.hybridMode
      };
    } catch (error) {
      console.error('❌ Failed to assign job with escrow:', error);
      throw error;
    }
  }

  // Complete job with location verification and payment release
  async completeJobWithPayment(jobId, workerLocation) {
    try {
      console.log('📍 Completing job with location verification...');
      
      // Get job details
      const { data: job, error: jobError } = await supabaseAdmin
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;

      // Verify location
      const locationProof = await this.concordiumService.verifyLocation(
        workerLocation.latitude,
        workerLocation.longitude,
        job.location.latitude,
        job.location.longitude,
        job.radius_m
      );

      console.log(`📍 Location verification: ${locationProof.verified ? 'PASSED' : 'FAILED'}`);
      console.log(`📏 Distance: ${locationProof.distance.toFixed(2)} meters`);
      console.log(`🎯 Required: within ${job.radius_m} meters`);

      // Create location check record
      await supabaseAdmin
        .from('location_checks')
        .insert({
          job_id: job.id,
          worker_id: job.worker_id,
          position: workerLocation,
          distance_m: locationProof.distance,
          within_geofence: locationProof.verified,
          created_at: new Date().toISOString()
        });

      // Update job status
      const newStatus = locationProof.verified ? 'completed' : 'cancelled';
      await supabaseAdmin
        .from('jobs')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);

      // If location verified, release payment
      let paymentResult = null;
      if (locationProof.verified) {
        console.log('💰 Releasing PLT payment...');
        
        paymentResult = await this.concordiumService.releasePayment(
          this.accountAddress, // Worker account
          job.amount_plt, // Amount in PLT
          job.id, // Job ID
          workerLocation // Worker location
        );

        // Update escrow status
        await supabaseAdmin
          .from('escrows')
          .update({
            status: 'released',
            tx_hash: paymentResult.hash,
            simulated: paymentResult.simulated || false,
            real_transaction: paymentResult.realTransaction || false,
            hybrid_mode: paymentResult.hybridMode || false,
            updated_at: new Date().toISOString()
          })
          .eq('job_id', job.id);

        // Update job status to paid
        await supabaseAdmin
          .from('jobs')
          .update({
            status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);

        console.log('✅ Payment released successfully!');
        console.log(`💰 Payment Hash: ${paymentResult.hash}`);
        console.log(`🪙 Amount: ${job.amount_plt} PLT`);
      }

      return {
        job,
        locationProof,
        payment: paymentResult,
        completed: locationProof.verified,
        realTransaction: paymentResult ? paymentResult.realTransaction : false,
        hybridMode: paymentResult ? paymentResult.hybridMode : false
      };
    } catch (error) {
      console.error('❌ Failed to complete job:', error);
      throw error;
    }
  }

  // Run complete demo workflow
  async runCompleteDemo() {
    try {
      console.log('🚀 Starting ProofOfWork Complete Demo');
      console.log('=====================================\n');

      // Step 1: Create demo entities
      console.log('📋 Step 1: Creating demo entities...');
      const business = await this.createDemoBusiness();
      const worker = await this.createDemoWorker();
      const job = await this.createDemoJob(business.id);

      // Step 2: Assign job with real escrow
      console.log('\n📋 Step 2: Assigning job with real PLT escrow...');
      const assignmentResult = await this.assignJobWithEscrow(job.id, worker.id, business.id);

      // Step 3: Complete job with location verification
      console.log('\n📋 Step 3: Completing job with location verification...');
      const workerLocation = {
        latitude: 40.7589, // Same as job location (within radius)
        longitude: -73.9851
      };
      const completionResult = await this.completeJobWithPayment(job.id, workerLocation);

      // Summary
      console.log('\n🎉 Demo Completed Successfully!');
      console.log('===============================');
      console.log(`🏢 Business: ${business.company_name}`);
      console.log(`👷 Worker: ${worker.display_name}`);
      console.log(`📋 Job: ${job.title}`);
      console.log(`💰 Amount: ${job.amount_plt} PLT`);
      console.log(`🔒 Escrow Hash: ${assignmentResult.escrow.hash}`);
      console.log(`📍 Location Verified: ${completionResult.completed ? 'YES' : 'NO'}`);
      console.log(`💰 Payment Released: ${completionResult.payment ? 'YES' : 'NO'}`);
      if (completionResult.payment) {
        console.log(`💳 Payment Hash: ${completionResult.payment.hash}`);
      }
      console.log(`🚀 Real Transactions: ${completionResult.realTransaction ? 'YES' : 'NO'}`);
      console.log(`🔗 Hybrid Mode: ${completionResult.hybridMode ? 'YES' : 'NO'}`);
      console.log(`🌐 Network: testnet`);

      return {
        business,
        worker,
        job,
        assignment: assignmentResult,
        completion: completionResult,
        demo: {
          completed: true,
          realTransactions: completionResult.realTransaction,
          hybridMode: completionResult.hybridMode,
          network: 'testnet',
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Demo failed:', error);
      throw error;
    }
  }

  // Test with different location (outside radius)
  async testLocationFailure() {
    try {
      console.log('\n🧪 Testing Location Verification Failure...');
      
      // Create a new job
      const business = await this.createDemoBusiness();
      const worker = await this.createDemoWorker();
      const job = await this.createDemoJob(business.id);

      // Assign job
      await this.assignJobWithEscrow(job.id, worker.id, business.id);

      // Try to complete from wrong location (outside radius)
      const wrongLocation = {
        latitude: 40.8000, // Far from job location
        longitude: -73.9000
      };

      const result = await this.completeJobWithPayment(job.id, wrongLocation);
      
      console.log('📍 Location verification result:', result.completed ? 'PASSED' : 'FAILED');
      console.log('💰 Payment released:', result.payment ? 'YES' : 'NO');
      
      return result;
    } catch (error) {
      console.error('❌ Location failure test failed:', error);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const demo = new ProofOfWorkDemo();
  
  // Run complete demo
  demo.runCompleteDemo()
    .then((result) => {
      console.log('\n🏆 Demo Results Summary:');
      console.log(JSON.stringify(result.demo, null, 2));
      
      // Test location failure
      return demo.testLocationFailure();
    })
    .then((failureResult) => {
      console.log('\n🎯 Location Failure Test:');
      console.log(`✅ Location verification: ${failureResult.completed ? 'PASSED' : 'FAILED'}`);
      console.log(`💰 Payment released: ${failureResult.payment ? 'YES' : 'NO'}`);
      
      console.log('\n🎉 All Demo Tests Completed!');
      console.log('🚀 ProofOfWork is ready for hackathon presentation!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Demo failed:', error);
      process.exit(1);
    });
}

module.exports = ProofOfWorkDemo;
