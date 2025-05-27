"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../supabaseClient";
import {
  FaGraduationCap,
  FaUniversity,
  FaBook,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUser,
  FaBriefcase,
  FaStar,
  FaArrowLeft,
  FaRegAddressBook,
} from "react-icons/fa";
import Header from "../../../components/Header";

export default function StudentDetail() {
  const params = useParams();
  const studentId = params.id;
  const [student, setStudent] = useState(null);
  const [privacy, setPrivacy] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      setIsLoading(true);
      setError(null);
      // Get logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let admin = false;
      if (user) {
        const { data: staffData } = await supabase
          .from("staff")
          .select("id")
          .eq("user_id", user.id)
          .single();
        admin = !!staffData;
        setIsAdmin(admin);
      }
      // Fetch student with joins
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select(
          `
          *,
          campus:campuses(name),
          course:courses(name),
          major:majors(name),
          department:departments(name),
          student_co_curricular_interests:student_co_curricular_interests(*, interest:co_curricular_interests(name)),
          student_extra_curricular_interests(name),
          student_hobbies(name),
          student_internships(company_name, position, start_date, end_date, description),
          student_job_offers(company_name, position, offer_date, status)
        `
        )
        .eq("id", studentId)
        .single();
      if (studentError || !studentData) {
        setError("Student not found.");
        setIsLoading(false);
        return;
      }
      setStudent(studentData);
      // Fetch privacy settings by user_id
      const { data: privacyData } = await supabase
        .from("privacy_settings")
        .select("field_name, is_private")
        .eq("user_id", studentData.user_id);
      const privacyMap = {};
      if (privacyData) {
        privacyData.forEach((row) => {
          privacyMap[row.field_name] = row.is_private;
        });
      }
      setPrivacy(privacyMap);
      setIsLoading(false);
    };
    fetchStudent();
  }, [studentId]);

  const showField = (field) => {
    if (isAdmin) return true;
    return !privacy[field];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-orange-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-orange-100 px-2">
        <div className="max-w-xl w-full bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-center shadow-xl animate-fade-in-up">
          {error}
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-orange-100">
      <Header />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 rounded-2xl shadow-2xl p-6 xs:p-10 animate-fade-in-up relative">
          {/* Back Button */}
          <button
            onClick={() => history.back()}
            className="absolute top-6 left-6 text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-1"
          >
            <FaArrowLeft /> <span className="hidden xs:inline">Back</span>
          </button>
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-10 mt-4 text-center">
            {/* Avatar */}
            {student.photo_url && showField("photo_url") ? (
              <img
                src={student.photo_url}
                alt={student.name}
                className="w-36 h-36 rounded-full object-cover mb-4 border-4 border-blue-200 shadow-lg"
              />
            ) : (
              <div className="w-36 h-36 rounded-full bg-blue-100 flex items-center justify-center mb-4 border-4 border-blue-200 shadow-lg">
                <FaUser className="text-6xl text-blue-600" />
              </div>
            )}
            {/* Name */}
            <h1 className="text-3xl xs:text-4xl font-bold font-playfair text-blue-700 mb-3">
              {student.name}
            </h1>
            {/* Academic Details */}
            <div className="text-gray-600 text-sm xs:text-base flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mb-3">
              {student.major?.name && (
                <span className="flex items-center gap-1">
                  <FaGraduationCap className="text-blue-400" />
                  {student.major.name}
                </span>
              )}
              {student.department?.name && (
                <span className="flex items-center gap-1">
                  <FaBuilding className="text-blue-400" />
                  {student.department.name}
                </span>
              )}
              {student.course?.name && (
                <span className="flex items-center gap-1">
                  <FaBook className="text-blue-400" />
                  {student.course.name}
                </span>
              )}
              {student.campus?.name && (
                <span className="flex items-center gap-1">
                  <FaUniversity className="text-blue-400" />
                  {student.campus.name}
                </span>
              )}
              {student.year_of_admission && (
                <span className="flex items-center gap-1 text-gray-500">
                  Year of Joining: {student.year_of_admission}
                </span>
              )}
            </div>
            {student.is_alumnus && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2 shadow-sm">
                Alumnus
              </span>
            )}
          </div>
          {/* Registered Number (Always Visible) */}
          <div className="mb-8 border-b border-gray-200 pb-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
              <FaUser className="text-blue-500" /> Basic Information
            </h2>
            <p className="text-gray-700">
              <span className="font-semibold">Registered Number:</span>{" "}
              {student.registered_number}
            </p>
          </div>
          {/* Contact Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
              <FaEnvelope className="text-blue-500" /> Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              {showField("personal_email") && student.personal_email && (
                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-blue-400 flex-shrink-0" />
                  <span className="break-all">{student.personal_email}</span>
                </div>
              )}
              {showField("mobile") && student.mobile && (
                <div className="flex items-center gap-2">
                  <FaPhone className="text-blue-400 flex-shrink-0" />
                  <span>{student.mobile}</span>
                </div>
              )}
              {showField("emergency_contact") && student.emergency_contact && (
                <div className="flex items-center gap-2">
                  <FaPhone className="text-blue-400 flex-shrink-0" />
                  <span>Emergency: {student.emergency_contact}</span>
                </div>
              )}
            </div>
          </div>
          {/* Addresses */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
              <FaRegAddressBook className="text-blue-500" /> Addresses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              {showField("present_address") && student.present_address && (
                <div className="flex flex-col">
                  <span className="font-semibold mb-2">Present Address:</span>
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                    {student.present_address}
                  </div>
                </div>
              )}
              {showField("permanent_address") && student.permanent_address && (
                <div className="flex flex-col">
                  <span className="font-semibold mb-2">Permanent Address:</span>
                  <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                    {student.permanent_address}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Interests */}
          {(showField("student_co_curricular_interests") &&
            student.student_co_curricular_interests?.length > 0) ||
          (showField("student_extra_curricular_interests") &&
            student.student_extra_curricular_interests?.length > 0) ||
          (showField("student_hobbies") &&
            student.student_hobbies?.length > 0) ? (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
                <FaStar className="text-blue-500" /> Interests
              </h2>
              <div className="space-y-4">
                {showField("student_co_curricular_interests") &&
                  student.student_co_curricular_interests?.length > 0 && (
                    <div>
                      <span className="font-semibold text-gray-800 block mb-3">
                        Co-curricular:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {student.student_co_curricular_interests.map(
                          (item, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm shadow-sm"
                            >
                              {item.interest?.name}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                {showField("student_extra_curricular_interests") &&
                  student.student_extra_curricular_interests?.length > 0 && (
                    <div>
                      <span className="font-semibold text-gray-800 block mb-3">
                        Extra Curricular:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {student.student_extra_curricular_interests.map(
                          (item, idx) => (
                            <span
                              key={idx}
                              className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm shadow-sm"
                            >
                              {item.name}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                {showField("student_hobbies") &&
                  student.student_hobbies?.length > 0 && (
                    <div>
                      <span className="font-semibold text-gray-800 block mb-3">
                        Hobbies:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {student.student_hobbies.map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm shadow-sm"
                          >
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ) : null}
          {/* Professional Experience */}
          {(showField("student_internships") &&
            student.student_internships?.length > 0) ||
          (showField("student_job_offers") &&
            student.student_job_offers?.length > 0) ? (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
                <FaBriefcase className="text-blue-500" /> Professional
                Experience
              </h2>
              <div className="space-y-4">
                {showField("student_internships") &&
                  student.student_internships?.length > 0 && (
                    <div>
                      <span className="font-semibold text-gray-800 block mb-3">
                        Internships:
                      </span>
                      <ul className="space-y-3">
                        {student.student_internships.map((item, idx) => (
                          <li
                            key={idx}
                            className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
                          >
                            <div className="font-semibold text-gray-900 mb-1">
                              {item.company_name} - {item.position}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              {item.start_date} to {item.end_date}
                            </div>
                            <div className="text-sm text-gray-700">
                              {item.description}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                {showField("student_job_offers") &&
                  student.student_job_offers?.length > 0 && (
                    <div>
                      <span className="font-semibold text-gray-800 block mb-3">
                        Job Offers:
                      </span>
                      <ul className="space-y-3">
                        {student.student_job_offers.map((item, idx) => (
                          <li
                            key={idx}
                            className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200"
                          >
                            <div className="font-semibold text-gray-900 mb-1">
                              {item.company_name} - {item.position}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              Offer Date: {item.offer_date}
                            </div>
                            <div className="text-sm text-gray-700">
                              Status: {item.status}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
