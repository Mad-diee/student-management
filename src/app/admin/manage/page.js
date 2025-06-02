"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  studentsAPI,
  campusesAPI,
  coursesAPI,
  majorsAPI,
  departmentsAPI,
  staffAPI,
} from "@/lib/apiClient";
import { FaPlus, FaSpinner, FaTrash, FaEdit } from "react-icons/fa";

export default function AdminManage() {
  const [activeTab, setActiveTab] = useState("campuses");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [campuses, setCampuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({
    name: "",
    address: "",
    campus_id: "",
    course_id: "",
    major_id: "",
    department_id: "",
    email: "",
    phone: "",
    position: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const user = localStorage.getItem("user");
      if (!user) {
        router.push("/login");
        return;
      }
      const parsedUser = JSON.parse(user);
      if (parsedUser.role !== "admin") {
        router.push("/");
        return;
      }
      await fetchData();
    };
    checkAuth();
  }, [router]);

  const fetchData = async () => {
    try {
      const [
        { data: campusesData },
        { data: departmentsData },
        { data: coursesData },
        { data: majorsData },
        { data: staffData },
      ] = await Promise.all([
        campusesAPI.getAll(),
        departmentsAPI.getAll(),
        coursesAPI.getAll(),
        majorsAPI.getAll(),
        staffAPI.getAll(),
      ]);

      setCampuses(campusesData || []);
      setDepartments(departmentsData || []);
      setCourses(coursesData || []);
      setMajors(majorsData || []);
      setStaff(staffData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
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
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      switch (activeTab) {
        case "campuses":
          await campusesAPI.create({
            name: form.name,
            address: form.address,
          });
          break;
        case "departments":
          await departmentsAPI.create({
            name: form.name,
            campus_id: form.campus_id,
          });
          break;
        case "courses":
          if (!form.department_id) {
            setError("Please select a department.");
            setIsSubmitting(false);
            return;
          }
          await coursesAPI.create({
            name: form.name,
            department_id: form.department_id,
          });
          break;
        case "majors":
          await majorsAPI.create({
            name: form.name,
            description: form.description,
          });
          break;
        case "staff":
          await staffAPI.create({
            full_name: form.name,
            department_id: form.department_id,
            campus_id: form.campus_id,
            designation: form.position,
            mobile: form.phone,
            email: form.email,
          });
          break;
      }

      setSuccess(`${activeTab.slice(0, -1)} added successfully!`);
      setForm({
        name: "",
        address: "",
        campus_id: "",
        course_id: "",
        major_id: "",
        department_id: "",
        email: "",
        phone: "",
        position: "",
      });
      await fetchData();
    } catch (err) {
      console.error("Error adding item:", err);
      setError(
        err.response?.data?.message ||
          `Failed to add ${activeTab.slice(0, -1)}. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      switch (activeTab) {
        case "campuses":
          await campusesAPI.delete(id);
          break;
        case "departments":
          await departmentsAPI.delete(id);
          break;
        case "courses":
          await coursesAPI.delete(id);
          break;
        case "majors":
          await majorsAPI.delete(id);
          break;
        case "staff":
          await staffAPI.delete(id);
          break;
      }

      setSuccess(`${activeTab.slice(0, -1)} deleted successfully!`);
      await fetchData();
    } catch (err) {
      console.error("Error deleting item:", err);
      setError(
        err.response?.data?.message ||
          `Failed to delete ${activeTab.slice(0, -1)}. Please try again.`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Manage University Data
          </h1>
          <p className="text-lg text-gray-600">
            Add, edit, or remove university information
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {["campuses", "departments", "courses", "majors", "staff"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-medium ${
                      activeTab === tab
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                )
              )}
            </nav>
          </div>

          <div className="p-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Add New{" "}
                  {activeTab === "campuses"
                    ? "Campus"
                    : activeTab.slice(0, -1).charAt(0).toUpperCase() +
                      activeTab.slice(0, -1).slice(1)}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name field, conditional based on tab */}
                  {activeTab !== "staff" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  )}

                  {activeTab === "campuses" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  )}

                  {activeTab === "departments" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Campus
                      </label>
                      <select
                        name="campus_id"
                        value={form.campus_id}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  )}

                  {activeTab === "courses" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        name="department_id"
                        value={form.department_id}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  )}

                  {activeTab === "staff" && (
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
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Position
                        </label>
                        <input
                          type="text"
                          name="position"
                          value={form.position}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
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
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          Campus
                        </label>
                        <select
                          name="campus_id"
                          value={form.campus_id}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    </>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <FaSpinner className="animate-spin mr-2" />
                        Adding...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <FaPlus className="mr-2" />
                        Add{" "}
                        {activeTab.slice(0, -1).charAt(0).toUpperCase() +
                          activeTab.slice(0, -1).slice(1)}
                      </span>
                    )}
                  </button>
                </form>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Current{" "}
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h2>
                <div className="space-y-4">
                  {(() => {
                    const items = {
                      campuses,
                      departments,
                      courses,
                      majors,
                      staff,
                    }[activeTab];

                    return items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {item.name}
                          </h3>
                          {activeTab === "campuses" && (
                            <p className="text-sm text-gray-600">
                              {item.address}
                            </p>
                          )}
                          {activeTab === "departments" && (
                            <p className="text-sm text-gray-600">
                              Campus: {item.campus?.name}
                            </p>
                          )}
                          {activeTab === "staff" && (
                            <div className="text-sm text-gray-600">
                              <p>Email: {item.email}</p>
                              <p>Phone: {item.mobile}</p>
                              <p>Position: {item.designation}</p>
                              <p>Department: {item.department?.name}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
