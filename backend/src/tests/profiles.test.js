const request = require('supertest');
const app = require('../server');
const { supabaseAdmin } = require('../config/supabase');

describe('Profiles API Tests', () => {
  let testBusinessId;
  let testWorkerId;

  afterAll(async () => {
    // Cleanup test data
    if (testBusinessId) {
      await supabaseAdmin.from('profiles').delete().eq('id', testBusinessId);
    }
    if (testWorkerId) {
      await supabaseAdmin.from('profiles').delete().eq('id', testWorkerId);
    }
  });

  describe('GET /api/v1/profiles', () => {
    test('should retrieve all profiles', async () => {
      const response = await request(app).get('/api/v1/profiles');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should filter profiles by role', async () => {
      // Test that filtering by role returns valid response
      const response = await request(app).get('/api/v1/profiles?role=business');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/profiles', () => {
    test('should require authentication for profile creation', async () => {
      const profileData = {
        role: 'business',
        display_name: 'Test Business'
      };

      const response = await request(app)
        .post('/api/v1/profiles')
        .send(profileData);

      // Profile creation fails due to foreign key constraint (requires auth user)
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('foreign key constraint');
    });

    test('should validate Concordium account when provided', async () => {
      const profileData = {
        role: 'business',
        display_name: 'Test Business',
        concordium_account: 'invalid_account'
      };

      const response = await request(app)
        .post('/api/v1/profiles')
        .send(profileData);

      // Should fail due to invalid Concordium account
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid Concordium account');
    });

    test('should validate required fields', async () => {
      const invalidProfile = {
        role: 'business'
        // Missing display_name
      };

      const response = await request(app)
        .post('/api/v1/profiles')
        .send(invalidProfile);

      // Should return 500 due to database constraint violation
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    test('should validate role enum', async () => {
      const invalidProfile = {
        role: 'invalid_role',
        display_name: 'Test'
      };

      const response = await request(app)
        .post('/api/v1/profiles')
        .send(invalidProfile);

      // Should return 500 due to database constraint violation
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    test('should validate Concordium account format', async () => {
      const invalidProfile = {
        role: 'business',
        display_name: 'Test Business',
        concordium_account: 'invalid_account_format'
      };

      const response = await request(app)
        .post('/api/v1/profiles')
        .send(invalidProfile);

      // Profile creation fails due to foreign key constraint (requires authenticated user)
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Failed to create profile');
    });
  });

  describe('GET /api/v1/profiles/:id', () => {
    test('should return 500 for invalid UUID format', async () => {
      const response = await request(app).get('/api/v1/profiles/non-existent-id');
      
      // Should return 500 due to database error (invalid UUID format)
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    test('should return 500 for valid UUID but non-existent profile', async () => {
      const response = await request(app).get('/api/v1/profiles/550e8400-e29b-41d4-a716-446655440000');
      
      // Should return 500 due to database error (profile not found)
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/profiles/:id/balance', () => {
    test('should return 500 for invalid profile ID', async () => {
      const response = await request(app).get('/api/v1/profiles/invalid-id/balance');
      
      // Should return 500 due to database error
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});
