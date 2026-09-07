const express = require("express");
const cors = require("cors");
require("dotenv").config();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const db = require("./config/db");

// =====================================================
// AUTHORIZED ADMIN EMAILS
// =====================================================

const ADMIN_EMAILS = [
    "lavanyatangellapalli167@gmail.com",
    "rishitha823@gmail.com",
    "sandhyadharavathu006@gmail.com",
    "lakshmilikhitha61@gmail.com",
    "osurimahendra1@gmail.com",
    "sindhukanakapudi@gmail.com"
];

// =====================================================
// EMAIL CONFIGURATION
// =====================================================

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
});

// Check Gmail connection
transporter.verify((error, success) => {

    if (error) {
        console.error("❌ Email configuration error:", error);
    } else {
        console.log("✅ Email server is ready");
    }

});

// =====================================================
// EXPRESS APP
// =====================================================

const app = express();

app.use(cors());
app.use(express.json());

// =====================================================
// TEST BACKEND
// =====================================================

app.get("/", (req, res) => {

    res.send("Missing Child Rescue Network Backend is Running!");

});

// =====================================================
// GET ALL MISSING CHILD CASES
// =====================================================

app.get("/api/cases", (req, res) => {

    const sql =
        "SELECT * FROM missing_cases ORDER BY created_at DESC";

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

// =====================================================
// ADD NEW MISSING CHILD CASE
// =====================================================

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
            message:
                "Please provide child name, age, gender and location"
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

                message:
                    "Missing child case added successfully",

                case_id: case_id

            });

        }
    );

});

// =====================================================
// ADMIN LOGIN
// =====================================================

app.post("/api/admin/login", (req, res) => {

    const { email, password } = req.body;

    // Check authorized email
    if (!ADMIN_EMAILS.includes(email)) {

        return res.status(401).json({

            message:
                "You are not authorized to access the Admin Portal"

        });

    }

    // Get common admin password from MySQL
    const sql =
        "SELECT admin_password FROM admin_settings WHERE id = 1";

    db.query(sql, (err, results) => {

        if (err) {

            console.error("Database error:", err);

            return res.status(500).json({
                message: "Database error"
            });

        }

        if (results.length === 0) {

            return res.status(500).json({
                message: "Admin password not found"
            });

        }

        // Check password
        if (password !== results[0].admin_password) {

            return res.status(401).json({
                message: "Incorrect password"
            });

        }

        // Login successful
        res.json({

            success: true,

            message:
                "Admin login successful"

        });

    });

});

// =====================================================
// SEND CURRENT PASSWORD TO EMAIL
// =====================================================

app.post("/api/admin/forgot-password", async (req, res) => {

    const { email } = req.body;

    console.log("📩 Current password request for:", email);

    // Check authorized email
    if (!ADMIN_EMAILS.includes(email)) {

        return res.status(401).json({
            message: "Email is not authorized"
        });

    }

    // Get current password from MySQL
    const sql =
        "SELECT admin_password FROM admin_settings WHERE id = 1";

    db.query(sql, async (err, results) => {

        if (err) {

            console.error("❌ Database error:", err);

            return res.status(500).json({
                message: "Database error"
            });

        }

        if (results.length === 0) {

            return res.status(500).json({
                message: "Admin password not found"
            });

        }

        const currentPassword =
            results[0].admin_password;

        try {

            console.log("📤 Sending current password email...");

            const info = await transporter.sendMail({

                from: process.env.EMAIL_USER,

                to: email,

                subject:
                    "Admin Portal Password",

                text:
                    `Your current Admin Portal password is: ${currentPassword}`

            });

            console.log("✅ PASSWORD EMAIL SENT");
            console.log("Message ID:", info.messageId);
            console.log("Accepted:", info.accepted);
            console.log("Rejected:", info.rejected);

            res.json({

                success: true,

                message:
                    "Password has been sent to your email"

            });

        } catch (error) {

            console.error(
                "❌ Email sending error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to send email"

            });

        }

    });

});

// =====================================================
// REQUEST PASSWORD RESET LINK
// =====================================================

app.post("/api/admin/request-reset", async (req, res) => {

    const { email } = req.body;

    console.log("📩 Reset request for:", email);

    // Check authorized email
    if (!ADMIN_EMAILS.includes(email)) {

        return res.status(401).json({
            message: "Email is not authorized"
        });

    }

    try {

        // Create JWT reset token
        const token = jwt.sign(

            {
                email: email
            },

            process.env.RESET_SECRET,

            {
                expiresIn: "15m"
            }

        );

        // Reset link
        const resetLink =
            `http://localhost:5181/reset-password/${token}`;

        console.log("🔗 Reset link created");

        // Send reset email
        console.log("📤 Sending reset email...");

        const info = await transporter.sendMail({

            from: process.env.EMAIL_USER,

            to: email,

            subject:
                "Reset Your Admin Portal Password",

            text:
`Hello,

You requested to reset your Admin Portal password.

Click the link below to create a new password:

${resetLink}

This link will expire in 15 minutes.

If you did not request this password reset, you can ignore this email.

Missing Child Rescue Network`

        });

        console.log("✅ RESET EMAIL SENT");
        console.log("Message ID:", info.messageId);
        console.log("Accepted:", info.accepted);
        console.log("Rejected:", info.rejected);

        res.json({

            success: true,

            message:
                "Password reset link has been sent to your registered email"

        });

    } catch (error) {

        console.error(
            "❌ Reset email error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to send reset email"

        });

    }

});

// =====================================================
// RESET PASSWORD
// =====================================================

app.post("/api/admin/reset-password", (req, res) => {

    const {
        token,
        newPassword
    } = req.body;

    if (!token || !newPassword) {

        return res.status(400).json({

            message:
                "Token and new password are required"

        });

    }

    try {

        // Verify token
        const decoded = jwt.verify(

            token,

            process.env.RESET_SECRET

        );

        // Check authorized email
        if (!ADMIN_EMAILS.includes(decoded.email)) {

            return res.status(401).json({

                message:
                    "Unauthorized email"

            });

        }

        // Update common admin password
        const sql = `
            UPDATE admin_settings
            SET admin_password = ?
            WHERE id = 1
        `;

        db.query(
            sql,
            [newPassword],
            (err, result) => {

                if (err) {

                    console.error(
                        "❌ Database update error:",
                        err
                    );

                    return res.status(500).json({

                        message:
                            "Failed to update password"

                    });

                }

                console.log(
                    "✅ Admin password updated successfully"
                );

                res.json({

                    success: true,

                    message:
                        "Password reset successfully"

                });

            }
        );

    } catch (error) {

        console.error(
            "❌ Password reset error:",
            error
        );

        res.status(400).json({

            success: false,

            message:
                "Reset link is invalid or expired"

        });

    }

});

// =====================================================
// START SERVER
// =====================================================

const PORT = 5000;

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});