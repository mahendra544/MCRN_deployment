import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PoliceDashboard from "./police-dashboard.jsx";
import PoliceProfile from "./police-profile.jsx";
import "./dashboard.css";
import "./notifications.css";
import "./forms-search.css";
import "./animations.css";
import "./police-dashboard.css";
import "./responsive-all.css";
function App(){return <BrowserRouter><Routes><Route path="/police-dashboard" element={<PoliceDashboard/>}/><Route path="/police-cases" element={<PoliceDashboard/>}/><Route path="/police-verify" element={<PoliceDashboard/>}/><Route path="/police-search" element={<PoliceDashboard/>}/><Route path="/police-notifications" element={<PoliceDashboard/>}/><Route path="/police-profile" element={<PoliceProfile/>}/><Route path="*" element={<PoliceDashboard/>}/></Routes></BrowserRouter>}
createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);
