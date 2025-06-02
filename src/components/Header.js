"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/apiClient";
import { FaBars, FaTimes } from "react-icons/fa";
import { useUser } from "@/context/UserContext";

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { user, isAdmin, isLoading, updateUser } = useUser();

  const handleLogout = async () => {
    try {
      // Clear user data and token from local storage
      localStorage.removeItem("user");
      updateUser(null);
      // Redirect to login page
      router.push("/login");
    } catch (err) {
      console.error("Error logging out:", err);
      // Even if logout API fails, clear client-side state for perceived logout
      localStorage.removeItem("user");
      updateUser(null);
      router.push("/login");
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Site Title (always rendered) */}
          <div className="flex items-center">
            <Link
              href={`${isAdmin ? "/admin" : "/"}`}
              className="flex items-center flex-shrink-0 mr-6"
            >
              <span className="text-2xl font-playfair font-bold text-blue-600 hover:text-blue-800 transition-colors duration-200">
                {isAdmin ? "Admin Dashboard" : "Student Directory"}
              </span>
            </Link>
          </div>

          {isLoading ? (
            // Render a minimal placeholder while loading on client
            <div className="flex-1 flex justify-end">
              <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : (
            <>
              {/* Mobile menu button */}
              <div className="sm:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  aria-controls="mobile-menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <FaTimes className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <FaBars className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>

              {/* Desktop navigation */}
              <nav className="hidden sm:flex sm:items-center sm:ml-6 space-x-4">
                {user ? (
                  <>
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin"
                          className="text-gray-600 hover:bg-gray-100 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                          Admin Dashboard
                        </Link>
                        <Link
                          href="/admin/manage"
                          className="text-gray-600 hover:bg-gray-100 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                          Manage
                        </Link>
                      </>
                    )}
                    <Link
                      href="/search"
                      className="text-gray-600 hover:bg-gray-100 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Search
                    </Link>
                    {!isAdmin && (
                      <>
                        <Link
                          href="/profile"
                          className="text-gray-600 hover:bg-gray-100 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/privacy-settings"
                          className="text-gray-600 hover:bg-gray-100 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                          Privacy Settings
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="text-gray-600 hover:bg-gray-100 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-gray-600 hover:bg-gray-100 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="text-gray-600 hover:bg-gray-100 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {!isLoading && isMobileMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                {isAdmin && (
                  <>
                    <Link
                      href="/admin"
                      className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      href="/admin/manage"
                      className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Manage
                    </Link>
                  </>
                )}
                <Link
                  href="/search"
                  className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Search
                </Link>
                {!isAdmin && (
                  <>
                    <Link
                      href="/profile"
                      className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/privacy-settings"
                      className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Privacy Settings
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
