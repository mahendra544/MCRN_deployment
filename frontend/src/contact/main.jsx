import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ContactUs from "./components/ContactUs.jsx";
import "./css/main.css";
import "./components/ContactUs.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="*" element={<ContactUs />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
