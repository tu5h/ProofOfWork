const BackendTestSuite = require('./comprehensive.test');

// Test configuration
const testConfig = {
  timeout: 30000, // 30 seconds timeout for each test
  retries: 2, // Retry failed tests twice
  parallel: true, // Run tests in parallel where possible
  verbose: true // Verbose output
};

// Test categories
const testCategories = {
  infrastructure: {
    name: 'Infrastructure Tests',
    description: 'Server startup, database connection, Concordium connection',
    critical: true
  },
  api: {
    name: 'API Endpoint Tests',
    description: 'All REST API endpoints and CRUD operations',
    critical: true
  },
  concordium: {
    name: 'Concordium Integration Tests',
    description: 'Blockchain service integration and smart contract functionality',
    critical: true
  },
  security: {
    name: 'Security Tests',
    description: 'SQL injection, XSS, rate limiting, input validation',
    critical: true
  },
  performance: {
    name: 'Performance Tests',
    description: 'Concurrent requests, large datasets, response times',
    critical: false
  },
  integration: {
    name: 'Integration Tests',
    description: 'End-to-end workflows and system integration',
    critical: true
  }
};

class TestRunner {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      categories: {},
      startTime: null,
      endTime: null
    };
  }

  async runCategory(categoryName, testSuite) {
    console.log(`\n🧪 Running ${testCategories[categoryName].name}`);
    console.log(`📝 ${testCategories[categoryName].description}`);
    console.log('='.repeat(50));

    const categoryStartTime = Date.now();
    let categoryResults;

    try {
      switch (categoryName) {
        case 'infrastructure':
          categoryResults = await this.runInfrastructureTests(testSuite);
          break;
        case 'api':
          categoryResults = await this.runAPITests(testSuite);
          break;
        case 'concordium':
          categoryResults = await this.runConcordiumTests(testSuite);
          break;
        case 'security':
          categoryResults = await this.runSecurityTests(testSuite);
          break;
        case 'performance':
          categoryResults = await this.runPerformanceTests(testSuite);
          break;
        case 'integration':
          categoryResults = await this.runIntegrationTests(testSuite);
          break;
        default:
          throw new Error(`Unknown test category: ${categoryName}`);
      }
    } catch (error) {
      console.error(`❌ Category ${categoryName} failed:`, error.message);
      categoryResults = {
        total: 1,
        passed: 0,
        failed: 1,
        skipped: 0,
        details: [{ name: `${categoryName} category`, passed: false, details: error.message }]
      };
    }

    const categoryEndTime = Date.now();
    const categoryDuration = categoryEndTime - categoryStartTime;

    this.results.categories[categoryName] = {
      ...categoryResults,
      duration: categoryDuration,
      critical: testCategories[categoryName].critical
    };

    this.results.total += categoryResults.total;
    this.results.passed += categoryResults.passed;
    this.results.failed += categoryResults.failed;
    this.results.skipped += categoryResults.skipped;

    console.log(`\n📊 ${testCategories[categoryName].name} Results:`);
    console.log(`   ✅ Passed: ${categoryResults.passed}`);
    console.log(`   ❌ Failed: ${categoryResults.failed}`);
    console.log(`   ⏭️  Skipped: ${categoryResults.skipped}`);
    console.log(`   ⏱️  Duration: ${categoryDuration}ms`);

    return categoryResults;
  }

  async runInfrastructureTests(testSuite) {
    const results = { total: 0, passed: 0, failed: 0, skipped: 0, details: [] };

    // Server startup
    try {
      const passed = await testSuite.testServerStartup();
      results.total++;
      if (passed) results.passed++; else results.failed++;
      results.details.push({ name: 'Server Startup', passed, details: passed ? 'Server running' : 'Server failed' });
    } catch (error) {
      results.total++;
      results.failed++;
      results.details.push({ name: 'Server Startup', passed: false, details: error.message });
    }

    // Database connection
    try {
      const passed = await testSuite.testDatabaseConnection();
      results.total++;
      if (passed) results.passed++; else results.failed++;
      results.details.push({ name: 'Database Connection', passed, details: passed ? 'Connected' : 'Connection failed' });
    } catch (error) {
      results.total++;
      results.failed++;
      results.details.push({ name: 'Database Connection', passed: false, details: error.message });
    }

    // Concordium connection
    try {
      const passed = await testSuite.testConcordiumConnection();
      results.total++;
      if (passed) results.passed++; else results.failed++;
      results.details.push({ name: 'Concordium Connection', passed, details: passed ? 'Connected' : 'Connection failed' });
    } catch (error) {
      results.total++;
      results.failed++;
      results.details.push({ name: 'Concordium Connection', passed: false, details: error.message });
    }

    return results;
  }

  async runAPITests(testSuite) {
    const results = { total: 0, passed: 0, failed: 0, skipped: 0, details: [] };

    const apiTests = [
      'testHealthEndpoint',
      'testProfilesGet',
      'testProfilesPost',
      'testWorkerProfileCreation',
      'testJobsGet',
      'testJobsPost',
      'testJobAssignment',
      'testJobCompletion'
    ];

    for (const testName of apiTests) {
      try {
        const passed = await testSuite[testName]();
        results.total++;
        if (passed) results.passed++; else results.failed++;
        results.details.push({ name: testName, passed, details: passed ? 'Success' : 'Failed' });
      } catch (error) {
        results.total++;
        results.failed++;
        results.details.push({ name: testName, passed: false, details: error.message });
      }
    }

    return results;
  }

  async runConcordiumTests(testSuite) {
    const results = { total: 0, passed: 0, failed: 0, skipped: 0, details: [] };

    const concordiumTests = [
      'testConcordiumIdentityVerification',
      'testConcordiumBalanceCheck',
      'testEscrowCreation',
      'testLocationVerification',
      'testPaymentRelease'
    ];

    for (const testName of concordiumTests) {
      try {
        const passed = await testSuite[testName]();
        results.total++;
        if (passed) results.passed++; else results.failed++;
        results.details.push({ name: testName, passed, details: passed ? 'Success' : 'Failed' });
      } catch (error) {
        results.total++;
        results.failed++;
        results.details.push({ name: testName, passed: false, details: error.message });
      }
    }

    return results;
  }

  async runSecurityTests(testSuite) {
    const results = { total: 0, passed: 0, failed: 0, skipped: 0, details: [] };

    const securityTests = [
      'testInvalidJobCreation',
      'testInvalidProfileCreation',
      'testNonExistentJobAccess'
    ];

    for (const testName of securityTests) {
      try {
        const passed = await testSuite[testName]();
        results.total++;
        if (passed) results.passed++; else results.failed++;
        results.details.push({ name: testName, passed, details: passed ? 'Success' : 'Failed' });
      } catch (error) {
        results.total++;
        results.failed++;
        results.details.push({ name: testName, passed: false, details: error.message });
      }
    }

    return results;
  }

  async runPerformanceTests(testSuite) {
    const results = { total: 0, passed: 0, failed: 0, skipped: 0, details: [] };

    const performanceTests = [
      'testConcurrentRequests',
      'testLargeDatasetHandling'
    ];

    for (const testName of performanceTests) {
      try {
        const passed = await testSuite[testName]();
        results.total++;
        if (passed) results.passed++; else results.failed++;
        results.details.push({ name: testName, passed, details: passed ? 'Success' : 'Failed' });
      } catch (error) {
        results.total++;
        results.failed++;
        results.details.push({ name: testName, passed: false, details: error.message });
      }
    }

    return results;
  }

  async runIntegrationTests(testSuite) {
    const results = { total: 0, passed: 0, failed: 0, skipped: 0, details: [] };

    try {
      const passed = await testSuite.testCompleteWorkflow();
      results.total++;
      if (passed) results.passed++; else results.failed++;
      results.details.push({ name: 'Complete Workflow', passed, details: passed ? 'Success' : 'Failed' });
    } catch (error) {
      results.total++;
      results.failed++;
      results.details.push({ name: 'Complete Workflow', passed: false, details: error.message });
    }

    return results;
  }

  generateReport() {
    const duration = this.results.endTime - this.results.startTime;
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);

    console.log('\n🎯 COMPREHENSIVE TEST REPORT');
    console.log('============================');
    console.log(`📊 Total Tests: ${this.results.total}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⏭️  Skipped: ${this.results.skipped}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log(`⏱️  Total Duration: ${duration}ms`);

    console.log('\n📋 Category Breakdown:');
    Object.entries(this.results.categories).forEach(([category, data]) => {
      const categorySuccessRate = ((data.passed / data.total) * 100).toFixed(1);
      const status = data.critical ? (data.failed === 0 ? '✅' : '❌') : (data.failed === 0 ? '✅' : '⚠️');
      console.log(`   ${status} ${testCategories[category].name}: ${data.passed}/${data.total} (${categorySuccessRate}%) - ${data.duration}ms`);
    });

    // Critical failures
    const criticalFailures = Object.entries(this.results.categories)
      .filter(([_, data]) => data.critical && data.failed > 0)
      .map(([category, _]) => category);

    if (criticalFailures.length > 0) {
      console.log('\n🚨 CRITICAL FAILURES:');
      criticalFailures.forEach(category => {
        console.log(`   ❌ ${testCategories[category].name}`);
        const failedTests = this.results.categories[category].details.filter(test => !test.passed);
        failedTests.forEach(test => {
          console.log(`      - ${test.name}: ${test.details}`);
        });
      });
    }

    // Performance summary
    console.log('\n⚡ Performance Summary:');
    Object.entries(this.results.categories).forEach(([category, data]) => {
      if (data.duration > 5000) {
        console.log(`   ⚠️  ${testCategories[category].name}: ${data.duration}ms (slow)`);
      }
    });

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (this.results.failed > 0) {
      console.log('   🔧 Fix failing tests before deployment');
    }
    if (successRate < 95) {
      console.log('   📈 Improve test coverage and reliability');
    }
    if (duration > 60000) {
      console.log('   ⚡ Optimize test performance');
    }
    if (criticalFailures.length === 0 && successRate >= 95) {
      console.log('   🚀 System is ready for production deployment!');
    }

    return {
      success: this.results.failed === 0,
      successRate: parseFloat(successRate),
      criticalFailures: criticalFailures.length,
      duration: duration
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Backend Test Suite');
    console.log('============================================');
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log(`🔧 Configuration: ${JSON.stringify(testConfig, null, 2)}`);

    this.results.startTime = Date.now();

    const testSuite = new BackendTestSuite();

    // Run all test categories
    const categories = Object.keys(testCategories);
    for (const category of categories) {
      await this.runCategory(category, testSuite);
    }

    this.results.endTime = Date.now();

    // Generate final report
    const report = this.generateReport();

    // Cleanup
    await testSuite.cleanup();

    return report;
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new TestRunner();
  
  runner.runAllTests()
    .then(report => {
      const exitCode = report.success ? 0 : 1;
      console.log(`\n🏁 Test suite completed with exit code: ${exitCode}`);
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = TestRunner;
