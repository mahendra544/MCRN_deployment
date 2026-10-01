const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ======================================================
// UPLOADS FOLDER
// ======================================================

const uploadsFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder);
}

// ======================================================
// MYSQL CONNECTION
// ======================================================

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    return;
  }

  console.log("Connected to MySQL database successfully!");
});

// ======================================================
// MULTER CONFIGURATION
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsFolder);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1E9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// ======================================================
// TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.send("Sightings backend is running successfully!");
});

// REPORT CHILD
app.post("/api/report-child", upload.single("photo"), (req, res) => {
  const {
    child_name,
    age,
    gender,
    last_seen_location,
    last_seen_date,
    last_seen_time,
    description,
    reporter_name,
    contact_number,
  } = req.body;

  const photo_url = req.file
    ? `/uploads/${req.file.filename}`
    : null;

  const sql = `
    INSERT INTO missing_child_reports
    (
      child_name,
      age,
      gender,
      last_seen_location,
      last_seen_date,
      last_seen_time,
      description,
      reporter_name,
      contact_number,
      photo_url
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      child_name,
      age,
      gender,
      last_seen_location,
      last_seen_date,
      last_seen_time,
      description,
      reporter_name,
      contact_number,
      photo_url,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Failed to report missing child",
        });
      }

      res.status(201).json({
        message: "Missing child reported successfully",
        id: result.insertId,
      });
    }
  );
});

// GET ALL REPORTS
app.get("/api/reports", (req, res) => {
  const sql = "SELECT * FROM missing_child_reports ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Failed to fetch reports",
      });
    }

    res.json(results);
  });
});

// ======================================================
// SIGHTINGS API
// ======================================================

// ------------------------------------------------------
// POST: Submit a new sighting
// ------------------------------------------------------

app.post("/api/sightings", upload.single("photo"), (req, res) => {
  const {
    location,
    approximate_age,
    gender,
    sighting_date,
    sighting_time,
    description,
    reporter_name,
    contact_number
  } = req.body;

  if (
    !req.file ||
    !location ||
    !approximate_age ||
    !gender ||
    !sighting_date ||
    !sighting_time ||
    !description
  ) {
    return res.status(400).json({
      message: "Please fill in all required fields and upload a photo."
    });
  }

  const photo_url = `/uploads/${req.file.filename}`;

  const sql = `
    INSERT INTO sightings
    (
      photo_url,
      location,
      approximate_age,
      gender,
      sighting_date,
      sighting_time,
      description,
      reporter_name,
      contact_number
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    photo_url,
    location,
    approximate_age,
    gender,
    sighting_date,
    sighting_time,
    description,
    reporter_name || null,
    contact_number || null
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error saving sighting:", err.message);

      return res.status(500).json({
        message: "Failed to save sighting report."
      });
    }

    res.status(201).json({
      message: "Sighting report submitted successfully!",
      sighting_id: result.insertId,
      status: "Pending"
    });
  });
});

// ------------------------------------------------------
// GET: Pending sightings
// ------------------------------------------------------

app.get("/api/police/sightings", (req, res) => {
  db.query(
    `SELECT *
     FROM sightings
     ORDER BY created_at DESC`,
    (err, rows) => {
      if (err) {
        console.error("Error fetching sightings:", err);

        return res.status(500).json({
          message: "Failed to fetch sightings",
        });
      }

      res.status(200).json(rows);
    }
  );
});

// ------------------------------------------------------
// GET: Pending sightings
// ------------------------------------------------------

