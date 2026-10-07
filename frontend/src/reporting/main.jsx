import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReportMissingChild from "./components/ReportMissingChild.jsx";
import Reports from "./components/Reports.jsx";
import "./css/main.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/report-child" element={<ReportMissingChild />} />
        <Route path="/my-cases" element={<Reports />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<ReportMissingChild />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
