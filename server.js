const express = require("express");
const cors = require("cors");
require("dotenv").config();
const policeRoutes = require("./routes/policeRoutes");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const db = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");

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

app.use("/api/police", policeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit-logs", auditLogRoutes);

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
// CASE VERIFICATION - GET PENDING CASES
// =====================================================

app.get("/api/admin/cases/pending", (req, res) => {

    const sql = `
        SELECT *
        FROM missing_cases
        WHERE status = 'Pending Verification'
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Error fetching pending cases:",
                err
            );

            return res.status(500).json({
                message: "Failed to fetch pending cases"
            });

        }

        res.json(results);

    });

});

// =====================================================
// CASE VERIFICATION - VERIFY CASE
// =====================================================

app.put("/api/admin/cases/:id/verify", (req, res) => {

    const { id } = req.params;

    const sql = `
        UPDATE missing_cases
        SET status = 'Verified'
        WHERE id = ?
          AND status = 'Pending Verification'
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {

            console.error(
                "Error verifying case:",
                err
            );

            return res.status(500).json({
                message: "Failed to verify case"
            });

        }

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message:
                    "Case not found or case is already verified"
            });

        }

        // CREATE AUDIT LOG
        const auditSql = `
            INSERT INTO audit_logs
            (action, description, performed_by)
            VALUES (?, ?, ?)
        `;

        db.query(
            auditSql,
            [
                "Case Verified",
                `Case ID ${id} was verified by admin.`,
                "Admin"
            ],
            (auditErr) => {

                if (auditErr) {

                    console.error(
                        "Error creating audit log:",
                        auditErr
                    );

                }

                res.json({
                    success: true,
                    message: "Case verified successfully"
                });

            }
        );

    });

});


// =====================================================
// REJECT CASE
// =====================================================

app.put("/api/admin/cases/:id/reject", (req, res) => {

    const { id } = req.params;

    console.log("➡️ Reject request received for case:", id);

    const sql = `
        UPDATE missing_cases
        SET status = 'Rejected'
        WHERE id = ?
          AND status = 'Pending Verification'
    `;

    console.log("➡️ Updating case...");

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error("❌ Error rejecting case:", err);

            return res.status(500).json({
                message: "Failed to reject case"
            });
        }

        console.log(
            "✅ Case update completed. Affected rows:",
            result.affectedRows
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message:
                    "Case not found or case is not pending verification"
            });

        }

        // CREATE AUDIT LOG
        const auditSql = `
            INSERT INTO audit_logs
            (action, description, performed_by)
            VALUES (?, ?, ?)
        `;

        console.log("➡️ Creating audit log...");

        db.query(
            auditSql,
            [
                "Case Rejected",
                `Case ID ${id} was rejected by admin.`,
                "Admin"
            ],
            (auditErr, auditResult) => {

                if (auditErr) {

                    console.error(
                        "❌ Error creating audit log:",
                        auditErr
                    );

                    return res.status(500).json({
                        message: "Case rejected, but audit log failed"
                    });
                }

                console.log(
                    "✅ Audit log created. ID:",
                    auditResult.insertId
                );

                res.json({
                    success: true,
                    message: "Case rejected successfully"
                });

            }
        );

    });

});
// =====================================================
// UPDATE CASE PRIORITY
// =====================================================

app.put("/api/admin/cases/:id/priority", (req, res) => {

    const { id } = req.params;
    const { priority } = req.body;

    const allowedPriorities = [
        "Low",
        "Medium",
        "High"
    ];

    if (!allowedPriorities.includes(priority)) {

        return res.status(400).json({
            message: "Invalid case priority"
        });

    }

    const sql = `
        UPDATE missing_cases
        SET priority = ?
        WHERE id = ?
    `;

    db.query(sql, [priority, id], (err, result) => {

        if (err) {

            console.error(
                "Error updating case priority:",
                err
            );

            return res.status(500).json({
                message: "Failed to update case priority"
            });

        }

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Case not found"
            });

        }

        res.json({
            success: true,
            message: "Case priority updated successfully"
        });

    });

});
// =====================================================
// UPDATE CASE STATUS
// =====================================================

