"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { FaUserGraduate } from "react-icons/fa";
import { filterPrivateFields } from "../../utils/privacy";
import Link from "next/link";
import Header from "../../components/Header";
// Card badge utility with static color map
const badgeColors = {
  blue: "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
  green: "bg-green-100 text-green-700",
  // add more as needed
};

function Badge({ children, color }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mr-2 mb-1 ${
        badgeColors[color] || "bg-gray-100 text-gray-700"
      }`}
    >
      {children}
    </span>
  );
}

// Card styles
const cardBase =
  "bg-white/70 backdrop-blur border border-blue-100 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.025] transition-all duration-200 cursor-pointer animate-fade-in-up flex flex-col items-center px-6 py-8";
const avatarBase =
  "w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-blue-200 shadow mb-4";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("or");
  const [filters, setFilters] = useState({
    year_of_admission: "",
    course_id: "",
    major_id: "",
    department_id: "",
    campus_id: "",
  });
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [courses, setCourses] = useState([]);
  const [majors, setMajors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

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
        setError("Failed to load filter data. Please try again.");
      }
    };
    fetchData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from("students").select(
        `
          *,
          campus:campuses(name),
          course:courses(name),
          major:majors(name),
          department:departments(name),
          student_co_curricular_interests:student_co_curricular_interests(*, interest:co_curricular_interests(name)),
          student_extra_curricular_interests(name),
          student_hobbies(name),
          student_internships(company_name, position, start_date, end_date, description),
          student_job_offers(company_name, position, offer_date, status)
        `
      );

      if (!user || user.role !== "admin") {
        query = query.eq("is_alumnus", false);
      }

      // Apply filters
      if (filters.year_of_admission) {
        query = query.eq("year_of_admission", filters.year_of_admission);
      }
      if (filters.course_id) {
        query = query.eq("course_id", filters.course_id);
      }
      if (filters.major_id) {
        query = query.eq("major_id", filters.major_id);
      }
      if (filters.department_id) {
        query = query.eq("department_id", filters.department_id);
      }
      if (filters.campus_id) {
        query = query.eq("campus_id", filters.campus_id);
      }

      // Apply search term
      if (searchTerm) {
        const searchFields = [
          "name",
          "registered_number",
          "mobile",
          "personal_email",
          "present_address",
          "permanent_address",
          // Add more fields as needed
        ];

        if (searchType === "and") {
          // Split searchTerm into words, require each word to be present in at least one field
          const words = searchTerm.trim().split(/\s+/);
          words.forEach((word) => {
            query = query.or(
              searchFields.map((field) => `${field}.ilike.%${word}%`).join(",")
            );
          });
        } else if (searchType === "or") {
          query = query.or(
            searchFields
              .map((field) => `${field}.ilike.%${searchTerm}%`)
              .join(",")
          );
        } else if (searchType === "not") {
          query = query.not(
            "or",
            searchFields
              .map((field) => `${field}.ilike.%${searchTerm}%`)
              .join(",")
          );
        }
      }

      const { data, error: searchError } = await query;

      if (searchError) throw searchError;

      // Fetch privacy settings for all user_ids
      const userIds = (data || []).map((s) => s.user_id);
      const { data: privacyData } = await supabase
        .from("privacy_settings")
        .select("user_id, field_name, is_private")
        .in("user_id", userIds);
      // Merge privacy settings into each student
      const privacyMap = {};
      (privacyData || []).forEach((row) => {
        if (!privacyMap[row.user_id]) privacyMap[row.user_id] = [];
        privacyMap[row.user_id].push({
          field_name: row.field_name,
          is_private: row.is_private,
        });
      });
      const studentsWithPrivacy = (data || []).map((student) => ({
        ...student,
        privacy_settings: privacyMap[student.user_id] || [],
      }));
      // Filter private fields based on user role
      const filteredResults = studentsWithPrivacy.map((student) => {
        if (user?.role === "admin") {
          return student;
        }
        return filterPrivateFields(student);
      });

      setResults(filteredResults);
    } catch (err) {
      console.error("Error:", err);
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-orange-100">
      <Header />
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 rounded-2xl shadow-2xl p-6 xs:p-10 mb-8 animate-fade-in-up">
          <h1 className="text-2xl xs:text-3xl font-bold font-playfair text-blue-700 mb-6 text-center">
            Search Students
          </h1>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Term
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
                  placeholder="Search by name, email, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Type
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
                >
                  <option value="and">All terms must match</option>
                  <option value="or">Any term can match</option>
                  <option value="not">Exclude matching terms</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year of Admission
                </label>
                <input
                  type="number"
                  name="year_of_admission"
                  value={filters.year_of_admission}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
                  placeholder="e.g., 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  name="course_id"
                  value={filters.course_id}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
                >
                  <option value="">All Courses</option>
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
                  value={filters.major_id}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
                >
                  <option value="">All Majors</option>
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
                  value={filters.department_id}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
                >
                  <option value="">All Departments</option>
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
                  value={filters.campus_id}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-gray-300 rounded-md text-gray-900 bg-white"
                >
                  <option value="">All Campuses</option>
                  {campuses.map((campus) => (
                    <option key={campus.id} value={campus.id}>
                      {campus.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 xs:py-4 bg-blue-600 text-white rounded-lg font-semibold text-base xs:text-lg shadow hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white/90 rounded-2xl shadow-2xl p-6 xs:p-10 animate-fade-in-up mt-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
              <h2 className="text-xl xs:text-2xl font-bold text-gray-900">
                Results ({results.length})
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "text-blue-700 hover:bg-blue-50"
                  }`}
                >
                  List View
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "text-blue-700 hover:bg-blue-50"
                  }`}
                >
                  Grid View
                </button>
              </div>
            </div>
            {viewMode === "list" ? (
              <div className="space-y-6">
                {results.map((student) => (
                  <Link
                    href={`/students/${student.id}`}
                    key={student.id}
                    className="block"
                  >
                    <div
                      className={
                        cardBase +
                        " md:flex-row md:items-center md:space-x-8 md:py-6 md:px-8"
                      }
                    >
                      {student.photo_url ? (
                        <img
                          src={student.photo_url}
                          alt={student.name}
                          className={avatarBase + " md:mb-0 mb-4"}
                        />
                      ) : (
                        <div
                          className={
                            avatarBase +
                            " bg-blue-100 flex items-center justify-center md:mb-0 mb-4"
                          }
                        >
                          <FaUserGraduate className="text-3xl text-blue-600" />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col items-center md:items-start">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1 text-center md:text-left">
                          {student.name}
                        </h3>
                        <div className="flex flex-wrap justify-center md:justify-start mb-2">
                          {student.department?.name && (
                            <Badge color="blue">
                              {student.department.name}
                            </Badge>
                          )}
                          {student.major?.name && (
                            <Badge color="orange">{student.major.name}</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-base text-center md:text-left mb-1">
                          Year of Joining: {student.year_of_admission}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {results.map((student) => (
                  <Link
                    href={`/students/${student.id}`}
                    key={student.id}
                    className="block"
                  >
                    <div className={cardBase + " py-10"}>
                      {student.photo_url ? (
                        <img
                          src={student.photo_url}
                          alt={student.name}
                          className={avatarBase}
                        />
                      ) : (
                        <div
                          className={
                            avatarBase +
                            " bg-blue-100 flex items-center justify-center"
                          }
                        >
                          <FaUserGraduate className="text-4xl text-blue-600" />
                        </div>
                      )}
                      <h3 className="text-2xl font-bold text-gray-900 mb-1 text-center mt-2">
                        {student.name}
                      </h3>
                      <div className="flex flex-wrap justify-center mb-2">
                        {student.department?.name && (
                          <Badge color="blue">{student.department.name}</Badge>
                        )}
                        {student.major?.name && (
                          <Badge color="orange">{student.major.name}</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-base text-center mb-1">
                        Year of Joining: {student.year_of_admission}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
