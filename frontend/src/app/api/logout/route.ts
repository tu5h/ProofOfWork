import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseClient";

export async function POST() {
  const supabase = createServerClient();
  
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Logged out successfully" });
}