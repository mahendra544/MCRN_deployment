import React from "react";

function Sidebar({
  activePage,
  setActivePage,
  sidebarOpen,
  setSidebarOpen
}) {

  const menuItems = [
    {
      id: "dashboard",
      icon: "🏠",
      label: "Dashboard"
    },
    {
      id: "verification",
      icon: "✓",
      label: "Case Verification"
    },
    {
      id: "cases",
      icon: "📁",
      label: "All Cases"
    },
    {
      id: "assignment",
      icon: "➜",
      label: "Case Assignment"
    },
    {
      id: "police",
      icon: "👮",
      label: "Police Management"
    },
    {
      id: "users",
      icon: "👤",
      label: "User Management"
    },
    {
      id: "analytics",
      icon: "📊",
      label: "Analytics"
    },
    {
      id: "notifications",
      icon: "🔔",
      label: "Notifications"
    },
    {
      id: "audit",
      icon: "📋",
      label: "Audit Logs"
    }
  ];

  const handleClick = (id) => {
    setActivePage(id);
    setSidebarOpen(false);
  };

  return (
    <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>

      <div className="admin-logo">

        <div className="logo-box">
          MC
        </div>

        <div>
          <h2>MCN</h2>
          <span>Rescue Network</span>
        </div>

      </div>

      <div className="portal-title">
        ADMIN PORTAL
      </div>

      <nav className="sidebar-menu">

        {menuItems.map((item) => (

          <button
            key={item.id}
            className={`sidebar-item ${
              activePage === item.id ? "active" : ""
            }`}
            onClick={() => handleClick(item.id)}
          >

            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span>
              {item.label}
            </span>

          </button>

        ))}

      </nav>

      <div className="sidebar-bottom">

        <div className="admin-profile">

          <div className="profile-avatar">
            A
          </div>

          <div>
            <strong>Admin</strong>
            <span>Administrator</span>
          </div>

        </div>

        <button className="logout-button">
          ⇥ Logout
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;