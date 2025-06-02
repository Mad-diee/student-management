"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  studentsAPI,
  campusesAPI,
  coursesAPI,
  majorsAPI,
  departmentsAPI,
  privacySettingsAPI,
  interestsAPI,
} from "@/lib/apiClient";
import {
  FaSpinner,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { filterPrivateFields } from "../../../utils/privacy";
import React from "react";

export default function StudentProfile({ params }) {
  // Next.js 14+ params is a promise, so unwrap with React.use() if needed
  const { id } = typeof params.then === "function" ? React.use(params) : params;
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [privacySettings, setPrivacySettings] = useState(null);
  const [interests, setInterests] = useState([]);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const user = localStorage.getItem("user");
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const userData = JSON.parse(user);
        setIsUserAdmin(userData.role === "admin");
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
      await fetchData();
    };
    checkAuth();
  }, [router, id]);

  const fetchData = async () => {
    try {
      const [{ data: studentData }, privacyData, { data: interestsData }] =
        await Promise.all([
          studentsAPI.getById(id),
          privacySettingsAPI.getByStudentId(id),
          interestsAPI.getByStudentId(id),
        ]);

      if (studentData && studentData.data) {
        setStudent(studentData.data);
      } else {
        setStudent(studentData);
      }
      setPrivacySettings(privacyData);
      setInterests(interestsData || []);

      console.log("Fetched privacy settings:", privacyData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load student data. Please try again.");
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
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Student not found</div>
      </div>
    );
  }

  const shouldShowField = (fieldName) => {
    // Admins can always see all fields
    if (isUserAdmin) return true;

    // If privacy settings haven't loaded yet, default to showing public fields (or hide if stricter default needed)
    // For now, let's assume if settings aren't loaded, we default to the *most private* state for non-admins.
    if (!privacySettings) return false; // Default to hiding if settings are not available

    // Find the specific setting for the field
    const setting = privacySettings.find((s) => s.field_name === fieldName);

    // If no specific setting exists, assume it's public
    if (!setting) return true; // Default to showing if no specific setting found

    // Otherwise, show the field only if it's NOT marked as private
    return !setting.is_private;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-4 border-blue-200">
                {shouldShowField("photo_url") ? (
                  student.photo_url ? (
                    <img
                      src={student.photo_url}
                      alt={student.name}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-profile.png";
                      }}
                    />
                  ) : (
                    <FaUser className="text-5xl text-blue-500" />
                  )
                ) : (
                  <FaUser className="text-5xl text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {shouldShowField("name") ? student.name : "Hidden"}
                </h1>
                <p className="text-lg text-gray-800 mb-4">
                  Reg. No:{" "}
                  {shouldShowField("registered_number")
                    ? student.registered_number || "-"
                    : "Hidden"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Academic Information
                    </h2>
                    <div className="space-y-2">
                      <p className="text-gray-800">
                        <span className="font-medium">Course:</span>{" "}
                        {shouldShowField("course")
                          ? student.course?.name || "-"
                          : "Hidden"}
                      </p>
                      <p className="text-gray-800">
                        <span className="font-medium">Major:</span>{" "}
                        {shouldShowField("major")
                          ? student.major?.name || "-"
                          : "Hidden"}
                      </p>
                      <p className="text-gray-800">
                        <span className="font-medium">Department:</span>{" "}
                        {shouldShowField("department")
                          ? student.department?.name || "-"
                          : "Hidden"}
                      </p>
                      <p className="text-gray-800">
                        <span className="font-medium">Year of Admission:</span>{" "}
                        {shouldShowField("year_of_admission")
                          ? student.year_of_admission || "-"
                          : "Hidden"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Contact Information
                    </h2>
                    <div className="space-y-2">
                      {student.email && shouldShowField("email") && (
                        <p className="text-gray-800 flex items-center gap-2">
                          <FaEnvelope className="text-blue-500" />
                          {student.email}
                        </p>
                      )}
                      {student.mobile && shouldShowField("mobile") && (
                        <p className="text-gray-800 flex items-center gap-2">
                          <FaPhone className="text-blue-500" />
                          {student.mobile}
                        </p>
                      )}
                      {student.personal_email &&
                        shouldShowField("personal_email") && (
                          <p className="text-gray-800 flex items-center gap-2">
                            <FaEnvelope className="text-blue-500" />
                            {student.personal_email}
                          </p>
                        )}
                      {student.present_address &&
                        shouldShowField("present_address") && (
                          <p className="text-gray-800 flex items-center gap-2">
                            <FaMapMarkerAlt className="text-blue-500" />
                            {student.present_address}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {interests.length > 0 && shouldShowField("interests") && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Co-curricular Interests
                </h2>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <span
                      key={interest.id}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {interest.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
