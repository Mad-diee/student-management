const API_BASE_URL = "https://student-management-lkeg.onrender.com/api";

// List of public endpoints that don't require authorization
const PUBLIC_ENDPOINTS = [
  "/campuses",
  "/courses",
  "/majors",
  "/departments",
  "/students",
];

// List of admin operations that always require authorization
const ADMIN_OPERATIONS = ["POST", "PUT", "DELETE"];

// Helper function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const token = user?.token;

  // Check if this is a public endpoint
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some((publicEndpoint) =>
    endpoint.startsWith(publicEndpoint)
  );

  // Check if this is an admin operation
  const isAdminOperation = ADMIN_OPERATIONS.includes(options.method);

  // Add Authorization header if:
  // 1. We have a token AND
  // 2. Either it's not a public endpoint OR it's an admin operation
  const shouldAddAuth = token && (!isPublicEndpoint || isAdminOperation);

  const headers = {
    "Content-Type": "application/json",
    ...(shouldAddAuth && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Something went wrong");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Students API
export const studentsAPI = {
  getStudents: (filters = {}) =>
    apiRequest("/students", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }),
  getAll: async () => {
    const response = await apiRequest("/students");
    return { data: response };
  },
  getStudent: async (id) => {
    const response = await apiRequest(`/students/${id}`);
    return { data: response };
  },
  getById: async (id) => {
    const response = await apiRequest(`/students/${id}`);
    return { data: response };
  },
  createStudent: (data) =>
    apiRequest("/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStudent: (id, data) =>
    apiRequest(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiRequest(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteStudent: (id) =>
    apiRequest(`/students/${id}`, {
      method: "DELETE",
    }),
  search: (params) =>
    apiRequest("/students/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }),
};

// Campuses API
export const campusesAPI = {
  getCampuses: () => apiRequest("/campuses"),
  getAll: () => apiRequest("/campuses"),
  getCampus: (id) => apiRequest(`/campuses/${id}`),
  createCampus: (data) =>
    apiRequest("/campuses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  create: (data) =>
    apiRequest("/campuses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCampus: (id, data) =>
    apiRequest(`/campuses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCampus: (id) =>
    apiRequest(`/campuses/${id}`, {
      method: "DELETE",
    }),
  delete: (id) =>
    apiRequest(`/campuses/${id}`, {
      method: "DELETE",
    }),
};

// Courses API
export const coursesAPI = {
  getCourses: () => apiRequest("/courses"),
  getAll: () => apiRequest("/courses"),
  getCourse: (id) => apiRequest(`/courses/${id}`),
  createCourse: (data) =>
    apiRequest("/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  create: (data) =>
    apiRequest("/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCourse: (id, data) =>
    apiRequest(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCourse: (id) =>
    apiRequest(`/courses/${id}`, {
      method: "DELETE",
    }),
  delete: (id) =>
    apiRequest(`/courses/${id}`, {
      method: "DELETE",
    }),
};

// Majors API
export const majorsAPI = {
  getMajors: () => apiRequest("/majors"),
  getAll: () => apiRequest("/majors"),
  getMajor: (id) => apiRequest(`/majors/${id}`),
  createMajor: (data) =>
    apiRequest("/majors", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  create: (data) =>
    apiRequest("/majors", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateMajor: (id, data) =>
    apiRequest(`/majors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteMajor: (id) =>
    apiRequest(`/majors/${id}`, {
      method: "DELETE",
    }),
  delete: (id) =>
    apiRequest(`/majors/${id}`, {
      method: "DELETE",
    }),
};

// Departments API
export const departmentsAPI = {
  getDepartments: () => apiRequest("/departments"),
  getAll: () => apiRequest("/departments"),
  getDepartment: (id) => apiRequest(`/departments/${id}`),
  createDepartment: (data) =>
    apiRequest("/departments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  create: (data) =>
    apiRequest("/departments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateDepartment: (id, data) =>
    apiRequest(`/departments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteDepartment: (id) =>
    apiRequest(`/departments/${id}`, {
      method: "DELETE",
    }),
  delete: (id) =>
    apiRequest(`/departments/${id}`, {
      method: "DELETE",
    }),
};

// Auth API
export const authAPI = {
  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

// Privacy Settings API
export const privacySettingsAPI = {
  getPrivacySettings: () => apiRequest("/privacy-settings"),
  getByUserId: async (userId) => {
    const response = await apiRequest(`/privacy-settings/by-user/${userId}`);
    // Assuming backend returns an array directly
    return response; // Backend get_privacy_settings returns array directly
  },
  getByStudentId: async (studentId) => {
    const response = await apiRequest(`/privacy-settings/student/${studentId}`);
    return response;
  },
  getPrivacySetting: (id) => apiRequest(`/privacy-settings/${id}`),
  createPrivacySetting: (data) =>
    apiRequest("/privacy-settings", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updatePrivacySetting: (id, data) =>
    apiRequest(`/privacy-settings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiRequest(`/privacy-settings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deletePrivacySetting: (id) =>
    apiRequest(`/privacy-settings/${id}`, {
      method: "DELETE",
    }),
  updateMultipleSettings: (settings) =>
    apiRequest("/privacy-settings/bulk", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),
  create: async (setting) => {
    return apiRequest("/privacy-settings", {
      method: "POST",
      body: JSON.stringify(setting),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
  createMany: async (settingsArray) => {
    return apiRequest("/privacy-settings/bulk", {
      method: "PUT",
      body: JSON.stringify(settingsArray),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
  updateByUserAndField: async (user_id, field_name, data) => {
    return apiRequest(`/privacy-settings/by-user-field`, {
      method: "PUT",
      body: JSON.stringify({ user_id, field_name, ...data }),
      headers: { "Content-Type": "application/json" },
    });
  },
};

// Interests API
export const interestsAPI = {
  getInterests: () => apiRequest("/interests"),
  getByStudentId: (studentId) => apiRequest(`/interests/student/${studentId}`),
  getInterest: (id) => apiRequest(`/interests/${id}`),
  createInterest: (data) =>
    apiRequest("/interests", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  create: (data) =>
    apiRequest("/interests", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateInterest: (id, data) =>
    apiRequest(`/interests/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteInterest: (id) =>
    apiRequest(`/interests/${id}`, {
      method: "DELETE",
    }),
  delete: (id) =>
    apiRequest(`/interests/${id}`, {
      method: "DELETE",
    }),
};

// Staff API
export const staffAPI = {
  getStaff: () => apiRequest("/staff"),
  getAll: () => apiRequest("/staff"),
  getStaffMember: (id) => apiRequest(`/staff/${id}`),
  createStaff: (data) =>
    apiRequest("/staff", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  create: (data) =>
    apiRequest("/staff", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateStaff: (id, data) =>
    apiRequest(`/staff/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteStaff: (id) =>
    apiRequest(`/staff/${id}`, {
      method: "DELETE",
    }),
  delete: (id) =>
    apiRequest(`/staff/${id}`, {
      method: "DELETE",
    }),
};
