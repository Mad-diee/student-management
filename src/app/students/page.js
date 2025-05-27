"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { FaUserGraduate } from "react-icons/fa";
import Link from "next/link";
import Header from "../../components/Header";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [privacyMap, setPrivacyMap] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchStudents(JSON.parse(storedUser));
  }, []);

  const fetchStudents = async (user) => {
    try {
      let query = supabase
        .from("students")
        .select(
          `
          *,
          department:departments!department_id(name),
          major:majors!major_id(name),
          course:courses!course_id(name),
          campus:campuses!campus_id(name)
        `
        )
        .order("name", { ascending: true });
      if (!user || user.role !== "admin") {
        query = query.eq("is_alumnus", false);
      }
      const { data, error } = await query;

      if (error) throw error;
      // Fetch privacy settings for all students
      const userIds = (data || []).map((s) => s.user_id);
      const { data: privacyData } = await supabase
        .from("privacy_settings")
        .select("user_id, field_name, is_private")
        .in("user_id", userIds);
      // Build privacy map: { user_id: { field_name: is_private, ... }, ... }
      const privacyMap = {};
      (privacyData || []).forEach((row) => {
        if (!privacyMap[row.user_id]) privacyMap[row.user_id] = {};
        privacyMap[row.user_id][row.field_name] = row.is_private;
      });
      setPrivacyMap(privacyMap);
      setStudents(data);
    } catch (err) {
      setError("Error fetching students. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsAlumnus = async (studentId) => {
    try {
      const { error } = await supabase
        .from("students")
        .update({ is_alumnus: true })
        .eq("id", studentId);

      if (error) throw error;

      setStudents(
        students.map((student) =>
          student.id === studentId ? { ...student, is_alumnus: true } : student
        )
      );
    } catch (err) {
      setError("Error marking student as alumnus. Please try again.");
      console.error("Error:", err);
    }
  };

  // Helper to check privacy
  const isFieldVisible = (student, field) => {
    if (!privacyMap[student.user_id]) return true;
    return !privacyMap[student.user_id][field];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-orange-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-orange-100">
      <Header />
      <div className="max-w-7xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* View Toggle */}
        <div className="flex justify-end">
          <div className="inline-flex rounded-lg shadow bg-white/80 border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "text-blue-700 hover:bg-blue-50"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "text-blue-700 hover:bg-blue-50"
              }`}
            >
              Grid View
            </button>
          </div>
        </div>

        {/* Students Display */}
        {viewMode === "list" ? (
          <div className="space-y-4">
            {students.map((student) => (
              <Link
                href={`/students/${student.id}`}
                key={student.id}
                className="block"
              >
                <div className="bg-white/90 border border-gray-200 rounded-xl p-6 flex flex-col xs:flex-row items-start xs:space-x-8 shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer animate-fade-in-up">
                  {/* Avatar */}
                  <div className="w-28 h-28 rounded-full overflow-hidden border-3 border-blue-400 shadow-md mb-4 xs:mb-0 flex-shrink-0">
                    {student.photo_url ? (
                      <img
                        src={student.photo_url}
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                        <FaUserGraduate className="text-4xl text-blue-600" />
                      </div>
                    )}
                  </div>
                  {/* Details */}
                  <div className="flex-1 text-left">
                    <div className="flex flex-col md:flex-row md:items-start gap-y-4 gap-x-6">
                      <div>
                        {/* Name */}
                        <h3 className="text-xl font-bold text-blue-800 mb-1 font-playfair">
                          {isFieldVisible(student, "name")
                            ? student.name
                            : "Name Hidden By Privacy Settings"}
                        </h3>
                        {/* Academic Info */}
                        <div className="text-gray-700 text-sm space-y-1">
                          {isFieldVisible(student, "major_id") && (
                            <p>
                              <span className="font-semibold">Major:</span>{" "}
                              {student.major?.name || "-"}
                            </p>
                          )}
                          {isFieldVisible(student, "department_id") && (
                            <p>
                              <span className="font-semibold">Department:</span>{" "}
                              {student.department?.name || "-"}
                            </p>
                          )}
                          {isFieldVisible(student, "course_id") && (
                            <p>
                              <span className="font-semibold">Course:</span>{" "}
                              {student.course?.name || "-"}
                            </p>
                          )}
                          {isFieldVisible(student, "campus_id") && (
                            <p>
                              <span className="font-semibold">Campus:</span>{" "}
                              {student.campus?.name || "-"}
                            </p>
                          )}
                          {isFieldVisible(student, "year_of_admission") && (
                            <p>
                              <span className="font-semibold">Joined:</span>{" "}
                              {student.year_of_admission}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Actions/Status */}
                      <div className="flex flex-col items-start xs:items-end space-y-2 mt-3 md:mt-0">
                        {!student.is_alumnus &&
                          user?.role === "admin" &&
                          !student.is_alumnus && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleMarkAsAlumnus(student.id);
                              }}
                              className="px-4 py-2 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow transition-colors duration-200"
                            >
                              Mark as Alumnus
                            </button>
                          )}
                        {student.is_alumnus && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm">
                            Alumnus
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Contact Info (Visible based on privacy) */}
                    <div className="text-gray-700 text-sm mt-3 space-y-1">
                      {isFieldVisible(student, "personal_email") &&
                        student.personal_email && (
                          <p>
                            <span className="font-semibold">Email:</span>{" "}
                            {student.personal_email}
                          </p>
                        )}
                      {isFieldVisible(student, "mobile") && student.mobile && (
                        <p>
                          <span className="font-semibold">Mobile:</span>{" "}
                          {student.mobile}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {students.map((student) => (
              <Link
                href={`/students/${student.id}`}
                key={student.id}
                className="block"
              >
                <div className="bg-white/90 border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col items-center text-center p-6 cursor-pointer animate-fade-in-up">
                  {student.photo_url ? (
                    <img
                      src={student.photo_url}
                      alt={student.name}
                      className="w-28 h-28 rounded-full object-cover border-3 border-blue-300 mb-4 shadow-md"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center border-3 border-blue-300 mb-4 shadow-md">
                      <FaUserGraduate className="text-4xl text-blue-600" />
                    </div>
                  )}
                  {/* Name */}
                  <h3 className="text-lg font-bold text-blue-800 mb-2 font-playfair">
                    {isFieldVisible(student, "name")
                      ? student.name
                      : "Name Hidden By Privacy"}
                  </h3>
                  {/* Academic Info */}
                  <div className="text-gray-700 text-xs space-y-1 mb-3">
                    {isFieldVisible(student, "major_id") && (
                      <p>
                        <span className="font-semibold">Major:</span>{" "}
                        {student.major?.name || "-"}
                      </p>
                    )}
                    {isFieldVisible(student, "department_id") && (
                      <p>
                        <span className="font-semibold">Dept:</span>{" "}
                        {student.department?.name || "-"}
                      </p>
                    )}
                    {isFieldVisible(student, "course_id") && (
                      <p>
                        <span className="font-semibold">Course:</span>{" "}
                        {student.course?.name || "-"}
                      </p>
                    )}
                    {isFieldVisible(student, "campus_id") && (
                      <p>
                        <span className="font-semibold">Campus:</span>{" "}
                        {student.campus?.name || "-"}
                      </p>
                    )}
                    {isFieldVisible(student, "year_of_admission") && (
                      <p>
                        <span className="font-semibold">Joined:</span>{" "}
                        {student.year_of_admission}
                      </p>
                    )}
                  </div>
                  {/* Actions/Status */}
                  <div className="w-full">
                    {!student.is_alumnus &&
                      user?.role === "admin" &&
                      !student.is_alumnus && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleMarkAsAlumnus(student.id);
                          }}
                          className="w-full px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow transition-colors duration-200"
                        >
                          Mark as Alumnus
                        </button>
                      )}
                    {student.is_alumnus && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 shadow-sm">
                        Alumnus
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
