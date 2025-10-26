const concordiumService = require('../services/concordiumService');

describe('Concordium Service Integration Tests', () => {
  const testAccount = '3tefNN5UYD6p53pQJaPDb4aDDV3XgLS2pV5171rA5XvpFvo6qH';

  describe('Basic Service Functionality', () => {
    test('should handle identity verification', async () => {
      const result = await concordiumService.verifyIdentity(testAccount);
      
      // Should return a result object with verified property
      expect(result).toBeDefined();
      expect(typeof result.verified).toBe('boolean');
    });

    test('should handle balance retrieval', async () => {
      const balance = await concordiumService.getBalance(testAccount);
      
      // Should return a number
      expect(typeof balance).toBe('number');
      expect(balance).toBeGreaterThanOrEqual(0);
    });

    test('should handle location verification', async () => {
      const result = await concordiumService.verifyLocation(
        40.7589, -73.9851, // Worker location
        40.7589, -73.9851, // Job location
        100 // Radius
      );

      expect(result).toBeDefined();
      expect(result.verified).toBe(true);
      expect(typeof result.distance).toBe('number');
    });

    test('should handle network info retrieval', async () => {
      const networkInfo = await concordiumService.getNetworkInfo();
      
      expect(networkInfo).toBeDefined();
      expect(networkInfo.network).toBeDefined();
    });
  });

  describe('Local Stack Integration', () => {
    test('should create escrow payments', async () => {
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
      expect(result.transactionHash).toBeDefined();
      expect(result.localStack).toBe(true);
    });

    test('should release payments', async () => {
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
      expect(result.transactionHash).toBeDefined();
      expect(result.localStack).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid account gracefully', async () => {
      const result = await concordiumService.verifyIdentity('invalid_account');
      
      expect(result.verified).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle empty account gracefully', async () => {
      const result = await concordiumService.verifyIdentity('');
      
      expect(result.verified).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle location outside radius', async () => {
      const result = await concordiumService.verifyLocation(
        40.8000, -73.9000, // Worker location (far away)
        40.7589, -73.9851, // Job location
        100 // Radius
      );

      expect(result.verified).toBe(false);
      expect(result.distance).toBeGreaterThan(100);
    });
  });
});