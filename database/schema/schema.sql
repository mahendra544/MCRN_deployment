-- MCRN COMPLETE POSTGRESQL SCHEMA

-- 1. USERS & PROFILES
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30) NULL,
    profile_photo_url VARCHAR(500) NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_role CHECK (role IN ('USER', 'POLICE', 'ADMIN'))
);

CREATE TABLE IF NOT EXISTS police_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    badge_number VARCHAR(80) NULL,
    station VARCHAR(150) NULL,
    police_rank VARCHAR(100) NULL,
    department VARCHAR(150) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_tokens (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(40) NOT NULL DEFAULT 'EMAIL_VERIFICATION',
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. PUBLIC & USER CHILDREN REGISTRY
CREATE TABLE IF NOT EXISTS children (
    id SERIAL PRIMARY KEY,
    case_id VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    location VARCHAR(150) NOT NULL,
    date_missing DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Missing',
    sighted INT DEFAULT 0,
    photo TEXT,
    owner_user_id VARCHAR(80) NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CITIZEN MISSING CHILD REPORTS
CREATE TABLE IF NOT EXISTS missing_child_reports (
    id SERIAL PRIMARY KEY,
    child_name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    date_missing DATE NOT NULL,
    time_missing TIME,
    last_seen_location VARCHAR(255) NOT NULL,
    height VARCHAR(50),
    weight VARCHAR(50),
    complexion VARCHAR(50),
    identifying_marks TEXT,
    clothing_description TEXT,
    parent_name VARCHAR(100) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    parent_email VARCHAR(100),
    address TEXT NOT NULL,
    photo VARCHAR(500),
    additional_information TEXT,
    status VARCHAR(30) DEFAULT 'Reported',
    owner_user_id VARCHAR(80) NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. POLICE CASES & INVESTIGATIONS
CREATE TABLE IF NOT EXISTS missing_cases (
    id SERIAL PRIMARY KEY,
    case_number VARCHAR(80) NOT NULL UNIQUE,
    child_name VARCHAR(150) NOT NULL,
    child_age INT NOT NULL,
    gender VARCHAR(30) NOT NULL,
    last_seen_location VARCHAR(255) NOT NULL,
    last_seen_datetime TIMESTAMP NOT NULL,
    case_stage VARCHAR(40) NOT NULL DEFAULT 'Open',
    status VARCHAR(40) NOT NULL DEFAULT 'Pending Verification',
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
    filed_by VARCHAR(100) NOT NULL,
    assigned_officer VARCHAR(100) NULL,
    parent_name VARCHAR(100) NULL,
    parent_phone VARCHAR(30) NULL,
    parent_email VARCHAR(150) NULL,
    address TEXT NULL,
    height VARCHAR(50) NULL,
    weight VARCHAR(50) NULL,
    complexion VARCHAR(50) NULL,
    identifying_marks TEXT NULL,
    clothing_description TEXT NULL,
    additional_information TEXT NULL,
    photo VARCHAR(500) NULL,
    opened_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    found_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL
);

-- 5. SIGHTINGS
CREATE TABLE IF NOT EXISTS sightings (
    id SERIAL PRIMARY KEY,
    photo_url VARCHAR(500) NOT NULL,
    location VARCHAR(255) NOT NULL,
    approximate_age VARCHAR(50) NOT NULL,
    gender VARCHAR(30) NOT NULL,
    sighting_date DATE NOT NULL,
    sighting_time TIME NOT NULL,
    description TEXT NOT NULL,
    reporter_name VARCHAR(150) NULL,
    contact_number VARCHAR(30) NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'Pending',
    case_id INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS police_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE,
    password VARCHAR(255),
    full_name VARCHAR(150),
    badge_id VARCHAR(80),
    department VARCHAR(150)
);

-- 6. ADMIN SUPPORT TABLES
CREATE TABLE IF NOT EXISTS admin_settings (
    id SERIAL PRIMARY KEY,
    password_hash VARCHAR(255) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS case_assignments (
    id SERIAL PRIMARY KEY,
    case_id INT NOT NULL,
    officer_name VARCHAR(150) NOT NULL,
    deadline DATE NULL,
    status VARCHAR(50) DEFAULT 'Assigned',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    admin_email VARCHAR(150),
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
