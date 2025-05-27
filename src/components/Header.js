"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../supabaseClient"; // Adjust path as necessary
import { useRouter } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Header() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Check role from user_roles table if user exists
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", parsedUser.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setIsAdmin(false); // Default to not admin on error
        } else if (data?.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
      setIsLoading(false);
    };

    checkUser();
  }, []);

  const handleLogout = async () => {
    setIsLoading(true); // Optional: Show loading state during logout
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error logging out:", error);
      // Optionally display an error message to the user
      setIsLoading(false);
    } else {
      // Clear user from state and local storage
      setUser(null);
      setIsAdmin(false); // Reset admin status
      localStorage.removeItem("user");
      // Redirect to login page
      router.push("/login");
    }
  };

  // Basic placeholder navigation - will refine later
  return (
    <header className="bg-white/90 shadow-md backdrop-blur-sm p-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Site Title */}
        <Link
          href="/"
          className="text-xl font-bold text-blue-700 font-playfair text-2xl"
        >
          Student Directory
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:block">
          {!isLoading && (
            <ul className="flex space-x-6 items-center">
              {user ? (
                // User is logged in
                <>
                  {isAdmin ? (
                    // Admin Navigation
                    <>
                      <li>
                        <Link
                          href="/search"
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                        >
                          Search
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/students"
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                        >
                          Students
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/admin"
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                        >
                          Admin Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/admin/manage"
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                        >
                          Manage Data
                        </Link>
                      </li>
                    </>
                  ) : (
                    // Regular User Navigation
                    <>
                      <li>
                        <Link
                          href="/search"
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                        >
                          Search
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/students"
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                        >
                          Students
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/profile"
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                        >
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/privacy-settings"
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                        >
                          Privacy Settings
                        </Link>
                      </li>
                    </>
                  )}
                  {/* Common logged-in link (e.g., Logout)*/}
                  <li>
                    <button
                      onClick={handleLogout}
                      disabled={isLoading}
                      className="font-semibold transition-colors duration-200 text-blue-600 hover:text-blue-800"
                    >
                      {isLoading ? "Logging out..." : "Logout"}
                    </button>
                  </li>
                </>
              ) : (
                // User is not logged in
                <>
                  <li>
                    <Link
                      href="/login"
                      className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="text-blue-600 focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Dropdown) */}
      {!isLoading && isMobileMenuOpen && (
        <div className="sm:hidden bg-white/90 backdrop-blur-sm shadow-md mt-2 py-2 px-4">
          <ul className="flex flex-col space-y-2">
            {user ? (
              // User is logged in
              <>
                {isAdmin ? (
                  // Admin Navigation
                  <>
                    <li>
                      <Link
                        href="/search"
                        className="block px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Search
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/students"
                        className="block px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Students
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin"
                        className="block px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/manage"
                        className="block px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Manage Data
                      </Link>
                    </li>
                  </>
                ) : (
                  // Regular User Navigation
                  <>
                    <li>
                      <Link
                        href="/search"
                        className="block px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Search
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/students"
                        className="block px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Students
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/profile"
                        className="block px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy-settings"
                        className="block px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Privacy Settings
                      </Link>
                    </li>
                  </>
                )}
                {/* Common logged-in link (e.g., Logout)*/}
                <li>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    disabled={isLoading}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
                  >
                    {isLoading ? "Logging out..." : "Logout"}
                  </button>
                </li>
              </>
            ) : (
              // User is not logged in
              <>
                <li>
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-blue-700 hover:bg-blue-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