app.put("/api/admin/cases/:id/status", (req, res) => {

    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
        "Pending Verification",
        "Verified",
        "Rejected",
        "Assigned",
        "Investigation",
        "Child Located",
        "Resolved",
        "Closed"
    ];

    if (!allowedStatuses.includes(status)) {

        return res.status(400).json({
            message: "Invalid case status"
        });

    }

    const sql = `
        UPDATE missing_cases
        SET status = ?
        WHERE id = ?
    `;

    db.query(sql, [status, id], (err, result) => {

        if (err) {

            console.error(
                "Error updating case status:",
                err
            );

            return res.status(500).json({
                message: "Failed to update case status"
            });

        }

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Case not found"
            });

        }

        res.json({

            success: true,

            message:
                "Case status updated successfully"

        });

    });

});

// =====================================================
// ASSIGN CASE TO POLICE OFFICER
// =====================================================

app.post("/api/admin/cases/:id/assign", (req, res) => {

    const { id } = req.params;

    const {
        officer_id,
        deadline
    } = req.body;

    if (!officer_id) {

        return res.status(400).json({
            message: "Officer ID is required"
        });

    }

    const checkCaseSql = `
        SELECT id, status
        FROM missing_cases
        WHERE id = ?
    `;

    db.query(
        checkCaseSql,
        [id],
        (err, caseResults) => {

            if (err) {

                console.error(
                    "Error checking case:",
                    err
                );

                return res.status(500).json({
                    message: "Database error"
                });

            }

            if (caseResults.length === 0) {

                return res.status(404).json({
                    message: "Case not found"
                });

            }

            const assignmentSql = `
                INSERT INTO case_assignments
                (case_id, officer_id, deadline)
                VALUES (?, ?, ?)
            `;

            db.query(
                assignmentSql,
                [
                    id,
                    officer_id,
                    deadline || null
                ],
                (err, result) => {

                    if (err) {

                        console.error(
                            "Error assigning case:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to assign case"
                        });

                    }

                    const updateCaseSql = `
                        UPDATE missing_cases
                        SET status = 'Assigned'
                        WHERE id = ?
                    `;

                    db.query(
                        updateCaseSql,
                        [id],
                        (err) => {

                            if (err) {

                                console.error(
                                    "Error updating case status:",
                                    err
                                );

                                return res.status(500).json({
                                    message:
                                        "Assignment created but case status update failed"
                                });

                            }

                            res.json({

                                success: true,

                                message:
                                    "Case assigned successfully",

                                assignment_id:
                                    result.insertId

                            });

                        }
                    );

                }
            );

        }
    );

});

// =====================================================
// ADMIN LOGIN
// =====================================================

app.post("/api/admin/login", (req, res) => {

    const { email, password } = req.body;

    if (!ADMIN_EMAILS.includes(email)) {

        return res.status(401).json({

            message:
                "You are not authorized to access the Admin Portal"

        });

    }

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

        if (password !== results[0].admin_password) {

            return res.status(401).json({
                message: "Incorrect password"
            });

        }

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

    console.log(
        "📩 Current password request for:",
        email
    );

    if (!ADMIN_EMAILS.includes(email)) {

        return res.status(401).json({
            message: "Email is not authorized"
        });

    }

    const sql =
        "SELECT admin_password FROM admin_settings WHERE id = 1";

    db.query(sql, async (err, results) => {

        if (err) {

            console.error(
                "❌ Database error:",
                err
            );

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

            console.log(
                "📤 Sending current password email..."
            );

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

    console.log(
        "📩 Reset request for:",
        email
    );

    if (!ADMIN_EMAILS.includes(email)) {

        return res.status(401).json({
            message: "Email is not authorized"
        });

    }

    try {

        const token = jwt.sign(

            {
                email: email
            },

            process.env.RESET_SECRET,

            {
                expiresIn: "15m"
            }

        );

        const resetLink =
            `http://localhost:5181/reset-password/${token}`;

        console.log("🔗 Reset link created");

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

        const decoded = jwt.verify(

            token,

            process.env.RESET_SECRET

        );

        if (!ADMIN_EMAILS.includes(decoded.email)) {

            return res.status(401).json({

                message:
                    "Unauthorized email"

            });

        }

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