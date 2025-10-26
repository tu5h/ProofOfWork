import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(req: Request) {
  try {
    const { jobId, workerLat, workerLng, businessApproval } = await req.json();

    console.log('=== PAYMENT VALIDATION REQUEST ===');
    console.log('Job ID:', jobId);
    console.log('Worker Location:', { workerLat, workerLng });
    console.log('Backend URL:', BACKEND_URL);

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Fetch job with payment rules
    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("id, payment_rules, location, radius_m, status, worker_id, amount_plt")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      console.error('Job fetch error:', jobError);
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    console.log('Job found:', { 
      id: job.id, 
      status: job.status, 
      location: job.location,
      radius_m: job.radius_m,
      payment_rules: job.payment_rules 
    });

    const rules = job.payment_rules as any || {};
    const validationErrors: string[] = [];

    // Check if job is in correct status
    if (job.status !== "completed") {
      console.log('❌ Job status check failed:', job.status);
      validationErrors.push("Job must be marked as completed");
    } else {
      console.log('✅ Job status is completed');
    }

    // Rule 1: Require business approval
    if (rules.require_business_approval && !businessApproval) {
      console.log('❌ Business approval required but not provided');
      validationErrors.push("Business approval is required");
    }

    // Parse job location from PostGIS format
    let jobLat: number | undefined;
    let jobLng: number | undefined;

    if (typeof job.location === "string" && job.location.startsWith("0101000020E6100000")) {
      const coordBytes = job.location.slice(18);
      const lngHex = coordBytes.slice(0, 16);
      const latHex = coordBytes.slice(16, 32);
      
      const lngBytes = new Uint8Array(8);
      const latBytes = new Uint8Array(8);
      
      for (let i = 0; i < 8; i++) {
        lngBytes[i] = parseInt(lngHex.slice(i * 2, i * 2 + 2), 16);
        latBytes[i] = parseInt(latHex.slice(i * 2, i * 2 + 2), 16);
      }
      
      const lngView = new DataView(lngBytes.buffer);
      const latView = new DataView(latBytes.buffer);
      
      jobLng = lngView.getFloat64(0, true);
      jobLat = latView.getFloat64(0, true);
      
      console.log('Parsed job location from WKB:', { jobLat, jobLng });
    }

    // Rule 2: Location verification using Concordium backend
    if (rules.require_location_verification) {
      console.log('🔍 Location verification required');
      if (typeof workerLat !== "number" || typeof workerLng !== "number") {
        console.log('❌ Worker location not provided');
        validationErrors.push("Worker location is required");
      } else if (typeof jobLat === "number" && typeof jobLng === "number") {
        try {
          console.log('Calling backend verify-location:', {
            url: `${BACKEND_URL}/api/verify-location`,
            workerLat,
            workerLng,
            jobLat,
            jobLng,
            radius: job.radius_m
          });

          const verifyResponse = await fetch(`${BACKEND_URL}/api/verify-location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: workerLat,
              longitude: workerLng,
              targetLatitude: jobLat,
              targetLongitude: jobLng,
              radius: job.radius_m || 100
            })
          });

          const verifyResult = await verifyResponse.json();
          console.log('Backend verification result:', verifyResult);

          if (!verifyResult.verified) {
            console.log('❌ Location verification failed:', verifyResult);
            validationErrors.push(
              `Worker location verification failed: ${verifyResult.error || 'Outside allowed radius'}`
            );
          } else {
            console.log('✅ Location verified');
          }
        } catch (error) {
          console.error('❌ Location verification service error:', error);
          validationErrors.push('Location verification service unavailable');
        }
      }
    } else {
      console.log('ℹ️ Location verification not required');
    }

    // Rule 3: Completion zones
    if (rules.allowed_completion_zones && Array.isArray(rules.allowed_completion_zones) && rules.allowed_completion_zones.length > 0) {
      console.log('🔍 Checking completion zones:', rules.allowed_completion_zones.length);
      if (typeof workerLat !== "number" || typeof workerLng !== "number") {
        validationErrors.push("Worker location is required for zone verification");
      } else {
        let inAllowedZone = false;

        for (const zone of rules.allowed_completion_zones) {
          try {
            const verifyResponse = await fetch(`${BACKEND_URL}/api/verify-location`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                latitude: workerLat,
                longitude: workerLng,
                targetLatitude: zone.lat,
                targetLongitude: zone.lng,
                radius: zone.radius_m
              })
            });

            const verifyResult = await verifyResponse.json();
            
            if (verifyResult.verified) {
              inAllowedZone = true;
              console.log('✅ Worker in allowed completion zone');
              break;
            }
          } catch (error) {
            console.error('Zone verification error:', error);
          }
        }

        if (!inAllowedZone) {
          console.log('❌ Worker not in any allowed completion zone');
          validationErrors.push("Worker must be in an allowed completion zone");
        }
      }
    }

    console.log('=== VALIDATION COMPLETE ===');
    console.log('Errors:', validationErrors);

    // Return validation result
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          valid: false,
          errors: validationErrors,
          canRelease: false
        },
        { status: 200 }
      );
    }

    // If auto-release is enabled, trigger payment release
    if (rules.auto_release_on_completion) {
      console.log('💰 Auto-release enabled, triggering payment...');
      try {
        const releaseResponse = await fetch(`${BACKEND_URL}/api/release-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: jobId,
            workerAddress: job.worker_id,
            amount: job.amount_plt,
            workerLocation: { lat: workerLat, lng: workerLng }
          })
        });

        const releaseResult = await releaseResponse.json();

        if (releaseResult.success) {
          await supabaseAdmin
            .from("jobs")
            .update({ status: "paid" })
            .eq("id", jobId);

          return NextResponse.json({
            valid: true,
            errors: [],
            canRelease: true,
            autoRelease: true,
            released: true,
            transactionHash: releaseResult.transactionHash
          });
        }
      } catch (error) {
        console.error('Auto-release failed:', error);
        return NextResponse.json({
          valid: true,
          errors: [],
          canRelease: true,
          autoRelease: true,
          released: false,
          releaseError: 'Payment release failed'
        });
      }
    }

    return NextResponse.json(
      {
        valid: true,
        errors: [],
        canRelease: true,
        autoRelease: rules.auto_release_on_completion
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ Payment validation error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}