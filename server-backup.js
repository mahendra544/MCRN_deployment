const express = require("express");
const cors = require("cors");
require("dotenv").config();
const nodemailer = require("nodemailer");
//const db = require("./config/db");
// Authorized Admin Emails
const ADMIN_EMAILS = [
    "lavanyatangellapalli167@gmail.com",
    "rishitha823@gmail.com",
    "sandhyadharavathu006@gmail.com",
    "lakshmilikhitha61@gmail.com",
    "osurimahendra1@gmail.com",
    "sindhukanakapudi@gmail.com"
];
// Email configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
});
const app = express();

app.use(cors());
app.use(express.json());

// Test backend
app.get("/", (req, res) => {
    res.send("Missing Child Rescue Network Backend is Running!");
});

// Get all missing child cases
app.get("/api/cases", (req, res) => {
    const sql = "SELECT * FROM missing_cases ORDER BY created_at DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching cases:", err);
            return res.status(500).json({
                message: "Database error"
            });
        }

        res.json(results);
    });
});

// Add a new missing child case
app.post("/api/cases", (req, res) => {

    const {
        child_name,
        age,
        gender,
        location,
        missing_date,
        priority
    } = req.body;

    // Check required values
    if (!child_name || !age || !gender || !location) {
        return res.status(400).json({
            message: "Please provide child name, age, gender and location"
        });
    }

    const sql = `
        INSERT INTO missing_cases
        (case_id, child_name, age, gender, location, missing_date, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const case_id = "MCN-" + Date.now();

    db.query(
        sql,
        [
            case_id,
            child_name,
            age,
            gender,
            location,
            missing_date || null,
            priority || "Medium"
        ],
        (err, result) => {

            if (err) {
                console.error("Error adding case:", err);

                return res.status(500).json({
                    message: "Failed to add case"
                });
            }

            res.status(201).json({
                message: "Missing child case added successfully",
                case_id: case_id
            });
        }
    );
});
// Admin Login
app.post("/api/admin/login", (req, res) => {

    const { email, password } = req.body;

    // Check if email belongs to one of the 6 admins
    if (!ADMIN_EMAILS.includes(email)) {
        return res.status(401).json({
            message: "You are not authorized to access the Admin Portal"
        });
    }

    // Check common admin password
    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({
            message: "Incorrect password"
        });
    }

    // Login successful
    res.json({
        message: "Admin login successful",
        success: true
    });
});
// Forgot Password
app.post("/api/admin/forgot-password", async (req, res) => {
    const { email } = req.body;

    // Check if email belongs to one of the 6 admins
    if (!ADMIN_EMAILS.includes(email)) {
        return res.status(401).json({
            message: "Email is not authorized"
        });
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Admin Portal Password",
            text: `Your Admin Portal password is: ${process.env.ADMIN_PASSWORD}`
        });

        res.json({
            success: true,
            message: "Password has been sent to your email"
        });

    } catch (error) {
        console.error("Email sending error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to send email"
        });
    }
});
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
