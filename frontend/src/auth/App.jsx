import { useEffect, useState } from "react";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import PoliceLogin from "./pages/PoliceLogin.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Verify from "./pages/Verify.jsx";
import Forgot from "./pages/Forgot.jsx";
import Reset from "./pages/Reset.jsx";
import Profile from "./pages/Profile.jsx";
import { get, TOKEN_KEY } from "./api/client.js";

export default function App() {
  const [page, setPage] = useState("home");
  const [data, setData] = useState(null);
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const go = (p, d) => {
    setPage(p);
    setData(d);
  };

  useEffect(() => {
    document.body.classList.add("page-ready");
    if (window.location.pathname === "/admin-login") {
      window.location.replace("/admin/");
      return;
    }
    const routePage = {
      "/login": "login", "/register": "register", "/police-login": "login",
      "/forgot": "forgot", "/profile": "profile"
    }[window.location.pathname];
    if (routePage) setPage(routePage);

    // Fixed: a hard refresh used to lose the logged-in view entirely, even
    // though the JWT was still sitting in localStorage. Now we check for a
    // token on load and restore the session by fetching the profile.
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      get("/user/profile", token)
        .then((profile) => {
          setSession({ token, ...profile });
          setPage(profile.role === "ADMIN" ? "admin-dashboard" : "profile");
        })
        .catch((x) => {
          // Fixed: previously this always removed the token on any failure,
          // including a plain network error (backend momentarily down).
          // That meant a temporary connectivity blip permanently logged the
          // user out. Only clear the token when the server actually
          // rejected it.
          if (!x.networkError) {
            localStorage.removeItem(TOKEN_KEY);
          }
        })
        .finally(() => setCheckingSession(false));
    } else {
      setCheckingSession(false);
    }
  }, []);

  if (checkingSession) {
    return (
      <Layout onHome={() => go("home")}>
        <main className="grid min-h-[60vh] place-items-center px-6">
          <p className="text-sm text-muted">Checking session...</p>
        </main>
      </Layout>
    );
  }

  if (page === "home") {
    return <Home go={go} />;
  }

  return (
    <Layout onHome={() => go("home")}>
      {page === "register" && <Register go={go} />}
      {page === "login" && <Login go={go} setSession={setSession} />}
      {page === "police-login" && <PoliceLogin go={go} setSession={setSession} />}
      {page === "admin-login" && <AdminLogin go={go} setSession={setSession} />}
      {page === "admin-dashboard" && <AdminDashboard go={go} clear={() => setSession(null)} />}
            {page === "verify" && <Verify email={data} go={go} />}
      {page === "forgot" && <Forgot go={go} />}
      {page === "reset" && <Reset email={data} go={go} />}
      {page === "profile" && <Profile clear={() => setSession(null)} go={go} />}
    </Layout>
  );
}
