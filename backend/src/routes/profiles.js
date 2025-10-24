const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');
const concordiumService = require('../services/concordiumService');

// Get all profiles
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        businesses(*),
        workers(*)
      `);

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profiles',
      error: error.message
    });
  }
});

// Get profile by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        businesses(*),
        workers(*)
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Create new profile
router.post('/', async (req, res) => {
  try {
    const { role, display_name, concordium_account, concordium_did } = req.body;

    // Verify Concordium identity if provided
    if (concordium_account) {
      const verification = await concordiumService.verifyIdentity(concordium_account);
      if (!verification.verified) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Concordium account or identity verification failed',
          details: verification.error
        });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        role,
        display_name,
        concordium_account,
        concordium_did: concordium_did || false
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create profile',
      error: error.message
    });
  }
});

// Get profile balance from Concordium
router.get('/:id/balance', async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('concordium_account')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    if (!profile || !profile.concordium_account) {
      return res.status(404).json({
        success: false,
        message: 'Profile or Concordium account not found'
      });
    }

    const balance = await concordiumService.getBalance(profile.concordium_account);
    
    res.json({
      success: true,
      data: {
        balance,
        concordium_account: profile.concordium_account
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch balance',
      error: error.message
    });
  }
});

// Verify Concordium identity
router.post('/profiles/:id/verify-identity', async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('concordium_account')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    if (!profile || !profile.concordium_account) {
      return res.status(404).json({
        success: false,
        message: 'Profile or Concordium account not found'
      });
    }

    const verification = await concordiumService.verifyIdentity(profile.concordium_account);
    
    if (verification.verified) {
      // Update profile with verification status
      await supabase
        .from('profiles')
        .update({ concordium_did: true })
        .eq('id', req.params.id);
    }

    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify identity',
      error: error.message
    });
  }
});

module.exports = router;
