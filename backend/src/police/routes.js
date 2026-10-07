const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { requirePolice, requireAnyUser } = require("../middleware");
const { ensurePoliceSchema } = require("./schema");
const db = require("../db");
const { uploadChildImage, supabase } = require("../config/supabase");

dotenv.config();

const router = express.Router();
const app = router;
const PORT = process.env.PORT || 5003;

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// ======================================================
// UPLOADS FOLDER
// ======================================================

const uploadsFolder = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder);
}

// ======================================================
// POSTGRESQL CONNECTION (SHARED MCRN DATABASE)
// ======================================================

const reportingDb = db;
const userDb = db;

ensurePoliceSchema(db).then(() => {
  console.log("Connected to PostgreSQL database successfully!");
  console.log("Police database schema verified/migrated successfully.");
}).catch((schemaError) => {
  console.warn("Police database schema verification warning:", schemaError.message);
});

app.use("/api/police", requirePolice);
app.use("/api/notifications", requireAnyUser);

function requireUserOrPolice(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    if (!/^Bearer\s+/i.test(h)) return res.status(401).json({ message: "Authentication required" });
    const jwt = require("jsonwebtoken");
    const user = jwt.verify(h.replace(/^Bearer\s+/i, ""), process.env.JWT_SECRET);
    if (!["USER", "POLICE", "ADMIN"].includes(user.role)) return res.status(403).json({ message: "Forbidden" });
    req.user = user;
    next();
  } catch { return res.status(401).json({ message: "Invalid or expired session" }); }
}

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

// ======================================================
// SIGHTINGS API
// ======================================================

// ------------------------------------------------------
// POST: Submit a new sighting
// ------------------------------------------------------

