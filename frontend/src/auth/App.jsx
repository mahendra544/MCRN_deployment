import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import PoliceLogin from "./pages/PoliceLogin.jsx";
import Verify from "./pages/Verify.jsx";
import Forgot from "./pages/Forgot.jsx";
import Reset from "./pages/Reset.jsx";
import Profile from "./pages/Profile.jsx";
import { get, TOKEN_KEY } from "./api/client.js";

const PAGE_PATHS = {
  home: "/",
  login: "/login",
  "police-login": "/police-login",
  register: "/register",
  verify: "/verify",
  forgot: "/forgot",
  reset: "/reset",
  profile: "/profile",
};

function pageForPath(path) {
  return Object.entries(PAGE_PATHS).find(([, route]) => route === path)?.[0] || "home";
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(() => pageForPath(location.pathname));
  const [data, setData] = useState(location.state?.data || null);
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const go = (p, d) => {
    setPage(p);
    setData(d);
    navigate(PAGE_PATHS[p] || "/", d === undefined ? undefined : { state: { data: d } });
  };

  useEffect(() => {
    document.body.classList.add("page-ready");
    setPage(pageForPath(location.pathname));
    setData(location.state?.data || null);
  }, [location.pathname, location.state]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      get("/user/profile", token)
        .then((profile) => {
          setSession({ token, ...profile });
          if (["/", "/login", "/police-login"].includes(location.pathname)) {
            const destination = {
              USER: "/user-dashboard",
              POLICE: "/police-dashboard",
              ADMIN: "/admin",
            }[profile.role];
            if (destination) navigate(destination, { replace: true });
          }
        })
        .catch((error) => {
          if (error.status === 401 || error.status === 403) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem("mcrn_session");
            setSession(null);
            if (location.pathname === "/profile") {
              navigate("/login", { replace: true });
            }
          }
        })
        .finally(() => setCheckingSession(false));
    } else {
      setCheckingSession(false);
    }
  }, [location.pathname, navigate]);

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
      {page === "verify" && <Verify email={data} go={go} />}
      {page === "forgot" && <Forgot go={go} />}
      {page === "reset" && <Reset email={data} go={go} />}
      {page === "profile" && <Profile clear={() => setSession(null)} go={go} />}
    </Layout>
  );
}
