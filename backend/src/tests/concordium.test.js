const concordiumService = require('../services/concordiumService');
const hybridConcordiumService = require('../services/hybridConcordiumService');

describe('Concordium Service Tests', () => {
  const testAccount = '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c';

  describe('Identity Verification', () => {
    test('should verify valid Concordium account', async () => {
      const result = await concordiumService.verifyIdentity(testAccount);
      
      expect(result.verified).toBe(true);
      expect(result.accountInfo).toBeDefined();
      expect(result.accountInfo.address).toBe(testAccount);
      expect(result.accountInfo.network).toBe('testnet');
    });

    test('should reject invalid account format', async () => {
      const result = await concordiumService.verifyIdentity('invalid_account');
      
      expect(result.verified).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should reject empty account', async () => {
      const result = await concordiumService.verifyIdentity('');
      
      expect(result.verified).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should use caching for repeated requests', async () => {
      const startTime = Date.now();
      const result1 = await concordiumService.verifyIdentity(testAccount);
      const firstCallTime = Date.now() - startTime;

      const startTime2 = Date.now();
      const result2 = await concordiumService.verifyIdentity(testAccount);
      const secondCallTime = Date.now() - startTime2;

      expect(result1.verified).toBe(true);
      expect(result2.verified).toBe(true);
      expect(result1.accountInfo.address).toBe(result2.accountInfo.address);
      // Second call should be faster due to caching
      expect(secondCallTime).toBeLessThan(firstCallTime);
    });
  });

  describe('Balance Retrieval', () => {
    test('should get account balance', async () => {
      const balance = await concordiumService.getBalance(testAccount);
      
      expect(typeof balance).toBe('number');
      expect(balance).toBeGreaterThanOrEqual(0);
    });

    test('should handle invalid account gracefully', async () => {
      const balance = await concordiumService.getBalance('invalid_account');
      
      expect(typeof balance).toBe('number');
      expect(balance).toBe(0);
    });
  });

  describe('Escrow Creation', () => {
    test('should create escrow payment', async () => {
      const location = {
        latitude: 40.7589,
        longitude: -73.9851,
        radius: 100
      };

      const result = await concordiumService.createEscrowPayment(
        testAccount,
        10.5,
        'test-job-123',
        testAccount,
        location
      );

      expect(result).toBeDefined();
      expect(result.hash).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.jobId).toBe('test-job-123');
      expect(result.amount).toBe(10.5);
    });

    test('should validate location data', async () => {
      const invalidLocation = {
        latitude: 200, // Invalid latitude
        longitude: -73.9851,
        radius: 100
      };

      const result = await concordiumService.createEscrowPayment(
        testAccount,
        10.5,
        'test-job-123',
        testAccount,
        invalidLocation
      );

      // Should still create escrow but with validated location
      expect(result).toBeDefined();
      expect(result.hash).toBeDefined();
    });
  });

  describe('Location Verification', () => {
    test('should verify location within radius', async () => {
      const result = await concordiumService.verifyLocation(
        40.7589, -73.9851, // Worker location
        40.7589, -73.9851, // Job location
        100 // Radius
      );

      expect(result.verified).toBe(true);
      expect(result.distance).toBeDefined();
      expect(typeof result.distance).toBe('number');
      expect(result.distance).toBeLessThanOrEqual(100);
    });

    test('should reject location outside radius', async () => {
      const result = await concordiumService.verifyLocation(
        40.8000, -73.9000, // Worker location (far away)
        40.7589, -73.9851, // Job location
        100 // Radius
      );

      expect(result.verified).toBe(false);
      expect(result.distance).toBeDefined();
      expect(result.distance).toBeGreaterThan(100);
    });

    test('should calculate distance accurately', async () => {
      const result = await concordiumService.verifyLocation(
        40.7589, -73.9851, // Same location
        40.7589, -73.9851,
        100
      );

      expect(result.distance).toBeCloseTo(0, 1);
    });
  });

  describe('Payment Release', () => {
    test('should release payment', async () => {
      const workerLocation = {
        latitude: 40.7589,
        longitude: -73.9851
      };

      const result = await concordiumService.releasePayment(
        testAccount,
        10.5,
        'test-job-123',
        workerLocation
      );

      expect(result).toBeDefined();
      expect(result.hash).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.jobId).toBe('test-job-123');
      expect(result.amount).toBe(10.5);
    });

    test('should handle invalid worker location', async () => {
      const invalidLocation = {
        latitude: 200, // Invalid latitude
        longitude: -73.9851
      };

      const result = await concordiumService.releasePayment(
        testAccount,
        10.5,
        'test-job-123',
        invalidLocation
      );

      // Should still process payment
      expect(result).toBeDefined();
      expect(result.hash).toBeDefined();
    });
  });

  describe('Network Information', () => {
    test('should get network info', async () => {
      const networkInfo = await concordiumService.getNetworkInfo();
      
      expect(networkInfo).toBeDefined();
      expect(networkInfo.network).toBe('testnet');
      expect(networkInfo.nodeUrl).toBeDefined();
    });
  });
});

