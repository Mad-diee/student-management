"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabaseClient";
import { FaUserGraduate } from "react-icons/fa";
import Header from "../../components/Header";
export default function Profile() {
  const [student, setStudent] = useState(null);
  const [form, setForm] = useState({
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
    name: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [courses, setCourses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          router.replace("/login");
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role === "admin") {
          router.replace("/admin");
          return;
        }

        if (parsedUser.role !== "student") {
          router.replace("/search");
          return;
        }

        // If we get here, user is authenticated and is a student
        await fetchData(parsedUser.id);
      } catch (err) {
        console.error("Auth check error:", err);
        router.replace("/login");
      }
    };

    checkAuth();
  }, []);

  const fetchData = async (userId) => {
    try {
      setIsLoading(true);
      setError(null);
      const [
        { data: studentData },
        { data: coursesData },
        { data: majorsData },
        { data: departmentsData },
        { data: campusesData },
      ] = await Promise.all([
        supabase
          .from("students")
          .select(
            `
            *,
            course:courses(name),
            major:majors(name),
            department:departments(name),
            campus:campuses(name)
          `
          )
          .eq("user_id", userId)
          .single(),
        supabase.from("courses").select("*"),
        supabase.from("majors").select("*"),
        supabase.from("departments").select("*"),
        supabase.from("campuses").select("*"),
      ]);

      if (studentData) {
        setStudent(studentData);
        setForm({
          year_of_admission: studentData.year_of_admission || "",
          campus_id: studentData.campus_id || "",
          course_id: studentData.course_id || "",
          major_id: studentData.major_id || "",
          department_id: studentData.department_id || "",
          mobile: studentData.mobile || "",
          personal_email: studentData.personal_email || "",
          emergency_contact: studentData.emergency_contact || "",
          present_address: studentData.present_address || "",
          permanent_address: studentData.permanent_address || "",
          photo_url: studentData.photo_url || "",
          name: studentData.name || "",
        });
      }
      setCourses(coursesData || []);
      setMajors(majorsData || []);
      setDepartments(departmentsData || []);
      setCampuses(campusesData || []);
    } catch (err) {
      console.error("Error:", err);
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
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Convert integer fields
    const updateData = {
      ...form,
      year_of_admission: form.year_of_admission
        ? parseInt(form.year_of_admission)
        : null,
      campus_id: form.campus_id ? parseInt(form.campus_id) : null,
      course_id: form.course_id ? parseInt(form.course_id) : null,
      major_id: form.major_id ? parseInt(form.major_id) : null,
      department_id: form.department_id ? parseInt(form.department_id) : null,
      photo_url: form.photo_url || null,
      name: form.name,
    };

    try {
      const { error: updateError } = await supabase
        .from("students")
        .update(updateData)
        .eq("id", student.id);

      if (updateError) throw updateError;

      setSuccess("Profile updated successfully.");
      // Refresh student data
      const { data: updatedStudent } = await supabase
        .from("students")
        .select(
          `
          *,
          course:courses(name),
          major:majors(name),
          department:departments(name),
          campus:campuses(name)
        `
        )
        .eq("id", student.id)
        .single();
      setStudent(updatedStudent);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-orange-100 flex flex-col">
      <Header />
      <div className="w-full max-w-3xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-6 xs:p-10 animate-fade-in-up mt-8 mb-8">
        <div className="flex flex-col items-center mb-6">
          {form.photo_url || student?.photo_url ? (
            <img
              src={form.photo_url || student?.photo_url}
              alt="Profile Photo"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 mb-2 shadow"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-2 border-4 border-blue-200 shadow">
              <FaUserGraduate className="text-5xl text-blue-600" />
            </div>
          )}
          <h1 className="text-2xl xs:text-3xl font-bold font-playfair text-blue-700 text-center mb-1">
            My Profile
          </h1>
          <span className="text-gray-500 text-xs">Profile Photo</span>
        </div>
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3 text-green-700 text-sm text-center">
            {success}
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name ?? student?.name ?? ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
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
                value={
                  form.year_of_admission ?? student.year_of_admission ?? ""
                }
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campus
              </label>
              <select
                name="campus_id"
                value={form.campus_id ?? student.campus_id ?? ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
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
                value={form.course_id ?? student.course_id ?? ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
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
                value={form.major_id ?? student.major_id ?? ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
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
                value={form.department_id ?? student.department_id ?? ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
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
                value={form.mobile ?? student.mobile ?? ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Email
              </label>
              <input
                type="email"
                name="personal_email"
                value={form.personal_email ?? student.personal_email ?? ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact
              </label>
              <input
                type="tel"
                name="emergency_contact"
                value={
                  form.emergency_contact ?? student.emergency_contact ?? ""
                }
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Present Address
              </label>
              <textarea
                name="present_address"
                value={form.present_address ?? student.present_address ?? ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permanent Address
              </label>
              <textarea
                name="permanent_address"
                value={
                  form.permanent_address ?? student.permanent_address ?? ""
                }
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Photo URL
              </label>
              <input
                type="url"
                name="photo_url"
                value={form.photo_url ?? student?.photo_url ?? ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="w-full py-3 xs:py-4 bg-blue-600 text-white rounded-lg font-semibold text-base xs:text-lg shadow hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}