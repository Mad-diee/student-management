"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabaseClient";
import Header from "../../components/Header";
import {
  FaUser,
  FaIdBadge,
  FaCalendarAlt,
  FaUniversity,
  FaBook,
  FaGraduationCap,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaAddressCard,
  FaMapMarkerAlt,
  FaLock,
  FaUnlock,
} from "react-icons/fa";

export default function PrivacySettings() {
  const [privacySettings, setPrivacySettings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [campusMap, setCampusMap] = useState({});
  const [courseMap, setCourseMap] = useState({});
  const [majorMap, setMajorMap] = useState({});
  const [departmentMap, setDepartmentMap] = useState({});

  const fieldIcons = {
    name: <FaUser className="text-blue-500 mr-2" />,
    registered_number: <FaIdBadge className="text-blue-500 mr-2" />,
    year_of_admission: <FaCalendarAlt className="text-blue-500 mr-2" />,
    campus_id: <FaUniversity className="text-blue-500 mr-2" />,
    course_id: <FaBook className="text-blue-500 mr-2" />,
    major_id: <FaGraduationCap className="text-blue-500 mr-2" />,
    department_id: <FaBuilding className="text-blue-500 mr-2" />,
    mobile: <FaPhone className="text-blue-500 mr-2" />,
    personal_email: <FaEnvelope className="text-blue-500 mr-2" />,
    emergency_contact: <FaPhone className="text-blue-500 mr-2" />,
    present_address: <FaAddressCard className="text-blue-500 mr-2" />,
    permanent_address: <FaMapMarkerAlt className="text-blue-500 mr-2" />,
  };

  useEffect(() => {
    // Protect page: check localStorage for user and student role
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "student") {
      router.replace("/admin");
      return;
    }
    // Fetch privacy settings by user_id and fetch lookup tables
    const fetchAndInitPrivacy = async () => {
      setIsLoading(true);
      setError(null);
      // Fetch lookup tables
      const [
        { data: campuses },
        { data: courses },
        { data: majors },
        { data: departments },
      ] = await Promise.all([
        supabase.from("campuses").select("id, name"),
        supabase.from("courses").select("id, name"),
        supabase.from("majors").select("id, name"),
        supabase.from("departments").select("id, name"),
      ]);
      setCampusMap(
        Object.fromEntries((campuses || []).map((c) => [c.id, c.name]))
      );
      setCourseMap(
        Object.fromEntries((courses || []).map((c) => [c.id, c.name]))
      );
      setMajorMap(
        Object.fromEntries((majors || []).map((m) => [m.id, m.name]))
      );
      setDepartmentMap(
        Object.fromEntries((departments || []).map((d) => [d.id, d.name]))
      );
      // Fetch privacy settings
      const { data: privacyData, error: privacyError } = await supabase
        .from("privacy_settings")
        .select("*")
        .eq("user_id", parsedUser.id);
      if (privacyError) {
        setError("Error fetching privacy settings. Please try again.");
        setIsLoading(false);
        return;
      }
      if (!privacyData || privacyData.length === 0) {
        // Insert default privacy settings for all student fields (excluding created_at, photo_url, is_alumnus)
        const studentFields = [
          "name",
          "registered_number",
          "year_of_admission",
          "campus_id",
          "course_id",
          "major_id",
          "department_id",
          "mobile",
          "personal_email",
          "emergency_contact",
          "present_address",
          "permanent_address",
        ];
        const defaultSettings = studentFields.map((field) => ({
          user_id: parsedUser.id,
          field_name: field,
          is_private: false,
        }));
        const { error: insertError } = await supabase
          .from("privacy_settings")
          .insert(defaultSettings);
        if (insertError) {
          setError("Error initializing privacy settings. Please try again.");
          setIsLoading(false);
          return;
        }
        // Re-fetch after insert
        const { data: newPrivacyData } = await supabase
          .from("privacy_settings")
          .select("*")
          .eq("user_id", parsedUser.id);
        setPrivacySettings(newPrivacyData);
        setIsLoading(false);
        return;
      }
      setPrivacySettings(privacyData);
      setIsLoading(false);
    };
    fetchAndInitPrivacy();
  }, [router]);

  const handleTogglePrivacy = async (fieldName, currentValue) => {
    try {
      const storedUser = localStorage.getItem("user");
      const parsedUser = JSON.parse(storedUser);
      const { error } = await supabase
        .from("privacy_settings")
        .update({ is_private: !currentValue })
        .eq("user_id", parsedUser.id)
        .eq("field_name", fieldName);
      if (error) throw error;
      setPrivacySettings(
        privacySettings.map((setting) =>
          setting.field_name === fieldName
            ? { ...setting, is_private: !currentValue }
            : setting
        )
      );
    } catch (err) {
      setError("Error updating privacy setting. Please try again.");
      console.error("Error:", err);
    }
  };

  // Deduplicate privacySettings by field_name
  const uniquePrivacySettings = [];
  const seen = new Set();
  for (const setting of privacySettings) {
    if (!seen.has(setting.field_name)) {
      uniquePrivacySettings.push(setting);
      seen.add(setting.field_name);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-orange-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-orange-100 flex flex-col">
      <Header />
      {error ? (
        <div className="flex items-center justify-center flex-grow px-4">
          <div className="max-w-xl w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center shadow-md">
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full px-4 py-8 flex-grow">
          <div className="bg-white/90 rounded-2xl shadow-2xl p-6 md:p-8">
            <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center font-playfair">
              Privacy Settings
            </h1>
            <p className="text-gray-700 text-center mb-8">
              Control which information is visible to other students in the
              directory and search results.
            </p>
            <div className="space-y-6">
              {uniquePrivacySettings.map((setting) => {
                if (
                  [
                    "created_at",
                    "photo_url",
                    "is_alumnus",
                    "user_id",
                    "id",
                  ].includes(setting.field_name)
                )
                  return null;
                const isPrivate = setting.is_private;
                const fieldDisplayName = setting.field_name
                  .replace(/_/g, " ")
                  .replace(/id$/, "")
                  .trim();
                return (
                  <div
                    key={setting.field_name}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {fieldIcons[setting.field_name]}
                      <span className="text-gray-800 font-medium capitalize">
                        {fieldDisplayName}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        handleTogglePrivacy(setting.field_name, isPrivate)
                      }
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                        isPrivate
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      } shadow-sm`}
                    >
                      {isPrivate ? (
                        <>
                          <FaLock className="inline mr-1" /> Private
                        </>
                      ) : (
                        <>
                          <FaUnlock className="inline mr-1" /> Public
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
