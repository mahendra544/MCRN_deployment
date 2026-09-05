/*import { useState } from "react";
import AdminLogin from "./AdminLogin_Styled";
import AdminDashboard from "./AdminDashboard";

function AppAdmin() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("adminLoggedIn") === "true"
  );

  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    setLoggedIn(false);
  };

  if (loggedIn) {
    return (
      <AdminDashboard onLogout={handleLogout} />
    );
  }

  return (
    <AdminLogin onLogin={handleLogin} />
  );
}

export default AppAdmin;
import { useState } from "react";
import AdminLogin from "./AdminLogin_Styled";
import AdminDashboard from "./AdminDashboard";

function AppAdmin() {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("adminLoggedIn") === "true"
  );

  const handleLogin = () => {
    localStorage.setItem("adminLoggedIn", "true");
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    setLoggedIn(false);
  };

  if (loggedIn) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return <AdminLogin onLogin={handleLogin} />;
}

export default AppAdmin;*/
import { useState } from "react";
import AdminLogin from "./AdminLogin_Styled";
import AdminDashboard from "./AdminDashboard";
import ForgotPassword from "./ForgotPassword";

function AppAdmin() {
  const [loggedIn, setLoggedIn] = useState(false);

  const [page, setPage] = useState("login");

  const handleLogin = () => {setLoggedIn(true);};

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    setLoggedIn(false);
    setPage("login");
  };

  // Show Dashboard after login
  if (loggedIn) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // Show Forgot Password page
  if (page === "forgot-password") {
    return (
      <ForgotPassword
        onBack={() => setPage("login")}
      />
    );
  }

  // Show Login page
  return (
    <AdminLogin
      onLogin={handleLogin}
      onForgotPassword={() => setPage("forgot-password")}
    />
  );
}

export default AppAdmin;