app.post("/api/sightings", requireUserOrPolice, upload.single("photo"), async (req, res) => {
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

  let photo_url = `/uploads/${req.file.filename}`;
  if (supabase) {
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const uploadedUrl = await uploadChildImage({
        buffer: fileBuffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }, { userId: req.user?.sub || "user", prefix: "sightings" });
      if (uploadedUrl) {
        photo_url = uploadedUrl;
      }
    } catch (uploadErr) {
      console.warn("Sightings Supabase upload fallback:", uploadErr.message);
    }
  }

  let matchedCaseId = null;
  if (req.body.case_id) {
    const [caseRows] = await db.promise().query(
      `SELECT id FROM missing_cases WHERE deleted_at IS NULL AND (CAST(id AS TEXT) = ? OR case_number = ?) LIMIT 1`,
      [String(req.body.case_id), String(req.body.case_id)]
    );
    if (!caseRows.length) return res.status(404).json({ message: "The selected missing-child case was not found." });
    matchedCaseId = caseRows[0].id;
  }

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
      contact_number,
      case_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    contact_number || null,
    matchedCaseId
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

// Merge details from the original reporting database for older cases that
// were synchronized before the complete-field fix. New cases already contain
// these values in missing_cases, but COALESCE keeps old records complete too.
async function enrichCasesFromReportingDb(cases) {
  if (!Array.isArray(cases) || cases.length === 0) return cases;

  const ids = cases
    .map((item) => {
      const match = /^MC-(\d+)$/.exec(String(item.case_id || ""));
      return match ? Number(match[1]) : null;
    })
    .filter((id) => Number.isInteger(id));

  if (!ids.length) return cases;

  const placeholders = ids.map(() => "?").join(",");
  const [reports] = await reportingDb.query(
    `SELECT id, parent_name, parent_phone, parent_email, address, height, weight, complexion,
            identifying_marks, clothing_description, additional_information, photo
     FROM missing_child_reports WHERE id IN (${placeholders})`,
    ids
  );

  const byId = new Map(reports.map((report) => [Number(report.id), report]));
  return cases.map((item) => {
    const match = /^MC-(\d+)$/.exec(String(item.case_id || ""));
    const report = match ? byId.get(Number(match[1])) : null;
    if (!report) return item;

    return {
      ...item,
      parent_name: item.parent_name || report.parent_name,
      parent_phone: item.parent_phone || report.parent_phone,
      parent_email: item.parent_email || report.parent_email,
      address: item.address || report.address,
      height: item.height || report.height,
      weight: item.weight || report.weight,
      complexion: item.complexion || report.complexion,
      identifying_marks: item.identifying_marks || report.identifying_marks,
      clothing_description: item.clothing_description || report.clothing_description,
      additional_information: item.additional_information || report.additional_information,
      photo: (function() {
        const raw = item.photo || (report ? report.photo : null);
        if (!raw) return null;
        if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/uploads/")) return raw;
        const SUPABASE_URL = process.env.SUPABASE_URL || "https://oiyckfwjescfzcokjnpf.supabase.co";
        const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "missing-child-images";
        return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${raw}`;
      })(),
    };
  });
}

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
      found_at,
      parent_name,
      parent_phone,
      parent_email,
      address,
      height,
      weight,
      complexion,
      identifying_marks,
      clothing_description,
      additional_information,
      photo
    FROM missing_cases
    WHERE deleted_at IS NULL
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

  const limit = req.query.limit ? Math.min(Math.max(Number(req.query.limit), 1), 500) : null;
  const offset = req.query.offset ? Math.max(Number(req.query.offset), 0) : null;
  sql += " ORDER BY opened_at DESC";
  if (limit !== null) {
    sql += " LIMIT ? OFFSET ?";
    values.push(limit, offset || 0);
  }

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error fetching cases:", err.message);

      return res.status(500).json({
        message: "Failed to fetch cases."
      });
    }

    enrichCasesFromReportingDb(results)
      .then((enriched) => res.status(200).json(enriched))
      .catch((enrichError) => {
        console.error("Case enrichment warning:", enrichError.message);
        res.status(200).json(results);
      });
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
      found_at,
      parent_name,
      parent_phone,
      parent_email,
      address,
      height,
      weight,
      complexion,
      identifying_marks,
      clothing_description,
      additional_information,
      photo
    FROM missing_cases
    WHERE deleted_at IS NULL AND (CAST(id AS TEXT) = ?
       OR case_number = ?)
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

    enrichCasesFromReportingDb(results)
      .then((enriched) => res.status(200).json(enriched[0]))
      .catch((enrichError) => {
        console.error("Case enrichment warning:", enrichError.message);
        res.status(200).json(results[0]);
      });
  });
});

// ------------------------------------------------------
// DELETE: Delete a missing case everywhere it was synchronized
// ------------------------------------------------------

app.delete("/api/police/cases/:id", async (req, res) => {
  const caseIdentifier = String(req.params.id || "").trim();
  if (!caseIdentifier) return res.status(400).json({ message: "Case identifier is required." });
  let policeCase;
  try {
    const [rows] = await db.promise().query(
      `SELECT id, case_number FROM missing_cases WHERE deleted_at IS NULL AND (CAST(id AS TEXT) = ? OR case_number = ?) LIMIT 1`,
      [caseIdentifier, caseIdentifier]
    );
    if (!rows.length) return res.status(404).json({ message: "Case not found." });
    policeCase = rows[0];
    const caseNumber = policeCase.case_number;
    const now = new Date();
    const match = /^MC-(\d+)$/.exec(caseNumber);
    let policeDone = false, userDone = false, reportDone = false;

    try {
      await db.promise().query(`UPDATE missing_cases SET deleted_at = ? WHERE id = ?`, [now, policeCase.id]);
      policeDone = true;
      await userDb.query(`UPDATE children SET deleted_at = ? WHERE case_id = ?`, [now, caseNumber]);
      userDone = true;
      if (match) {
        await reportingDb.query(`UPDATE missing_child_reports SET deleted_at = ? WHERE id = ?`, [now, Number(match[1])]);
        reportDone = true;
      }
    } catch (syncError) {
      // Compensate any earlier soft-deletes so all synchronized databases remain consistent.
      if (reportDone && match) await reportingDb.query(`UPDATE missing_child_reports SET deleted_at = NULL WHERE id = ?`, [Number(match[1])]).catch(() => {});
      if (userDone) await userDb.query(`UPDATE children SET deleted_at = NULL WHERE case_id = ?`, [caseNumber]).catch(() => {});
      if (policeDone) await db.promise().query(`UPDATE missing_cases SET deleted_at = NULL WHERE id = ?`, [policeCase.id]).catch(() => {});
      throw syncError;
    }

    return res.status(200).json({ success:true, message:"Case deleted successfully from the police, user, and reporting records.", case_id:caseNumber });
  } catch (error) {
    console.error("Error deleting case:", error);
    return res.status(500).json({ message:"Case could not be deleted consistently from all synchronized databases. No completed deletion was left behind." });
  }
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
    assigned_officer,
    parent_name,
    parent_phone,
    parent_email,
    address,
    height,
    weight,
    complexion,
    identifying_marks,
    clothing_description,
    additional_information,
    photo
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
      assigned_officer,
      parent_name,
      parent_phone,
      parent_email,
      address,
      height,
      weight,
      complexion,
      identifying_marks,
      clothing_description,
      additional_information,
      photo
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    case_number,
    child_name,
    child_age,
    gender,
    last_seen_location,
    last_seen_datetime,
    filed_by,
    assigned_officer || null,
    parent_name || null,
    parent_phone || null,
    parent_email || null,
    address || null,
    height || null,
    weight || null,
    complexion || null,
    identifying_marks || null,
    clothing_description || null,
    additional_information || null,
    photo || null
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
async function syncCaseState(caseNumber, stage) {
  const normalized = stage === "Resolved" || stage === "Closed" || stage === "Child Located" ? "Resolved" : stage;
  await userDb.query("UPDATE children SET status = ? WHERE case_id = ?", [normalized, caseNumber]);
  if (/^MC-\d+$/.test(caseNumber)) {
    await reportingDb.query("UPDATE missing_child_reports SET status = ? WHERE id = ?", [stage, Number(caseNumber.slice(3))]);
  }
}

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
    WHERE deleted_at IS NULL AND (CAST(id AS TEXT) = ?
       OR case_number = ?)
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
        WHERE deleted_at IS NULL AND id = ?
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

          syncCaseState(existingCase.case_number, case_stage).catch((syncError) => {
            console.error("Cross-system stage sync warning:", syncError.message);
          });

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
    WHERE deleted_at IS NULL AND case_number = ?
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
        WHERE deleted_at IS NULL AND id = ?
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

              syncCaseState(caseRows[0].case_number, "Resolved").catch((syncError) => {
                console.error("Cross-system found-case sync warning:", syncError.message);
              });

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
          WHERE deleted_at IS NULL AND (CAST(id AS TEXT) = ?
             OR case_number = ?)
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
// LIVE NOTIFICATIONS (shared user + police feed)
// ======================================================
app.get("/api/notifications", async (req, res) => {
  try {
    const [cases] = await db.promise().query(`
      SELECT id, case_number, child_name, case_stage, opened_at, updated_at
      FROM missing_cases
      WHERE deleted_at IS NULL
      ORDER BY COALESCE(updated_at, opened_at) DESC
      LIMIT 30
    `);
    const notifications = [];
    for (const item of cases) {
      const when = item.updated_at || item.opened_at;
      if (item.case_stage === "Resolved" || item.case_stage === "Closed") {
        notifications.push({ id: `resolved-${item.id}`, title: "Case solved", message: `${item.case_number}: ${item.child_name} has been marked ${item.case_stage.toLowerCase()}.`, time: when, type: "resolved" });
      } else {
        notifications.push({ id: `report-${item.id}`, title: "New missing-child report", message: `${item.case_number}: ${item.child_name} requires attention.`, time: when, type: "case" });
      }
    }
    res.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications", notifications: [] });
  }
});

// ======================================================
// GET SIGHTINGS FOR A CASE
// ======================================================

app.get("/api/police/cases/:id/sightings", async (req, res) => {
  const caseIdentifier = String(req.params.id || "").trim();

  try {
    const [caseRows] = await db.promise().query(
      `SELECT id FROM missing_cases WHERE deleted_at IS NULL AND (CAST(id AS TEXT) = ? OR case_number = ?) LIMIT 1`,
      [caseIdentifier, caseIdentifier]
    );

    if (!caseRows.length) {
      return res.status(404).json({ message: "Case not found" });
    }

    const [rows] = await db.promise().query(
      `SELECT * FROM sightings WHERE case_id = ? ORDER BY created_at DESC`,
      [caseRows[0].id]
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching case sightings:", error);
    return res.status(500).json({
      message: "Failed to fetch case sightings",
      error: error.message
    });
  }
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
      count: Number((rows && rows[0] && rows[0].count) || 0),
    });
  });
});

// ======================================================
// START SERVER
// ======================================================


module.exports = router;
