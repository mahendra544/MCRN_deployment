import React, { useState } from "react";

function Header({ setSidebarOpen }) {

  const [showNotifications, setShowNotifications] =
    useState(false);

  return (
    <header className="admin-header">

      <button
        className="mobile-menu-button"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      <div className="header-search">

        <span>🔍</span>

        <input
          type="text"
          placeholder="Search case ID, child name, location..."
        />

      </div>

      <div className="header-right">

        <div className="notification-container">

          <button
            className="notification-button"
            onClick={() =>
              setShowNotifications(!showNotifications)
            }
          >

            🔔

            <span className="notification-count">
              3
            </span>

          </button>

          {showNotifications && (

            <div className="notification-dropdown">

              <h3>Notifications</h3>

              <div className="notification-item">
                <strong>New Case Report</strong>
                <p>MCN-006 requires verification.</p>
                <small>5 minutes ago</small>
              </div>

              <div className="notification-item">
                <strong>Police Update</strong>
                <p>Officer Ravi updated MCN-001.</p>
                <small>25 minutes ago</small>
              </div>

              <div className="notification-item">
                <strong>High Priority Case</strong>
                <p>MCN-003 requires attention.</p>
                <small>1 hour ago</small>
              </div>

            </div>

          )}

        </div>

        <div className="header-line"></div>

        <div className="header-admin">

          <div className="profile-avatar">
            A
          </div>

          <div>
            <strong>Admin</strong>
            <span>Administrator</span>
          </div>

          <span>⌄</span>

        </div>

      </div>

    </header>
  );
}

export default Header;