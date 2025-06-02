// This is the canonical privacy settings page. All privacy settings UI and logic should be maintained here.
// /privacy has been removed in favor of this file.
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { privacySettingsAPI } from "@/lib/apiClient";

const FIELDS = [
  { key: "name", label: "Name" },
  { key: "registered_number", label: "Registered Number" },
  { key: "year_of_admission", label: "Year of Admission" },
  { key: "mobile", label: "Mobile" },
  { key: "personal_email", label: "Personal Email" },
  { key: "emergency_contact", label: "Emergency Contact" },
  { key: "present_address", label: "Present Address" },
  { key: "permanent_address", label: "Permanent Address" },
  { key: "photo_url", label: "Profile Picture URL" },
];

export default function PrivacySettings() {
  const [privacySettings, setPrivacySettings] = useState({});
  const [updating, setUpdating] = useState({});
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
      return;
    }
    const userData = JSON.parse(user);
    fetchSettings(userData.id);
  }, [router]);

  const fetchSettings = async (userId) => {
    setError(null);
    try {
      const apiResponse = await privacySettingsAPI.getByUserId(userId);
      console.log("Raw API response for privacy settings:", apiResponse);
      const data = apiResponse?.data || apiResponse; // Try accessing .data or use the whole response
      console.log("Extracted data for privacy settings:", data);

      if (apiResponse?.error) {
        throw apiResponse.error;
      }

      const settingsObj = {};
      // Ensure data is an array before iterating
      (Array.isArray(data) ? data : []).forEach((s) => {
        settingsObj[s.field_name] = Boolean(s.is_private);
      });
      console.log("Processed settingsObj before setting state:", settingsObj);
      setPrivacySettings(settingsObj);
    } catch (err) {
      setError("Failed to load privacy settings.");
    }
  };

  const handleToggle = async (field) => {
    setError(null);
    setUpdating((prev) => ({ ...prev, [field]: true }));
    const user = JSON.parse(localStorage.getItem("user"));
    const current = privacySettings[field] || false;
    setPrivacySettings((prev) => ({ ...prev, [field]: !current }));
    try {
      const { error } = await privacySettingsAPI.updateByUserAndField(
        user.id,
        field,
        { is_private: !current }
      );
      if (error) throw error;
    } catch (err) {
      setPrivacySettings((prev) => ({ ...prev, [field]: current }));
      setError("Failed to update privacy setting.");
    } finally {
      setUpdating((prev) => ({ ...prev, [field]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-blue-800 mb-8 text-center">
          Privacy Settings
        </h1>
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center">
            {error}
          </div>
        )}
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FIELDS.map((field) => {
              const isPrivate = privacySettings[field.key] || false;
              return (
                <div
                  key={field.key}
                  className="flex items-center justify-between"
                >
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggle(field.key)}
                    disabled={updating[field.key]}
                    className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ml-4 ${
                      isPrivate
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                    }`}
                  >
                    {updating[field.key]
                      ? "Updating..."
                      : isPrivate
                      ? "Make Public"
                      : "Make Private"}
                  </button>
                </div>
              );
            })}
          </div>
        </form>
      </div>
    </div>
  );
}
