const { ConcordiumGRPCClient, ConcordiumHdWallet } = require('@concordium/web-sdk');
const axios = require('axios');

class ConcordiumService {
  constructor() {
    this.nodeUrl = process.env.CONCORDIUM_NODE_URL || 'https://testnet.concordium.com';
    this.isTestnet = this.nodeUrl.includes('testnet');
    this.client = null;
    this.initializeClient();
  }

  async initializeClient() {
    try {
      this.client = new ConcordiumGRPCClient(this.nodeUrl, 10000);
      console.log('✅ Connected to Concordium node:', this.nodeUrl);
    } catch (error) {
      console.error('❌ Failed to connect to Concordium node:', error.message);
    }
  }

  // Verify Concordium Identity
  async verifyIdentity(concordiumAccount) {
    try {
      if (!this.client) {
        throw new Error('Concordium client not initialized');
      }

      // Get account info from Concordium blockchain
      const accountInfo = await this.client.getAccountInfo(concordiumAccount);
      
      if (accountInfo && accountInfo.accountNonce !== undefined) {
        return {
          verified: true,
          accountInfo: {
            address: concordiumAccount,
            nonce: accountInfo.accountNonce,
            amount: accountInfo.accountAmount,
            hasIdentity: accountInfo.accountCredentials.length > 0
          }
        };
      }
      
      return { verified: false, error: 'Account not found' };
    } catch (error) {
      console.error('Concordium identity verification failed:', error.message);
      return { verified: false, error: error.message };
    }
  }

  // Get account balance
  async getBalance(concordiumAccount) {
    try {
      if (!this.client) {
        throw new Error('Concordium client not initialized');
      }

      const accountInfo = await this.client.getAccountInfo(concordiumAccount);
      return accountInfo ? accountInfo.accountAmount : 0;
    } catch (error) {
      console.error('Failed to get balance:', error.message);
      return 0;
    }
  }

  // Create escrow payment
  async createEscrowPayment(fromAccount, amount, jobId) {
    try {
      if (!this.client) {
        throw new Error('Concordium client not initialized');
      }

      // In a real implementation, this would interact with a smart contract
      // For now, we'll simulate the transaction
      const transactionData = {
        from: fromAccount,
        to: process.env.ESCROW_CONTRACT_ADDRESS || 'escrow_contract',
        amount: amount,
        jobId: jobId,
        timestamp: new Date().toISOString(),
        type: 'escrow_create'
      };

      // Simulate transaction creation
      const transactionHash = `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Escrow payment created:', transactionHash);
      
      return {
        hash: transactionHash,
        status: 'confirmed',
        data: transactionData,
        simulated: true
      };
    } catch (error) {
      console.error('Escrow payment failed:', error);
      throw new Error('Failed to create escrow payment');
    }
  }

  // Release payment from escrow
  async releasePayment(toAccount, amount, jobId) {
    try {
      if (!this.client) {
        throw new Error('Concordium client not initialized');
      }

      const transactionData = {
        from: process.env.ESCROW_CONTRACT_ADDRESS || 'escrow_contract',
        to: toAccount,
        amount: amount,
        jobId: jobId,
        timestamp: new Date().toISOString(),
        type: 'escrow_release'
      };

      // Simulate payment release
      const transactionHash = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Payment released:', transactionHash);
      
      return {
        hash: transactionHash,
        status: 'confirmed',
        data: transactionData,
        simulated: true
      };
    } catch (error) {
      console.error('Payment release failed:', error);
      throw new Error('Failed to release payment');
    }
  }

  // Verify location and create proof
  async verifyLocation(latitude, longitude, targetLatitude, targetLongitude, radius) {
    try {
      const distance = this.calculateDistance(latitude, longitude, targetLatitude, targetLongitude);
      const isWithinRadius = distance <= radius;

      const proofData = {
        latitude,
        longitude,
        targetLatitude,
        targetLongitude,
        radius,
        distance,
        isWithinRadius,
        timestamp: new Date().toISOString(),
        accuracy: 5 // Simulated GPS accuracy
      };

      // Create blockchain proof (simulated)
      const proofHash = `location_proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Location verification proof created:', proofHash);
      
      return {
        hash: proofHash,
        verified: isWithinRadius,
        distance: distance,
        proof: proofData,
        simulated: true
      };
    } catch (error) {
      console.error('Location verification failed:', error);
      throw new Error('Failed to verify location');
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  }

  // Wait for transaction confirmation
  async waitForConfirmation(transactionHash) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    return true;
  }

  // Get transaction status
  async getTransactionStatus(transactionHash) {
    try {
      // In a real implementation, this would query the blockchain
      return {
        hash: transactionHash,
        status: 'confirmed',
        confirmations: 1,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return {
        hash: transactionHash,
        status: 'unknown',
        confirmations: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get network info
  async getNetworkInfo() {
    try {
      if (!this.client) {
        throw new Error('Concordium client not initialized');
      }

      const consensusInfo = await this.client.getConsensusInfo();
      return {
        network: this.isTestnet ? 'testnet' : 'mainnet',
        nodeUrl: this.nodeUrl,
        consensusInfo: consensusInfo
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      return {
        network: this.isTestnet ? 'testnet' : 'mainnet',
        nodeUrl: this.nodeUrl,
        error: error.message
      };
    }
  }
}

module.exports = new ConcordiumService();
