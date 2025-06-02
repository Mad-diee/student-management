"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaGraduationCap, FaBuilding, FaBook } from "react-icons/fa";
import {
  studentsAPI,
  campusesAPI,
  coursesAPI,
  majorsAPI,
} from "@/lib/apiClient";

export default function Home() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCampuses: 0,
    totalCourses: 0,
    totalMajors: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const user = localStorage.getItem("user");
      if (!user) {
        router.push("/login");
        return;
      }
      await fetchStats();
    };
    checkAuth();
  }, [router]);

  const fetchStats = async () => {
    try {
      const [
        { data: studentsData },
        { data: campusesData },
        { data: coursesData },
        { data: majorsData },
      ] = await Promise.all([
        studentsAPI.getAll(),
        campusesAPI.getAll(),
        coursesAPI.getAll(),
        majorsAPI.getAll(),
      ]);

      setStats({
        totalStudents: Array.isArray(studentsData)
          ? studentsData.length
          : Array.isArray(studentsData?.data)
          ? studentsData.data.length
          : 0,
        totalCampuses: campusesData?.length || 0,
        totalCourses: coursesData?.length || 0,
        totalMajors: majorsData?.length || 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load dashboard statistics");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Student Portal
          </h1>
          <p className="text-lg text-gray-600">
            Your one-stop platform for student information
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Students Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaUser className="text-2xl text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.totalStudents}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Total Students
            </h3>
            <p className="text-gray-600 mt-2">
              Registered students in the system
            </p>
          </div>

          {/* Campuses Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaBuilding className="text-2xl text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.totalCampuses}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Campuses</h3>
            <p className="text-gray-600 mt-2">University campuses available</p>
          </div>

          {/* Courses Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaBook className="text-2xl text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.totalCourses}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Courses</h3>
            <p className="text-gray-600 mt-2">
              Available courses across campuses
            </p>
          </div>

          {/* Majors Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaGraduationCap className="text-2xl text-orange-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.totalMajors}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Majors</h3>
            <p className="text-gray-600 mt-2">Specializations offered</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => router.push("/search")}
              className="bg-white rounded-xl shadow-lg p-6 text-left transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Search Students
              </h3>
              <p className="text-gray-600">Find and view student profiles</p>
            </button>

            <button
              onClick={() => router.push("/profile")}
              className="bg-white rounded-xl shadow-lg p-6 text-left transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                View Profile
              </h3>
              <p className="text-gray-600">Access and update your profile</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
