import React from "react";
import ReactDOM from "react-dom/client";
import AppAdmin from "./AppAdmin.jsx";

const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const url = typeof input === "string" ? input : input?.url || "";
  const token = localStorage.getItem("adminToken");
  if (token && url.includes("/api/") && !url.includes("/api/admin/login")) {
    const headers = new Headers(init.headers || (typeof input !== "string" ? input.headers : undefined));
    headers.set("Authorization", `Bearer ${token}`);
    init = { ...init, headers };
  }
  return nativeFetch(input, init);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppAdmin />
  </React.StrictMode>
);
