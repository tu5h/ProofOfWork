// Test setup and teardown
const { supabaseAdmin } = require('../config/supabase');

// Global test timeout
jest.setTimeout(30000);

// Setup before all tests
beforeAll(async () => {
  console.log('🧪 Setting up test environment...');
  
  // Verify database connection
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('count').limit(1);
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
    console.log('✅ Database connection verified');
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
    throw error;
  }
});

// Cleanup after all tests
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  
  // Clean up any test data
  try {
    // Remove test profiles
    await supabaseAdmin
      .from('profiles')
      .delete()
      .like('display_name', '%Test%');
    
    // Remove test jobs
    await supabaseAdmin
      .from('jobs')
      .delete()
      .like('title', '%Test%');
    
    console.log('✅ Test cleanup completed');
  } catch (error) {
    console.error('⚠️ Test cleanup warning:', error.message);
  }
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
