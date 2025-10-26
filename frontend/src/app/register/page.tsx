"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff, Building2, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<"business" | "worker">("worker");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate required fields based on account type
    if (accountType === "worker" && !username.trim()) {
      setError("Username is required for worker accounts.");
      setLoading(false);
      return;
    }

    if (accountType === "business" && !businessName.trim()) {
      setError("Business name is required for business accounts.");
      setLoading(false);
      return;
    }

    const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    if (!passwordRequirements.test(password)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
      );
      setLoading(false);
      return;
    }

    try {
      const displayName = accountType === "business" 
        ? businessName.trim() 
        : username.trim();

      // Step 1: Register with Supabase Auth WITH METADATA
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: displayName,
            account_type: accountType,
            display_name: displayName,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Check if this is actually a new user or existing user
      const isNewUser = authData.user?.identities && authData.user.identities.length > 0;

      if (!isNewUser) {
        setError("This email is already registered. Please login instead.");
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Step 2: Call API to create profile
      const response = await fetch('/api/register/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authData.user.id,
          displayName: displayName,
          role: accountType,
          businessName: accountType === "business" ? businessName.trim() : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Profile creation failed:", result);
        setError(result.error || "Profile creation failed. Please contact support.");
        setLoading(false);
        return;
      }

      // Success
      alert("Registration successful! Please check your email to verify your account before logging in.");
      router.push("/login");

    } catch (err: any) {
      console.error("Registration error:", err);
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
            Welcome to ProofOfWork.
          </p>
        </div>
      </section>

      {/* RIGHT / register */}
      <section className="w-full md:w-5/12 flex items-center justify-center p-10 bg-white">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-10">
          <h2 className="text-3xl font-bold mb-6 text-center">Register</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
              {error.includes("already registered") && (
                <div className="mt-2">
                  <a href="/login" className="underline font-medium">
                    Go to login →
                  </a>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* Account Type Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("worker")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${accountType === "worker"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                    }`}
                >
                  <User className="w-6 h-6" />
                  <span className="text-sm font-medium">Worker</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("business")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${accountType === "business"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                    }`}
                >
                  <Building2 className="w-6 h-6" />
                  <span className="text-sm font-medium">Business</span>
                </button>
              </div>
            </div>

            {/* Conditional input based on account type */}
            {accountType === "worker" ? (
              <input
                type="text"
                className="border border-gray-300 p-3 rounded-lg text-lg text-gray-900"
                placeholder="Username *"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            ) : (
              <input
                type="text"
                className="border border-gray-300 p-3 rounded-lg text-lg text-gray-900"
                placeholder="Business Name *"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            )}

            <input
              type="email"
              className="border border-gray-300 p-3 rounded-lg text-lg text-gray-900"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password input with toggle */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="border border-gray-300 p-3 pr-12 rounded-lg text-lg text-gray-900 w-full"
                placeholder="Password *"
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

            <p className="text-sm text-gray-500 -mt-2">
              Password must include:
              <br />• 8+ characters
              <br />• Uppercase, lowercase, number, special character
            </p>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-3 rounded-lg text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="mt-6 text-gray-600 text-center text-base">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}