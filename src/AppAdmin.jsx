import { useState } from "react";

import AdminLogin from "./AdminLogin_Styled";
import AdminDashboard from "./AdminDashboard";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

function AppAdmin() {

  const path = window.location.pathname;

  const [loggedIn, setLoggedIn] = useState(false);
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

    setLoggedIn(false);

    setPage("login");
  };


  // =========================
  // RESET PASSWORD PAGE
  // =========================

  // IMPORTANT:
  // This must be checked before login/dashboard.

  if (path.startsWith("/reset-password/")) {

    return (
      <ResetPassword
        onBack={() => {

          window.history.pushState(
            {},
            "",
            "/"
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