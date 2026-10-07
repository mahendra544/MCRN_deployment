const path = require('path');
const fs = require('fs');
const backendNodeModules = path.resolve(__dirname, '../backend/node_modules');
const rootBackendNodeModules = path.resolve(__dirname, '../../backend/node_modules');
const rootNodeModules = path.resolve(__dirname, '../../node_modules');
if (fs.existsSync(rootNodeModules)) {
  module.paths.unshift(rootNodeModules);
}
if (fs.existsSync(backendNodeModules)) {
  module.paths.unshift(backendNodeModules);
}
if (fs.existsSync(rootBackendNodeModules)) {
  module.paths.unshift(rootBackendNodeModules);
}
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { ensurePoliceSchema } = require('../schema/schema');

async function run() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mcrn';
  const isSsl = String(process.env.PG_SSL || 'false').toLowerCase() === 'true';

  const pool = new Pool({
    connectionString,
    ssl: isSsl ? { rejectUnauthorized: false } : false
  });

  console.log('== Initializing MCRN PostgreSQL Database ==');
  try {
    // 1. Auth schema
    await pool.query(`
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
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_user_role'
        ) THEN
          ALTER TABLE users ADD CONSTRAINT chk_user_role CHECK (role IN ('USER', 'POLICE', 'ADMIN'));
        END IF;
      END $$;
    `);

    // Ensure users boolean compatibility
    try {
      await pool.query(`ALTER TABLE users ALTER COLUMN verified DROP DEFAULT`);
      await pool.query(`ALTER TABLE users ALTER COLUMN verified TYPE BOOLEAN USING (CASE WHEN verified::text IN ('1', 'true', 't') THEN true ELSE false END)`);
      await pool.query(`ALTER TABLE users ALTER COLUMN verified SET DEFAULT FALSE`);
    } catch (_) {}

    try {
      await pool.query(`ALTER TABLE users ALTER COLUMN active DROP DEFAULT`);
      await pool.query(`ALTER TABLE users ALTER COLUMN active TYPE BOOLEAN USING (CASE WHEN active::text IN ('0', 'false', 'f') THEN false ELSE true END)`);
      await pool.query(`ALTER TABLE users ALTER COLUMN active SET DEFAULT TRUE`);
    } catch (_) {}
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS police_profiles (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        badge_number VARCHAR(80) NULL,
        station VARCHAR(150) NULL,
        police_rank VARCHAR(100) NULL,
        department VARCHAR(150) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`ALTER TABLE police_profiles ADD COLUMN IF NOT EXISTS station VARCHAR(150) NULL`);
    await pool.query(`ALTER TABLE police_profiles ADD COLUMN IF NOT EXISTS police_rank VARCHAR(100) NULL`);
    await pool.query(`ALTER TABLE police_profiles ADD COLUMN IF NOT EXISTS badge_number VARCHAR(80) NULL`);
    await pool.query(`ALTER TABLE police_profiles ADD COLUMN IF NOT EXISTS official_id VARCHAR(80) NULL`);
    await pool.query(`ALTER TABLE police_profiles ADD COLUMN IF NOT EXISTS department VARCHAR(150) NULL`);
    await pool.query(`ALTER TABLE police_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    await pool.query(`ALTER TABLE police_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    try {
      await pool.query(`ALTER TABLE police_profiles ALTER COLUMN official_id DROP NOT NULL`);
      await pool.query(`ALTER TABLE police_profiles ALTER COLUMN badge_number DROP NOT NULL`);
    } catch (_) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS otp_tokens (
        id SERIAL PRIMARY KEY,
        email VARCHAR(150) NOT NULL,
        code_hash VARCHAR(255) NOT NULL,
        purpose VARCHAR(40) NOT NULL DEFAULT 'EMAIL_VERIFICATION',
        expires_at TIMESTAMP NOT NULL,
        consumed_at TIMESTAMP NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`ALTER TABLE otp_tokens ADD COLUMN IF NOT EXISTS consumed_at TIMESTAMPTZ NULL`);
    await pool.query(`ALTER TABLE otp_tokens ADD COLUMN IF NOT EXISTS code_hash VARCHAR(255)`);
    await pool.query(`ALTER TABLE otp_tokens ADD COLUMN IF NOT EXISTS purpose VARCHAR(40) DEFAULT 'EMAIL_VERIFICATION'`);
    await pool.query(`ALTER TABLE otp_tokens ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ`);
    await pool.query(`ALTER TABLE otp_tokens ADD COLUMN IF NOT EXISTS attempts INT DEFAULT 0`);
    try {
      await pool.query(`ALTER TABLE otp_tokens ALTER COLUMN expires_at TYPE TIMESTAMPTZ`);
      await pool.query(`ALTER TABLE otp_tokens ALTER COLUMN created_at TYPE TIMESTAMPTZ`);
      await pool.query(`ALTER TABLE otp_tokens ALTER COLUMN consumed_at TYPE TIMESTAMPTZ`);
      await pool.query(`UPDATE otp_tokens SET consumed_at = created_at WHERE consumed = true AND consumed_at IS NULL`);
    } catch (_) {}

    // 2. User schema
    await pool.query(`
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
      )
    `);
    await pool.query(`ALTER TABLE children ADD COLUMN IF NOT EXISTS owner_user_id VARCHAR(80) NULL`);
    await pool.query(`ALTER TABLE children ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL`);

    // 3. Reporting schema
    await pool.query(`
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
      )
    `);
    await pool.query(`ALTER TABLE missing_child_reports ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'Reported'`);
    await pool.query(`ALTER TABLE missing_child_reports ADD COLUMN IF NOT EXISTS owner_user_id VARCHAR(80) NULL`);
    await pool.query(`ALTER TABLE missing_child_reports ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL`);

    // 4. Police schema & migration
    await ensurePoliceSchema(pool);

    // 5. Admin schema & seeds
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id SERIAL PRIMARY KEY,
        password_hash VARCHAR(255) NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS case_assignments (
        id SERIAL PRIMARY KEY,
        case_id INT NOT NULL,
        officer_name VARCHAR(150) NULL,
        deadline DATE NULL,
        status VARCHAR(50) DEFAULT 'Assigned',
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`ALTER TABLE case_assignments ADD COLUMN IF NOT EXISTS deadline DATE NULL`);
    await pool.query(`ALTER TABLE case_assignments ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Assigned'`);
    await pool.query(`ALTER TABLE case_assignments ADD COLUMN IF NOT EXISTS officer_id BIGINT NULL`);
    try {
      await pool.query(`ALTER TABLE case_assignments ALTER COLUMN officer_name DROP NOT NULL`);
      await pool.query(`ALTER TABLE case_assignments ALTER COLUMN assigned_by DROP NOT NULL`);
    } catch (_) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        admin_email VARCHAR(150),
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS description TEXT NULL`);
    await pool.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS admin_email VARCHAR(150) NULL`);
    try {
      await pool.query(`ALTER TABLE audit_logs ALTER COLUMN performed_by DROP NOT NULL`);
      await pool.query(`UPDATE audit_logs SET description = details WHERE description IS NULL AND details IS NOT NULL`);
      await pool.query(`UPDATE audit_logs SET details = description WHERE details IS NULL AND description IS NOT NULL`);
    } catch (_) {}

    // Ensure admin_settings schema compatibility
    try {
      await pool.query(`ALTER TABLE admin_settings ALTER COLUMN setting_key DROP NOT NULL`);
      await pool.query(`ALTER TABLE admin_settings ALTER COLUMN setting_value DROP NOT NULL`);
    } catch (_) {}

    // Ensure default admin password hash in admin_settings if empty
    const isProd = process.env.NODE_ENV === 'production' || String(process.env.CLOUD_MODE || '').toLowerCase() === 'true';
    const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || (isProd ? null : 'Admin@123');
    const existing = await pool.query('SELECT password_hash FROM admin_settings WHERE id = 1');
    if (existing.rows.length === 0 && defaultPass) {
      const hashed = await bcrypt.hash(defaultPass, 10);
      await pool.query(
        'INSERT INTO admin_settings (id, setting_key, setting_value, password_hash) VALUES (1, $1, $2, $3)',
        ['default_password', 'configured', hashed]
      );
      console.log('Initialized admin password in admin_settings.');
    }

    console.log('✅ All MCRN PostgreSQL tables initialized and verified successfully.');
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error('❌ Database initialization error:', err.message);
  process.exit(1);
});
