const { supabaseAdmin } = require('../config/supabase');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting Supabase database seeding...');

    // Create demo profiles
    const profiles = [
      {
        role: 'business',
        display_name: 'CleanPro Services',
        concordium_account: 'concordium_business_123',
        concordium_did: true
      },
      {
        role: 'business', 
        display_name: 'PetCare Solutions',
        concordium_account: 'concordium_business_456',
        concordium_did: true
      },
      {
        role: 'worker',
        display_name: 'Alex Johnson',
        concordium_account: 'concordium_worker_456',
        concordium_did: true
      },
      {
        role: 'worker',
        display_name: 'Sarah Chen', 
        concordium_account: 'concordium_worker_789',
        concordium_did: true
      }
    ];

    const { data: createdProfiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(profiles)
      .select();

    if (profileError) throw profileError;

    console.log(`👥 Created ${createdProfiles.length} profiles`);

    // Create businesses
    const businesses = [
      { id: createdProfiles[0].id, company_name: 'CleanPro Services' },
      { id: createdProfiles[1].id, company_name: 'PetCare Solutions' }
    ];

    const { error: businessError } = await supabaseAdmin
      .from('businesses')
      .insert(businesses);

    if (businessError) throw businessError;

    // Create workers
    const workers = [
      { id: createdProfiles[2].id },
      { id: createdProfiles[3].id }
    ];

    const { error: workerError } = await supabaseAdmin
      .from('workers')
      .insert(workers);

    if (workerError) throw workerError;

    // Create demo jobs
    const jobs = [
      {
        business_id: createdProfiles[0].id,
        title: 'Office Cleaning - Downtown',
        description: 'Deep clean office space including floors, windows, and bathrooms.',
        amount_plt: 25.0,
        location: { latitude: 40.7589, longitude: -73.9851 },
        radius_m: 150,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        business_id: createdProfiles[1].id,
        title: 'Dog Walking Service',
        description: 'Walk two golden retrievers for 1 hour in Central Park.',
        amount_plt: 15.0,
        location: { latitude: 40.7829, longitude: -73.9654 },
        radius_m: 200,
        status: 'assigned',
        worker_id: createdProfiles[2].id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const { data: createdJobs, error: jobError } = await supabaseAdmin
      .from('jobs')
      .insert(jobs)
      .select();

    if (jobError) throw jobError;

    // Create escrow records
    const escrows = createdJobs.map(job => ({
      job_id: job.id,
      status: 'none',
      simulated: true,
      updated_at: new Date().toISOString()
    }));

    const { error: escrowError } = await supabaseAdmin
      .from('escrows')
      .insert(escrows);

    if (escrowError) throw escrowError;

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`- ${profiles.filter(p => p.role === 'business').length} Business accounts`);
    console.log(`- ${profiles.filter(p => p.role === 'worker').length} Worker accounts`);
    console.log(`- ${jobs.length} Demo jobs`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
};

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = seedDatabase;
