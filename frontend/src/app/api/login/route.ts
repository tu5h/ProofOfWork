import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Login with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return user data and session 
    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata?.username,
        },
        session: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}