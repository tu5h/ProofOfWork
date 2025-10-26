const express = require('express');
const router = express.Router();
const concordiumService = require('../services/concordiumService');

// Verify location endpoint
router.post('/verify-location', async (req, res) => {
  try {
    console.log('=== VERIFY LOCATION REQUEST ===');
    console.log('Request body:', req.body);
    
    const { latitude, longitude, targetLatitude, targetLongitude, radius } = req.body;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      typeof targetLatitude !== 'number' ||
      typeof targetLongitude !== 'number' ||
      typeof radius !== 'number'
    ) {
      console.log('❌ Invalid parameters:', { latitude, longitude, targetLatitude, targetLongitude, radius });
      return res.status(400).json({ error: 'Invalid parameters' });
    }

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

// Release payment endpoint
router.post('/release-payment', async (req, res) => {
  try {
    const { jobId, workerAddress, amount, workerLocation } = req.body;

    if (!jobId || !workerAddress || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await concordiumService.releasePayment(
      workerAddress,
      amount,
      jobId,
      workerLocation
    );

    res.json(result);
  } catch (error) {
    console.error('Payment release error:', error);
    res.status(500).json({ 
      error: 'Payment release failed', 
      details: error.message 
    });
  }
});

module.exports = router;