const db = require("../config/db");
const bcrypt = require("bcryptjs");

// ===============================
// GET ALL USERS
// ===============================
const getUsers = (req, res) => {
  const sql = `
    SELECT 
      id,
      name,
      email,
      phone,
      status,
      created_at
    FROM users
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch users",
      });
    }

    res.json({
      success: true,
      users: results,
    });
  });
};


// ===============================
// GET USER BY ID
// ===============================
const getUserById = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      id,
      name,
      email,
      phone,
      status,
      created_at
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch user",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: results[0],
    });
  });
};


// ===============================
// ADD NEW USER
// ===============================
const addUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Check whether email already exists
    const checkSql = `
      SELECT id
      FROM users
      WHERE email = ?
    `;

    db.query(checkSql, [email], async (err, results) => {
      if (err) {
        console.error("Error checking user:", err);

        return res.status(500).json({
          success: false,
          message: "Database error",
        });
      }

      if (results.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertSql = `
        INSERT INTO users
        (name, email, password, phone, status)
        VALUES (?, ?, ?, ?, 'Active')
      `;

      db.query(
        insertSql,
        [name, email, hashedPassword, phone || null],
        (err, result) => {
          if (err) {
            console.error("Error adding user:", err);

            return res.status(500).json({
              success: false,
              message: "Failed to add user",
            });
          }

          res.status(201).json({
            success: true,
            message: "User added successfully",
            userId: result.insertId,
          });
        }
      );
    });

  } catch (error) {
    console.error("Add user error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ===============================
// UPDATE USER STATUS
// ===============================
const updateUserStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Active", "Inactive"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be Active or Inactive",
    });
  }

  const sql = `
    UPDATE users
    SET status = ?
    WHERE id = ?
  `;

  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("Error updating user status:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to update user status",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: `User status changed to ${status}`,
    });
  });
};


module.exports = {
  getUsers,
  getUserById,
  addUser,
  updateUserStatus,
}; 