import { BrowserRouter, Routes, Route } from "react-router-dom";

import UserDashboard from "./pages/user_dashboard";
import SearchChildren from "./pages/search_children";
import ChildDetails from "./pages/child_details";
import Sightings from "./pages/sightings";
import AboutUs from "./pages/aboutus";
import ReportMissingChild from "./pages/ReportMissingChild";
import Reports from "./components/Reports";
import "./components/Reports.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* USER DASHBOARD */}
        <Route
          path="/user-dashboard"
          element={<UserDashboard />}
        />

        {/* SEARCH CHILDREN */}
        <Route
          path="/search-children"
          element={<SearchChildren />}
        />

        {/* CHILD DETAILS */}
        <Route
          path="/child/:caseId"
          element={<ChildDetails />}
        />

        {/* REPORT SIGHTING */}
        <Route
          path="/report-sighting"
          element={<Sightings />}
        />

        {/* ABOUT US */}
        <Route
          path="/about-us"
          element={<AboutUs />}
        />

        {/* MY REPORTS */}
        <Route
          path="/my-cases"
          element={<Reports />}
        />

        {/* REPORT MISSING CHILD */}
        <Route
          path="/report-child"
          element={<ReportMissingChild />}
        />

        {/* DEFAULT PAGE */}
        <Route
          path="*"
          element={<UserDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;