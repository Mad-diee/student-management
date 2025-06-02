"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  studentsAPI,
  campusesAPI,
  coursesAPI,
  majorsAPI,
  departmentsAPI,
} from "@/lib/apiClient";
import { FaUser, FaSpinner } from "react-icons/fa";
import { useUser } from "@/context/UserContext";

export default function Profile() {
  const [studentData, setStudentData] = useState(null);
  const [form, setForm] = useState({
    name: "",
    registered_number: "",
    year_of_admission: "",
    campus_id: "",
    course_id: "",
    major_id: "",
    department_id: "",
    mobile: "",
    personal_email: "",
    emergency_contact: "",
    present_address: "",
    permanent_address: "",
    photo_url: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [campuses, setCampuses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  useEffect(() => {
    const checkAuth = async () => {
      if (userLoading) return;

      if (!user) {
        router.push("/login");
        return;
      }

      if (!user.student_id) {
        setError(
          "You don't have access to this page. Please login as a student."
        );
        router.push("/login");
        return;
      }

      await fetchData();
    };
    checkAuth();
  }, [user, userLoading, router]);

  const fetchData = async () => {
    try {
      const { data: student } = await studentsAPI.getById(user.student_id);
      console.log("Fetched student data:", student); // Debug log

      if (student && student.data) {
        const s = student.data;
        setStudentData(s);
        setForm({
          name: s.name || "",
          registered_number: s.registered_number || "",
          year_of_admission: s.year_of_admission || "",
          campus_id: s.campus?.id || "",
          course_id: s.course?.id || "",
          major_id: s.major?.id || "",
          department_id: s.department?.id || "",
          mobile: s.mobile || "",
          personal_email: s.personal_email || "",
          emergency_contact: s.emergency_contact || "",
          present_address: s.present_address || "",
          permanent_address: s.permanent_address || "",
          photo_url: s.photo_url || "",
        });
      }

      // Fetch all related data
      const [
        { data: campusesData },
        { data: coursesData },
        { data: majorsData },
        { data: departmentsData },
      ] = await Promise.all([
        campusesAPI.getAll(),
        coursesAPI.getAll(),
        majorsAPI.getAll(),
        departmentsAPI.getAll(),
      ]);

      setCampuses(campusesData || []);
      setCourses(coursesData || []);
      setMajors(majorsData || []);
      setDepartments(departmentsData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load profile data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData = {
        name: form.name,
        registered_number: form.registered_number,
        year_of_admission: form.year_of_admission,
        campus_id: form.campus_id,
        course_id: form.course_id,
        major_id: form.major_id,
        department_id: form.department_id,
        mobile: form.mobile,
        personal_email: form.personal_email,
        emergency_contact: form.emergency_contact,
        present_address: form.present_address,
        permanent_address: form.permanent_address,
        photo_url: form.photo_url,
      };

      await studentsAPI.update(user.student_id, updateData);
      setSuccess("Profile updated successfully!");
      await fetchData(); // Refresh data
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex items-center justify-center mb-8">
              <div className="w-40 h-40 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                {form.photo_url ? (
                  <img
                    src={form.photo_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-4xl text-blue-500" />
                )}
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Student Profile
            </h1>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registered Number
                  </label>
                  <input
                    type="text"
                    name="registered_number"
                    value={form.registered_number}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year of Admission
                  </label>
                  <input
                    type="number"
                    name="year_of_admission"
                    value={form.year_of_admission}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campus
                  </label>
                  <select
                    name="campus_id"
                    value={form.campus_id}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  >
                    <option value="">Select Campus</option>
                    {campuses.map((campus) => (
                      <option key={campus.id} value={campus.id}>
                        {campus.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course
                  </label>
                  <select
                    name="course_id"
                    value={form.course_id}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Major
                  </label>
                  <select
                    name="major_id"
                    value={form.major_id}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  >
                    <option value="">Select Major</option>
                    {majors.map((major) => (
                      <option key={major.id} value={major.id}>
                        {major.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    name="department_id"
                    value={form.department_id}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Personal Email
                  </label>
                  <input
                    type="email"
                    name="personal_email"
                    value={form.personal_email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    name="emergency_contact"
                    value={form.emergency_contact}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Present Address
                  </label>
                  <textarea
                    name="present_address"
                    value={form.present_address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permanent Address
                  </label>
                  <textarea
                    name="permanent_address"
                    value={form.permanent_address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Picture URL
                  </label>
                  <input
                    type="text"
                    name="photo_url"
                    value={form.photo_url}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
