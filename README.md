# Student Management System

A comprehensive web application for managing student information, including a searchable directory, individual profiles, and administrative features with privacy controls.

## Features

- **Student Directory:** Browse and search for students with key details.
- **Student Profiles:** View detailed information for individual students (subject to privacy settings).
- **Admin Dashboard:** Overview of system statistics (total students, campuses, etc.) and quick links for management.
- **Privacy Settings:** Students can control the visibility of their information to non-admin users.
- **Authentication & Authorization:** Secure login for users and role-based access (student/admin).

## Technology Stack

**Frontend:**

- Next.js (React Framework)
- React
- Tailwind CSS
- Bun (Package Manager/Runtime)

**Backend:**

- Flask (Python Web Framework)
- SQLAlchemy (ORM)
- Flask-SQLAlchemy, Flask-Migrate, Flask-CORS, Flask-JWT-Extended (Flask Extensions)
- Psycopg2 (PostgreSQL adapter)
- Python-dotenv
- Bcrypt
- Gunicorn (Production WSGI Server)

**Database:**

- PostgreSQL (Recommended for production)
- SQLite (Used for local development by default)

## File Structure

```
.
├── .env
├── .gitignore
├── node_modules/
├── package.json
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── run.ts
├── schema.sql
├── src/
│   ├── app/
│   │   ├── [studentId]/
│   │   │   └── page.js
│   │   ├── admin/
│   │   │   └── page.js
│   │   ├── layout.js
│   │   ├── login/
│   │   │   └── page.js
│   │   ├── page.js
│   │   ├── privacy-settings/
│   │   │   └── page.js
│   │   ├── search/
│   │   │   └── page.js
│   │   ├── students/
│   │   │   └── page.js
│   │   └── signup/
│   │       └── page.js
│   ├── components/
│   │   ├── AuthRequired.js
│   │   ├── Navbar.js
│   │   ├── PrivateField.js
│   │   └── StudentCard.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── lib/
│   │   └── apiClient.js
│   │   └── supabaseClient.js
│   └── utils/
│       └── privacy.js
├── backend/
│   ├── .env
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models/
│   │   │   ├── campus.py
│   │   │   ├── course.py
│   │   │   ├── department.py
│   │   │   ├── major.py
│   │   │   ├── privacy_setting.py
│   │   │   ├── staff.py
│   │   │   └── student.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── campus_routes.py
│   │   │   ├── course_routes.py
│   │   │   ├── department_routes.py
│   │   │   ├── major_routes.py
│   │   │   ├── privacy_setting_routes.py
│   │   │   ├── staff_routes.py
│   │   │   └── students.py
│   │   └── services/
│   │       ├── auth_service.py
│   │       ├── campus_service.py
│   │       ├── course_service.py
│   │       ├── department_service.py
│   │   │   ├── major_service.py
│   │   │   ├── privacy_setting_service.py
│   │   │   ├── staff_service.py
│   │   │   └── student_service.py
│   ├── check_admin.py
│   ├── config.py
│   ├── init_db.py
│   ├── migrations/
│   ├── recreate_admin.py
│   ├── recreate_db.py
│   ├── requirements.txt
│   └── run.py
└── tailwind.config.mjs
```

## Backend Overview

The backend is a RESTful API built with Flask. It uses SQLAlchemy as an Object-Relational Mapper (ORM) to interact with the database. The application is structured into models (defining database tables), services (containing business logic), and routes (exposing API endpoints). Flask-JWT-Extended is used for authentication and authorization, and Flask-CORS handles Cross-Origin Resource Sharing.

## Frontend Overview

The frontend is a single-page application (SPA) built with Next.js and React. It uses the App Router for navigation and rendering. Components are used to build the user interface. The `apiClient.js` file in `src/lib` is responsible for making HTTP requests to the backend API.

## Database Schema

The database schema defines the structure of the data stored in the database. Below is the SQL schema used for the project:

