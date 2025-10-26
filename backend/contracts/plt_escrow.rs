// PLT Escrow Smart Contract for ProofOfWork
// This contract handles secure PLT token escrow for location-verified payments

import concordium_std::*;

// Contract state
#[derive(Serial, Deserial, StateClone)]
struct EscrowState {
    // Mapping from job_id to escrow details
    escrows: StateMap<u64, EscrowDetails>,
    // Contract owner (business)
    owner: AccountAddress,
    // PLT token contract address
    plt_token: ContractAddress,
}

#[derive(Serial, Deserial, StateClone)]
struct EscrowDetails {
    // Business account that created the escrow
    business: AccountAddress,
    // Worker account that will receive payment
    worker: AccountAddress,
    // Amount of PLT tokens in escrow
    amount: u64,
    // Job location coordinates
    location_lat: i64,
    location_lng: i64,
    // Verification radius in meters
    radius: u64,
    // Escrow status
    status: EscrowStatus,
    // Creation timestamp
    created_at: u64,
}

#[derive(Serial, Deserial, StateClone)]
enum EscrowStatus {
    Created,
    Verified,
    Released,
    Cancelled,
}

// Contract functions
#[init(contract = "plt_escrow")]
fn init(ctx: &InitContext, state_builder: &mut StateBuilder) -> InitResult<State<EscrowState>> {
    let owner = ctx.owner();
    let plt_token = ctx.parameter_cursor().get()?;
    
    Ok(State::new(EscrowState {
        escrows: state_builder.new_map(),
        owner,
        plt_token,
    }))
}

// Create escrow for a job
#[receive(contract = "plt_escrow", name = "create_escrow")]
fn create_escrow(
    ctx: &ReceiveContext,
    host: &mut Host<EscrowState>,
) -> Result<(), Reject> {
    let job_id: u64 = ctx.parameter_cursor().get()?;
    let worker: AccountAddress = ctx.parameter_cursor().get()?;
    let amount: u64 = ctx.parameter_cursor().get()?;
    let location_lat: i64 = ctx.parameter_cursor().get()?;
    let location_lng: i64 = ctx.parameter_cursor().get()?;
    let radius: u64 = ctx.parameter_cursor().get()?;
    
    // Check if escrow already exists
    if host.state().escrows.contains(&job_id) {
        return Err(Reject::new(1)); // Escrow already exists
    }
    
    // Create escrow details
    let escrow = EscrowDetails {
        business: ctx.sender(),
        worker,
        amount,
        location_lat,
        location_lng,
        radius,
        status: EscrowStatus::Created,
        created_at: ctx.metadata().slot_time(),
    };
    
    // Store escrow
    host.state_mut().escrows.insert(job_id, escrow);
    
    // Transfer PLT tokens to escrow contract
    host.invoke_contract(
        &host.state().plt_token,
        &amount,
        "transfer",
        &(ctx.sender(), ContractAddress::new(ctx.self_address().index, ctx.self_address().subindex)),
    )?;
    
    Ok(())
}

// Verify location and release payment
#[receive(contract = "plt_escrow", name = "verify_and_release")]
fn verify_and_release(
    ctx: &ReceiveContext,
    host: &mut Host<EscrowState>,
) -> Result<(), Reject> {
    let job_id: u64 = ctx.parameter_cursor().get()?;
    let worker_lat: i64 = ctx.parameter_cursor().get()?;
    let worker_lng: i64 = ctx.parameter_cursor().get()?;
    
    // Get escrow details
    let escrow = host.state().escrows.get(&job_id).ok_or(Reject::new(2))?;
    
    // Check if escrow is in correct status
    match escrow.status {
        EscrowStatus::Created => {},
        _ => return Err(Reject::new(3)), // Invalid status
    }
    
    // Verify location (simplified distance calculation)
    let distance = calculate_distance(
        escrow.location_lat,
        escrow.location_lng,
        worker_lat,
        worker_lng,
    );
    
    if distance > escrow.radius as i64 {
        return Err(Reject::new(4)); // Location verification failed
    }
    
    // Update escrow status
    host.state_mut().escrows.get_mut(&job_id).unwrap().status = EscrowStatus::Verified;
    
    // Transfer PLT tokens to worker
    host.invoke_contract(
        &host.state().plt_token,
        &escrow.amount,
        "transfer",
        &(ContractAddress::new(ctx.self_address().index, ctx.self_address().subindex), escrow.worker),
    )?;
    
    // Update final status
    host.state_mut().escrows.get_mut(&job_id).unwrap().status = EscrowStatus::Released;
    
    Ok(())
}

// Cancel escrow (only business can cancel)
#[receive(contract = "plt_escrow", name = "cancel_escrow")]
fn cancel_escrow(
    ctx: &ReceiveContext,
    host: &mut Host<EscrowState>,
) -> Result<(), Reject> {
    let job_id: u64 = ctx.parameter_cursor().get()?;
    
    // Get escrow details
    let escrow = host.state().escrows.get(&job_id).ok_or(Reject::new(2))?;
    
    // Check if caller is the business
    if ctx.sender() != escrow.business {
        return Err(Reject::new(5)); // Unauthorized
    }
    
    // Check if escrow can be cancelled
    match escrow.status {
        EscrowStatus::Created => {},
        _ => return Err(Reject::new(3)), // Invalid status
    }
    
    // Update status
    host.state_mut().escrows.get_mut(&job_id).unwrap().status = EscrowStatus::Cancelled;
    
    // Return PLT tokens to business
    host.invoke_contract(
        &host.state().plt_token,
        &escrow.amount,
        "transfer",
        &(ContractAddress::new(ctx.self_address().index, ctx.self_address().subindex), escrow.business),
    )?;
    
    Ok(())
}

// Get escrow details
#[receive(contract = "plt_escrow", name = "get_escrow", mutable = false)]
fn get_escrow(
    ctx: &ReceiveContext,
    host: &Host<EscrowState>,
) -> Result<EscrowDetails, Reject> {
    let job_id: u64 = ctx.parameter_cursor().get()?;
    
    host.state().escrows.get(&job_id).ok_or(Reject::new(2))
}

// Helper function to calculate distance (simplified)
fn calculate_distance(lat1: i64, lng1: i64, lat2: i64, lng2: i64) -> i64 {
    // Simplified distance calculation for demo
    // In production, use proper Haversine formula
    let lat_diff = lat1 - lat2;
    let lng_diff = lng1 - lng2;
    (lat_diff * lat_diff + lng_diff * lng_diff).sqrt() as i64
}
