const request = require('supertest');
const app = require('../server');
const { supabaseAdmin } = require('../config/supabase');
const concordiumService = require('../services/concordiumService');

class BackendTestSuite {
  constructor() {
    this.app = app;
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
    this.testData = {
      businessId: null,
      workerId: null,
      jobId: null,
      escrowId: null
    };
  }

  // Test result tracking
  recordTest(testName, passed, details = '') {
    this.testResults.total++;
    if (passed) {
      this.testResults.passed++;
      console.log(`✅ ${testName}`);
    } else {
      this.testResults.failed++;
      console.log(`❌ ${testName}: ${details}`);
    }
    this.testResults.details.push({
      name: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Clean up test data
  async cleanup() {
    try {
      if (this.testData.jobId) {
        await supabaseAdmin.from('jobs').delete().eq('id', this.testData.jobId);
      }
      if (this.testData.businessId) {
        await supabaseAdmin.from('profiles').delete().eq('id', this.testData.businessId);
      }
      if (this.testData.workerId) {
        await supabaseAdmin.from('profiles').delete().eq('id', this.testData.workerId);
      }
      console.log('🧹 Test cleanup completed');
    } catch (error) {
      console.error('Cleanup error:', error.message);
    }
  }

  // ==================== INFRASTRUCTURE TESTS ====================

  async testServerStartup() {
    try {
      const response = await request(this.app).get('/health');
      const passed = response.status === 200 && response.body.success === true;
      this.recordTest('Server Startup', passed, passed ? 'Server running on port 5000' : 'Server failed to start');
      return passed;
    } catch (error) {
      this.recordTest('Server Startup', false, error.message);
      return false;
    }
  }

  async testDatabaseConnection() {
    try {
      const { data, error } = await supabaseAdmin.from('profiles').select('count').limit(1);
      const passed = !error;
      this.recordTest('Database Connection', passed, passed ? 'Supabase connected' : error.message);
      return passed;
    } catch (error) {
      this.recordTest('Database Connection', false, error.message);
      return false;
    }
  }

  async testConcordiumConnection() {
    try {
      const networkInfo = await concordiumService.getNetworkInfo();
      const passed = networkInfo && networkInfo.network === 'testnet';
      this.recordTest('Concordium Connection', passed, passed ? 'Connected to testnet' : 'Connection failed');
      return passed;
    } catch (error) {
      this.recordTest('Concordium Connection', false, error.message);
      return false;
    }
  }

  // ==================== API ENDPOINT TESTS ====================

  async testHealthEndpoint() {
    try {
      const response = await request(this.app).get('/health');
      const passed = response.status === 200 && 
                    response.body.success === true &&
                    response.body.concordium &&
                    response.body.timestamp;
      this.recordTest('Health Endpoint', passed, passed ? 'All health checks passed' : 'Health check failed');
      return passed;
    } catch (error) {
      this.recordTest('Health Endpoint', false, error.message);
      return false;
    }
  }

  async testProfilesGet() {
    try {
      const response = await request(this.app).get('/api/v1/profiles');
      const passed = response.status === 200 && 
                    response.body.success === true &&
                    Array.isArray(response.body.data);
      this.recordTest('Profiles GET', passed, passed ? `Retrieved ${response.body.data.length} profiles` : 'Failed to get profiles');
      return passed;
    } catch (error) {
      this.recordTest('Profiles GET', false, error.message);
      return false;
    }
  }

  async testProfilesPost() {
    try {
      const profileData = {
        role: 'business',
        display_name: 'Test Business',
        concordium_account: '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c'
      };

      const response = await request(this.app)
        .post('/api/v1/profiles')
        .send(profileData);

      const passed = response.status === 201 && 
                    response.body.success === true &&
                    response.body.data.id;

      if (passed) {
        this.testData.businessId = response.body.data.id;
      }

      this.recordTest('Profiles POST', passed, passed ? 'Business profile created' : 'Failed to create profile');
      return passed;
    } catch (error) {
      this.recordTest('Profiles POST', false, error.message);
      return false;
    }
  }

  async testWorkerProfileCreation() {
    try {
      const profileData = {
        role: 'worker',
        display_name: 'Test Worker',
        concordium_account: '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c'
      };

      const response = await request(this.app)
        .post('/api/v1/profiles')
        .send(profileData);

      const passed = response.status === 201 && 
                    response.body.success === true &&
                    response.body.data.id;

      if (passed) {
        this.testData.workerId = response.body.data.id;
      }

      this.recordTest('Worker Profile Creation', passed, passed ? 'Worker profile created' : 'Failed to create worker');
      return passed;
    } catch (error) {
      this.recordTest('Worker Profile Creation', false, error.message);
      return false;
    }
  }

  async testJobsGet() {
    try {
      const response = await request(this.app).get('/api/v1/jobs');
      const passed = response.status === 200 && 
                    response.body.success === true &&
                    Array.isArray(response.body.data) &&
                    response.body.pagination;
      this.recordTest('Jobs GET', passed, passed ? `Retrieved ${response.body.data.length} jobs` : 'Failed to get jobs');
      return passed;
    } catch (error) {
      this.recordTest('Jobs GET', false, error.message);
      return false;
    }
  }

  async testJobsPost() {
    try {
      if (!this.testData.businessId) {
        throw new Error('Business ID not available');
      }

      const jobData = {
        title: 'Test Job',
        description: 'This is a test job for automated testing',
        amount_plt: 10.5,
        location: {
          latitude: 40.7589,
          longitude: -73.9851,
          radius: 100
        },
        business_id: this.testData.businessId
      };

      const response = await request(this.app)
        .post('/api/v1/jobs')
        .send(jobData);

      const passed = response.status === 201 && 
                    response.body.success === true &&
                    response.body.data.id;

      if (passed) {
        this.testData.jobId = response.body.data.id;
      }

      this.recordTest('Jobs POST', passed, passed ? 'Job created successfully' : 'Failed to create job');
      return passed;
    } catch (error) {
      this.recordTest('Jobs POST', false, error.message);
      return false;
    }
  }

  async testJobAssignment() {
    try {
      if (!this.testData.jobId || !this.testData.workerId) {
        throw new Error('Job ID or Worker ID not available');
      }

      const assignmentData = {
        worker_id: this.testData.workerId,
        concordium_account: '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c'
      };

      const response = await request(this.app)
        .patch(`/api/v1/jobs/${this.testData.jobId}/assign`)
        .send(assignmentData);

      const passed = response.status === 200 && 
                    response.body.success === true &&
                    response.body.data.status === 'assigned';

      this.recordTest('Job Assignment', passed, passed ? 'Job assigned to worker' : 'Failed to assign job');
      return passed;
    } catch (error) {
      this.recordTest('Job Assignment', false, error.message);
      return false;
    }
  }

  async testJobCompletion() {
    try {
      if (!this.testData.jobId) {
        throw new Error('Job ID not available');
      }

      const completionData = {
        position: {
          latitude: 40.7589,
          longitude: -73.9851
        },
        concordium_account: '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c'
      };

      const response = await request(this.app)
        .patch(`/api/v1/jobs/${this.testData.jobId}/complete`)
        .send(completionData);

      const passed = response.status === 200 && 
                    response.body.success === true &&
                    response.body.data.status === 'completed';

      this.recordTest('Job Completion', passed, passed ? 'Job completed successfully' : 'Failed to complete job');
      return passed;
    } catch (error) {
      this.recordTest('Job Completion', false, error.message);
      return false;
    }
  }

  // ==================== CONCORDIUM SERVICE TESTS ====================

  async testConcordiumIdentityVerification() {
    try {
      const testAccount = '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c';
      const result = await concordiumService.verifyIdentity(testAccount);
      
      const passed = result.verified === true && 
                    result.accountInfo &&
                    result.accountInfo.address === testAccount;

      this.recordTest('Concordium Identity Verification', passed, passed ? 'Account verified successfully' : 'Identity verification failed');
      return passed;
    } catch (error) {
      this.recordTest('Concordium Identity Verification', false, error.message);
      return false;
    }
  }

  async testConcordiumBalanceCheck() {
    try {
      const testAccount = '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c';
      const balance = await concordiumService.getBalance(testAccount);
      
      const passed = typeof balance === 'number' && balance >= 0;

      this.recordTest('Concordium Balance Check', passed, passed ? `Balance: ${balance} CCD` : 'Balance check failed');
      return passed;
    } catch (error) {
      this.recordTest('Concordium Balance Check', false, error.message);
      return false;
    }
  }

  async testEscrowCreation() {
    try {
      const testAccount = '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c';
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

      const passed = result && 
                    result.hash &&
                    result.status &&
                    result.jobId === 'test-job-123';

      this.recordTest('Escrow Creation', passed, passed ? 'Escrow created successfully' : 'Escrow creation failed');
      return passed;
    } catch (error) {
      this.recordTest('Escrow Creation', false, error.message);
      return false;
    }
  }

  async testLocationVerification() {
    try {
      const result = await concordiumService.verifyLocation(
        40.7589, -73.9851, // Worker location
        40.7589, -73.9851, // Job location
        100 // Radius
      );

      const passed = result && 
                    result.verified === true &&
                    result.distance !== undefined;

      this.recordTest('Location Verification', passed, passed ? `Distance: ${result.distance}m` : 'Location verification failed');
      return passed;
    } catch (error) {
      this.recordTest('Location Verification', false, error.message);
      return false;
    }
  }

  async testPaymentRelease() {
    try {
      const testAccount = '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c';
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

      const passed = result && 
                    result.hash &&
                    result.status &&
                    result.jobId === 'test-job-123';

      this.recordTest('Payment Release', passed, passed ? 'Payment released successfully' : 'Payment release failed');
      return passed;
    } catch (error) {
      this.recordTest('Payment Release', false, error.message);
      return false;
    }
  }

  // ==================== ERROR HANDLING TESTS ====================

  async testInvalidJobCreation() {
    try {
      const invalidJobData = {
        title: '', // Invalid empty title
        description: 'Test',
        amount_plt: -10, // Invalid negative amount
        location: {
          latitude: 200, // Invalid latitude
          longitude: -73.9851,
          radius: 100
        },
        business_id: 'invalid-uuid'
      };

      const response = await request(this.app)
        .post('/api/v1/jobs')
        .send(invalidJobData);

      const passed = response.status === 400;

      this.recordTest('Invalid Job Creation', passed, passed ? 'Properly rejected invalid data' : 'Failed to validate input');
      return passed;
    } catch (error) {
      this.recordTest('Invalid Job Creation', false, error.message);
      return false;
    }
  }

  async testInvalidProfileCreation() {
    try {
      const invalidProfileData = {
        role: 'invalid_role',
        display_name: '',
        concordium_account: 'invalid_account'
      };

      const response = await request(this.app)
        .post('/api/v1/profiles')
        .send(invalidProfileData);

      const passed = response.status === 400;

      this.recordTest('Invalid Profile Creation', passed, passed ? 'Properly rejected invalid profile' : 'Failed to validate profile');
      return passed;
    } catch (error) {
      this.recordTest('Invalid Profile Creation', false, error.message);
      return false;
    }
  }

  async testNonExistentJobAccess() {
    try {
      const response = await request(this.app).get('/api/v1/jobs/non-existent-id');
      const passed = response.status === 404;

      this.recordTest('Non-existent Job Access', passed, passed ? 'Properly handled missing job' : 'Failed to handle missing job');
      return passed;
    } catch (error) {
      this.recordTest('Non-existent Job Access', false, error.message);
      return false;
    }
  }

  // ==================== PERFORMANCE TESTS ====================

  async testConcurrentRequests() {
    try {
      const promises = Array.from({ length: 10 }, () => 
        request(this.app).get('/api/v1/jobs')
      );

      const responses = await Promise.all(promises);
      const passed = responses.every(response => response.status === 200);

      this.recordTest('Concurrent Requests', passed, passed ? 'Handled 10 concurrent requests' : 'Failed concurrent request test');
      return passed;
    } catch (error) {
      this.recordTest('Concurrent Requests', false, error.message);
      return false;
    }
  }

  async testLargeDatasetHandling() {
    try {
      const response = await request(this.app).get('/api/v1/jobs?limit=1000');
      const passed = response.status === 200 && response.body.data.length <= 1000;

      this.recordTest('Large Dataset Handling', passed, passed ? 'Handled large dataset request' : 'Failed large dataset test');
      return passed;
    } catch (error) {
      this.recordTest('Large Dataset Handling', false, error.message);
      return false;
    }
  }

  // ==================== SECURITY TESTS ====================

  async testSQLInjectionPrevention() {
    try {
      const maliciousQuery = "'; DROP TABLE jobs; --";
      const response = await request(this.app)
        .get(`/api/v1/jobs?title=${maliciousQuery}`);

      const passed = response.status === 200 && !response.text.includes('error');

      this.recordTest('SQL Injection Prevention', passed, passed ? 'Protected against SQL injection' : 'Vulnerable to SQL injection');
      return passed;
    } catch (error) {
      this.recordTest('SQL Injection Prevention', false, error.message);
      return false;
    }
  }

  async testRateLimiting() {
    try {
      const promises = Array.from({ length: 150 }, () => 
        request(this.app).get('/api/v1/jobs')
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(response => response.status === 429);
      const passed = rateLimited;

      this.recordTest('Rate Limiting', passed, passed ? 'Rate limiting working' : 'Rate limiting not working');
      return passed;
    } catch (error) {
      this.recordTest('Rate Limiting', false, error.message);
      return false;
    }
  }

  // ==================== INTEGRATION TESTS ====================

  async testCompleteWorkflow() {
    try {
      // Step 1: Create business profile
      const businessResponse = await request(this.app)
        .post('/api/v1/profiles')
        .send({
          role: 'business',
          display_name: 'Workflow Test Business',
          concordium_account: '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c'
        });

      if (businessResponse.status !== 201) {
        throw new Error('Failed to create business profile');
      }

      const businessId = businessResponse.body.data.id;

      // Step 2: Create worker profile
      const workerResponse = await request(this.app)
        .post('/api/v1/profiles')
        .send({
          role: 'worker',
          display_name: 'Workflow Test Worker',
          concordium_account: '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c'
        });

      if (workerResponse.status !== 201) {
        throw new Error('Failed to create worker profile');
      }

      const workerId = workerResponse.body.data.id;

      // Step 3: Create job
      const jobResponse = await request(this.app)
        .post('/api/v1/jobs')
        .send({
          title: 'Workflow Test Job',
          description: 'Complete workflow test',
          amount_plt: 15.0,
          location: {
            latitude: 40.7589,
            longitude: -73.9851,
            radius: 100
          },
          business_id: businessId
        });

      if (jobResponse.status !== 201) {
        throw new Error('Failed to create job');
      }

      const jobId = jobResponse.body.data.id;

      // Step 4: Assign job
      const assignResponse = await request(this.app)
        .patch(`/api/v1/jobs/${jobId}/assign`)
        .send({
          worker_id: workerId,
          concordium_account: '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c'
        });

      if (assignResponse.status !== 200) {
        throw new Error('Failed to assign job');
      }

      // Step 5: Complete job
      const completeResponse = await request(this.app)
        .patch(`/api/v1/jobs/${jobId}/complete`)
        .send({
          position: {
            latitude: 40.7589,
            longitude: -73.9851
          },
          concordium_account: '3tQNXbUExDuZMK4YDhMVTQNAcQqBMppHMN3sWG5z6c'
        });

      if (completeResponse.status !== 200) {
        throw new Error('Failed to complete job');
      }

      // Cleanup
      await supabaseAdmin.from('jobs').delete().eq('id', jobId);
      await supabaseAdmin.from('profiles').delete().eq('id', businessId);
      await supabaseAdmin.from('profiles').delete().eq('id', workerId);

      const passed = true;
      this.recordTest('Complete Workflow', passed, 'End-to-end workflow completed successfully');
      return passed;
    } catch (error) {
      this.recordTest('Complete Workflow', false, error.message);
      return false;
    }
  }

  // ==================== MAIN TEST RUNNER ====================

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Backend Test Suite');
    console.log('==========================================\n');

    // Infrastructure Tests
    console.log('📋 Infrastructure Tests');
    console.log('----------------------');
    await this.testServerStartup();
    await this.testDatabaseConnection();
    await this.testConcordiumConnection();

    // API Endpoint Tests
    console.log('\n📋 API Endpoint Tests');
    console.log('-------------------');
    await this.testHealthEndpoint();
    await this.testProfilesGet();
    await this.testProfilesPost();
    await this.testWorkerProfileCreation();
    await this.testJobsGet();
    await this.testJobsPost();
    await this.testJobAssignment();
    await this.testJobCompletion();

    // Concordium Service Tests
    console.log('\n📋 Concordium Service Tests');
    console.log('-------------------------');
    await this.testConcordiumIdentityVerification();
    await this.testConcordiumBalanceCheck();
    await this.testEscrowCreation();
    await this.testLocationVerification();
    await this.testPaymentRelease();

    // Error Handling Tests
    console.log('\n📋 Error Handling Tests');
    console.log('---------------------');
    await this.testInvalidJobCreation();
    await this.testInvalidProfileCreation();
    await this.testNonExistentJobAccess();

    // Performance Tests
    console.log('\n📋 Performance Tests');
    console.log('------------------');
    await this.testConcurrentRequests();
    await this.testLargeDatasetHandling();

    // Security Tests
    console.log('\n📋 Security Tests');
    console.log('---------------');
    await this.testSQLInjectionPrevention();
    await this.testRateLimiting();

    // Integration Tests
    console.log('\n📋 Integration Tests');
    console.log('------------------');
    await this.testCompleteWorkflow();

    // Cleanup
    await this.cleanup();

    // Results Summary
    console.log('\n🎯 Test Results Summary');
    console.log('======================');
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed}`);
    console.log(`Failed: ${this.testResults.failed}`);
    console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);

    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.details
        .filter(test => !test.passed)
        .forEach(test => console.log(`  - ${test.name}: ${test.details}`));
    }

    console.log('\n📊 Test Coverage:');
    console.log('✅ Infrastructure (Server, Database, Blockchain)');
    console.log('✅ API Endpoints (CRUD operations)');
    console.log('✅ Concordium Integration (Identity, Escrow, Payments)');
    console.log('✅ Error Handling (Validation, Edge cases)');
    console.log('✅ Performance (Concurrency, Large datasets)');
    console.log('✅ Security (SQL injection, Rate limiting)');
    console.log('✅ Integration (End-to-end workflows)');

    return this.testResults;
  }
}

// Run tests if called directly
if (require.main === module) {
  const testSuite = new BackendTestSuite();
  
  testSuite.runAllTests()
    .then(results => {
      const exitCode = results.failed > 0 ? 1 : 0;
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = BackendTestSuite;