app.get("/api/police/sightings/pending", (req, res) => {
  const sql = `
    SELECT *
    FROM sightings
    WHERE status = 'Pending'
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching pending sightings:", err);

      return res.status(500).json({
        message: "Failed to fetch pending sightings"
      });
    }

    res.status(200).json(results);
  });
});

// ------------------------------------------------------
// PATCH: Verify or reject sighting
// ------------------------------------------------------

app.patch("/api/police/sightings/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = [
    "Verified",
    "Rejected"
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Status must be either Verified or Rejected."
    });
  }

  const sql = `
    UPDATE sightings
    SET status = ?
    WHERE id = ?
  `;

  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("Error updating sighting status:", err.message);

      return res.status(500).json({
        message: "Failed to update sighting status."
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Sighting report not found."
      });
    }

    res.status(200).json({
      message: `Sighting report ${status.toLowerCase()} successfully!`,
      sighting_id: id,
      status
    });
  });
});

// ------------------------------------------------------
// PUT: Update sighting status
// ------------------------------------------------------

app.put("/api/police/sightings/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = [
    "Pending",
    "Under Investigation",
    "Verified",
    "Rejected",
    "Found",
    "Closed"
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid status"
    });
  }

  const sql = `
    UPDATE sightings
    SET status = ?
    WHERE id = ?
  `;

  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("Error updating sighting status:", err);

      return res.status(500).json({
        message: "Failed to update sighting status"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Sighting report not found"
      });
    }

    res.status(200).json({
      message: "Sighting status updated successfully",
      sighting_id: id,
      status
    });
  });
});

// ------------------------------------------------------
// GET: One sighting
// ------------------------------------------------------

app.get("/api/police/sightings/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT *
    FROM sightings
    WHERE id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching sighting:", err);

      return res.status(500).json({
        message: "Failed to fetch sighting report"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Sighting report not found"
      });
    }

    res.status(200).json(results[0]);
  });
});

// ------------------------------------------------------
// PUT: Verify sighting
// ------------------------------------------------------

app.put("/api/police/sightings/:id/verify", (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE sightings
    SET status = 'Verified'
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error verifying sighting:", err);

      return res.status(500).json({
        message: "Failed to verify sighting report"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Sighting report not found"
      });
    }

    res.status(200).json({
      message: "Sighting report verified successfully",
      sighting_id: id,
      status: "Verified"
    });
  });
});

// ------------------------------------------------------
// PUT: Reject sighting
// ------------------------------------------------------

app.put("/api/police/sightings/:id/reject", (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE sightings
    SET status = 'Rejected'
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error rejecting sighting:", err);

      return res.status(500).json({
        message: "Failed to reject sighting report"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Sighting report not found"
      });
    }

    res.status(200).json({
      message: "Sighting report rejected successfully",
      sighting_id: id,
      status: "Rejected"
    });
  });
});

// ======================================================
// POLICE CASES API
// ======================================================

// ------------------------------------------------------
// GET: All missing cases
// ------------------------------------------------------

app.get("/api/police/cases", (req, res) => {
  const { name, stage, location } = req.query;

  let sql = `
    SELECT
      id,
      case_number AS case_id,
      child_name,
      child_age,
      gender,
      last_seen_location,
      last_seen_datetime,
      case_stage,
      filed_by,
      assigned_officer,
      opened_at,
      updated_at,
      found_at
    FROM missing_cases
    WHERE 1 = 1
  `;

  const values = [];

  if (name) {
    sql += " AND child_name LIKE ?";
    values.push(`%${name}%`);
  }

  if (stage) {
    sql += " AND case_stage = ?";
    values.push(stage);
  }

  if (location) {
    sql += " AND last_seen_location LIKE ?";
    values.push(`%${location}%`);
  }

  sql += " ORDER BY opened_at DESC";

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error fetching cases:", err.message);

      return res.status(500).json({
        message: "Failed to fetch cases."
      });
    }

    res.status(200).json(results);
  });
});

// ------------------------------------------------------
// GET: One missing case
// ------------------------------------------------------

app.get("/api/police/cases/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      id,
      case_number AS case_id,
      child_name,
      child_age,
      gender,
      last_seen_location,
      last_seen_datetime,
      case_stage,
      filed_by,
      assigned_officer,
      opened_at,
      updated_at,
      found_at
    FROM missing_cases
    WHERE id = ?
       OR case_number = ?
    LIMIT 1
  `;

  db.query(sql, [id, id], (err, results) => {
    if (err) {
      console.error("Error fetching case:", err.message);

      return res.status(500).json({
        message: "Failed to fetch case."
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Case not found."
      });
    }

    res.status(200).json(results[0]);
  });
});

// ------------------------------------------------------
// POST: Create a new missing case
// ------------------------------------------------------

