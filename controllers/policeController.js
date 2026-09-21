const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// GET ALL POLICE
const getAllPolice = (req, res) => {
    const sql = `
        SELECT 
            id,
            police_id,
            name,
            email,
            phone,
            station,
            police_rank,
            badge_number,
            username,
            status,
            created_at
        FROM police
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching police:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch police officers"
            });
        }

        res.json({
            success: true,
            police: results
        });
    });
};


// GET ONE POLICE OFFICER
const getPoliceById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT 
            id,
            police_id,
            name,
            email,
            phone,
            station,
            police_rank,
            badge_number,
            username,
            status,
            created_at
        FROM police
        WHERE id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Error fetching police officer:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch police officer"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Police officer not found"
            });
        }

        res.json({
            success: true,
            police: results[0]
        });
    });
};


// ADD POLICE OFFICER
const addPolice = (req, res) => {
    const {
        police_id,
        name,
        email,
        phone,
        station,
        police_rank,
        badge_number,
        username,
        password
    } = req.body;

    if (
        !police_id ||
        !name ||
        !email ||
        !phone ||
        !station ||
        !police_rank ||
        !badge_number ||
        !username ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    const sql = `
        INSERT INTO police
        (
            police_id,
            name,
            email,
            phone,
            station,
            police_rank,
            badge_number,
            username,
            password
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const values = [
        police_id,
        name,
        email,
        phone,
        station,
        police_rank,
        badge_number,
        username,
        hashedPassword
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error adding police:", err);

            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    success: false,
                    message: "Police ID, email, badge number or username already exists"
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to add police officer"
            });
        }

        res.status(201).json({
            success: true,
            message: "Police officer added successfully",
            id: result.insertId
        });
    });
};


// UPDATE POLICE OFFICER
const updatePolice = (req, res) => {
    const { id } = req.params;

    const {
        police_id,
        name,
        email,
        phone,
        station,
        police_rank,
        badge_number,
        username,
        hashedPassword
    } = req.body;

    const sql = `
        UPDATE police
        SET
            police_id = ?,
            name = ?,
            email = ?,
            phone = ?,
            station = ?,
            police_rank = ?,
            badge_number = ?,
            username = ?,
            password = ?
        WHERE id = ?
    `;

    const values = [
        police_id,
        name,
        email,
        phone,
        station,
        police_rank,
        badge_number,
        username,
        password,
        id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error updating police:", err);

            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    success: false,
                    message: "Police ID, email, badge number or username already exists"
                });
            }

            return res.status(500).json({
                success: false,
                message: "Failed to update police officer"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Police officer not found"
            });
        }

        res.json({
            success: true,
            message: "Police officer updated successfully"
        });
    });
};


// CHANGE POLICE STATUS
const updatePoliceStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Status must be Active or Inactive"
        });
    }

    const sql = `
        UPDATE police
        SET status = ?
        WHERE id = ?
    `;

    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error("Error updating police status:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to update police status"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Police officer not found"
            });
        }

        res.json({
            success: true,
            message: `Police officer ${status.toLowerCase()} successfully`
        });
    });
};


// DELETE POLICE OFFICER
const deletePolice = (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM police WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error deleting police:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to delete police officer"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Police officer not found"
            });
        }

        res.json({
            success: true,
            message: "Police officer deleted successfully"
        });
    });
};

// =====================================================
// POLICE LOGIN
// =====================================================

const policeLogin = (req, res) => {
    const { username, password } = req.body;

    // Check required fields
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username and password are required"
        });
    }

    // Find police officer
    const sql = `
        SELECT *
        FROM police
        WHERE username = ?
    `;

    db.query(sql, [username], async (err, results) => {

        if (err) {
            console.error("Police login database error:", err);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        // Username not found
        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        const police = results[0];

        // Check account status
        if (police.status !== "Active") {
            return res.status(403).json({
                success: false,
                message: "Your police account is inactive"
            });
        }

        // Compare password with bcrypt hash
        const passwordMatch = await bcrypt.compare(
            password,
            police.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: police.id,
                police_id: police.police_id,
                username: police.username,
                role: "police"
            },
            process.env.RESET_SECRET,
            {
                expiresIn: "8h"
            }
        );

        // Successful login
        res.json({
            success: true,
            message: "Police login successful",
            token: token,
            police: {
                id: police.id,
                police_id: police.police_id,
                name: police.name,
                email: police.email,
                phone: police.phone,
                station: police.station,
                police_rank: police.police_rank,
                badge_number: police.badge_number,
                username: police.username,
                status: police.status
            }
        });
    });
};
module.exports = {
    getAllPolice,
    getPoliceById,
    addPolice,
    updatePolice,
    updatePoliceStatus,
    deletePolice,
    policeLogin
};
