"use client";

import Link from "next/link";
import Layout from "../components/Layout";
import Head from "next/head";
import Header from "../components/Header";
import {
  FaUserGraduate,
  FaSearch,
  FaShieldAlt,
  FaUniversity,
  FaRocket,
  FaArrowRight,
  FaUserPlus,
  FaSignInAlt,
  FaGithub,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";
import { useState, useEffect } from "react";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          body { font-family: 'Inter', sans-serif; color: #1e293b; background: #f8fafc; }
          h1, h2, h3, h4, h5, h6, .font-playfair { font-family: 'Playfair Display', serif; }
        `}</style>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-orange-100 flex flex-col text-slate-800">
        <Header />
        {/* Hero Section */}
        <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 sm:px-2 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50">
          <h1 className="text-4xl md:text-5xl font-playfair font-semibold text-blue-800 mb-4 tracking-tight">
            <span className="block text-3xl xs:text-4xl md:text-5xl leading-tight">
              Welcome to the Modern Student Directory
            </span>
          </h1>
          <p className="text-base xs:text-lg md:text-2xl text-slate-700 mb-8 max-w-xl xs:max-w-2xl mx-auto font-normal">
            Effortlessly connect, discover, and manage students and alumni
            across all campuses <br /> with privacy and style.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <FaUserPlus /> Get Started
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-white border-2 border-orange-400 text-orange-600 rounded-lg font-semibold text-lg shadow-lg hover:bg-orange-50 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <FaSignInAlt /> Login
              </Link>
            </div>
          )}
        </section>
        {/* Features Section */}
        <section className="relative h-screen flex flex-col justify-center items-center bg-gradient-to-br from-white via-blue-50 to-orange-50 px-4 sm:px-2">
          <div className="max-w-6xl w-full mx-auto flex flex-col justify-center items-center h-full">
            <h2 className="text-3xl xs:text-4xl md:text-5xl font-playfair font-bold text-blue-800 mb-10 xs:mb-16 text-center">
              Why Choose Us?
            </h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-6 xs:gap-8 md:gap-10 w-full">
              <div
                className="flex flex-col items-center p-6 xs:p-8 md:p-10 bg-gradient-to-br from-blue-50 to-white rounded-3xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                <span className="w-16 xs:w-20 h-16 xs:h-20 flex items-center justify-center rounded-full bg-blue-100 mb-4 xs:mb-6 shadow-lg">
                  <FaUserGraduate className="text-3xl xs:text-4xl text-blue-600" />
                </span>
                <h3 className="font-playfair text-xl xs:text-2xl font-bold mb-2 xs:mb-3">
                  All Campuses
                </h3>
                <p className="text-slate-700 text-base xs:text-lg text-center">
                  Unified directory for every campus and college.
                </p>
              </div>
              <div
                className="flex flex-col items-center p-6 xs:p-8 md:p-10 bg-gradient-to-br from-orange-50 to-white rounded-3xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <span className="w-16 xs:w-20 h-16 xs:h-20 flex items-center justify-center rounded-full bg-orange-100 mb-4 xs:mb-6 shadow-lg">
                  <FaSearch className="text-3xl xs:text-4xl text-orange-400" />
                </span>
                <h3 className="font-playfair text-xl xs:text-2xl font-bold mb-2 xs:mb-3">
                  Powerful Search
                </h3>
                <p className="text-slate-700 text-base xs:text-lg text-center">
                  Find students by name, department, interests, and more.
                </p>
              </div>
              <div
                className="flex flex-col items-center p-6 xs:p-8 md:p-10 bg-gradient-to-br from-blue-50 to-white rounded-3xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <span className="w-16 xs:w-20 h-16 xs:h-20 flex items-center justify-center rounded-full bg-blue-100 mb-4 xs:mb-6 shadow-lg">
                  <FaShieldAlt className="text-3xl xs:text-4xl text-blue-600" />
                </span>
                <h3 className="font-playfair text-xl xs:text-2xl font-bold mb-2 xs:mb-3">
                  Privacy First
                </h3>
                <p className="text-slate-700 text-base xs:text-lg text-center">
                  Students control what information is public or private.
                </p>
              </div>
              <div
                className="flex flex-col items-center p-6 xs:p-8 md:p-10 bg-gradient-to-br from-orange-50 to-white rounded-3xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                <span className="w-16 xs:w-20 h-16 xs:h-20 flex items-center justify-center rounded-full bg-orange-100 mb-4 xs:mb-6 shadow-lg">
                  <FaRocket className="text-3xl xs:text-4xl text-orange-400" />
                </span>
                <h3 className="font-playfair text-xl xs:text-2xl font-bold mb-2 xs:mb-3">
                  Admin Tools
                </h3>
                <p className="text-slate-700 text-base xs:text-lg text-center">
                  Easy management for staff and administrators.
                </p>
              </div>
            </div>
          </div>
          {/* Section divider */}
          <div
            className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180"
            style={{ height: "60px" }}
          >
            <svg
              viewBox="0 0 500 60"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              <path
                d="M0,0 C150,60 350,0 500,60 L500,00 L0,0 Z"
                style={{ stroke: "none", fill: "#f8fafc" }}
              ></path>
            </svg>
          </div>
        </section>
        {/* How it Works Section */}
        <section className="relative h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-50 to-orange-50 px-4 sm:px-2">
          <div className="max-w-5xl w-full mx-auto flex flex-col justify-center items-center h-full">
            <h2 className="text-3xl xs:text-4xl md:text-5xl font-playfair font-bold text-blue-800 mb-10 xs:mb-16 text-center">
              How It Works
            </h2>
            <div className="flex flex-col xs:flex-row items-center justify-between gap-8 xs:gap-10 md:gap-12 w-full overflow-x-auto xs:overflow-x-visible">
              {/* Step 1 */}
              <div
                className="flex-1 min-w-[260px] flex flex-col items-center text-center relative animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="w-16 xs:w-20 h-16 xs:h-20 flex items-center justify-center rounded-full bg-blue-600 text-white text-3xl xs:text-4xl font-bold shadow-xl mb-4 xs:mb-6">
                  1
                </div>
                <div className="font-playfair text-xl xs:text-2xl font-bold mb-2 xs:mb-3">
                  Register or Login
                </div>
                <div className="text-slate-700 text-base xs:text-lg mb-2">
                  Create your account or sign in as a student, staff, or admin.
                </div>
                <div className="hidden md:block absolute top-8 xs:top-10 right-0 w-24 xs:w-36 h-2 bg-gradient-to-r from-blue-200 to-orange-200 rounded-full z-0"></div>
              </div>
              {/* Step 2 */}
              <div
                className="flex-1 min-w-[260px] flex flex-col items-center text-center relative animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="w-16 xs:w-20 h-16 xs:h-20 flex items-center justify-center rounded-full bg-orange-400 text-white text-3xl xs:text-4xl font-bold shadow-xl mb-4 xs:mb-6">
                  2
                </div>
                <div className="font-playfair text-xl xs:text-2xl font-bold mb-2 xs:mb-3">
                  Complete Your Profile
                </div>
                <div className="text-slate-700 text-base xs:text-lg mb-2">
                  Add your details, interests, and privacy preferences.
                </div>
                <div className="hidden md:block absolute top-8 xs:top-10 right-0 w-24 xs:w-36 h-2 bg-gradient-to-r from-orange-200 to-blue-200 rounded-full z-0"></div>
              </div>
              {/* Step 3 */}
              <div
                className="flex-1 min-w-[260px] flex flex-col items-center text-center animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="w-16 xs:w-20 h-16 xs:h-20 flex items-center justify-center rounded-full bg-blue-600 text-white text-3xl xs:text-4xl font-bold shadow-xl mb-4 xs:mb-6">
                  3
                </div>
                <div className="font-playfair text-xl xs:text-2xl font-bold mb-2 xs:mb-3">
                  Discover & Connect
                </div>
                <div className="text-slate-700 text-base xs:text-lg mb-2">
                  Search, explore, and connect with students and staff across
                  all campuses.
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Footer */}
        <footer className="mt-12 py-8 bg-white border-t border-blue-100 text-center text-slate-600 text-sm">
          <div className="container mx-auto px-4">
            &copy; {new Date().getFullYear()} Student Directory. All rights
            reserved.
          </div>
        </footer>
      </div>
    </>
  );
}
