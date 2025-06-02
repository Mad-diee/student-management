"use client";

import { useEffect, useState } from "react";
import { FaSpinner, FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { studentsAPI } from "@/lib/apiClient";
import { privacySettingsAPI } from "@/lib/apiClient";

export default function StudentsDirectory() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [privacyMap, setPrivacyMap] = useState({});
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      setError(null);

      // Check admin status
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const userData = JSON.parse(user);
          setIsUserAdmin(userData.role === "admin");
        } catch (err) {
          console.error("Error parsing user data:", err);
        }
      }

      try {
        const { data } = await studentsAPI.getAll();
        let studentsArr = [];
        if (Array.isArray(data?.data)) {
          studentsArr = data.data;
        } else if (Array.isArray(data)) {
          studentsArr = data;
        } else if (data && typeof data === "object") {
          studentsArr = [data];
        } else {
          studentsArr = [];
        }
        setStudents(studentsArr);
        // Fetch privacy settings for each student
        const privacyResults = await Promise.all(
          studentsArr.map((student) =>
            privacySettingsAPI.getByStudentId(student.id)
          )
        );
        console.log("Privacy results:", privacyResults);
        const privacyMapObj = {};
        studentsArr.forEach((student, idx) => {
          const settingsArr = privacyResults[idx] || [];
          const fieldMap = {};
          settingsArr.forEach((s) => {
            fieldMap[s.field_name] = s.is_private;
          });
          privacyMapObj[student.id] = fieldMap;
        });
        setPrivacyMap(privacyMapObj);
        console.log("privacyMapObj", privacyMapObj);
      } catch (err) {
        setError("Failed to load students. Please try again.");
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleStudentClick = (studentId) => {
    router.push(`/student/${studentId}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            All Students
          </h1>
          <p className="text-lg text-gray-600">
            Browse the complete student directory
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 h-full">
          {students.length === 0 ? (
            <div className="col-span-full text-center text-gray-600">
              No students found.
            </div>
          ) : (
            students.map((student, index) => {
              console.log("Rendering student ID:", student.id);
              console.log("Privacy for this student:", privacyMap[student.id]);
              return (
                <div
                  key={student.id || index}
                  onClick={() => handleStudentClick(student.id)}
                  className="flex flex-col items-center p-6 bg-white border border-gray-200 rounded-2xl cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 shadow-md max-w-xs w-full min-h-[480px] h-full mx-auto"
                  style={{ minHeight: 480 }}
                >
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4 overflow-hidden border-4 border-blue-200 shadow">
                    {isUserAdmin || !privacyMap[student.id]?.photo_url ? (
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
                        <FaUser className="text-4xl text-blue-500" />
                      )
                    ) : (
                      <FaUser className="text-4xl text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
                    {isUserAdmin || !privacyMap[student.id]?.name
                      ? student.name || "-"
                      : "Hidden"}
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-2">
                    {isUserAdmin || !privacyMap[student.id]?.registered_number
                      ? student.registered_number || "-"
                      : "Hidden"}
                  </p>
                  <div className="w-full border-t border-gray-200 my-2"></div>
                  <div className="text-sm text-gray-800 w-full space-y-1">
                    <div>
                      <span className="font-medium">Year:</span>{" "}
                      {isUserAdmin || !privacyMap[student.id]?.year_of_admission
                        ? student.year_of_admission || "-"
                        : "Hidden"}
                    </div>
                    <div>
                      <span className="font-medium">Mobile:</span>{" "}
                      {isUserAdmin || !privacyMap[student.id]?.mobile
                        ? student.mobile || "-"
                        : "Hidden"}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {isUserAdmin || !privacyMap[student.id]?.personal_email
                        ? student.personal_email || "-"
                        : "Hidden"}
                    </div>
                    <div>
                      <span className="font-medium">Address:</span>{" "}
                      {isUserAdmin || !privacyMap[student.id]?.present_address
                        ? student.present_address || "-"
                        : "Hidden"}
                    </div>
                    <div>
                      <span className="font-medium">Department:</span>{" "}
                      {isUserAdmin || !privacyMap[student.id]?.department
                        ? student.department?.name || "-"
                        : "Hidden"}
                    </div>
                    <div>
                      <span className="font-medium">Course:</span>{" "}
                      {isUserAdmin || !privacyMap[student.id]?.course
                        ? student.course?.name || "-"
                        : "Hidden"}
                    </div>
                    <div>
                      <span className="font-medium">Campus:</span>{" "}
                      {isUserAdmin || !privacyMap[student.id]?.campus
                        ? student.campus?.name || "-"
                        : "Hidden"}
                    </div>
                    <div>
                      <span className="font-medium">Major:</span>{" "}
                      {isUserAdmin || !privacyMap[student.id]?.major
                        ? student.major?.name || "-"
                        : "Hidden"}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
