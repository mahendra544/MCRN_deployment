import { Routes, Route } from "react-router-dom";
import Sightings from "./sightings.jsx";

import "./global.css";
import "./navigation.css";
import "./buttons.css";
import "./responsive.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Sightings />} />
      <Route path="/report-sighting" element={<Sightings />} />
    </Routes>
  );
}

export default App;