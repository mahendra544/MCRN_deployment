import React, { useEffect, useState } from "react";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        "/api/admin/notifications"
      );

      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
      } else {
        console.error("Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // MARK ONE NOTIFICATION AS READ
  const markAsRead = async (id) => {
    try {
      const response = await fetch(
        `/api/admin/notifications/${id}/read`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (data.success) {
        setNotifications((previousNotifications) =>
          previousNotifications.map((notification) =>
            notification.id === id
              ? { ...notification, is_read: 1 }
              : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // MARK ALL AS READ
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(
        (notification) => !notification.is_read
      );

      await Promise.all(
        unreadNotifications.map((notification) =>
          fetch(
            `/api/admin/notifications/${notification.id}/read`,
            {
              method: "PUT",
            }
          )
        )
      );

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) => ({
          ...notification,
          is_read: 1,
        }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // CONVERT DATABASE TIME
  const getTime = (createdAt) => {
    if (!createdAt) return "";

    const date = new Date(createdAt);
    const now = new Date();

    const difference = Math.floor(
      (now - date) / 1000
    );

    if (difference < 60) {
      return `${difference} seconds ago`;
    }

    if (difference < 3600) {
      return `${Math.floor(difference / 60)} minutes ago`;
    }

    if (difference < 86400) {
      return `${Math.floor(difference / 3600)} hours ago`;
    }

    return `${Math.floor(difference / 86400)} days ago`;
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <div>
      <div className="page-title">
        <div>
          <span className="section-label">SYSTEM ALERTS</span>

          <h1>Notifications</h1>

          <p>Important case and police updates.</p>
        </div>

        <button
          className="secondary-button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>

      <div className="dashboard-card">

        {loading && (
          <p>Loading notifications...</p>
        )}

        {!loading && notifications.length === 0 && (
          <p>No notifications available.</p>
        )}

        {!loading &&
          notifications.map((notification) => (
            <div
              className="notification-row"
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              style={{
                cursor: notification.is_read ? "default" : "pointer",
                opacity: notification.is_read ? 0.65 : 1,
              }}
            >
              <div className="notification-symbol">
                🔔
              </div>

              <div>
                <strong>
                  {notification.title}
                </strong>

                <p>
                  {notification.message}
                </p>

                <small>
                  {getTime(notification.created_at)}
                </small>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Notifications;