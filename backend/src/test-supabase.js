const { supabase } = require('./config/supabase');

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase test failed:', error);
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testSupabaseConnection().then(() => process.exit(0));
}

module.exports = testSupabaseConnection;
