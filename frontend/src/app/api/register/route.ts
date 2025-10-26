import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Password requirements
    const passwordRequirement = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRequirement.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character.",
        },
        { status: 400 }
      );
    }

    const supabase = await createServerClient()

    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0], // Optional username
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}