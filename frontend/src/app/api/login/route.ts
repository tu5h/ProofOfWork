// app/api/login/route.ts
import { NextResponse } from "next/server";
import { findUser } from "@/lib/users";


export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ message: "Missing username or password" }, { status: 400 });
  }

  const user = findUser(username, password);

  if (!user) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({ message: "Login successful" });
}
