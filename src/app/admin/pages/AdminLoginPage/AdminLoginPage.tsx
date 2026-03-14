import { Link, navigateTo } from "@mongez/react-router";
import { useState } from "react";
import { AiOutlineLock, AiOutlineMail } from "react-icons/ai";
import { authService } from "services/supabase";
import URLS from "shared/utils/urls";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Authenticate with Supabase
      const { user } = await authService.login(email, password);

      if (!user) {
        throw new Error("Authentication failed");
      }

      // Store user data
      localStorage.setItem(
        "adminUser",
        JSON.stringify({
          id: user.id,
          name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
          email: user.email,
        }),
      );

      // Navigate to admin dashboard
      navigateTo(URLS.admin.dashboard);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[#2b38d1] rounded-full flex items-center justify-center mb-4">
            <AiOutlineLock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-5">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AiOutlineMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-borderLight rounded-lg focus:ring-2 focus:ring-[#2b38d1] focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AiOutlineLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 border border-borderLight rounded-lg focus:ring-2 focus:ring-[#2b38d1] focus:border-transparent outline-none transition"
                  minLength={6}
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2b38d1] hover:bg-[#2330b0] text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          {/* Back to Home Link */}
          <div className="text-center">
            <Link
              to={URLS.home}
              className="text-sm text-[#2b38d1] hover:text-[#2330b0] font-medium">
              ← Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
