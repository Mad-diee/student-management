"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabaseClient";
import {
  FaUserGraduate,
  FaUserTie,
  FaUsers,
  FaUniversity,
  FaTrash,
} from "react-icons/fa";
import Header from "../../components/Header";

export default function Admin() {
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [courses, setCourses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department_id: "",
    campus_id: "",
    designation: "",
    mobile: "",
  });
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
        console.log("User role:", parsedUser.role); // Debug log

        // Check if user has admin role
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", parsedUser.id)
          .single();

        if (roleError || !roleData || roleData.role !== "admin") {
          console.log("Not an admin, redirecting to profile"); // Debug log
          router.replace("/profile");
          return;
        }

        // If we get here, user is authenticated and is an admin
        console.log("Admin access granted"); // Debug log
        await fetchData();
      } catch (err) {
        console.error("Auth check error:", err);
        router.replace("/login");
      }
    };

    checkAuth();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [
        { data: studentsData },
        { data: staffData },
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
            department:departments(name)
          `
          )
          .eq("is_alumnus", false),
        supabase.from("staff").select(`
            *,
            department:departments(name)
          `),
        supabase.from("courses").select("*"),
        supabase.from("majors").select("*"),
        supabase.from("departments").select("*"),
        supabase.from("campuses").select("*"),
      ]);

      setStudents(studentsData || []);
      setStaff(staffData || []);
      setCourses(coursesData || []);
      setMajors(majorsData || []);
      setDepartments(departmentsData || []);
      setCampuses(campusesData || []);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
            password: form.password,
          },
        ])
        .select()
        .single();

      if (userError) throw userError;

      // 2. Create user role record
      const { error: roleError } = await supabase.from("user_roles").insert([
        {
          user_id: userData.id,
          role: "admin",
        },
      ]);

      if (roleError) throw roleError;

      // 3. Create staff record
      const { error: staffError } = await supabase.from("staff").insert([
        {
          user_id: userData.id,
          full_name: form.name,
          department_id: parseInt(form.department_id),
          campus_id: parseInt(form.campus_id),
          designation: form.designation,
          mobile: form.mobile,
          email: form.email,
        },
      ]);

      if (staffError) throw staffError;

      setSuccess("Staff member added successfully!");
      setForm({
        name: "",
        email: "",
        password: "",
        department_id: "",
        campus_id: "",
        designation: "",
        mobile: "",
      });
      fetchData();
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Failed to add staff member. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle deleting a staff member
  const handleDeleteStaff = async (staffId) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Find the user_id associated with the staff member
      const { data: staffData, error: fetchError } = await supabase
        .from("staff")
        .select("user_id")
        .eq("id", staffId)
        .single();

      if (fetchError) throw fetchError;
      if (!staffData) throw new Error("Staff member not found.");

      const userIdToDelete = staffData.user_id;

      // Delete the staff record
      const { error: staffDeleteError } = await supabase
        .from("staff")
        .delete()
        .eq("id", staffId);

      if (staffDeleteError) throw staffDeleteError;

      // Optionally delete the associated user role (if they are only an admin staff)
      // This part might need refinement based on your user/role management logic
      // For simplicity, we might skip this step or handle it manually in Supabase
      // For now, we'll just log a message
      console.log(
        `Staff member with user_id ${userIdToDelete} deleted. Consider deleting the user record if no longer needed.`
      );

      setSuccess("Staff member deleted successfully!");
      // Refresh the staff list
      const { data: staffDataAfterDelete, error: fetchStaffError } =
        await supabase.from("staff").select(
          `
            *,
            department:departments(name)
          `
        );

      if (fetchStaffError) throw fetchStaffError;

      setStaff(staffDataAfterDelete || []);
    } catch (err) {
      console.error("Error deleting staff member:", err);
      setError(
        err.message || "Failed to delete staff member. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsAlumnus = async (studentId) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: updateError } = await supabase
        .from("students")
        .update({ is_alumnus: true })
        .eq("id", studentId);

      if (updateError) throw updateError;

      setSuccess("Student marked as alumnus successfully.");
      // Refresh student list
      const { data: studentsData } = await supabase
        .from("students")
        .select(
          `
          *,
          course:courses(name),
          major:majors(name),
          department:departments(name)
        `
        )
        .eq("is_alumnus", false);
      setStudents(studentsData || []);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to mark student as alumnus. Please try again.");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-orange-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Dashboard Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl xs:text-4xl font-bold font-playfair text-blue-700 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-base">
              Manage staff, students, and more.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center md:justify-end">
            <div className="flex items-center gap-2 bg-white/90 rounded-xl shadow p-4 min-w-[120px]">
              <FaUsers className="text-blue-500 text-2xl" />
              <div>
                <div className="text-lg font-bold text-blue-700">
                  {students.length}
                </div>
                <div className="text-xs text-gray-500">Students</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/90 rounded-xl shadow p-4 min-w-[120px]">
              <FaUserTie className="text-orange-400 text-2xl" />
              <div>
                <div className="text-lg font-bold text-orange-500">
                  {staff.length}
                </div>
                <div className="text-xs text-gray-500">Staff</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/90 rounded-xl shadow p-4 min-w-[120px]">
              <FaUniversity className="text-green-500 text-2xl" />
              <div>
                <div className="text-lg font-bold text-green-600">
                  {campuses.length}
                </div>
                <div className="text-xs text-gray-500">Campuses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Staff Form */}
        <div className="bg-white/90 rounded-2xl shadow-2xl p-6 xs:p-10 animate-fade-in-up mb-8">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            Add Staff Member
          </h2>
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm text-center shadow-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-sm text-center shadow-sm">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
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
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  name="department_id"
                  value={form.department_id}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campus
                </label>
                <select
                  name="campus_id"
                  value={form.campus_id}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
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
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 xs:py-4 bg-blue-600 text-white rounded-lg font-semibold text-base xs:text-lg shadow hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Staff Member"}
            </button>
          </form>
        </div>

        {/* Staff List */}
        <div className="bg-white/90 rounded-2xl shadow-2xl p-6 xs:p-10 animate-fade-in-up mb-8">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            Staff Members
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {staff.map((member) => (
              <div
                key={member.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow flex flex-col gap-2 animate-fade-in-up"
              >
                <div className="flex items-center gap-3 mb-2">
                  <FaUserTie className="text-orange-400 text-2xl" />
                  <h3 className="font-bold text-lg text-gray-900">
                    {member.full_name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">{member.email}</p>
                <p className="text-sm text-gray-600">
                  Department:{" "}
                  {departments.find((d) => d.id === member.department_id)?.name}
                </p>
                <p className="text-sm text-gray-600">
                  Campus:{" "}
                  {campuses.find((c) => c.id === member.campus_id)?.name}
                </p>
                <p className="text-sm text-gray-600">
                  Designation: {member.designation}
                </p>
                <p className="text-sm text-gray-600">Mobile: {member.mobile}</p>
                <button
                  onClick={() => handleDeleteStaff(member.id)}
                  className="mt-auto text-red-600 hover:text-red-800 text-xs self-end flex items-center gap-1 transition-colors duration-200"
                >
                  <FaTrash className="text-sm" /> Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
