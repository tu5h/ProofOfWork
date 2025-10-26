const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const concordiumService = require('../services/concordiumService');

// Apply optional auth to all routes (frontend handles main auth)
router.use(optionalAuth);

// Verify location endpoint with validation
const locationVerificationSchema = require('joi').object({
  latitude: require('joi').number().min(-90).max(90).required(),
  longitude: require('joi').number().min(-180).max(180).required(),
  targetLatitude: require('joi').number().min(-90).max(90).required(),
  targetLongitude: require('joi').number().min(-180).max(180).required(),
  radius: require('joi').number().positive().max(10000).required()
});

router.post('/verify-location', (req, res, next) => {
  const { error, value } = locationVerificationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Invalid parameters', 
      details: error.details[0].message 
    });
  }
  req.body = value;
  next();
}, async (req, res) => {
  try {
    console.log('=== VERIFY LOCATION REQUEST ===');
    console.log('Request body:', req.body);
    
    const { latitude, longitude, targetLatitude, targetLongitude, radius } = req.body;

    console.log('Calling concordiumService.verifyLocation with:', {
      latitude,
      longitude,
      targetLatitude,
      targetLongitude,
      radius
    });

    const result = await concordiumService.verifyLocation(
      latitude,
      longitude,
      targetLatitude,
      targetLongitude,
      radius
    );

    console.log('Verification result:', result);
    console.log('=== VERIFY LOCATION COMPLETE ===');

    res.json(result);
  } catch (error) {
    console.error('❌ Location verification error:', error);
    res.status(500).json({ 
      error: 'Location verification failed', 
      details: error.message 
    });
  }
});

// Release payment endpoint with validation
const releasePaymentSchema = require('joi').object({
  jobId: require('joi').string().required(),
  workerAddress: require('joi').string().min(40).max(60).required(),
  amount: require('joi').number().positive().required(),
  workerLocation: require('joi').object({
    lat: require('joi').number().min(-90).max(90).optional(),
    lng: require('joi').number().min(-180).max(180).optional()
  }).optional()
});

router.post('/release-payment', (req, res, next) => {
  const { error, value } = releasePaymentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Invalid parameters', 
      details: error.details[0].message 
    });
  }
  req.body = value;
  next();
  }, async (req, res) => {
    try {
      const { jobId, workerAddress, amount, workerLocation } = req.body;

      // Get sender (business) account from job
      const { supabaseAdmin } = require('../config/supabase');
      
      // Get job details to find business account
      const { data: job, error: jobError } = await supabaseAdmin
        .from('jobs')
        .select('business_id')
        .eq('id', jobId)
        .single();
      
      if (jobError || !job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      // Get business profile to find Concordium account
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('concordium_account')
        .eq('id', job.business_id)
        .single();

      if (profileError || !profile) {
        throw new Error(`Business profile not found for job: ${jobId}`);
      }

      const senderAccount = profile.concordium_account;
      if (!senderAccount) {
        return res.status(400).json({ 
          error: 'Business account does not have a Concordium address configured' 
        });
      }

      console.log(`💰 Releasing payment from business (${senderAccount}) to worker (${workerAddress})`);

      const result = await concordiumService.releasePayment(
        senderAccount,
        workerAddress,
        amount,
        jobId,
        workerLocation
      );

    res.json(result);
    
    // If this returns transaction data, notify user about manual submission
    if (result.transactionData && result.transactionData.command) {
      console.log('\n📋 MANUAL SUBMISSION REQUIRED:');
      console.log('Execute this CLI command to submit to blockchain:');
      console.log(result.transactionData.command);
      console.log('');
    }
  } catch (error) {
    console.error('Payment release error:', error);
    res.status(500).json({ 
      error: 'Payment release failed', 
      details: error.message 
    });
  }
});

// Create real blockchain transaction endpoint
router.post('/v1/transactions', async (req, res) => {
  try {
    console.log('=== CREATE REAL BLOCKCHAIN TRANSACTION ===');
    console.log('Request body:', req.body);
    
    const { fromAccount, toAccount, amount, jobId, location } = req.body;

    if (!fromAccount || !toAccount || !amount || !jobId || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Use the working blockchain service
    const result = await concordiumService.createRealTransaction(
      fromAccount,
      toAccount,
      amount,
      jobId,
      location
    );

    console.log('Transaction result:', result);
    console.log('=== TRANSACTION CREATION COMPLETE ===');

    res.json(result);
  } catch (error) {
    console.error('❌ Transaction creation error:', error);
    res.status(500).json({ 
      error: 'Transaction creation failed', 
      details: error.message 
    });
  }
});

module.exports = router;