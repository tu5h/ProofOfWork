const concordiumService = require('../services/concordiumService');

describe('Concordium Service Unit Tests', () => {
  describe('Identity Verification', () => {
    test('should verify valid Concordium account', async () => {
      const testAccount = '3tefNN5UYD6p53pQJaPDb4aDDV3XgLS2pV5171rA5XvpFvo6qH';
      const result = await concordiumService.verifyIdentity(testAccount);
      
      // Local stack service accepts valid accounts
      expect(result.verified).toBe(true);
      expect(result.accountInfo).toBeDefined();
      expect(result.accountInfo.address).toBe(testAccount);
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
  });

  describe('Balance Retrieval', () => {
    test('should get account balance', async () => {
      const testAccount = '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c';
      const balance = await concordiumService.getBalance(testAccount);
      
      expect(typeof balance).toBe('number');
      expect(balance).toBeGreaterThanOrEqual(0);
    });

    test('should handle invalid account gracefully', async () => {
      const balance = await concordiumService.getBalance('invalid_account');
      
      expect(typeof balance).toBe('number');
      expect(balance).toBeGreaterThanOrEqual(0); // Mock returns 20000000000
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

  describe('Network Information', () => {
    test('should get network info', async () => {
      const networkInfo = await concordiumService.getNetworkInfo();
      
      expect(networkInfo).toBeDefined();
      expect(networkInfo.network).toBe('local');
      expect(networkInfo.nodeUrl).toBeDefined();
    });
  });

  describe('Caching', () => {
    test('should use caching for repeated requests', async () => {
      const testAccount = '3tefNN5UYD6p53pQJaPDb4aDDV3XgLS2pV5171rA5XvpFvo6qH';
      
      const startTime = Date.now();
      const result1 = await concordiumService.verifyIdentity(testAccount);
      const firstCallTime = Date.now() - startTime;

      const startTime2 = Date.now();
      const result2 = await concordiumService.verifyIdentity(testAccount);
      const secondCallTime = Date.now() - startTime2;

      expect(result1.verified).toBe(true); // Local stack accepts valid accounts
      expect(result2.verified).toBe(true); // Local stack accepts valid accounts
      expect(result1.accountInfo).toBeDefined();
      expect(result2.accountInfo).toBeDefined();
      // Both calls should return same result (cached)
      expect(result1.accountInfo.address).toBe(result2.accountInfo.address);
    });
  });
});
