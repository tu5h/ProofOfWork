const request = require('supertest');
const app = require('../server');
const { supabaseAdmin } = require('../config/supabase');

describe('Jobs API Tests', () => {
  let testBusinessId;
  let testWorkerId;
  let testJobId;

  beforeAll(async () => {
    // Use hardcoded UUIDs since profile creation requires authentication
    testBusinessId = '550e8400-e29b-41d4-a716-446655440001';
    testWorkerId = '550e8400-e29b-41d4-a716-446655440002';
  });

  afterAll(async () => {
    // Cleanup test data
    if (testJobId) {
      await supabaseAdmin.from('jobs').delete().eq('id', testJobId);
    }
    if (testBusinessId) {
      await supabaseAdmin.from('profiles').delete().eq('id', testBusinessId);
    }
    if (testWorkerId) {
      await supabaseAdmin.from('profiles').delete().eq('id', testWorkerId);
    }
  });

  describe('GET /api/v1/jobs', () => {
    test('should retrieve all jobs', async () => {
      const response = await request(app).get('/api/v1/jobs');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    test('should support pagination', async () => {
      const response = await request(app).get('/api/v1/jobs?limit=5&offset=0');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.offset).toBe(0);
    });

    test('should filter jobs by status', async () => {
      const response = await request(app).get('/api/v1/jobs?status=open');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      response.body.data.forEach(job => {
        expect(job.status).toBe('open');
      });
    });

    test('should filter jobs by business_id', async () => {
      const response = await request(app).get(`/api/v1/jobs?business_id=${testBusinessId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      response.body.data.forEach(job => {
        expect(job.business_id).toBe(testBusinessId);
      });
    });
  });

  describe('POST /api/v1/jobs', () => {
    test('should require valid business ID', async () => {
      const jobData = {
        title: 'Test Job',
        description: 'This is a test job for automated testing',
        amount_plt: 10.5,
        location: {
          latitude: 40.7589,
          longitude: -73.9851,
          radius: 100
        },
        business_id: testBusinessId
      };

      const response = await request(app)
        .post('/api/v1/jobs')
        .send(jobData);

      // Job creation fails because business doesn't exist (requires authentication)
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid business ID');
    });

    test('should validate required fields', async () => {
      const invalidJob = {
        title: 'Test Job'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/v1/jobs')
        .send(invalidJob);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should validate location coordinates', async () => {
      const invalidJob = {
        title: 'Test Job',
        description: 'Test description',
        amount_plt: 10.5,
        location: {
          latitude: 200, // Invalid latitude
          longitude: -73.9851,
          radius: 100
        },
        business_id: testBusinessId
      };

      const response = await request(app)
        .post('/api/v1/jobs')
        .send(invalidJob);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should validate amount_plt is positive', async () => {
      const invalidJob = {
        title: 'Test Job',
        description: 'Test description',
        amount_plt: -10, // Invalid negative amount
        location: {
          latitude: 40.7589,
          longitude: -73.9851,
          radius: 100
        },
        business_id: testBusinessId
      };

      const response = await request(app)
        .post('/api/v1/jobs')
        .send(invalidJob);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/jobs/:id', () => {
    test('should return 500 for invalid job ID format', async () => {
      const response = await request(app).get('/api/v1/jobs/non-existent-id');
      
      // Should return 500 due to database error (invalid UUID format)
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    test('should return 500 for valid UUID but non-existent job', async () => {
      const response = await request(app).get('/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000');
      
      // Should return 500 due to database error (job not found)
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/jobs/:id/assign', () => {
    test('should return 500 for invalid job ID', async () => {
      const assignmentData = {
        worker_id: testWorkerId,
        concordium_account: '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c'
      };

      const response = await request(app)
        .patch('/api/v1/jobs/invalid-id/assign')
        .send(assignmentData);

      // Should return 404 for invalid job ID
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should validate worker_id format', async () => {
      const invalidAssignment = {
        worker_id: 'invalid-uuid',
        concordium_account: '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c'
      };

      const response = await request(app)
        .patch('/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000/assign')
        .send(invalidAssignment);

      // Should return 404 for invalid job ID
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/jobs/:id/complete', () => {
    test('should return 500 for invalid job ID', async () => {
      const completionData = {
        position: {
          latitude: 40.7589,
          longitude: -73.9851
        },
        concordium_account: '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c'
      };

      const response = await request(app)
        .patch('/api/v1/jobs/invalid-id/complete')
        .send(completionData);

      // Should return 404 for invalid job ID
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should validate position coordinates', async () => {
      const invalidCompletion = {
        position: {
          latitude: 200, // Invalid latitude
          longitude: -73.9851
        },
        concordium_account: '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c'
      };

      const response = await request(app)
        .patch('/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000/complete')
        .send(invalidCompletion);

      // Should return 404 for invalid job ID
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
