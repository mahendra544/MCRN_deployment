import { Routes, Route } from "react-router-dom";
import Sightings from "./sightings.jsx";
import PoliceDashboard from "./police-dashboard/police-dashboard.jsx";

import "./global.css";
import "./navigation.css";
import "./buttons.css";
import "./responsive.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Sightings />} />

      <Route
        path="/report-sighting"
        element={<Sightings />}
      />

      <Route
        path="/police-dashboard"
        element={<PoliceDashboard />}
      />
    </Routes>
  );
}

export default App;