import { Routes, Route } from "react-router-dom";

import ReportMissingChild from "./components/ReportMissingChild";
import Reports from "./components/Reports";
import Sightings from "./sightings.jsx";
import PoliceDashboard from "./police-dashboard/police-dashboard.jsx";

import "./css/main.css";
import "./global.css";
import "./navigation.css";
import "./buttons.css";
import "./responsive.css";

function App() {
  return (
    <Routes>
      {/* Public / Missing Child Reporting */}
      <Route
        path="/report-child"
        element={
          <>
            <ReportMissingChild />
            <Reports />
          </>
        }
      />

      {/* Public / Sightings */}
      <Route path="/" element={<Sightings />} />
      <Route path="/report-sighting" element={<Sightings />} />

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
    </Routes>
  );
}

export default App;