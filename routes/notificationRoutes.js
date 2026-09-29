const express = require("express");

const router = express.Router();

const {
  getNotifications,
  getUnreadNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

// GET all notifications
router.get("/", getNotifications);

// GET unread notifications
router.get("/unread", getUnreadNotifications);

// CREATE notification
router.post("/", createNotification);

// MARK notification as read
router.put("/:id/read", markAsRead);

// DELETE notification
router.delete("/:id", deleteNotification);

module.exports = router;