import React from "react";
import ReactDOM from "react-dom/client";
import AppAdmin from "./AppAdmin.jsx";
import { installApiFetch } from "../api.js";

installApiFetch();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppAdmin />
  </React.StrictMode>
);
