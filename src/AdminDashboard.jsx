import React, { useState } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";

import Dashboard from "./Dashboard";
import CaseVerification from "./CaseVerification";
import CaseManagement from "./CaseManagement";
import CaseAssignment from "./CaseAssignment";
import PoliceManagement from "./PoliceManagement";
import UserManagement from "./UserManagement";
import Analytics from "./Analytics";
import Notifications from "./Notifications";
import AuditLogs from "./AuditLogs";
import "./admin-dashboard.css";
function AdminDashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
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
      default:
        return <Dashboard />;
    }
  };
  return (
    <div className="admin-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="admin-content">
        <Header setSidebarOpen={setSidebarOpen} />

        <main className="admin-main">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;