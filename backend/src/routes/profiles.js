const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');
const concordiumService = require('../services/concordiumService');

// Get balance for a specific user account
router.get('/balance/:accountAddress', async (req, res) => {
  try {
    const { accountAddress } = req.params;
    
    if (!accountAddress) {
      return res.status(400).json({
        success: false,
        message: 'Account address is required'
      });
    }
    
    // Get balance from local Concordium service
    const balance = await concordiumService.localService.getUserBalance(accountAddress);
    
    res.json({
      success: true,
      data: {
        account: accountAddress,
        balance: balance,
        currency: 'PLT',
        network: 'Concordium Local Stack',
        realTime: true
      }
    });
  } catch (error) {
    console.error('Failed to get user balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user balance',
      error: error.message
    });
  }
});

// Initialize account with starting balance
router.post('/initialize-account', async (req, res) => {
  try {
    const { accountAddress, startingBalance = 10000.0 } = req.body;
    
    if (!accountAddress) {
      return res.status(400).json({
        success: false,
        message: 'Account address is required'
      });
    }
    
    // Initialize account with starting balance
    const balance = await concordiumService.localService.initializeAccount(accountAddress, startingBalance);
    
    res.json({
      success: true,
      message: 'Account initialized successfully',
      data: {
        account: accountAddress,
        balance: balance,
        currency: 'PLT',
        network: 'Concordium Local Stack'
      }
    });
  } catch (error) {
    console.error('Failed to initialize account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize account',
      error: error.message
    });
  }
});

// Get all user balances (for admin/debugging)
router.get('/all-balances', async (req, res) => {
  try {
    const balances = concordiumService.localService.getAllUserBalances();
    
    res.json({
      success: true,
      data: {
        balances: balances,
        network: 'Concordium Local Stack',
        totalAccounts: Object.keys(balances).length
      }
    });
  } catch (error) {
    console.error('Failed to get all balances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get all balances',
      error: error.message
    });
  }
});

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

    // Generate a UUID for the profile (simulating auth user ID)
    const { v4: uuidv4 } = require('uuid');
    const profileId = uuidv4();

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: profileId,
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

// Wallet connection endpoint
router.post('/wallet/connect', async (req, res) => {
  try {
    const { accountAddress } = req.body;
    
    if (!accountAddress) {
      return res.status(400).json({
        success: false,
        message: 'Account address is required'
      });
    }

    // Verify wallet connection
    const identityResult = await concordiumService.verifyIdentity(accountAddress);
    
    if (!identityResult.verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet connection',
        error: identityResult.error
      });
    }

    // Get current balance
    const balance = await concordiumService.getBalance(accountAddress);
    
    // Distribute POW tokens for testing (simulated)
    const testPOWAmount = 1000;
    const distributionResult = {
      transactionHash: `pow_distribution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: testPOWAmount,
      recipient: accountAddress,
      token: 'POW',
      network: 'local',
      note: 'POW tokens distributed for testing'
    };

    res.json({
      success: true,
      message: 'Wallet connected successfully',
      data: {
        account: {
          address: accountAddress,
          balance: balance,
          powTokens: testPOWAmount,
          network: 'local',
          verified: true
        },
        distribution: distributionResult,
        services: {
          node: 'http://localhost:20100',
          walletProxy: 'http://localhost:7013',
          explorer: 'http://localhost:7016',
          metadata: 'http://localhost:7020'
        }
      }
    });

  } catch (error) {
    console.error('Wallet connection failed:', error);
    res.status(500).json({
      success: false,
      message: 'Wallet connection failed',
      error: error.message
    });
  }
});

// Get POW token balance
router.get('/wallet/pow-balance/:accountAddress', async (req, res) => {
  try {
    const { accountAddress } = req.params;
    
    if (!accountAddress) {
      return res.status(400).json({
        success: false,
        message: 'Account address is required'
      });
    }
    
    const balance = await concordiumService.getBalance(accountAddress);
    
    res.json({
      success: true,
      data: {
        account: accountAddress,
        balance: balance,
        powTokens: 1000, // Simulated POW tokens for testing
        network: 'local',
        currency: 'POW',
        realTime: true
      }
    });

  } catch (error) {
    console.error('Failed to get POW balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get POW balance',
      error: error.message
    });
  }
});

// Distribute POW tokens for testing
router.post('/wallet/distribute-pow', async (req, res) => {
  try {
    const { accountAddress, amount = 1000 } = req.body;
    
    if (!accountAddress) {
      return res.status(400).json({
        success: false,
        message: 'Account address is required'
      });
    }

    // Verify account exists
    const identityResult = await concordiumService.verifyIdentity(accountAddress);
    if (!identityResult.verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account address'
      });
    }

    // Simulate POW token distribution
    const distributionResult = {
      transactionHash: `pow_distribution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount,
      recipient: accountAddress,
      token: 'POW',
      network: 'local',
      status: 'completed',
      note: 'POW tokens distributed for testing'
    };

    res.json({
      success: true,
      message: 'POW tokens distributed successfully',
      data: distributionResult
    });

  } catch (error) {
    console.error('POW distribution failed:', error);
    res.status(500).json({
      success: false,
      message: 'POW distribution failed',
      error: error.message
    });
  }
});

module.exports = router;
