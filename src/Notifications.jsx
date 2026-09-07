import React from "react";

function Notifications() {
  const notifications = [
    { title: "New Missing Child Report", message: "Case MCN-006 has been submitted and requires verification.", time: "5 minutes ago" },
    { title: "Police Investigation Update", message: "Officer Ravi Kumar updated investigation for MCN-001.", time: "25 minutes ago" },
    { title: "High Priority Case", message: "MCN-003 requires immediate police assignment.", time: "1 hour ago" },
    { title: "Child Located", message: "MCN-005 has been marked as successfully resolved.", time: "2 hours ago" }
  ];

  return (
    <div>
      <div className="page-title">
        <div>
          <span className="section-label">SYSTEM ALERTS</span>
          <h1>Notifications</h1>
          <p>Important case and police updates.</p>
        </div>
        <button className="secondary-button">Mark all as read</button>
      </div>

      <div className="dashboard-card">
        {notifications.map((notification, index) => (
          <div className="notification-row" key={index}>
            <div className="notification-symbol">🔔</div>
            <div>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
              <small>{notification.time}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notifications;