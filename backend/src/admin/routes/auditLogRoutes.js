const express = require("express");

const router = express.Router();

const {
  getAuditLogs,
  createAuditLog,
  deleteAuditLog,
} = require("../controllers/auditLogController");

// GET all audit logs
router.get("/", getAuditLogs);

// CREATE audit log
router.post("/", createAuditLog);

// DELETE audit log
router.delete("/:id", deleteAuditLog);

module.exports = router;