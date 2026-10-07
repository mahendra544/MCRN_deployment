const db = require("../../db");

// GET ALL NOTIFICATIONS
const getNotifications = (req, res) => {
  const sql = `
    SELECT
      id,
      title,
      message,
      type,
      is_read,
      created_at
    FROM notifications
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching notifications:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
      });
    }

    res.json({
      success: true,
      notifications: results,
    });
  });
};


// GET UNREAD NOTIFICATIONS
const getUnreadNotifications = (req, res) => {
  const sql = `
    SELECT
      id,
      title,
      message,
      type,
      is_read,
      created_at
    FROM notifications
    WHERE is_read = FALSE
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching unread notifications:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch unread notifications",
      });
    }

    res.json({
      success: true,
      notifications: results,
      unreadCount: results.length,
    });
  });
};


// CREATE NOTIFICATION
const createNotification = (req, res) => {
  const {
    title,
    message,
    type,
  } = req.body;

  if (!title || !message) {
    return res.status(400).json({
      success: false,
      message: "Title and message are required",
    });
  }

  const sql = `
    INSERT INTO notifications
    (title, message, type)
    VALUES (?, ?, ?)
  `;

  db.query(
    sql,
    [title, message, type || "Info"],
    (err, result) => {
      if (err) {
        console.error("Error creating notification:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to create notification",
        });
      }

      res.status(201).json({
        success: true,
        message: "Notification created successfully",
        notificationId: result.insertId,
      });
    }
  );
};


// MARK NOTIFICATION AS READ
const markAsRead = (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error marking notification as read:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to mark notification as read",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  });
};


// DELETE NOTIFICATION
const deleteNotification = (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM notifications
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting notification:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to delete notification",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  });
};


module.exports = {
  getNotifications,
  getUnreadNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
};