import { useState } from "react";

import AdminLogin from "./AdminLogin_Styled";
import AdminDashboard from "./AdminDashboard";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

function AppAdmin() {

  const path = window.location.pathname;

  const [loggedIn, setLoggedIn] = useState(() => Boolean(localStorage.getItem("adminToken")));
  const [page, setPage] = useState("login");

  // =========================
  // LOGIN
  // =========================

  const handleLogin = () => {
    setLoggedIn(true);
  };


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
  // RESET PASSWORD PAGE
  // =========================

  // IMPORTANT:
  // This must be checked before login/dashboard.

  if (path.startsWith("/admin/reset-password/")) {

    return (
      <ResetPassword
        onBack={() => {

          window.history.pushState(
            {},
            "",
            "/admin"
          );

          setPage("login");

        }}
      />
    );
  }


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