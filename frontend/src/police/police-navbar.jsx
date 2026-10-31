import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { API_ORIGIN as API_BASE_URL } from "../api.js";
import "./common-navbar.css";

function PoliceNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState({ username: "Police Officer", officialId: "", department: "Police Department" });
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const saved = localStorage.getItem("mcrn_session");
        if (saved) {
          const data = JSON.parse(saved);
          setProfile((current) => ({
            ...current,
            username: data.username || data.name || current.username,
            officialId: data.officialId || current.officialId,
            department: data.department || current.department,
          }));
        }
        const token = localStorage.getItem("mcrn_token");
        if (token) {
          const response = await fetch(`${API_BASE_URL}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } });
          if (response.ok) {
            const data = await response.json();
            setProfile((current) => ({
              ...current,
              username: data.username || data.name || current.username,
              officialId: data.officialId || current.officialId,
              department: data.department || current.department,
            }));
          }
        }
      } catch (_) {}
    };

    const loadNotifications = () => fetch(`${API_BASE_URL}/api/notifications`, { headers: { Authorization: `Bearer ${localStorage.getItem("mcrn_token") || ""}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setNotificationCount(Array.isArray(data?.notifications) ? data.notifications.length : 0))
      .catch(() => {});

    loadProfile();
    loadNotifications();
    const timer = setInterval(loadNotifications, 15000);
    return () => clearInterval(timer);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const initials = (profile.username || "P").trim().charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("mcrn_token");
    localStorage.removeItem("mcrn_session");
    window.location.href = "/login";
  };

  const navClass = ({ isActive }) => isActive ? "common-nav-link active" : "common-nav-link";
  const mobileClass = ({ isActive }) => isActive ? "common-mobile-link active" : "common-mobile-link";

  return (
    <header className="common-navbar">
      <div className="common-navbar-container">
        <NavLink to="/police-dashboard" className="common-brand" onClick={closeMenu}>
          <div className="common-brand-mark">
            <img src="/logo.png" alt="Missing Child Rescue Network" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "13px" }} />
          </div>
          <div className="common-brand-text">
            <strong>Missing Child</strong>
            <span>Rescue Network</span>
          </div>
        </NavLink>

        <nav className="common-nav-links" aria-label="Police dashboard navigation">
          <NavLink to="/police-dashboard" end className={navClass}><span className="common-nav-icon">⌂</span>Home</NavLink>
          <NavLink to="/police-cases#all-cases" className={navClass}><span className="common-nav-icon">▣</span>All Cases</NavLink>
          <NavLink to="/police-verify#verify-reports" className={navClass}><span className="common-nav-icon">✓</span>Verify Reports</NavLink>
          <NavLink to="/police-search#search-records" className={navClass}><span className="common-nav-icon">⌕</span>Search Records</NavLink>
        </nav>

        <div className="common-nav-right">
          <NavLink to="/police-notifications#notifications" className="common-notification" aria-label="Notifications">
            <span>🔔</span><i>{notificationCount}</i>
          </NavLink>
          <NavLink to="/police-profile" className="common-profile" title="Profile">
            <div className="common-profile-avatar">{initials}</div>
            <div className="common-profile-details">
              <strong>{profile.username}</strong>
              <span>Police</span>
            </div>
            <span className="common-profile-arrow">⌄</span>
          </NavLink>
          <button type="button" className="common-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation menu" aria-expanded={menuOpen}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="common-mobile-menu">
          <NavLink to="/police-dashboard" end className={mobileClass} onClick={closeMenu}><span className="common-nav-icon">⌂</span>Home</NavLink>
          <NavLink to="/police-cases#all-cases" className={mobileClass} onClick={closeMenu}><span className="common-nav-icon">▣</span>All Cases</NavLink>
          <NavLink to="/police-verify#verify-reports" className={mobileClass} onClick={closeMenu}><span className="common-nav-icon">✓</span>Verify Reports</NavLink>
          <NavLink to="/police-search#search-records" className={mobileClass} onClick={closeMenu}><span className="common-nav-icon">⌕</span>Search Records</NavLink>
          <NavLink to="/police-notifications#notifications" className={mobileClass} onClick={closeMenu}><span className="common-nav-icon">🔔</span>Notifications</NavLink>
          <button type="button" className="common-mobile-link" onClick={handleLogout}>Logout</button>
        </nav>
      )}
    </header>
  );
}

export default PoliceNavbar;
