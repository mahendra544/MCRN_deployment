import { useEffect, useState } from "react";
import { API_ORIGIN as API_BASE_URL } from "../api.js";


export default function PoliceProfile() {
  const [profile, setProfile] = useState({
    username: "Police Officer",
    name: "Police Officer",
    email: "",
    officialId: "",
    department: "Police Department",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mcrn_session");
      if (saved) {
        const session = JSON.parse(saved);
        setProfile((current) => ({
          ...current,
          username: session.username || session.name || current.username,
          name: session.name || session.username || current.name,
          email: session.email || current.email,
          officialId: session.officialId || current.officialId,
          department: session.department || current.department,
        }));
      }
    } catch (_) {}

    const token = localStorage.getItem("mcrn_token");
    if (!token) return;

    fetch(`${API_BASE_URL}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) return;
        setProfile((current) => ({
          ...current,
          username: data.username || data.name || current.username,
          name: data.name || data.username || current.name,
          email: data.email || current.email,
          officialId: data.officialId || current.officialId,
          department: data.department || current.department,
        }));
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    // Same logout behavior as the user/auth profile: only the explicit
    // Logout button clears the active session.
    localStorage.removeItem("mcrn_token");
    localStorage.removeItem("mcrn_session");
    window.location.href = "/login";
  };

  return (
    <div className="police-dashboard-shell">
      <main className="police-dashboard-page" style={{ paddingTop: "110px" }}>
        <section className="pd-hero">
          <div>
            <div className="pd-eyebrow">POLICE ACCOUNT</div>
            <h1>My Profile</h1>
            <p>View your police account details and manage your session.</p>
          </div>
        </section>

        <section className="pd-stats-row" style={{ display: "block" }}>
          <div className="pd-stat" style={{ maxWidth: "760px", margin: "0 auto" }}>
            <div style={{ width: "100%" }}>
              <h2 style={{ marginBottom: "18px" }}>{profile.name}</h2>
              <p><strong>Username:</strong> {profile.username}</p>
              {profile.email && <p><strong>Email:</strong> {profile.email}</p>}
              <p><strong>Official ID:</strong> {profile.officialId || "Not available"}</p>
              <p><strong>Department:</strong> {profile.department}</p>
              <button
                type="button"
                className="pd-logout-button"
                onClick={handleLogout}
                style={{ marginTop: "24px", maxWidth: "180px" }}
              >
                <span className="pd-logout-icon">↪</span>
                Logout
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
