import React from "react";
import logo from "./logo.png";
function Sidebar({ activePage, setActivePage, sidebarOpen, setSidebarOpen ,onLogout}) {
  const menuItems = [
    { id: "dashboard", icon: "🏠", label: "Dashboard" },
    { id: "verification", icon: "✓", label: "Case Verification" },
    { id: "cases", icon: "📁", label: "Case Management" },
    { id: "assignment", icon: "➜", label: "Case Assignment" },
    { id: "police", icon: "👮", label: "Police Management" },
    { id: "users", icon: "👤", label: "User Management" },
    { id: "analytics", icon: "📊", label: "Analytics" },
    { id: "notifications", icon: "🔔", label: "Notifications" },
    { id: "audit", icon: "📋", label: "Audit Logs" }
  ];

  const handleClick = (id) => {
    setActivePage(id);
    setSidebarOpen(false);
  };

  return (
    <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="admin-logo">
        <div className="logo-box">
           <img src={logo} alt="Missing Child Rescue Network Logo" />
      

        </div>
        <div>
          <h2>Missing Child</h2>
          <h3>Rescue Network</h3>
        </div>
      </div>

      <div className="portal-title">ADMIN PORTAL</div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => handleClick(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="admin-profile">
          <div className="profile-avatar">A</div>
          <div>
            <strong>Admin</strong>
            <span>Administrator</span>
          </div>
        </div>
        <button onClick={onLogout}   style={{
    width: "100%",
    padding: "10px 14px",
    marginTop: "12px",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "6px",
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "left",
    cursor: "pointer",
  }}>
  Logout
</button>
      </div>
    </aside>
  );
}

export default Sidebar;