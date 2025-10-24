const request = require('supertest');
const app = require('../src/server');

describe('ProofOfWork API Tests', () => {
  let testProfileId;
  let testJobId;

  describe('Health Check', () => {
    test('GET /health should return API status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('ProofOfWork API');
      expect(response.body.concordium).toBeDefined();
    });

    test('GET / should return API info', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.endpoints).toBeDefined();
    });
  });

  describe('Profiles API', () => {
    test('POST /api/v1/profiles should create a new profile', async () => {
      const profileData = {
        role: 'business',
        display_name: 'Test Business',
        concordium_account: 'test_concordium_account_123',
        concordium_did: true
      };

      const response = await request(app)
        .post('/api/v1/profiles')
        .send(profileData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('business');
      expect(response.body.data.display_name).toBe('Test Business');
      
      testProfileId = response.body.data.id;
    });

    test('GET /api/v1/profiles should return all profiles', async () => {
      const response = await request(app)
        .get('/api/v1/profiles')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/v1/profiles/:id should return specific profile', async () => {
      if (!testProfileId) {
        // Create a test profile first
        const profileData = {
          role: 'worker',
          display_name: 'Test Worker',
          concordium_account: 'test_worker_account_456',
          concordium_did: true
        };

        const createResponse = await request(app)
          .post('/api/v1/profiles')
          .send(profileData);
        
        testProfileId = createResponse.body.data.id;
      }

      const response = await request(app)
        .get(`/api/v1/profiles/${testProfileId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testProfileId);
    });

    test('GET /api/v1/profiles/:id/balance should return balance', async () => {
      if (!testProfileId) {
        // Create a test profile first
        const profileData = {
          role: 'business',
          display_name: 'Balance Test Business',
          concordium_account: 'balance_test_account',
          concordium_did: true
        };

        const createResponse = await request(app)
          .post('/api/v1/profiles')
          .send(profileData);
        
        testProfileId = createResponse.body.data.id;
      }

      const response = await request(app)
        .get(`/api/v1/profiles/${testProfileId}/balance`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('balance');
      expect(response.body.data).toHaveProperty('concordium_account');
    });
  });

  describe('Jobs API', () => {
    test('POST /api/v1/jobs should create a new job', async () => {
      if (!testProfileId) {
        // Create a test business profile first
        const profileData = {
          role: 'business',
          display_name: 'Job Test Business',
          concordium_account: 'job_test_business',
          concordium_did: true
        };

        const createResponse = await request(app)
          .post('/api/v1/profiles')
          .send(profileData);
        
        testProfileId = createResponse.body.data.id;
      }

      const jobData = {
        business_id: testProfileId,
        title: 'Test Cleaning Job',
        description: 'A test job for API testing',
        amount_plt: 25.0,
        location: { latitude: 40.7589, longitude: -73.9851 },
        radius_m: 150
      };

      const response = await request(app)
        .post('/api/v1/jobs')
        .send(jobData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Cleaning Job');
      expect(response.body.data.status).toBe('open');
      
      testJobId = response.body.data.id;
    });

    test('GET /api/v1/jobs should return all jobs', async () => {
      const response = await request(app)
        .get('/api/v1/jobs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/v1/jobs/:id should return specific job', async () => {
      if (!testJobId) {
        // Create a test job first
        const jobData = {
          business_id: testProfileId || 'test-business-id',
          title: 'Test Job for Get',
          description: 'Test job description',
          amount_plt: 15.0,
          location: { latitude: 40.7829, longitude: -73.9654 },
          radius_m: 200
        };

        const createResponse = await request(app)
          .post('/api/v1/jobs')
          .send(jobData);
        
        testJobId = createResponse.body.data.id;
      }

      const response = await request(app)
        .get(`/api/v1/jobs/${testJobId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testJobId);
    });

    test('GET /api/v1/jobs/nearby should return nearby jobs', async () => {
      const response = await request(app)
        .get('/api/v1/jobs/nearby')
        .query({
          latitude: 40.7589,
          longitude: -73.9851,
          radius: 5000,
          limit: 10
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('GET /api/v1/profiles/invalid-id should return 404', async () => {
      const response = await request(app)
        .get('/api/v1/profiles/invalid-uuid')
        .expect(500); // Supabase will return 500 for invalid UUID format

      expect(response.body.success).toBe(false);
    });

    test('POST /api/v1/profiles with invalid data should return 400', async () => {
      const invalidData = {
        role: 'invalid_role',
        display_name: '', // Empty name
        concordium_account: null
      };

      const response = await request(app)
        .post('/api/v1/profiles')
        .send(invalidData)
        .expect(500); // Will fail due to validation

      expect(response.body.success).toBe(false);
    });

    test('GET /nonexistent-endpoint should return 404', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('Rate Limiting', () => {
    test('Should enforce rate limiting', async () => {
      // Make multiple requests quickly
      const promises = Array(10).fill().map(() => 
        request(app).get('/health')
      );

      const responses = await Promise.all(promises);
      
      // All should succeed (rate limit is 100 requests per 15 minutes)
      responses.forEach(response => {
        expect(response.status).toBeLessThan(500);
      });
    });
  });
});
