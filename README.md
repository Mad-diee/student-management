# Student Directory

A modern web application for managing student information across multiple campuses.
http://student-management-nine-beige.vercel.app/

## What This Project Does

- **For Students**

  - Create and manage your profile
  - Control what information is visible to others
  - Add your interests, internships, and job offers
  - Connect with other students

- **For Staff/Admin**
  - Manage student information
  - Add and manage staff members
  - Handle campus and department information
  - Monitor student activities

## How to Run the Project

1. **Install Dependencies**

   ```bash
   bun/npm install
   ```

2. **Set Up Environment**
   Create a `.env` file with:

   ```
   DATABASE_URL=your_supabase_database_url
   NEXT_PUBLIC_URL=your_supabase_url
   NEXT_PUBLIC_ANON_PUBLIC_KEY=your_supabase_anon_key
   ```

3. **Start Development Server**
   ```bash
   bun/npm run dev
   ```

## Project Structure

```
src/
├── app/                    # Main application pages
│   ├── admin/             # Admin dashboard
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── students/          # Student directory
│   ├── search/            # Search functionality
│   └── privacy-settings/  # Privacy controls
│
├── components/            # Reusable components
│   ├── Header.js         # Navigation header
│   └── Layout.js         # Page layout
│
└── supabaseClient.js     # Database connection
```

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Package Manager**: Bun

## Database Schema

### Core Tables

1. **users**

   - Stores user account information
   - Fields: id, email, password, created_at

2. **user_roles**

   - Manages user permissions (admin, staff, student)
   - Fields: id, user_id, role, created_at

3. **campuses**

   - Information about different college campuses
   - Fields: id, name, address, created_at

4. **departments**

   - Department information for each campus
   - Fields: id, name, campus_id, created_at

5. **courses**

   - Available courses
   - Fields: id, name, description, created_at

6. **majors**
   - Major/specialization options
   - Fields: id, name, description, created_at

### Student-Related Tables

1. **students**

   - Main student information
   - Fields: id, user_id, name, registered_number, year_of_admission, campus_id, course_id, major_id, department_id, mobile, personal_email, emergency_contact, present_address, permanent_address, photo_url, is_alumnus, created_at

2. **co_curricular_interests**

   - Predefined co-curricular activities
   - Fields: id, name, is_default, created_at

### Staff-Related Tables

1. **staff**
   - Staff member information
   - Fields: id, user_id, full_name, department_id, campus_id, designation, mobile, email, created_at

### Privacy Settings

1. **privacy_settings**
   - Controls visibility of student information
   - Fields: id, user_id, field_name, is_private, created_at

### Key Relationships

- Students are linked to users through user_id
- Staff members are linked to users through user_id
- Departments belong to specific campuses
- Students can have multiple interests, hobbies, internships, and job offers
- Privacy settings are managed per user and field

## How We Manage Data (CRUD)

CRUD stands for Create, Read, Update, and Delete. These are the basic operations you do with data in any application. In this project, we use Supabase to handle these operations.

Here's how we do each one:

### Create (Adding New Data)

This is for adding new records, like a new student, campus, or course.

```javascript
// Example: Adding a new campus
const { data, error } = await supabase
  .from("campuses") // Choose the table
  .insert([
    // Insert a new row
    {
      name: "New Campus Name",
      address: "123 Campus Lane",
    },
  ]);

if (error) {
  console.error("Error adding campus:", error);
} else {
  console.log("Campus added successfully:", data);
}
```

### Read (Getting Data)

This is for fetching data from the database, like getting a student's profile or listing all campuses.

```javascript
// Example: Getting all students
const { data: students, error } = await supabase
  .from("students") // Choose the table
  .select("*"); // Select all columns

if (error) {
  console.error("Error fetching students:", error);
} else {
  console.log("Students:", students);
}

// Example: Getting a specific student by ID
const { data: student, error } = await supabase
  .from("students")
  .select("*")
  .eq("id", studentId) // Filter by student ID
  .single(); // Get a single record

if (error) {
  console.error("Error fetching student:", error);
} else {
  console.log("Student:", student);
}
```

### Update (Changing Data)

This is for modifying existing records, like updating a student's contact information.

```javascript
// Example: Updating a student's mobile number
const { data, error } = await supabase
  .from("students") // Choose the table
  .update({ mobile: "9876543210" }) // Data to update
  .eq("id", studentId); // Which record to update (by ID)

if (error) {
  console.error("Error updating student:", error);
} else {
  console.log("Student updated successfully:", data);
}
```

### Delete (Removing Data)

This is for removing records from the database, like deleting a staff member.

```javascript
// Example: Deleting a staff member
const { data, error } = await supabase
  .from("staff") // Choose the table
  .delete()
  .eq("id", staffId); // Which record to delete (by ID)

if (error) {
  console.error("Error deleting staff:", error);
} else {
  console.log("Staff member deleted successfully:", data);
}
```
