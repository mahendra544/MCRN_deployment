import { Routes, Route } from "react-router-dom";

import UserDashboard from "./pages/user_dashboard";
import SearchChildren from "./pages/search_children";
import ChildDetails from "./pages/child_details";
import Sightings from "./sightings.jsx";
import AboutUs from "./pages/aboutus";
import ReportMissingChild from "./components/ReportMissingChild";
import ContactUs from "./components/ContactUs";
import Reports from "./components/Reports";
import PoliceDashboard from "./police-dashboard/police-dashboard.jsx";

import "./css/main.css";
import "./global.css";
import "./navigation.css";
import "./buttons.css";
import "./responsive.css";

function App() {
  return (
    <Routes>
      {/* User Dashboard */}
      <Route
        path="/user-dashboard"
        element={<UserDashboard />}
      />

      {/* Search Children */}
      <Route
        path="/search-children"
        element={<SearchChildren />}
      />

      {/* Child Details */}
      <Route
        path="/child/:caseId"
        element={<ChildDetails />}
      />

      {/* Public / Sightings */}
      <Route path="/report-sighting" element={<Sightings />} />

      {/* About Us */}
      <Route
        path="/about-us"
        element={<AboutUs />}
      />

      {/* Contact Us */}
      <Route
        path="/contact-us"
        element={<ContactUs />}
      />

      {/* Missing Child Reporting */}
      <Route
        path="/report-child"
        element={
          <>
            <ReportMissingChild />
            <Reports />
          </>
        }
      />

      {/* Police Dashboard */}
      <Route
        path="/police-dashboard"
        element={<PoliceDashboard />}
      />

      <Route
        path="/police-cases"
        element={<PoliceDashboard />}
      />

      <Route
        path="/police-verify"
        element={<PoliceDashboard />}
      />

      <Route
        path="/police-search"
        element={<PoliceDashboard />}
      />

      <Route
        path="/police-notifications"
        element={<PoliceDashboard />}
      />

      <Route
        path="/police-profile"
        element={<PoliceDashboard />}
      />

      {/* Default page */}
      <Route
        path="*"
        element={<UserDashboard />}
      />
    </Routes>
  );
}

export default App;