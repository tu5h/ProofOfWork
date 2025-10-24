// app/api/register/route.ts
import { NextResponse } from "next/server";
import { addUser, userExists } from "@/lib/users";


export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ message: "Missing username or password" }, { status: 400 });
  }

  if (userExists(username)) {
    return NextResponse.json({ message: "User already exists" }, { status: 400 });
  }

  addUser({username, password});
  return NextResponse.json({ message: "Registration successful"});
}
