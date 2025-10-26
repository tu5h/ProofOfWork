import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key to bypass RLS
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

export async function POST(req: Request) {
  try {
    const { userId, displayName, role, businessName } = await req.json();

    console.log("Received profile creation request:", { userId, displayName, role, businessName });

    if (!userId || !displayName || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Insert profile using service role (bypasses RLS)
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        display_name: displayName,
        role: role,
        concordium_account: null,
        concordium_did: false,
      })
      .select()
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return NextResponse.json(
        { error: "Failed to create profile", details: profileError.message },
        { status: 500 }
      );
    }

    console.log("Profile created successfully:", profileData);

    // If business account, create business entry
    if (role === "business" && businessName) {
      console.log("Attempting to create business with:", {
        id: userId,
        company_name: businessName,
      });

      const { data: businessData, error: businessError } = await supabaseAdmin
        .from("businesses")
        .insert({
          id: userId,
          company_name: businessName,
        })
        .select()
        .single();

      if (businessError) {
        console.error("Business creation error:", businessError);
        console.error("Error code:", businessError.code);
        console.error("Error details:", businessError.details);
        console.error("Error hint:", businessError.hint);
        return NextResponse.json(
          { 
            error: "Profile created but business setup failed", 
            details: businessError.message,
            code: businessError.code,
            hint: businessError.hint 
          },
          { status: 500 }
        );
      }

      console.log("Business created successfully:", businessData);
    }

    // If worker account, create worker entry
    if (role === "worker") {
      console.log("Attempting to create worker with:", {
        id: userId,
        business_id: null,
      });

      const { data: workerData, error: workerError } = await supabaseAdmin
        .from("workers")
        .insert({
          id: userId,
          business_id: null, // Initially not associated with any business
        })
        .select()
        .single();

      if (workerError) {
        console.error("Worker creation error:", workerError);
        console.error("Error code:", workerError.code);
        console.error("Error details:", workerError.details);
        console.error("Error hint:", workerError.hint);
        return NextResponse.json(
          { 
            error: "Profile created but worker setup failed", 
            details: workerError.message,
            code: workerError.code,
            hint: workerError.hint 
          },
          { status: 500 }
        );
      }

      console.log("Worker created successfully:", workerData);
    }

    return NextResponse.json(
      { message: "Profile created successfully", profile: profileData },
      { status: 201 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}