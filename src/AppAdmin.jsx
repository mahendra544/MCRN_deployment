/*import AdminDashboard from "./AdminDashboard";

function AppAdmin() {
  return <AdminDashboard />;
}

export default AppAdmin;
import { useState } from "react";
import AdminLogin from "./AdminLogin_Styled";
import AdminDashboard from "./AdminDashboard";

function AppAdmin() {
  const [loggedIn, setLoggedIn] = useState(false);

  return loggedIn ? (
    <AdminDashboard />
  ) : (
    <AdminLogin onLogin={() => setLoggedIn(true)} />
  );
}

export default AppAdmin;*/
import { useState } from "react";
import AdminRegister from "./AdminRegister";
import AdminLogin from "./AdminLogin_Styled";
import AdminDashboard from "./AdminDashboard";

function AppAdmin() {
  const [page, setPage] = useState("register");
  const [loggedIn, setLoggedIn] = useState(false);

  // After successful login → Dashboard
  if (loggedIn) {
    return <AdminDashboard />;
  }

  // Register page
  if (page === "register") {
    return (
      <AdminRegister
        onRegister={() => setPage("login")}
      />
    );
  }

  // Login page
  return (
    <AdminLogin
      onLogin={() => setLoggedIn(true)}
      onRegister={() => setPage("register")}
    />
  );
}

export default AppAdmin;