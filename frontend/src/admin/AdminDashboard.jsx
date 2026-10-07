import React, { useState } from "react";

import AdminNavbar from "./AdminNavbar";

import Dashboard from "./Dashboard";
import CaseVerification from "./CaseVerification";
import CaseManagement from "./CaseManagement";
import CaseAssignment from "./CaseAssignment";
import PoliceManagement from "./PoliceManagement";
import UserManagement from "./UserManagement";
import Analytics from "./Analytics";
import Notifications from "./Notifications";
import AuditLogs from "./AuditLogs";
import AdminProfile from "./AdminProfile";

import "./admin-dashboard.css";

function AdminDashboard({ onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard  setActivePage={setActivePage}/>;

      case "verification":
        return <CaseVerification />;

      case "cases":
        return <CaseManagement />;

      case "assignment":
        return <CaseAssignment />;

      case "police":
        return <PoliceManagement />;

      case "users":
        return <UserManagement />;

      case "analytics":
        return <Analytics />;

      case "notifications":
        return <Notifications />;

      case "audit":
        return <AuditLogs />;

      case "profile":
        return <AdminProfile />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="admin-layout">

      <AdminNavbar
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={onLogout}
      />

      <div className="admin-content">
        <main className="admin-main">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;