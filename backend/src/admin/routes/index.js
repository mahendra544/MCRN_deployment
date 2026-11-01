const dns = require("node:dns");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const policeRoutes = require("./policeRoutes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const reportingDb = db;
const userDb = db;
const userRoutes = require("./userRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const notificationRoutes = require("./notificationRoutes");
const auditLogRoutes = require("./auditLogRoutes");
const { requireAdmin } = require("../../middleware");

async function syncCaseStatusAcrossSystems(caseId, status) {
    const [rows] = await db.promise().query("SELECT case_number FROM missing_cases WHERE id = ? LIMIT 1", [caseId]);
    if (!rows.length) return;
    const caseNumber = rows[0].case_number;
    const userStatus = ["Child Located", "Resolved", "Closed"].includes(status) ? "Resolved" : status;
    await userDb.query("UPDATE children SET status = ? WHERE case_id = ?", [userStatus, caseNumber]);
    if (/^MC-\d+$/.test(caseNumber)) {
        await reportingDb.query("UPDATE missing_child_reports SET status = ? WHERE id = ?", [status, Number(caseNumber.slice(3))]);
    }
}

// =====================================================
// AUTHORIZED ADMIN EMAILS & SECRETS
// =====================================================
const getAdminJwtSecret = () => {
    if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
    const isProd = process.env.NODE_ENV === "production" || String(process.env.CLOUD_MODE || "").toLowerCase() === "true";
    if (isProd) throw new Error("FATAL: JWT_SECRET must be configured in production.");
    return "MCRN_LOCAL_DEVELOPMENT_SECRET_32_CHARS_CHANGE_ME_2026";
};

const getAdminResetSecret = () => {
    if (process.env.RESET_SECRET) return process.env.RESET_SECRET;
    const isProd = process.env.NODE_ENV === "production" || String(process.env.CLOUD_MODE || "").toLowerCase() === "true";
    if (isProd) throw new Error("FATAL: RESET_SECRET must be configured in production.");
    return "MCRN_ADMIN_RESET_SECRET_32_CHARS_2026";
};

const configuredAdminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
const defaultAdminEmails = [
    "lavanyatangellapalli167@gmail.com",
    "rishitha823@gmail.com",
    "sandhyadharavathu006@gmail.com",
    "lakshmilikhitha61@gmail.com",
    "osurimahendra1@gmail.com",
    "sindhukanakapudi@gmail.com"
];
const ADMIN_EMAILS = configuredAdminEmails.length > 0 ? configuredAdminEmails : defaultAdminEmails;
const ADMIN_DETAILS = {
    "lavanyatangellapalli167@gmail.com": {
        name: "Lavanya",
        role: "Super Administrator",
        phone: "9876543210",
        status: "Active"
    },
    "rishitha823@gmail.com": {
        name: "Rishitha",
        role: "Administrator",
        phone: "9876543211",
        status: "Active"
    },
    "sandhyadharavathu006@gmail.com": {
        name: "Sandhya",
        role: "Administrator",
        phone: "9876543212",
        status: "Active"
    },
    "lakshmilikhitha61@gmail.com": {
        name: "Lakshmi Likhitha",
        role: "Administrator",
        phone: "9876543213",
        status: "Active"
    },
    "osurimahendra1@gmail.com": {
        name: "Mahendra",
        role: "Administrator",
        phone: "9876543214",
        status: "Active"
    },
    "sindhukanakapudi@gmail.com": {
        name: "Sindhu",
        role: "Administrator",
        phone: "9876543215",
        status: "Active"
    }};


// =====================================================
// EMAIL CONFIGURATION
// =====================================================

const { sendAdminPasswordReset, sendPoliceNotification, maskEmail } = require("../../utils/mail");

// =====================================================
// EXPRESS APP
// =====================================================

const router = express.Router();
const app = router;

app.use(cors());
app.use(express.json());

// All /api/admin/* endpoints below the login/reset endpoints are protected by requireAdmin.

app.use("/api/admin/police", requireAdmin, policeRoutes);
app.use("/api/admin/users", requireAdmin, userRoutes);
app.use("/api/admin/analytics", requireAdmin, analyticsRoutes);
app.use("/api/admin/notifications", requireAdmin, notificationRoutes);
app.use("/api/admin/audit-logs", requireAdmin, auditLogRoutes);

// =====================================================
// TEST BACKEND
// =====================================================

app.get("/", (req, res) => {

    res.send("Missing Child Rescue Network Backend is Running!");

});

// =====================================================
// GET ALL MISSING CHILD CASES
// =====================================================

app.get("/api/admin/cases", requireAdmin, (req, res) => {
    const limit = req.query.limit ? Math.min(Math.max(Number(req.query.limit), 1), 500) : null;
    const offset = req.query.offset ? Math.max(Number(req.query.offset), 0) : null;

    let sql =
        "SELECT *, COALESCE(status, case_stage) AS status FROM missing_cases WHERE deleted_at IS NULL ORDER BY opened_at DESC";
    const params = [];
    if (limit !== null) {
        sql += " LIMIT ? OFFSET ?";
        params.push(limit, offset || 0);
    }

    db.query(sql, params, async (err, results) => {
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

app.post("/api/admin/cases", requireAdmin, (req, res) => {

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
        (case_number, child_name, child_age, gender, last_seen_location, last_seen_datetime, case_stage, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const case_id = "MCN-" + Date.now();

    db.query(
        sql,
        [
            case_id,
            child_name,
            Number(age),
            gender,
            location,
            missing_date || new Date(),
            "Open",
            "Pending Verification"
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

app.get("/api/admin/cases/pending", requireAdmin, (req, res) => {

    const sql = `
        SELECT *
        FROM missing_cases
        WHERE deleted_at IS NULL AND status = 'Pending Verification'
        ORDER BY opened_at DESC
    `;

    db.query(sql, async (err, results) => {

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

app.put("/api/admin/cases/:id/verify", requireAdmin, (req, res) => {

    const { id } = req.params;

    const sql = `
        UPDATE missing_cases
        SET status = 'Verified', case_stage = 'Open'
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

        syncCaseStatusAcrossSystems(id, "Verified").catch((syncError) => console.error("Verification sync warning:", syncError.message));

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

app.put("/api/admin/cases/:id/reject", requireAdmin, (req, res) => {

    const { id } = req.params;

    console.log("➡️ Reject request received for case:", id);

    const sql = `
        UPDATE missing_cases
        SET status = 'Rejected', case_stage = 'Rejected'
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

        syncCaseStatusAcrossSystems(id, "Rejected").catch((syncError) => console.error("Rejection sync warning:", syncError.message));

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

app.put("/api/admin/cases/:id/priority", requireAdmin, (req, res) => {

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

app.put("/api/admin/cases/:id/status", requireAdmin, (req, res) => {

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
        SET status = ?, case_stage = ?
        WHERE id = ?
    `;

    const policeStage = status === "Resolved" || status === "Child Located" || status === "Closed" ? "Child Located" : status === "Investigation" ? "Investigation" : status === "Assigned" ? "Assigned" : status === "Verified" ? "Open" : status;
    db.query(sql, [status, policeStage, id], async (err, result) => {

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

        try {
            const [caseRows] = await db.promise().query("SELECT case_number FROM missing_cases WHERE id = ?", [id]);
            if (caseRows.length) {
                const userStatus = status === "Child Located" || status === "Resolved" || status === "Closed" ? "Resolved" : status;
                await userDb.query("UPDATE children SET status = ? WHERE case_id = ?", [userStatus, caseRows[0].case_number]);
                if (/^MC-\d+$/.test(caseRows[0].case_number)) {
                    await reportingDb.query("UPDATE missing_child_reports SET status = ? WHERE id = ?", [status, Number(caseRows[0].case_number.slice(3))]);
                }
            }
        } catch (syncError) { console.error("Cross-system status sync warning:", syncError.message); }

        res.json({
            success: true,
            message: "Case status updated successfully"
        });

    });

});

// =====================================================
// ASSIGN CASE TO POLICE OFFICER
// =====================================================

app.post("/api/admin/cases/:id/assign", requireAdmin, (req, res) => {

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
                                message: "Case assigned successfully",
                                assignment_id: result.insertId
                            });

                            sendPoliceNotification({
                                officerId: officer_id,
                                subject: `New Case Assignment: Case #${id}`,
                                text: `Case #${id} has been assigned to your unit. Deadline: ${deadline || "Not specified"}.`
                            }).catch((notifyErr) => {
                                console.log(`[POLICE_NOTIFY_INFO] Assignment completed without external email dispatch (${notifyErr.message})`);
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

app.post("/api/admin/login", async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    try {
        // 1. Check for registered administrator in users table
        const [dbAdminRows] = await db.query(
            "SELECT id, name, email, password_hash, role, active FROM users WHERE email = ? AND role = 'ADMIN' LIMIT 1",
            [email]
        );

        if (dbAdminRows && dbAdminRows.length > 0) {
            const dbAdmin = dbAdminRows[0];
            if (dbAdmin.active === false) {
                return res.status(403).json({ message: "Administrator account is deactivated" });
            }
            const passwordMatches = await bcrypt.compare(password, dbAdmin.password_hash || "");
            if (!passwordMatches) {
                return res.status(401).json({ message: "Incorrect password" });
            }
            const token = jwt.sign(
                { sub: `admin-${dbAdmin.id}`, username: dbAdmin.email, name: dbAdmin.name || "Admin", role: "ADMIN" },
                getAdminJwtSecret(),
                { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
            );
            return res.json({
                success: true,
                message: "Admin login successful",
                token,
                admin: {
                    email: dbAdmin.email,
                    name: dbAdmin.name || "Administrator",
                    role: "Super Administrator"
                }
            });
        }

        // 2. Check whitelist and admin_settings configuration
        if (!ADMIN_EMAILS.includes(email)) {
            return res.status(401).json({
                message: "You are not authorized to access the Admin Portal"
            });
        }

        const [settingsRows] = await db.query("SELECT password_hash FROM admin_settings WHERE id = 1");
        if (!settingsRows || settingsRows.length === 0) {
            return res.status(500).json({
                message: "Admin password not found"
            });
        }

        const passwordMatches = await bcrypt.compare(password, settingsRows[0].password_hash || "");
        if (!passwordMatches) {
            return res.status(401).json({ message: "Incorrect password" });
        }
        const admin = ADMIN_DETAILS[email] || { name: email.split("@")[0], role: "Administrator" };

        const token = jwt.sign(
            { sub: `admin-${email}`, username: email, name: admin.name, role: "ADMIN" },
            getAdminJwtSecret(),
            { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
        );

        return res.json({
            success: true,
            message: "Admin login successful",
            token,
            admin: {
                email,
                name: admin.name,
                role: admin.role
            }
        });
    } catch (err) {
        console.error("Admin login error:", err);
        return res.status(500).json({ message: "Authentication error" });
    }
});

// =====================================================
// SEND CURRENT PASSWORD TO EMAIL
// =====================================================

app.post("/api/admin/forgot-password", async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!ADMIN_EMAILS.includes(email)) return res.status(401).json({ message: "Email is not authorized" });
    try {
        const token = jwt.sign(
            { email },
            getAdminResetSecret(),
            { expiresIn: "15m" }
        );
        const appUrl = (
            process.env.PUBLIC_APP_URL ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
            req.headers.origin ||
            (req.headers["x-forwarded-host"] ? `${req.headers["x-forwarded-proto"] || "https"}://${req.headers["x-forwarded-host"]}` : null) ||
            "http://localhost:5000"
        ).replace(/\/$/, "");
        const resetLink = `${appUrl}/admin/reset-password/${token}`;
        await sendAdminPasswordReset(email, resetLink);
        return res.json({ success: true, message: "Password reset link has been sent to your registered email" });
    } catch (error) {
        console.error(`[ADMIN_AUTH] Failed to send reset email for ${maskEmail(email)}:`, error.message);
        const status = error.status || 500;
        return res.status(status).json({ success: false, message: error.message || "Failed to send reset email" });
    }
});

// =====================================================
// REQUEST PASSWORD RESET LINK
// =====================================================

app.post("/api/admin/request-reset", async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();

    console.log("[ADMIN_AUTH] Reset request for:", maskEmail(email));

    if (!ADMIN_EMAILS.includes(email)) {
        return res.status(401).json({
            message: "Email is not authorized"
        });
    }

    try {
        const token = jwt.sign(
            { email: email },
            getAdminResetSecret(),
            { expiresIn: "15m" }
        );

        const appUrl = (
            process.env.PUBLIC_APP_URL ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
            req.headers.origin ||
            (req.headers["x-forwarded-host"] ? `${req.headers["x-forwarded-proto"] || "https"}://${req.headers["x-forwarded-host"]}` : null) ||
            "http://localhost:5000"
        ).replace(/\/$/, "");
        const resetLink = `${appUrl}/admin/reset-password/${token}`;

        console.log("🔗 Reset link created");
        console.log("📤 Sending reset email via shared mailer...");

        await sendAdminPasswordReset(email, resetLink);

        console.log("✅ Admin reset email accepted by the shared email service");

        res.json({
            success: true,
            message: "Password reset link has been sent to your registered email"
        });
    } catch (error) {
        console.error(`❌ Admin reset email error for ${maskEmail(email)}:`, error.message);
        const status = error.status || 500;
        res.status(status).json({
            success: false,
            message: error.message || "Failed to send reset email"
        });
    }
});

// =====================================================
// CHANGE PASSWORD (AUTHENTICATED ADMIN)
// =====================================================
app.post("/api/admin/change-password", requireAdmin, async (req, res) => {
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");
    if (!currentPassword || !newPassword) return res.status(400).json({ success:false, message:"Current password and new password are required" });
    if (newPassword.length < 6) return res.status(400).json({ success:false, message:"New password must contain at least 6 characters" });
    try {
        const [rows] = await db.promise().query("SELECT password_hash FROM admin_settings WHERE id = 1 LIMIT 1");
        if (!rows.length || !rows[0].password_hash) return res.status(500).json({ success:false, message:"Admin password is not initialized" });
        if (!(await bcrypt.compare(currentPassword, rows[0].password_hash))) return res.status(401).json({ success:false, message:"Current password is incorrect" });
        const hash = await bcrypt.hash(newPassword, 12);
        await db.promise().query("UPDATE admin_settings SET password_hash = ?, admin_password = NULL WHERE id = 1", [hash]);
        res.json({ success:true, message:"Password changed successfully" });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ success:false, message:"Failed to change password" });
    }
});

// =====================================================
// RESET PASSWORD
// =====================================================

app.post("/api/admin/reset-password", async (req, res) => {

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
            getAdminResetSecret()
        );

        if (!ADMIN_EMAILS.includes(decoded.email)) {

            return res.status(401).json({

                message:
                    "Unauthorized email"

            });

        }

        const passwordHash = await bcrypt.hash(String(newPassword), 12);
        const sql = `
            UPDATE admin_settings
            SET password_hash = ?, admin_password = NULL
            WHERE id = 1
        `;

        db.query(
            sql,
            [passwordHash],
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

const PORT = Number(process.env.PORT || 5004);


module.exports = router;