```sql
-- Create tables for the student directory

-- Campuses/Colleges
CREATE TABLE campuses (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses
CREATE TABLE courses (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    department_id VARCHAR(36) REFERENCES departments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Majors
CREATE TABLE majors (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments
CREATE TABLE departments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    campus_id VARCHAR(36) REFERENCES campuses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Roles
CREATE TABLE user_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students
CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    registered_number VARCHAR(20) UNIQUE,
    year_of_admission INTEGER,
    campus_id VARCHAR(36) REFERENCES campuses(id),
    course_id VARCHAR(36) REFERENCES courses(id),
    major_id VARCHAR(36) REFERENCES majors(id),
    department_id VARCHAR(36) REFERENCES departments(id),
    mobile VARCHAR(20),
    personal_email VARCHAR(120),
    emergency_contact VARCHAR(20),
    present_address TEXT,
    permanent_address TEXT,
    photo_url TEXT,
    is_alumnus BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Internships
CREATE TABLE student_internships (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) REFERENCES students(id),
    company_name VARCHAR(100) NOT NULL,
    position VARCHAR(100),
    start_date DATE,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Job Offers
CREATE TABLE student_job_offers (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) REFERENCES students(id),
    company_name VARCHAR(100) NOT NULL,
    position VARCHAR(100),
    offer_date DATE,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff
CREATE TABLE staff (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    full_name VARCHAR(100) NOT NULL,
    department_id VARCHAR(36) REFERENCES departments(id),
    campus_id VARCHAR(36) REFERENCES campuses(id),
    designation VARCHAR(100),
    mobile VARCHAR(20),
    email VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Privacy Settings
CREATE TABLE privacy_settings (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    field_name VARCHAR(50) NOT NULL,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_campus_id ON students(campus_id);
CREATE INDEX idx_students_course_id ON students(course_id);
CREATE INDEX idx_students_major_id ON students(major_id);
CREATE INDEX idx_students_department_id ON students(department_id);
CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_staff_department_id ON staff(department_id);
CREATE INDEX idx_staff_campus_id ON staff(campus_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_privacy_settings_user_id ON privacy_settings(user_id);
```

## Getting Started (Local Setup)

Follow these steps to set up and run the project on your local machine.

### Prerequisites

Make sure you have the following installed:

- Git
- Python 3.7+
- Bun:

### 1. Clone the Repository

```bash
git clone <repository_url>
cd <repository_directory>
```

Replace `<repository_url>` with the actual URL of your GitHub repository and `<repository_directory>` with the name of the cloned folder.

### 2. Backend Setup

Navigate to the backend directory, create a Python virtual environment, activate it, and install the dependencies.

```bash
cd backend
python -m venv venv
# On Windows:
# .\\venv\\Scripts\\activate
# On macOS/Linux:
# source venv/bin/activate
pip install -r requirements.txt
```

Configure your database connection. Copy the `.env.example` file to `.env` and update the `DATABASE_URL` and `JWT_SECRET_KEY` variables.

```bash
copy .env.example .env  # On Windows
# cp .env.example .env    # On macOS/Linux
```

Edit the `.env` file:

```dotenv
DATABASE_URL=postgresql://user:password@host:port/database_name
JWT_SECRET_KEY=your_super_secret_key_here
# Other potential variables
```

Replace `user`, `password`, `host`, `port`, and `database_name` with your database credentials. You can also use a SQLite database with `DATABASE_URL=sqlite:///app.db`.

Initialize and run database migrations to create the tables. If you are using SQLite or prefer to set up manually, you can execute the SQL statements from `schema.sql` in your database client.

```bash
flask db upgrade
```

### 3. Frontend Setup

Navigate back to the project root directory and install frontend dependencies using Bun.

```bash
cd ..
bun install
```

Copy the frontend environment file:

```bash
copy .env.example .env # If you have one for the frontend, otherwise create one
```

If you need to configure the backend API URL for local development (e.g., if running backend on a non-default port or a different URL for testing), you might add a variable like `NEXT_PUBLIC_API_BASE_URL` to your frontend `.env` file:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
# Or your deployed backend URL if testing against that
# NEXT_PUBLIC_API_BASE_URL=https://student-management-lkeg.onrender.com/api
```

### 4. Running the Project

From the project root directory, you can use the `run.ts` script with Bun to start both the backend and frontend development servers concurrently:

```bash
bun run run.ts
```

Alternatively, you can start them separately:

- **Backend:**
  ```bash
  cd backend
  # Activate virtual environment
  python run.py
  ```
- **Frontend:**
  ```bash
  cd ..
  bun run dev
  ```

The frontend will typically run on `http://localhost:3000` and the backend on `http://localhost:5000` (unless configured differently in your `.env` files).

## Deployment

The application is structured for deployment with separate backend and frontend services.

- **Backend (Render):** `https://student-management-lkeg.onrender.com/`
- **Frontend (Vercel):** `https://student-management-nine-beige.vercel.app`

The frontend is configured to communicate with the deployed backend URL.
