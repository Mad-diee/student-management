"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../supabaseClient";
import {
  FaPlusCircle,
  FaTrash,
  FaBuilding,
  FaBook,
  FaUniversity,
  FaStar,
  FaGraduationCap,
} from "react-icons/fa";
import Header from "../../../components/Header";

export default function AdminManage() {
  const [activeTab, setActiveTab] = useState("campuses");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    is_default: false,
    campus_id: "",
  });
  const [data, setData] = useState({
    campuses: [],
    courses: [],
    departments: [],
    majors: [],
    interests: [],
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          router.push("/login");
          return;
        }

        const user = JSON.parse(storedUser);
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (roleError || roleData.role !== "admin") {
          router.push("/profile");
          return;
        }

        fetchData();
      } catch (err) {
        console.error("Error checking auth:", err);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const fetchData = async () => {
    try {
      const [
        { data: campusesData },
        { data: coursesData },
        { data: departmentsData },
        { data: majorsData },
        { data: interestsData },
      ] = await Promise.all([
        supabase.from("campuses").select("*"),
        supabase.from("courses").select("*"),
        supabase.from("departments").select("*"),
        supabase.from("majors").select("*"),
        supabase.from("co_curricular_interests").select("*"),
      ]);

      setData({
        campuses: campusesData || [],
        courses: coursesData || [],
        departments: departmentsData || [],
        majors: majorsData || [],
        interests: interestsData || [],
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    console.log("handleSubmit called");
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let tableName;
      let insertData = {};

      switch (activeTab) {
        case "campuses":
          tableName = "campuses";
          insertData = {
            name: form.name,
            address: form.address,
          };
          break;
        case "courses":
          tableName = "courses";
          insertData = {
            name: form.name,
            description: form.description,
          };
          break;
        case "departments":
          tableName = "departments";
          insertData = {
            name: form.name,
            campus_id: parseInt(form.campus_id),
          };
          break;
        case "majors":
          tableName = "majors";
          insertData = {
            name: form.name,
            description: form.description,
          };
          break;
        case "interests":
          tableName = "co_curricular_interests";
          insertData = {
            name: form.name,
            is_default: form.is_default,
          };
          break;
        default:
          throw new Error("Invalid tab selected");
      }

      const { error: insertError } = await supabase
        .from(tableName)
        .insert([insertData]);

      if (insertError) throw insertError;

      setSuccess(`${activeTab.slice(0, -1)} added successfully!`);
      setForm({
        name: "",
        description: "",
        address: "",
        is_default: false,
        campus_id: "",
      });
      fetchData();
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Failed to add item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      let tableName;
      switch (activeTab) {
        case "campuses":
          tableName = "campuses";
          break;
        case "courses":
          tableName = "courses";
          break;
        case "departments":
          tableName = "departments";
          break;
        case "majors":
          tableName = "majors";
          break;
        case "interests":
          tableName = "co_curricular_interests";
          break;
        default:
          throw new Error("Invalid tab selected");
      }

      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setSuccess("Item deleted successfully!");
      fetchData();
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Failed to delete item. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-orange-100">
      <Header />
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/90 rounded-2xl shadow-2xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-6 font-playfair">
            Manage University Data
          </h1>

          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setActiveTab("campuses")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                activeTab === "campuses"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Campuses
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                activeTab === "courses"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => setActiveTab("departments")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                activeTab === "departments"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Departments
            </button>
            <button
              onClick={() => setActiveTab("majors")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                activeTab === "majors"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Majors
            </button>
            <button
              onClick={() => setActiveTab("interests")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                activeTab === "interests"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Co-curricular Interests
            </button>
          </div>

          {error && (
            <div
              className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {success && (
            <div
              className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          {/* Add New Item Section */}
          <div className="mb-10 p-6 bg-gray-50 rounded-xl shadow-inner border border-gray-200">
            <h2 className="text-xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
              <FaPlusCircle className="text-green-600" /> Add New{" "}
              {activeTab.slice(0, -1)}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
              </div>
              {activeTab === "campuses" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    required
                  >
                    <option value="">Select Campus</option>
                    {data.campuses.map((campus) => (
                      <option key={campus.id} value={campus.id}>
                        {campus.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {(activeTab === "courses" || activeTab === "majors") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              )}
              {activeTab === "interests" && (
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_default"
                      checked={form.is_default}
                      onChange={handleChange}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700 cursor-pointer">
                      Set as default interest
                    </span>
                  </label>
                </div>
              )}
              <div className="mt-6 col-span-1 md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 font-semibold shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : `Add ${activeTab.slice(0, -1)}`}
                </button>
              </div>
            </form>
          </div>

          {/* Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data[activeTab]?.map((item) => (
              <div
                key={item.id}
                className="bg-gray-100 rounded-lg p-5 border border-gray-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-blue-800 text-lg">
                      {item.name}
                    </h3>
                    {/* Add specific icons based on tab */}
                    {activeTab === "campuses" && (
                      <FaUniversity className="text-blue-500 text-xl" />
                    )}
                    {activeTab === "courses" && (
                      <FaBook className="text-green-500 text-xl" />
                    )}
                    {activeTab === "departments" && (
                      <FaBuilding className="text-orange-500 text-xl" />
                    )}
                    {activeTab === "majors" && (
                      <FaGraduationCap className="text-purple-500 text-xl" />
                    )}
                    {activeTab === "interests" && (
                      <FaStar className="text-yellow-500 text-xl" />
                    )}
                  </div>

                  {activeTab === "campuses" && item.address && (
                    <p className="text-sm text-gray-700 mb-3">
                      Address: {item.address}
                    </p>
                  )}
                  {activeTab === "departments" && item.campus_id && (
                    <p className="text-sm text-gray-700 mb-3">
                      Campus:{" "}
                      {data.campuses.find((c) => c.id === item.campus_id)?.name}
                    </p>
                  )}
                  {(activeTab === "courses" || activeTab === "majors") &&
                    item.description && (
                      <p className="text-sm text-gray-700 mb-3">
                        {item.description}
                      </p>
                    )}
                  {activeTab === "interests" && item.is_default && (
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-200 text-blue-800 rounded-full shadow-sm">
                      Default Interest
                    </span>
                  )}
                </div>

                {/* Delete Button */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center gap-1"
                  >
                    <FaTrash className="text-sm" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
