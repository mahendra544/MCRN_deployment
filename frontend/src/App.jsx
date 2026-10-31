import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth module
import AuthApp from "./auth/App.jsx";

// User module
import UserDashboard from "./user/pages/user_dashboard.jsx";
import SearchChildren from "./user/pages/search_children.jsx";
import ChildDetails from "./user/pages/child_details.jsx";
import Sightings from "./user/pages/sightings.jsx";
import AboutUs from "./user/pages/aboutus.jsx";
import ReportMissingChild from "./user/pages/ReportMissingChild.jsx";
import Reports from "./user/components/Reports.jsx";

// Police module
import PoliceDashboard from "./police/police-dashboard.jsx";
import PoliceProfile from "./police/police-profile.jsx";

// Contact module
import ContactUs from "./contact/components/ContactUs.jsx";

// Admin module
import AppAdmin from "./admin/AppAdmin.jsx";
import PortalGuard from "./auth/PortalGuard.jsx";

export default function App() {
  const userPortal = (page) => <PortalGuard role="USER">{page}</PortalGuard>;
  const policePortal = (page) => <PortalGuard role="POLICE">{page}</PortalGuard>;

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth & Homepage Routes */}
        <Route path="/" element={<AuthApp />} />
        <Route path="/login" element={<AuthApp />} />
        <Route path="/police-login" element={<AuthApp />} />
        <Route path="/register" element={<AuthApp />} />
        <Route path="/verify" element={<AuthApp />} />
        <Route path="/forgot" element={<AuthApp />} />
        <Route path="/reset" element={<AuthApp />} />
        <Route path="/profile" element={<AuthApp />} />
        <Route path="/admin-login" element={<Navigate to="/admin" replace />} />

        {/* User Portal Routes */}
        <Route path="/user-dashboard" element={userPortal(<UserDashboard />)} />
        <Route path="/notifications" element={userPortal(<Navigate to="/user-dashboard#notifications" replace />)} />
        <Route path="/search-children" element={userPortal(<SearchChildren />)} />
        <Route path="/child/:caseId" element={userPortal(<ChildDetails />)} />
        <Route path="/report-sighting" element={userPortal(<Sightings />)} />
        <Route path="/about-us" element={userPortal(<AboutUs />)} />
        <Route path="/my-cases" element={userPortal(<Reports />)} />
        <Route path="/reports" element={userPortal(<Reports />)} />
        <Route path="/report-child" element={userPortal(<ReportMissingChild />)} />

        {/* Police Portal Routes */}
        <Route path="/police-dashboard" element={policePortal(<PoliceDashboard />)} />
        <Route path="/police-cases" element={policePortal(<PoliceDashboard />)} />
        <Route path="/police-verify" element={policePortal(<PoliceDashboard />)} />
        <Route path="/police-search" element={policePortal(<PoliceDashboard />)} />
        <Route path="/police-notifications" element={policePortal(<PoliceDashboard />)} />
        <Route path="/police-profile" element={policePortal(<PoliceProfile />)} />

        {/* Contact Us Route */}
        <Route path="/contact-us" element={<ContactUs />} />

        {/* Admin Portal Routes */}
        <Route path="/admin/*" element={<AppAdmin />} />
        <Route path="/admin" element={<AppAdmin />} />

        {/* Fallback */}
        <Route path="*" element={<AuthApp />} />
      </Routes>
    </BrowserRouter>
  );
}
