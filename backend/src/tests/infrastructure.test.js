const request = require('supertest');
const app = require('../server');

describe('Infrastructure Tests', () => {
  describe('Server Startup', () => {
    test('should start server successfully', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.concordium).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    test('should have proper CORS headers', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('should have security headers', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['x-frame-options']).toBeDefined();
    });
  });

  describe('Health Endpoint', () => {
    test('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'ProofOfWork API is running',
        environment: 'test',
        concordium: {
          network: 'testnet',
          nodeUrl: 'https://testnet.concordium.com'
        }
      });
    });

    test('should include timestamp', async () => {
      const response = await request(app).get('/health');
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });

  describe('404 Handling', () => {
    test('should return 404 for non-existent endpoints', async () => {
      const response = await request(app).get('/non-existent-endpoint');
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('API endpoint not found');
    });
  });
});

describe('Rate Limiting', () => {
  test('should enforce rate limits', async () => {
    const promises = Array.from({ length: 150 }, () => 
      request(app).get('/api/v1/jobs')
    );

    const responses = await Promise.all(promises);
    const rateLimited = responses.some(response => response.status === 429);
    expect(rateLimited).toBe(true);
  });
});

describe('Security Headers', () => {
  test('should include security headers', async () => {
    const response = await request(app).get('/health');
    
    expect(response.headers['content-security-policy']).toBeDefined();
    expect(response.headers['x-frame-options']).toBeDefined();
    expect(response.headers['x-content-type-options']).toBeDefined();
    expect(response.headers['referrer-policy']).toBeDefined();
  });
});
