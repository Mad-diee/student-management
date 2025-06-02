"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  studentsAPI,
  campusesAPI,
  coursesAPI,
  majorsAPI,
  departmentsAPI,
  privacySettingsAPI,
} from "@/lib/apiClient";
import { FaSpinner, FaSearch, FaUser, FaTh, FaList } from "react-icons/fa";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    campus_id: "",
    course_id: "",
    major_id: "",
    department_id: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    campuses: [],
    courses: [],
    majors: [],
    departments: [],
  });
  const [viewMode, setViewMode] = useState("grid");
  const [privacyMap, setPrivacyMap] = useState({});
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchOptions = async () => {
      const user = localStorage.getItem("user");
      if (!user) {
        router.push("/login");
        return;
      }
      const userData = JSON.parse(user);
      setIsUserAdmin(userData.role === "admin");
      await fetchFilterOptions();
    };
    checkAuthAndFetchOptions();
  }, [router]);

  const fetchFilterOptions = async () => {
    try {
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

      setFilterOptions({
        campuses: campusesData || [],
        courses: coursesData || [],
        majors: majorsData || [],
        departments: departmentsData || [],
      });
    } catch (err) {
      console.error("Error fetching filter options:", err);
      setError("Failed to load filter options. Please try again.");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await studentsAPI.search(
        {
          search_term: searchTerm.trim(),
          ...filters,
        },
        { method: "POST" }
      );
      const searchResultsArr = data || [];
      setSearchResults(searchResultsArr);

      // Fetch privacy settings for each student in search results
      const privacyResults = await Promise.all(
        searchResultsArr.map((student) =>
          privacySettingsAPI.getByStudentId(student.id)
        )
      );

      const privacyMapObj = {};
      searchResultsArr.forEach((student, idx) => {
        const settingsArr =
          privacyResults[idx]?.data || privacyResults[idx] || [];
        const fieldMap = {};
        settingsArr.forEach((s) => {
          fieldMap[s.field_name] = Boolean(s.is_private);
        });
        privacyMapObj[student.id] = fieldMap;
      });
      setPrivacyMap(privacyMapObj);
    } catch (err) {
      console.error("Error searching students:", err);
      setError(
        err.response?.data?.message ||
          "Failed to search students. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentClick = (studentId) => {
    router.push(`/student/${studentId}`);
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Search Students
          </h1>
          <p className="text-lg text-gray-600">
            Find students by name, registration number, or other details
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden text-gray-800">
          <div className="p-6">
            <div className="flex justify-end mb-4">
              <button
                className={`mr-2 px-3 py-2 rounded-lg border ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setViewMode("grid")}
                type="button"
              >
                <FaTh className="inline mr-1" /> Grid
              </button>
              <button
                className={`px-3 py-2 rounded-lg border ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
                onClick={() => setViewMode("list")}
                type="button"
              >
                <FaList className="inline mr-1" /> List
              </button>
            </div>
            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex gap-4 mb-6">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or registration number..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Searching...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaSearch className="mr-2" />
                      Search
                    </span>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <select
                  name="campus_id"
                  value={filters.campus_id}
                  onChange={handleFilterChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Campuses</option>
                  {filterOptions.campuses.map((campus) => (
                    <option key={campus.id} value={campus.id}>
                      {campus.name}
                    </option>
                  ))}
                </select>

                <select
                  name="course_id"
                  value={filters.course_id}
                  onChange={handleFilterChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Courses</option>
                  {filterOptions.courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>

                <select
                  name="major_id"
                  value={filters.major_id}
                  onChange={handleFilterChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Majors</option>
                  {filterOptions.majors.map((major) => (
                    <option key={major.id} value={major.id}>
                      {major.name}
                    </option>
                  ))}
                </select>

                <select
                  name="department_id"
                  value={filters.department_id}
                  onChange={handleFilterChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Departments</option>
                  {filterOptions.departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
            </form>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {searchResults.length === 0 ? (
                <p className="text-center text-gray-600">
                  No students found. Try adjusting your search criteria.
                </p>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {searchResults.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleStudentClick(student.id)}
                      className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 shadow-md"
                    >
                      <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-2 overflow-hidden border-4 border-blue-200">
                        {isUserAdmin || !privacyMap[student.id]?.photo_url ? (
                          student.photo_url ? (
                            <img
                              src={student.photo_url}
                              alt={student.name}
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/default-profile.png";
                              }}
                            />
                          ) : (
                            <FaUser className="text-3xl text-blue-500" />
                          )
                        ) : (
                          <FaUser className="text-3xl text-gray-400" />
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 text-center">
                        {isUserAdmin || !privacyMap[student.id]?.name
                          ? student.name || "-"
                          : "Hidden"}
                      </h3>
                      <p className="text-sm text-gray-800 text-center">
                        {isUserAdmin || !privacyMap[student.id]?.department
                          ? student.department?.name || "-"
                          : "Hidden"}
                      </p>
                      <p className="text-sm text-gray-800 text-center">
                        {isUserAdmin || !privacyMap[student.id]?.major
                          ? student.major?.name || "-"
                          : "Hidden"}
                      </p>
                      <p className="text-sm text-gray-800 text-center">
                        {isUserAdmin ||
                        !privacyMap[student.id]?.year_of_admission
                          ? "Year: " + (student.year_of_admission || "-")
                          : "Year: Hidden"}
                      </p>
                      <p className="text-xs text-gray-700 text-center">
                        {isUserAdmin ||
                        !privacyMap[student.id]?.registered_number
                          ? "Reg. No: " + (student.registered_number || "-")
                          : "Reg. No: Hidden"}
                      </p>
                      {student.email && (
                        <p className="text-xs text-gray-700 text-center break-all">
                          {isUserAdmin ||
                          !privacyMap[student.id]?.personal_email
                            ? student.personal_email
                            : "Hidden"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {searchResults.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleStudentClick(student.id)}
                      className="flex items-center gap-6 p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200 shadow-sm"
                    >
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mr-4 border-4 border-blue-200">
                        {isUserAdmin || !privacyMap[student.id]?.photo_url ? (
                          student.photo_url ? (
                            <img
                              src={student.photo_url}
                              alt={student.name}
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/default-profile.png";
                              }}
                            />
                          ) : (
                            <FaUser className="text-2xl text-blue-500" />
                          )
                        ) : (
                          <FaUser className="text-2xl text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate">
                          {isUserAdmin || !privacyMap[student.id]?.name
                            ? student.name || "-"
                            : "Hidden"}
                        </div>
                        <div className="text-gray-800 text-sm truncate">
                          {isUserAdmin || !privacyMap[student.id]?.department
                            ? student.department?.name || "-"
                            : "Hidden"}
                        </div>
                        <div className="text-gray-800 text-sm truncate">
                          {isUserAdmin || !privacyMap[student.id]?.major
                            ? student.major?.name || "-"
                            : "Hidden"}
                        </div>
                        <div className="text-gray-800 text-sm truncate">
                          {isUserAdmin ||
                          !privacyMap[student.id]?.year_of_admission
                            ? "Year: " + (student.year_of_admission || "-")
                            : "Year: Hidden"}
                        </div>
                        <div className="text-xs text-gray-700 truncate">
                          {isUserAdmin ||
                          !privacyMap[student.id]?.registered_number
                            ? "Reg. No: " + (student.registered_number || "-")
                            : "Reg. No: Hidden"}
                        </div>
                        {student.email && (
                          <div className="text-xs text-gray-700 truncate break-all">
                            {isUserAdmin ||
                            !privacyMap[student.id]?.personal_email
                              ? student.personal_email
                              : "Hidden"}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
