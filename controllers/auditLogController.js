const db = require("../config/db");

// GET ALL AUDIT LOGS
const getAuditLogs = (req, res) => {
  const sql = `
    SELECT
      id,
      action,
      description,
      performed_by,
      created_at
    FROM audit_logs
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching audit logs:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch audit logs",
      });
    }

    res.json({
      success: true,
      auditLogs: results,
    });
  });
};


// CREATE AUDIT LOG
const createAuditLog = (req, res) => {
  const {
    action,
    description,
    performed_by,
  } = req.body;

  if (!action || !description) {
    return res.status(400).json({
      success: false,
      message: "Action and description are required",
    });
  }

  const sql = `
    INSERT INTO audit_logs
    (action, description, performed_by)
    VALUES (?, ?, ?)
  `;

  db.query(
    sql,
    [
      action,
      description,
      performed_by || "Admin",
    ],
    (err, result) => {
      if (err) {
        console.error("Error creating audit log:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to create audit log",
        });
      }

      res.status(201).json({
        success: true,
        message: "Audit log created successfully",
        auditLogId: result.insertId,
      });
    }
  );
};


// DELETE AUDIT LOG
const deleteAuditLog = (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM audit_logs
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting audit log:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to delete audit log",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found",
      });
    }

    res.json({
      success: true,
      message: "Audit log deleted successfully",
    });
  });
};


module.exports = {
  getAuditLogs,
  createAuditLog,
  deleteAuditLog,
};