describe('Hybrid Concordium Service Tests', () => {
  const testAccount = '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c';

  describe('Hybrid Identity Verification', () => {
    test('should verify account in hybrid mode', async () => {
      const result = await hybridConcordiumService.verifyIdentity(testAccount);
      
      expect(result.verified).toBe(true);
      expect(result.accountInfo).toBeDefined();
      expect(result.accountInfo.hybridMode).toBe(true);
    });

    test('should handle account format variations', async () => {
      const variations = [
        '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c',
        '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c1234567890',
        '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c12345678901234567890'
      ];

      for (const account of variations) {
        const result = await hybridConcordiumService.verifyIdentity(account);
        expect(result.verified).toBe(true);
      }
    });
  });

  describe('Hybrid Transaction Creation', () => {
    test('should create CCD transaction', async () => {
      const result = await hybridConcordiumService.createCCDTransaction(
        testAccount,
        1000000000 // 1 CCD in microCCD
      );

      expect(result).toBeDefined();
      expect(result.hash).toBeDefined();
      expect(result.type).toBe('CCD_TRANSFER');
      expect(result.hybridMode).toBe(true);
    });

    test('should create escrow payment', async () => {
      const location = {
        latitude: 40.7589,
        longitude: -73.9851,
        radius: 100
      };

      const result = await hybridConcordiumService.createEscrowPayment(
        testAccount,
        10.5,
        'test-job-123',
        testAccount,
        location
      );

      expect(result).toBeDefined();
      expect(result.hash).toBeDefined();
      expect(result.hybridMode).toBe(true);
      expect(result.blockchainSubmitted).toBe(true);
    });

    test('should release payment', async () => {
      const workerLocation = {
        latitude: 40.7589,
        longitude: -73.9851
      };

      const result = await hybridConcordiumService.releasePayment(
        testAccount,
        10.5,
        'test-job-123',
        workerLocation
      );

      expect(result).toBeDefined();
      expect(result.hash).toBeDefined();
      expect(result.hybridMode).toBe(true);
      expect(result.blockchainSubmitted).toBe(true);
    });
  });

  describe('Contract Deployment', () => {
    test('should deploy contract', async () => {
      const result = await hybridConcordiumService.deployContract();
      
      expect(result).toBeDefined();
      expect(result.contractAddress).toBeDefined();
      expect(result.moduleReference).toBeDefined();
      expect(result.hybridMode).toBe(true);
    });

    test('should initialize contract', async () => {
      const result = await hybridConcordiumService.initializeContract();
      
      expect(result).toBeDefined();
      expect(result.contractAddress).toBeDefined();
      expect(result.hybridMode).toBe(true);
    });
  });

  describe('Transaction Status', () => {
    test('should get transaction status', async () => {
      const testHash = 'test-transaction-hash';
      const result = await hybridConcordiumService.getTransactionStatus(testHash);
      
      expect(result).toBeDefined();
      expect(result.hash).toBe(testHash);
      expect(result.status).toBeDefined();
    });

    test('should wait for confirmation', async () => {
      const testHash = 'test-transaction-hash';
      const result = await hybridConcordiumService.waitForConfirmation(testHash);
      
      expect(result).toBeDefined();
      expect(result.hash).toBe(testHash);
      expect(result.status).toBe('confirmed');
    });
  });
});
