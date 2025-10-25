"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Get account type from user metadata
      const accountType = data.user?.user_metadata?.account_type || "personal";

      // Redirect based on account type
      if (accountType === "business") {
        router.push("/dashboard/business");
      } else {
        router.push("/dashboard/personal");
      }

      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row pt-16 md:pt-0">
      {/* LEFT / misc - clipped on md+ */}
      <section className="w-full md:w-7/12 clip-diagonal bg-blue-50 flex items-center justify-center p-12">
        <div className="max-w-md text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">ProofOfWork</h1>
          <p className="text-base sm:text-lg text-gray-600">
            Welcome back to ProofOfWork.
          </p>
        </div>
      </section>

      {/* RIGHT / login */}
      <section className="w-full md:w-5/12 flex items-center justify-center p-10 bg-white">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-10">
          <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email"
              className="border border-gray-300 p-3 rounded-lg text-lg text-gray-900"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password input with toggle */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="border border-gray-300 p-3 pr-12 rounded-lg text-lg text-gray-900 w-full"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white py-3 rounded-lg text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-gray-600 text-center text-base">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Register here
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}