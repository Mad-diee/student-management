import { supabase } from "../supabaseClient";

export const filterPrivateFields = (student) => {
  if (!student) return null;

  // Create a copy of the student object
  const filteredStudent = { ...student };

  // Get privacy settings from the student object
  const privacySettings = student.privacy_settings || [];

  // List of fields that can be private
  const privateFields = [
    "name",
    "mobile",
    "personal_email",
    "college_email",
    "emergency_contact",
    "present_address",
    "permanent_address",
    "hobbies",
    "extra_curricular_interests",
    "internships_done",
    "job_offers_received",
    "photo",
  ];

  // Filter out private fields
  privateFields.forEach((field) => {
    const isPrivate = privacySettings.some(
      (setting) => setting.field_name === field && setting.is_private
    );
    if (isPrivate) {
      delete filteredStudent[field];
    }
  });

  // Remove privacy_settings from the response
  delete filteredStudent.privacy_settings;

  return filteredStudent;
};

export const isFieldPrivate = async (studentId, fieldName) => {
  try {
    const { data, error } = await supabase
      .from("privacy_settings")
      .select("is_private")
      .eq("student_id", studentId)
      .eq("field_name", fieldName)
      .single();

    if (error) throw error;
    return data?.is_private || false;
  } catch (err) {
    console.error("Error checking privacy:", err);
    return false;
  }
};

export const updatePrivacySettings = async (
  studentId,
  fieldName,
  isPrivate
) => {
  try {
    const { error } = await supabase.from("privacy_settings").upsert({
      student_id: studentId,
      field_name: fieldName,
      is_private: isPrivate,
    });

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error updating privacy:", err);
    return false;
  }
};
