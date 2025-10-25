const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');
const concordiumService = require('../services/concordiumService');

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const { status, business_id, worker_id } = req.query;
    let query = supabaseAdmin
      .from('jobs')
      .select(`
        *,
        businesses!jobs_business_id_fkey(company_name),
        workers!jobs_worker_id_fkey(*),
        escrows(*)
      `);

    if (status) query = query.eq('status', status);
    if (business_id) query = query.eq('business_id', business_id);
    if (worker_id) query = query.eq('worker_id', worker_id);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select(`
        *,
        businesses!jobs_business_id_fkey(company_name),
        workers!jobs_worker_id_fkey(*),
        escrows(*),
        location_checks(*)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: error.message
    });
  }
});

// Create new job
router.post('/', async (req, res) => {
  try {
    const { business_id, title, description, amount_plt, location, radius_m } = req.body;

    // Verify business exists
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('id', business_id)
      .single();

    if (businessError || !business) {
      return res.status(400).json({
        success: false,
        message: 'Invalid business ID'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert({
        business_id,
        title,
        description,
        amount_plt,
        location,
        radius_m,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Create escrow record
    await supabaseAdmin
      .from('escrows')
      .insert({
        job_id: data.id,
        status: 'none',
        simulated: true,
        updated_at: new Date().toISOString()
      });

    res.status(201).json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: error.message
    });
  }
});

// Assign job to worker
router.patch('/:id/assign', async (req, res) => {
  try {
    const { worker_id } = req.body;

    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select(`
        *,
        businesses!jobs_business_id_fkey(*),
        workers!jobs_worker_id_fkey(*)
      `)
      .eq('id', req.params.id)
      .single();

    if (jobError || !job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Job is not available for assignment'
      });
    }

    // Verify worker exists
    const { data: worker, error: workerError } = await supabaseAdmin
      .from('workers')
      .select('id, concordium_account')
      .eq('id', worker_id)
      .single();

    if (workerError || !worker) {
      return res.status(400).json({
        success: false,
        message: 'Invalid worker ID'
      });
    }

    // Create real PLT escrow transaction
    let escrowResult = null;
    if (job.businesses && job.businesses.concordium_account && worker.concordium_account) {
      try {
        escrowResult = await concordiumService.createEscrowPayment(
          job.businesses.concordium_account, // Business account
          job.amount_plt, // Amount in PLT
          job.id, // Job ID
          worker.concordium_account, // Worker account
          { // Location
            latitude: job.location.latitude,
            longitude: job.location.longitude,
            radius: job.radius_m
          }
        );

        // Update escrow record with real transaction
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

      } catch (escrowError) {
        console.error('Escrow creation failed:', escrowError);
        // Continue with assignment even if escrow fails
      }
    }

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .update({
        worker_id,
        status: 'assigned',
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: {
        job: data,
        escrow: escrowResult,
        realTransaction: escrowResult ? escrowResult.realTransaction : false,
        hybridMode: escrowResult ? escrowResult.hybridMode : false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to assign job',
      error: error.message
    });
  }
});

// Complete job with location verification
router.patch('/:id/complete', async (req, res) => {
  try {
    const { position } = req.body;

    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select(`
        *,
        businesses!jobs_business_id_fkey(*),
        workers!jobs_worker_id_fkey(*)
      `)
      .eq('id', req.params.id)
      .single();

    if (jobError || !job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (!job.worker_id) {
      return res.status(400).json({
        success: false,
        message: 'Job is not assigned to a worker'
      });
    }

    if (job.status !== 'assigned' && job.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Job cannot be completed in current status'
      });
    }

    // Verify location using Concordium service
    const locationProof = await concordiumService.verifyLocation(
      position.latitude,
      position.longitude,
      job.location.latitude,
      job.location.longitude,
      job.radius_m
    );

    const isWithinRadius = locationProof.verified;
    const distance = locationProof.distance;

    // Create location verification record
    const { data: locationCheck, error: locationError } = await supabaseAdmin
      .from('location_checks')
      .insert({
        job_id: job.id,
        worker_id: job.worker_id,
        position,
        distance_m: distance,
        within_geofence: isWithinRadius,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (locationError) throw locationError;

    // Update job status
    const newStatus = isWithinRadius ? 'completed' : 'cancelled';
    const { data: updatedJob, error: updateError } = await supabaseAdmin
      .from('jobs')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', job.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // If within radius, process payment
    if (isWithinRadius && job.workers && job.workers.concordium_account) {
      try {
        const paymentResult = await concordiumService.releasePayment(
          job.workers.concordium_account,
          job.amount_plt,
          job.id,
          position // Worker location for verification
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

        // Add payment result to response
        res.json({
          success: true,
          data: {
            job: updatedJob,
            locationCheck,
            isWithinRadius,
            distance,
            payment: paymentResult,
            realTransaction: paymentResult.realTransaction || false,
            hybridMode: paymentResult.hybridMode || false
          }
        });
        return;

      } catch (paymentError) {
        console.error('Payment release failed:', paymentError);
        // Job is still completed, but payment failed
      }
    }

    res.json({
      success: true,
      data: {
        job: updatedJob,
        locationCheck,
        isWithinRadius,
        distance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to complete job',
      error: error.message
    });
  }
});

// Get jobs near location (for workers)
router.get('/jobs/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000, limit = 20 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // For now, we'll get all open jobs and filter by distance in the application
    // In a real implementation, you'd use PostGIS for spatial queries
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select(`
        *,
        businesses!jobs_business_id_fkey(company_name)
      `)
      .eq('status', 'open')
      .limit(parseInt(limit))
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter by distance (simplified - in production use PostGIS)
    const nearbyJobs = data.filter(job => {
      if (!job.location) return false;
      
      const distance = concordiumService.calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        job.location.latitude,
        job.location.longitude
      );
      
      return distance <= parseFloat(radius);
    });

    res.json({
      success: true,
      data: nearbyJobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby jobs',
      error: error.message
    });
  }
});

module.exports = router;
