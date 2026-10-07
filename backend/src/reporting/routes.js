const express = require("express");
const multer = require("multer");
const db = require("../db");
const { syncReport } = require("./sync");
const { requireAuth } = require("../middleware");
const { uploadChildImage } = require("../config/supabase");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed."));
    }
  }
});

// POST /api/report-child
router.post("/report-child", requireAuth(["USER"]), upload.single("photo"), async (req, res) => {
  const {
    child_name,
    age,
    gender,
    date_missing,
    time_missing,
    last_seen_location,
    height,
    weight,
    complexion,
    identifying_marks,
    clothing_description,
    parent_name,
    parent_phone,
    parent_email,
    address,
    additional_information
  } = req.body;

  let photo = null;

  try {
    if (req.file) {
      photo = await uploadChildImage(req.file, { userId: req.user.sub });
    }
  } catch (uploadError) {
    console.error("Photo upload error:", uploadError.message);
    return res.status(400).json({
      success: false,
      message: uploadError.message || "Image upload failed"
    });
  }

  const sql = `
    INSERT INTO missing_child_reports (
      child_name, age, gender, date_missing, time_missing, last_seen_location,
      height, weight, complexion, identifying_marks, clothing_description,
      parent_name, parent_phone, parent_email, address, photo,
      additional_information, owner_user_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    child_name,
    age,
    gender,
    date_missing,
    time_missing,
    last_seen_location,
    height,
    weight,
    complexion,
    identifying_marks,
    clothing_description,
    parent_name,
    parent_phone,
    parent_email,
    address,
    photo,
    additional_information,
    String(req.user.sub)
  ];

  db.query(sql, values, async (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: "Failed to submit report." });
    }

    const insertId = result.insertId || (result.rows && result.rows[0] && result.rows[0].id);
    const caseNumber = `MC-${insertId}`;

    try {
      await syncReport({
        userId: req.user.sub,
        reportId: insertId,
        caseNumber,
        childName: child_name,
        age,
        gender,
        location: last_seen_location,
        dateMissing: date_missing,
        timeMissing: time_missing,
        photo,
        parentName: parent_name,
        parentPhone: parent_phone,
        parentEmail: parent_email,
        address,
        height,
        weight,
        complexion,
        identifyingMarks: identifying_marks,
        clothingDescription: clothing_description,
        additionalInformation: additional_information
      });
      res.status(201).json({
        success: true,
        message: "Missing child report submitted successfully!",
        reportId: insertId,
        caseNumber
      });
    } catch (syncError) {
      console.error("Integration sync failed:", syncError);
      db.query("UPDATE missing_child_reports SET deleted_at = NOW() WHERE id = ?", [insertId], () => {});
      res.status(500).json({
        success: false,
        message: "Report could not be synchronized with the rescue network. Please try again."
      });
    }
  });
});

// GET /api/reports
router.get("/reports", requireAuth(["USER", "ADMIN"]), (req, res) => {
  const limit = req.query.limit ? Math.min(Math.max(Number(req.query.limit), 1), 500) : null;
  const offset = req.query.offset ? Math.max(Number(req.query.offset), 0) : null;
  let sql = `
    SELECT *
    FROM missing_child_reports
    WHERE deleted_at IS NULL AND owner_user_id = ?
    ORDER BY created_at DESC
  `;
  const params = [req.user.sub];
  if (limit !== null) {
    sql += " LIMIT ? OFFSET ?";
    params.push(limit, offset || 0);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch reports."
      });
    }

    res.json({
      success: true,
      reports: results || []
    });
  });
});

module.exports = router;
