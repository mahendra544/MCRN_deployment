import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Global fetch interceptor to attach authentication tokens consistently
const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const url = typeof input === "string" ? input : input?.url || "";
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("mcrn_token");

  if (adminToken && url.includes("/api/admin/") && !url.includes("/api/admin/login")) {
    const headers = new Headers(init.headers || (typeof input !== "string" ? input.headers : undefined));
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${adminToken}`);
    }
    init = { ...init, headers };
  } else if (userToken && url.includes("/api/") && !url.includes("/api/auth/login") && !url.includes("/api/auth/register")) {
    const headers = new Headers(init.headers || (typeof input !== "string" ? input.headers : undefined));
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${userToken}`);
    }
    init = { ...init, headers };
  }
  return nativeFetch(input, init);
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
