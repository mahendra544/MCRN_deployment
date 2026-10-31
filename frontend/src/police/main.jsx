import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PoliceDashboard from "./police-dashboard.jsx";
import PoliceProfile from "./police-profile.jsx";
import PortalGuard from "../auth/PortalGuard.jsx";
import { installApiFetch } from "../api.js";
import "./dashboard.css";
import "./notifications.css";
import "./forms-search.css";
import "./animations.css";
import "./police-dashboard.css";
import "./responsive-all.css";
installApiFetch();
function App(){return <BrowserRouter><Routes><Route path="/police-dashboard" element={<PortalGuard role="POLICE"><PoliceDashboard/></PortalGuard>}/><Route path="/police-cases" element={<PortalGuard role="POLICE"><PoliceDashboard/></PortalGuard>}/><Route path="/police-verify" element={<PortalGuard role="POLICE"><PoliceDashboard/></PortalGuard>}/><Route path="/police-search" element={<PortalGuard role="POLICE"><PoliceDashboard/></PortalGuard>}/><Route path="/police-notifications" element={<PortalGuard role="POLICE"><PoliceDashboard/></PortalGuard>}/><Route path="/police-profile" element={<PortalGuard role="POLICE"><PoliceProfile/></PortalGuard>}/><Route path="*" element={<PortalGuard role="POLICE"><PoliceDashboard/></PortalGuard>}/></Routes></BrowserRouter>}
createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);
