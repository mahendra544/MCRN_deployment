import { useEffect, useState } from "react";
import { apiUrl } from "../api.js";

const HOME_BY_ROLE = {
  USER: "/user-dashboard",
  POLICE: "/police-dashboard",
  ADMIN: "/admin",
};

export default function PortalGuard({ role, children }) {
  const [status, setStatus] = useState("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("mcrn_token");

    if (!token) {
      setStatus("unauthenticated");
      return () => { active = false; };
    }

    fetch(apiUrl("/api/user/profile"), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const profile = await response.json().catch(() => ({}));
        if (!response.ok) {
          const error = new Error(profile.message || "Unable to verify your session.");
          error.status = response.status;
          throw error;
        }
        return profile;
      })
      .then((profile) => {
        if (!active) return;
        if (profile.role === role) {
          setStatus("authorized");
          return;
        }
        setStatus(HOME_BY_ROLE[profile.role] ? `redirect:${HOME_BY_ROLE[profile.role]}` : "unauthenticated");
      })
      .catch((error) => {
        if (!active) return;
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem("mcrn_token");
          localStorage.removeItem("mcrn_session");
          setStatus("unauthenticated");
          return;
        }
        setStatus("unavailable");
      });

    return () => { active = false; };
  }, [role, attempt]);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.replace("/login");
    } else if (status.startsWith("redirect:")) {
      window.location.replace(status.slice("redirect:".length));
    }
  }, [status]);

  if (status === "authorized") return children;
  if (status === "unavailable") {
    return (
      <main className="grid min-h-[60vh] place-items-center px-6">
        <div className="text-center">
          <p className="text-sm text-muted">Unable to verify your session. Check your connection and try again.</p>
          <button className="auth-link mt-3" type="button" onClick={() => {
            setStatus("checking");
            setAttempt((value) => value + 1);
          }}>Retry</button>
        </div>
      </main>
    );
  }
  return (
    <main className="grid min-h-[60vh] place-items-center px-6">
      <p className="text-sm text-muted">Checking session...</p>
    </main>
  );
}
