import { BrowserRouter, Routes, Route } from "react-router-dom";

import UserDashboard from "./pages/user_dashboard";
import SearchChildren from "./pages/search_children";
import ChildDetails from "./pages/child_details";
import Sightings from "./pages/sightings";
import AboutUs from "./pages/aboutus";
import ReportMissingChild from "./pages/ReportMissingChild";
import ContactUs from "./components/ContactUs";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/user-dashboard"
          element={<UserDashboard />}
        />

        <Route
          path="/search-children"
          element={<SearchChildren />}
        />

        <Route
          path="/child/:caseId"
          element={<ChildDetails />}
        />

        <Route
          path="/report-sighting"
          element={<Sightings />}
        />

        <Route
          path="/about-us"
          element={<AboutUs />}
        />

        <Route
          path="/contact-us"
          element={<ContactUs />}
        />

        <Route
          path="/report-child"
          element={<ReportMissingChild />}
        />

        <Route
          path="*"
          element={<UserDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;