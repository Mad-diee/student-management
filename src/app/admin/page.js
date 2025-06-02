"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaSpinner,
  FaUsers,
  FaBuilding,
  FaBook,
  FaGraduationCap,
} from "react-icons/fa";
import {
  studentsAPI,
  campusesAPI,
  coursesAPI,
  majorsAPI,
  departmentsAPI,
} from "@/lib/apiClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCampuses: 0,
    totalCourses: 0,
    totalMajors: 0,
    totalDepartments: 0,
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
      const userData = JSON.parse(user);
      if (userData.role !== "admin") {
        router.push("/");
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
        { data: departmentsData },
      ] = await Promise.all([
        studentsAPI.getAll(),
        campusesAPI.getAll(),
        coursesAPI.getAll(),
        majorsAPI.getAll(),
        departmentsAPI.getAll(),
      ]);

      setStats({
        totalStudents: studentsData?.data?.length || 0,
        totalCampuses: campusesData?.length || 0,
        totalCourses: coursesData?.length || 0,
        totalMajors: majorsData?.length || 0,
        totalDepartments: departmentsData?.length || 0,
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
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
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
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage your university's data and settings
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {/* Students Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaUsers className="text-2xl text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.totalStudents}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Students</h3>
            <p className="text-gray-600 mt-2">Total registered students</p>
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
            <p className="text-gray-600 mt-2">University campuses</p>
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
            <p className="text-gray-600 mt-2">Available courses</p>
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
            <p className="text-gray-600 mt-2">Specializations</p>
          </div>

          {/* Departments Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <FaBuilding className="text-2xl text-red-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.totalDepartments}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Departments</h3>
            <p className="text-gray-600 mt-2">Academic departments</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => router.push("/admin/manage")}
              className="bg-white rounded-xl shadow-lg p-6 text-left transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Manage Data
              </h3>
              <p className="text-gray-600">
                Add, edit, or remove campuses, courses, majors, and departments
              </p>
            </button>

            <button
              onClick={() => router.push("/search")}
              className="bg-white rounded-xl shadow-lg p-6 text-left transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Search Students
              </h3>
              <p className="text-gray-600">Find and manage student records</p>
            </button>

            <button
              onClick={() => router.push("/students")}
              className="bg-white rounded-xl shadow-lg p-6 text-left transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                View All Students
              </h3>
              <p className="text-gray-600">
                Browse the complete student directory
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
