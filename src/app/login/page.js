"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabaseClient";
import Link from "next/link";
import { FaUserGraduate } from "react-icons/fa";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", form.email)
        .eq("password", form.password)
        .single();
      if (userError || !userData) throw new Error("Invalid email or password");
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.id)
        .single();
      if (roleError || !roleData)
        throw new Error("No role found for this user");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...userData, role: roleData.role })
      );
      if (roleData.role === "admin") router.push("/admin");
      else router.push("/profile");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-orange-100 px-2 py-8">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-2xl p-6 xs:p-8 animate-fade-in-up">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3 shadow">
            <FaUserGraduate className="text-3xl text-blue-600" />
          </div>
          <h1 className="text-2xl xs:text-3xl font-bold font-playfair text-blue-700 text-center">
            Login
          </h1>
        </div>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5 xs:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 xs:p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 xs:p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 xs:py-4 bg-blue-600 text-white rounded-lg font-semibold text-base xs:text-lg shadow hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
