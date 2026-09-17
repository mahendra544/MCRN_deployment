const express = require("express");
const cors = require("cors");
const multer = require("multer");
const db = require("./db");

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploaded photos can be accessed through /uploads
app.use("/uploads", express.static("uploads"));

// Photo upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        const fileName = Date.now() + "-" + file.originalname;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

// Test route
app.get("/", (req, res) => {
    res.send("Missing Child Reporting Backend is running!");
});

// Report Missing Child
app.post("/api/report-child", upload.single("photo"), (req, res) => {

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

    const photo = req.file ? req.file.filename : null;

    const sql = `
        INSERT INTO missing_child_reports (
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
            additional_information
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        additional_information
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.log("Database error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to submit report."
            });
        }

        res.status(201).json({
            success: true,
            message: "Missing child report submitted successfully!",
            reportId: result.insertId
        });
    });
});
// Get all missing child reports
app.get("/api/reports", (req, res) => {
    const sql = `
        SELECT *
        FROM missing_child_reports
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.log("Database error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch reports."
            });
        }

        res.json({
            success: true,
            reports: results
        });
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});  
