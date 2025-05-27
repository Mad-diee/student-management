"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./Layout.css"; // For custom background and floating shapes
import { useRouter } from "next/navigation";

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAdmin(parsedUser.role === "admin");
    } else {
      setUser(null);
      setIsAdmin(false);
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] relative overflow-x-hidden overflow-y-auto max-w-full">
      {/* Animated Floating Decorative Circles */}
      <div
        className="floating-circle circle1 pointer-events-none"
        style={{ maxWidth: "200px", maxHeight: "200px", left: 0, top: 0 }}
      ></div>
      <div
        className="floating-circle circle2 pointer-events-none"
        style={{ maxWidth: "260px", maxHeight: "260px", right: 0, top: "40%" }}
      ></div>
      <div
        className="floating-circle circle3 pointer-events-none"
        style={{
          maxWidth: "120px",
          maxHeight: "120px",
          left: "35%",
          bottom: 0,
        }}
      ></div>
      {/* Gradient Accent Shape */}
      <div
        className="absolute z-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[700px] h-[400px] bg-gradient-to-br from-blue-300 via-purple-200 to-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{ maxWidth: "90vw" }}
      ></div>
      {/* Navigation */}
      <nav className="relative z-10 bg-white/60 backdrop-blur-xl shadow-2xl rounded-b-2xl mx-auto max-w-6xl mt-6 px-8 py-4 flex items-center justify-between border-b border-blue-100">
        <div className="flex items-center gap-8">
          <span className="text-3xl font-extrabold text-blue-700 tracking-tight drop-shadow-lg logo-gradient">
            Student Directory
          </span>
          <div className="hidden md:flex gap-6 text-gray-600 font-medium">
            <Link href="/" className="hover:text-blue-700 transition">
              Home
            </Link>
            <Link href="/search" className="hover:text-blue-700 transition">
              Search
            </Link>
            {isAdmin && (
              <>
                <Link href="/admin" className="hover:text-blue-700 transition">
                  Admin
                </Link>
                <Link
                  href="/admin/manage"
                  className="hover:text-blue-700 transition"
                >
                  Manage
                </Link>
              </>
            )}
            {user && user.role === "student" && (
              <>
                <Link
                  href="/privacy-settings"
                  className="hover:text-blue-700 transition"
                >
                  Privacy Settings
                </Link>
                <Link
                  href="/profile"
                  className="hover:text-blue-700 transition"
                >
                  Profile
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-lg shadow-lg hover:scale-105 hover:shadow-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-lg shadow-lg hover:scale-105 hover:shadow-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto py-12 px-4 sm:px-8">
        <div className="rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl p-10 min-h-[60vh] flex flex-col justify-center border border-blue-100">
          {children}
        </div>
      </main>
      {/* Footer */}
      <footer className="relative z-10 bg-transparent mt-8">
        <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Student Directory. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
