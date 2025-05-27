"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabaseClient";
import { FaUserPlus } from "react-icons/fa";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "student",
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
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { data: coursesData },
          { data: majorsData },
          { data: departmentsData },
          { data: campusesData },
        ] = await Promise.all([
          supabase.from("courses").select("*"),
          supabase.from("majors").select("*"),
          supabase.from("departments").select("*"),
          supabase.from("campuses").select("*"),
        ]);
        setCourses(coursesData || []);
        setMajors(majorsData || []);
        setDepartments(departmentsData || []);
        setCampuses(campusesData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load form data. Please try again.");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Create user record
      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert([
          {
            email: form.email,
            password: form.password, // In production, you should hash this password
          },
        ])
        .select()
        .single();

      if (userError) throw userError;

      // 2. Create user role record
      const { error: roleError } = await supabase.from("user_roles").insert([
        {
          user_id: userData.id,
          role: form.role,
        },
      ]);

      if (roleError) throw roleError;

      // 3. If student, create student record
      if (form.role === "student") {
        const { error: studentError } = await supabase.from("students").insert([
          {
            user_id: userData.id,
            name: form.name,
            registered_number: form.registered_number,
            year_of_admission: parseInt(form.year_of_admission),
            campus_id: parseInt(form.campus_id),
            course_id: parseInt(form.course_id),
            major_id: parseInt(form.major_id),
            department_id: parseInt(form.department_id),
            mobile: form.mobile,
            personal_email: form.personal_email,
            emergency_contact: form.emergency_contact,
            present_address: form.present_address,
            permanent_address: form.permanent_address,
          },
        ]);

        if (studentError) throw studentError;
      }

      setSuccess("Registration successful! Please login to continue.");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-orange-100 px-2 py-8">
      <div className="w-full max-w-2xl bg-white/90 rounded-2xl shadow-2xl p-6 xs:p-10 animate-fade-in-up">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-3 shadow">
            <FaUserPlus className="text-3xl text-blue-600" />
          </div>
          <h1 className="text-2xl xs:text-3xl font-bold font-playfair text-blue-700 text-center">
            Register
          </h1>
        </div>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-3 text-green-700 text-sm text-center">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-3 xs:p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full p-3 xs:p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full p-3 xs:p-4 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {form.role === "student" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
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
                      value={form.year_of_admission}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course
                    </label>
                    <select
                      name="course_id"
                      value={form.course_id}
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
                      Department
                    </label>
                    <select
                      name="department_id"
                      value={form.department_id}
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
                      Personal Email
                    </label>
                    <input
                      type="email"
                      name="personal_email"
                      value={form.personal_email}
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
                      value={form.present_address}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
                      rows="3"
                    />
                  </div>
                </>
              )}
            </div>
            {/* Right column */}
            <div className="space-y-4">
              {form.role === "student" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registered Number
                    </label>
                    <input
                      type="text"
                      name="registered_number"
                      value={form.registered_number}
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
                      value={form.campus_id}
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
                      Major
                    </label>
                    <select
                      name="major_id"
                      value={form.major_id}
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
                      Mobile
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={form.mobile}
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
                      value={form.emergency_contact}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Permanent Address
                    </label>
                    <textarea
                      name="permanent_address"
                      value={form.permanent_address}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
                      rows="3"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 xs:py-4 bg-blue-600 text-white rounded-lg font-semibold text-base xs:text-lg shadow hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
