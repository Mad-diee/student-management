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