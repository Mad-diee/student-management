-- Create tables for the student directory

-- Campuses/Colleges
CREATE TABLE campuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Courses
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Majors
CREATE TABLE majors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Departments
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    campus_id INTEGER REFERENCES campuses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Co-curricular Interests
CREATE TABLE co_curricular_interests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Roles
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Students
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    registered_number VARCHAR(50) UNIQUE NOT NULL,
    year_of_admission INTEGER NOT NULL,
    campus_id INTEGER REFERENCES campuses(id),
    course_id INTEGER REFERENCES courses(id),
    major_id INTEGER REFERENCES majors(id),
    department_id INTEGER REFERENCES departments(id),
    mobile VARCHAR(20),
    personal_email VARCHAR(255),
    emergency_contact VARCHAR(20),
    present_address TEXT,
    permanent_address TEXT,
    photo_url TEXT,
    is_alumnus BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student Interests (Co-curricular)
CREATE TABLE student_co_curricular_interests (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    interest_id INTEGER REFERENCES co_curricular_interests(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student Extra Curricular Interests
CREATE TABLE student_extra_curricular_interests (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student Hobbies
CREATE TABLE student_hobbies (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student Internships
CREATE TABLE student_internships (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    company_name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    start_date DATE,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student Job Offers
CREATE TABLE student_job_offers (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    company_name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    offer_date DATE,
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Staff
CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    full_name VARCHAR(255) NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    campus_id INTEGER REFERENCES campuses(id),
    designation VARCHAR(255),
    mobile VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Privacy Settings
CREATE TABLE privacy_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    field_name VARCHAR(50) NOT NULL,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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