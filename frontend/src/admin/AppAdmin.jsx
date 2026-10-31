import { useEffect, useState } from "react";

import AdminLogin from "./AdminLogin_Styled";
import AdminDashboard from "./AdminDashboard";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import { apiUrl } from "../api.js";

function AppAdmin() {
  const path = window.location.pathname;
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("login");
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    let active = true;
    if (path.startsWith("/admin/reset-password/")) {
      setCheckingSession(false);
      return () => { active = false; };
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      setCheckingSession(false);
      return () => { active = false; };
    }

    fetch(apiUrl("/api/admin/cases?limit=1"), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("adminLoggedIn");
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminData");
          throw new Error("Your administrator session has expired. Please sign in again.");
        }
        if (!response.ok) {
          throw new Error("Unable to verify your administrator session.");
        }
        return response.json();
      })
      .then(() => {
        if (active) setLoggedIn(true);
      })
      .catch((error) => {
        if (!active) return;
        if (!localStorage.getItem("adminToken")) {
          setLoggedIn(false);
          setSessionError("");
        } else {
          setSessionError(error.message);
        }
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => { active = false; };
  }, []);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = () => {
    setSessionError("");
    setLoggedIn(true);
  };

  if (path.startsWith("/admin/reset-password/")) {
    return (
      <ResetPassword
        onBack={() => {
          window.history.pushState({}, "", "/admin");
          setPage("login");
        }}
      />
    );
  }

  if (checkingSession) {
    return <main className="grid min-h-[60vh] place-items-center px-6"><p>Checking administrator session...</p></main>;
  }

  if (sessionError) {
    return (
      <main className="grid min-h-[60vh] place-items-center px-6">
        <div className="text-center">
          <p role="alert">{sessionError}</p>
          <button type="button" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </main>
    );
  }


  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {

    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");

    setLoggedIn(false);

    window.location.href = "/";
  };


  // =========================
  // ADMIN DASHBOARD
  // =========================

  if (loggedIn) {

    return (
      <AdminDashboard
        onLogout={handleLogout}
      />
    );
  }


  // =========================
  // FORGOT PASSWORD PAGE
  // =========================

  if (page === "forgot-password") {

    return (
      <ForgotPassword
        onBack={() => setPage("login")}
      />
    );
  }


  // =========================
  // LOGIN PAGE
  // =========================

  return (
    <AdminLogin
      onLogin={handleLogin}
      onForgotPassword={() =>
        setPage("forgot-password")
      }
    />
  );
}

export default AppAdmin;