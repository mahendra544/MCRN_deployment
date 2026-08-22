import React, { useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import CaseVerification from "./pages/CaseVerification";
import CaseManagement from "./pages/CaseManagement";
import CaseAssignment from "./pages/CaseAssignment";
import PoliceManagement from "./pages/PoliceManagement";
import UserManagement from "./pages/UserManagement";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";
import AuditLogs from "./pages/AuditLogs";

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

        <Header
          setSidebarOpen={setSidebarOpen}
        />

        <main className="admin-main">
          {renderPage()}
        </main>

      </div>

    </div>
  );
}

export default AdminDashboard;