const { supabaseAdmin } = require('../config/supabase');

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...');

    // First, let's create some test profiles without the auth.users constraint
    // We'll use direct UUIDs to bypass the foreign key constraint for demo
    
    const testProfiles = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        role: 'business',
        display_name: 'Demo Cleaning Company',
        concordium_account: null,
        concordium_did: false
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002', 
        role: 'worker',
        display_name: 'John Doe',
        concordium_account: null,
        concordium_did: false
      }
    ];

    // Insert profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(testProfiles)
      .select();

    if (profileError) {
      console.error('❌ Profile creation error:', profileError);
      return;
    }

    console.log('✅ Created profiles:', profiles.length);

    // Create business record
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440001',
        company_name: 'Demo Cleaning Company'
      })
      .select();

    if (businessError) {
      console.error('❌ Business creation error:', businessError);
    } else {
      console.log('✅ Created business:', business[0].company_name);
    }

    // Create worker record
    const { data: worker, error: workerError } = await supabaseAdmin
      .from('workers')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440002'
      })
      .select();

    if (workerError) {
      console.error('❌ Worker creation error:', workerError);
    } else {
      console.log('✅ Created worker');
    }

    // Create a test job
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .insert({
        business_id: '550e8400-e29b-41d4-a716-446655440001',
        worker_id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Office Cleaning',
        description: 'Clean the office space including desks, floors, and bathrooms',
        amount_plt: 50.00,
        location: '(40.7128, -74.0060)', // New York coordinates
        radius_m: 100,
        status: 'open'
      })
      .select();

    if (jobError) {
      console.error('❌ Job creation error:', jobError);
    } else {
      console.log('✅ Created job:', job[0].title);
    }

    console.log('🎉 Test data seeded successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedTestData().then(() => process.exit(0));
}

module.exports = seedTestData;
