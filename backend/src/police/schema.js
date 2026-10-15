const { Pool } = require("pg");

const BASE_COLUMNS = [
  ["case_number", "VARCHAR(80) NOT NULL UNIQUE"],
  ["child_name", "VARCHAR(150) NOT NULL"],
  ["child_age", "INT NOT NULL"],
  ["gender", "VARCHAR(30) NOT NULL"],
  ["last_seen_location", "VARCHAR(255) NOT NULL"],
  ["last_seen_datetime", "TIMESTAMP NOT NULL"],
  ["case_stage", "VARCHAR(40) NOT NULL DEFAULT 'Open'"],
  ["status", "VARCHAR(40) NOT NULL DEFAULT 'Pending Verification'"],
  ["priority", "VARCHAR(20) NOT NULL DEFAULT 'Medium'"],
  ["filed_by", "VARCHAR(100) NOT NULL"],
  ["assigned_officer", "VARCHAR(100) NULL"],
  ["parent_name", "VARCHAR(100) NULL"],
  ["parent_phone", "VARCHAR(30) NULL"],
  ["parent_email", "VARCHAR(150) NULL"],
  ["address", "TEXT NULL"],
  ["height", "VARCHAR(50) NULL"],
  ["weight", "VARCHAR(50) NULL"],
  ["complexion", "VARCHAR(50) NULL"],
  ["identifying_marks", "TEXT NULL"],
  ["clothing_description", "TEXT NULL"],
  ["additional_information", "TEXT NULL"],
  ["photo", "VARCHAR(500) NULL"],
  ["opened_at", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"],
  ["updated_at", "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"],
  ["found_at", "TIMESTAMP NULL"],
  ["deleted_at", "TIMESTAMP NULL"]
];

async function ensurePoliceSchema(connection) {
  await connection.query(`
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
    )
  `);

  const qRes = await connection.query(
    `SELECT column_name AS "COLUMN_NAME" FROM information_schema.columns
     WHERE table_schema = current_schema() AND table_name = 'missing_cases'`
  );
  const rows = qRes.rows || (Array.isArray(qRes) ? qRes[0] : qRes); const existing = new Set((rows || []).map((row) => (row.COLUMN_NAME || row.column_name)));

  for (const [name, definition] of BASE_COLUMNS) {
    if (name === "case_number" || name === "child_name" || name === "child_age" ||
        name === "gender" || name === "last_seen_location" || name === "last_seen_datetime" ||
        name === "case_stage" || name === "filed_by") {
      if (!existing.has(name)) {
        const safeDefinition = definition
          .replace(/ NOT NULL/g, " NULL")
          .replace(/ DEFAULT 'Open'/g, " DEFAULT NULL")
          .replace(/ UNIQUE/g, "");
        await connection.query(`ALTER TABLE missing_cases ADD COLUMN IF NOT EXISTS ${name} ${safeDefinition}`);
      }
      continue;
    }

    if (!existing.has(name)) {
      await connection.query(`ALTER TABLE missing_cases ADD COLUMN IF NOT EXISTS ${name} ${definition}`);
    }
  }

  await connection.query(`UPDATE missing_cases SET status = CASE
    WHEN status IS NULL OR status = '' THEN
      CASE case_stage WHEN 'Open' THEN 'Pending Verification' WHEN 'Child Located' THEN 'Resolved' ELSE case_stage END
    ELSE status END`);

  await connection.query(`
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
    )
  `);

  await connection.query(`ALTER TABLE sightings ADD COLUMN IF NOT EXISTS case_id INT NULL`);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS police_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(80) UNIQUE,
      password VARCHAR(255),
      full_name VARCHAR(150),
      badge_id VARCHAR(80),
      department VARCHAR(150)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS email_suppressions (
      email VARCHAR(255) PRIMARY KEY,
      reason VARCHAR(255) NOT NULL,
      failure_type VARCHAR(100) NOT NULL,
      suppressed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function ensurePoliceSchemaFromEnv(env = process.env) {
  const connectionString = env.DATABASE_URL || (
    env.DB_HOST
      ? `postgresql://${encodeURIComponent(env.DB_USER || "postgres")}:${encodeURIComponent(env.DB_PASSWORD || "")}@${env.DB_HOST}:${env.DB_PORT || 5432}/${env.DB_NAME || "mcrn"}`
      : "postgresql://localhost:5432/mcrn"
  );
  const isSsl = String(env.PG_SSL || env.DB_SSL || "false").toLowerCase() === "true";
  const pool = new Pool({
    connectionString,
    ssl: isSsl ? { rejectUnauthorized: false } : false
  });
  try {
    await ensurePoliceSchema(pool);
  } finally {
    await pool.end();
  }
}

module.exports = { ensurePoliceSchema, ensurePoliceSchemaFromEnv };
