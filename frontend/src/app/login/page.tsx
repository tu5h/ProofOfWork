"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let loginEmail = emailOrUsername;

      // Check if input is an email or username
      const isEmail = emailOrUsername.includes("@");

      // If it's not an email, look up the email by username
      if (!isEmail) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("display_name", emailOrUsername)
          .single();

        if (profileError || !profileData) {
          setError("Invalid username or password");
          setLoading(false);
          return;
        }

        // Get the user's email from auth.users via RPC
        const { data: emailData, error: emailError } = await supabase
          .rpc('get_email_by_user_id', { user_id: profileData.id });

        if (emailError || !emailData) {
          setError("Invalid username or password");
          setLoading(false);
          return;
        }

        loginEmail = emailData;
      }

      // Login with email
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (authError) {
        setError("Invalid email/username or password");
        setLoading(false);
        return;
      }

      // Get user's role from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profileData) {
        console.error("Failed to fetch user profile:", profileError);
        setError("Login successful but failed to load profile. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (profileData.role === "business") {
        router.push("/dashboard/business");
      } else if (profileData.role === "worker") {
        router.push("/dashboard/worker");
      } else {
        // Fallback to generic dashboard
        router.push("/dashboard");
      }

    } catch (err: any) {
      console.error("Login error:", err);
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
              type="text"
              className="border border-gray-300 p-3 rounded-lg text-lg text-gray-900"
              placeholder="Email or Username"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
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
              className="bg-blue-600 text-white py-3 rounded-lg text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-gray-600 text-center text-base">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Register
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}