app.post("/api/police/cases", (req, res) => {
  const {
    case_number,
    child_name,
    child_age,
    gender,
    last_seen_location,
    last_seen_datetime,
    filed_by,
    assigned_officer
  } = req.body;

  if (
    !case_number ||
    !child_name ||
    child_age === undefined ||
    !gender ||
    !last_seen_location ||
    !last_seen_datetime ||
    !filed_by
  ) {
    return res.status(400).json({
      message: "Please provide all required case details."
    });
  }

  const sql = `
    INSERT INTO missing_cases (
      case_number,
      child_name,
      child_age,
      gender,
      last_seen_location,
      last_seen_datetime,
      filed_by,
      assigned_officer
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    case_number,
    child_name,
    child_age,
    gender,
    last_seen_location,
    last_seen_datetime,
    filed_by,
    assigned_officer || null
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error creating case:", err.message);

      return res.status(500).json({
        message: "Failed to create case."
      });
    }

    res.status(201).json({
      message: "Missing case created successfully.",
      case_id: result.insertId,
      case_number,
      case_stage: "Open"
    });
  });
});

// ------------------------------------------------------
// PATCH: Update case stage
// ------------------------------------------------------

app.patch("/api/police/cases/:id/stage", (req, res) => {
  const caseIdentifier = req.params.id;
  const { case_stage } = req.body;

  console.log("STAGE ENDPOINT HIT");
  console.log("CASE IDENTIFIER RECEIVED:", caseIdentifier);
  console.log("NEW CASE STAGE:", case_stage);

  const allowedStages = [
    "Open",
    "Investigating",
    "Matched",
    "Resolved",
    "Closed",
  ];

  if (!case_stage) {
    return res.status(400).json({
      message: "case_stage is required",
    });
  }

  if (!allowedStages.includes(case_stage)) {
    return res.status(400).json({
      message: "Invalid case stage",
    });
  }

  const findCaseSql = `
    SELECT *
    FROM missing_cases
    WHERE id = ?
       OR case_number = ?
    LIMIT 1
  `;

  db.query(
    findCaseSql,
    [caseIdentifier, caseIdentifier],
    (findErr, rows) => {
      if (findErr) {
        console.error(
          "Error finding case:",
          findErr
        );

        return res.status(500).json({
          message: "Failed to find case",
        });
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({
          message: "Case not found",
        });
      }

      const existingCase = rows[0];

      console.log(
        "ACTUAL DATABASE CASE ID:",
        existingCase.id
      );

      const updateSql = `
        UPDATE missing_cases
        SET case_stage = ?,
            updated_at = NOW()
        WHERE id = ?
      `;

      db.query(
        updateSql,
        [case_stage, existingCase.id],
        (updateErr, result) => {
          if (updateErr) {
            console.error(
              "Error updating case stage:",
              updateErr
            );

            return res.status(500).json({
              message: "Failed to update case stage",
            });
          }

          console.log(
            "STAGE UPDATE RESULT:",
            result
          );

          const selectSql = `
            SELECT
              id,
              case_number AS case_id,
              child_name,
              child_age,
              gender,
              last_seen_location,
              last_seen_datetime,
              case_stage,
              filed_by,
              assigned_officer,
              opened_at,
              updated_at,
              found_at
            FROM missing_cases
            WHERE id = ?
          `;

          db.query(
            selectSql,
            [existingCase.id],
            (selectErr, updatedRows) => {
              if (selectErr) {
                console.error(
                  "Error fetching updated case:",
                  selectErr
                );

                return res.status(500).json({
                  message:
                    "Case updated but failed to fetch updated case",
                });
              }

              if (!updatedRows || updatedRows.length === 0) {
                return res.status(404).json({
                  message:
                    "Case updated but could not be retrieved",
                });
              }

              res.status(200).json({
                message: "Case stage updated successfully",
                case: updatedRows[0],
              });
            }
          );
        }
      );
    }
  );
});

// ------------------------------------------------------
// PATCH: Mark child as found
// ------------------------------------------------------

// ------------------------------------------------------
// PATCH: Mark child as found
// ------------------------------------------------------

app.patch("/api/police/cases/:id/found", (req, res) => {
  const caseIdentifier = req.params.id;

  console.log("FOUND ENDPOINT HIT");
  console.log("CASE IDENTIFIER RECEIVED:", caseIdentifier);

  // First find the case using either numeric ID or case number.
  const findCaseSql = `
    SELECT id, case_number
    FROM missing_cases
    WHERE case_number = ?
  `;

  db.query(
    findCaseSql,
    [caseIdentifier],
    (err, caseRows) => {
      if (err) {
        console.error("Error finding case:", err);

        return res.status(500).json({
          message: "Failed to find case"
        });
      }

      if (caseRows.length === 0) {
        return res.status(404).json({
          message: "Case not found"
        });
      }

      const actualCaseId = caseRows[0].id;

      console.log("ACTUAL DATABASE CASE ID:", actualCaseId);

      // Now update using the numeric database ID.
      const updateSql = `
        UPDATE missing_cases
        SET
          case_stage = 'Resolved',
          found_at = NOW()
        WHERE id = ?
      `;

      db.query(
        updateSql,
        [actualCaseId],
        (err, result) => {
          if (err) {
            console.error("Error marking case as found:", err);

            return res.status(500).json({
              message: "Failed to mark child as found"
            });
          }

          console.log("FOUND UPDATE RESULT:", result);

          if (result.affectedRows === 0) {
            return res.status(404).json({
              message: "Case not found"
            });
          }

          // Get the updated case.
          const getUpdatedCaseSql = `
            SELECT
              id,
              case_number AS case_id,
              child_name,
              child_age,
              gender,
              last_seen_location,
              last_seen_datetime,
              case_stage,
              filed_by,
              assigned_officer,
              opened_at,
              updated_at,
              found_at
            FROM missing_cases
            WHERE id = ?
          `;

          db.query(
            getUpdatedCaseSql,
            [actualCaseId],
            (err, rows) => {
              if (err) {
                console.error(
                  "Error fetching updated case:",
                  err
                );

                return res.status(500).json({
                  message:
                    "Case was updated but failed to fetch updated case"
                });
              }

              res.status(200).json({
                message:
                  "Child marked as found successfully",
                case: rows[0]
              });
            }
          );
        }
      );
    }
  );
});

// ======================================================
// MATCH SIGHTING TO CASE
// ======================================================

app.put("/api/police/sightings/:id/match", (req, res) => {
  const sightingId = req.params.id;
  const { case_id } = req.body;

  if (!case_id) {
    return res.status(400).json({
      message: "case_id is required"
    });
  }

  // ----------------------------------------------------
  // 1. Check sighting
  // ----------------------------------------------------

  db.query(
    "SELECT * FROM sightings WHERE id = ?",
    [sightingId],
    (err, sightingRows) => {
      if (err) {
        console.error("Error checking sighting:", err);

        return res.status(500).json({
          message: "Failed to check sighting"
        });
      }

      if (sightingRows.length === 0) {
        return res.status(404).json({
          message: "Sighting not found"
        });
      }

      // ------------------------------------------------
      // 2. Check case
      // ------------------------------------------------

      db.query(
        `
          SELECT *
          FROM missing_cases
          WHERE id = ?
             OR case_number = ?
          LIMIT 1
        `,
        [case_id, case_id],
        (err, caseRows) => {
          if (err) {
            console.error("Error checking case:", err);

            return res.status(500).json({
              message: "Failed to check case"
            });
          }

          if (caseRows.length === 0) {
            return res.status(404).json({
              message: "Missing-child case not found"
            });
          }

          const actualCaseId = caseRows[0].id;

          // ----------------------------------------------
          // 3. Link sighting to case
          // ----------------------------------------------

          db.query(
            `
              UPDATE sightings
              SET
                case_id = ?,
                status = 'Verified'
              WHERE id = ?
            `,
            [actualCaseId, sightingId],
            (err) => {
              if (err) {
                console.error("Error matching sighting:", err);

                return res.status(500).json({
                  message: "Failed to match sighting to case"
                });
              }

              // ------------------------------------------
              // 4. Update case stage
              // ------------------------------------------

              db.query(
                `
                  UPDATE missing_cases
                  SET case_stage = 'Matched'
                  WHERE id = ?
                `,
                [actualCaseId],
                (err) => {
                  if (err) {
                    console.error("Error updating case:", err);

                    return res.status(500).json({
                      message: "Failed to update case stage"
                    });
                  }

                  res.status(200).json({
                    message: "Sighting matched to case successfully",
                    sighting_id: Number(sightingId),
                    case_id: actualCaseId,
                    case_number: caseRows[0].case_number,
                    status: "Verified",
                    case_stage: "Matched"
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// ======================================================
// GET SIGHTINGS FOR A CASE
// ======================================================

app.get("/api/police/cases/:id/sightings", (req, res) => {
  const caseId = req.params.id;

  db.query(
    `
      SELECT
        *
      FROM sightings
      WHERE case_id = ?
      ORDER BY created_at DESC
    `,
    [caseId],
    (err, rows) => {
      if (err) {
        console.error("Error fetching case sightings:", err);

        return res.status(500).json({
          message: "Failed to fetch case sightings"
        });
      }

      res.status(200).json(rows);
    }
  );
});

app.post("/api/police/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  const sql = `
    SELECT
      id,
      officer_name,
      badge_number,
      username,
      password_hash
    FROM police_users
    WHERE username = ?
    LIMIT 1
  `;

  db.query(sql, [username], async (err, rows) => {
    if (err) {
      console.error("Police login error:", err);

      return res.status(500).json({
        message: "Login failed",
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const officer = rows[0];

    try {
      const passwordMatches = await bcrypt.compare(
        password,
        officer.password_hash
      );

      if (!passwordMatches) {
        return res.status(401).json({
          message: "Invalid username or password",
        });
      }

      return res.status(200).json({
        message: "Login successful",
        officer: {
          id: officer.id,
          officer_name: officer.officer_name,
          badge_number: officer.badge_number,
          username: officer.username,
        },
      });
    } catch (error) {
      console.error("Password comparison error:", error);

      return res.status(500).json({
        message: "Login failed",
      });
    }
  });
});

app.get("/api/police/sightings/pending/count", (req, res) => {
  const sql = `
    SELECT COUNT(*) AS count
    FROM sightings
    WHERE status = 'Pending'
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error(
        "Error fetching pending sighting count:",
        err
      );

      return res.status(500).json({
        message: "Failed to fetch pending sighting count",
      });
    }

    res.status(200).json({
      count: Number(rows[0]?.count || 0),
    });
  });
});

// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});