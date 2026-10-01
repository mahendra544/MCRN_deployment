const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Create uploads folder automatically
const uploadsFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsFolder)) {
  fs.mkdirSync(uploadsFolder);
}

// MySQL connection
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

// Multer configuration for photo upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsFolder);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// Test route
app.get("/", (req, res) => {
  res.send("Sightings backend is running successfully!");
});

// POST: Submit a new sighting
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

  // Check required fields
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

  // Path of uploaded photo
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

// GET: Get all pending sightings for Police Dashboard
app.get("/api/police/sightings", (req, res) => {
  const sql = `
    SELECT * FROM sightings
    WHERE status = 'Pending'
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching sightings:", err.message);

      return res.status(500).json({
        message: "Failed to fetch sighting reports."
      });
    }

    res.status(200).json(results);
  });
});

// PATCH: Police verifies or rejects a sighting report
app.patch("/api/police/sightings/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Only allow police verification statuses
  const allowedStatuses = ["Verified", "Rejected"];

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
      status: status
    });
  });
});

// Get all pending sighting reports for Police Dashboard
app.get("/api/police/sightings/pending", (req, res) => {
  const sql = `
    SELECT * FROM sightings
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

// Update sighting status by Police
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

  const sql = "UPDATE sightings SET status = ? WHERE id = ?";

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
      status: status
    });
  });
});

// Get one sighting report by ID
app.get("/api/police/sightings/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM sightings WHERE id = ?";

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

// Verify a sighting report
app.put("/api/police/sightings/:id/verify", (req, res) => {
  const { id } = req.params;

  const sql = "UPDATE sightings SET status = 'Verified' WHERE id = ?";

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


// Reject a sighting report
app.put("/api/police/sightings/:id/reject", (req, res) => {
  const { id } = req.params;

  const sql = "UPDATE sightings SET status = 'Rejected' WHERE id = ?";

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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});