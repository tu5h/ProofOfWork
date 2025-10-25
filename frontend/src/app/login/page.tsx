"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message || "Login failed");
    router.push("/business_dashboard");
  };

  return (
    // Use column on small screens, row on md+
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT / misc - clipped on md+ */}
      <section className="w-full md:w-7/12 clip-diagonal bg-blue-50 flex items-center justify-center p-12 ">
        <div className="max-w-md text-center">
          <br></br>
          <br></br>
          <h1 className="text-5xl font-bold mb-6">ProofOfWork</h1>
          <p className="text-lg text-gray-600">
            Welcome back to ProofOfWork.
          </p>
        </div>
      </section>

      {/* RIGHT / login */}
      <section className="w-full md:w-5/12 flex items-center justify-center p-10 bg-white">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-10">
          <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              className="border border-gray-300 p-3 rounded-lg text-lg"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              className="border border-gray-300 p-3 rounded-lg text-lg"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="bg-green-600 text-white py-3 rounded-lg text-lg hover:bg-blue-700 transition">
              Login
            </button>
          </form>

          <p className="mt-6 text-gray-600 text-center text-base">
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Register here
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}