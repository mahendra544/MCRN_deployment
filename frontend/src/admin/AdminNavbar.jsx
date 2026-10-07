import React, { useEffect, useMemo, useState } from "react";
import "./admin-navbar.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function AdminNavbar({ activePage, setActivePage, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cases, setCases] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const adminData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("adminData") || "{}");
    } catch {
      return {};
    }
  }, []);

  const adminName = adminData.name || adminData.username || "Admin";
  const initials = adminName.trim().charAt(0).toUpperCase() || "A";

  const items = [
    ["dashboard", "⌂", "Home"],
    ["verification", "✓", "Verify Reports"],
    ["cases", "▣", "Cases"],
    ["assignment", "➜", "Assignments"],
    ["police", "♙", "Police"],
    ["users", "♙", "Users"],
    ["analytics", "◒", "Analytics"],
    ["notifications", "🔔", "Notifications"],
    ["audit", "▤", "Audit Logs"],
  ];

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    const load = async () => {
      try {
        const [caseResponse, notificationResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/cases`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/admin/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (caseResponse.ok) {
          const data = await caseResponse.json();
          setCases(Array.isArray(data) ? data : data.cases || []);
        }

        if (notificationResponse.ok) {
          const data = await notificationResponse.json();
          const list = Array.isArray(data) ? data : data.notifications || [];
          setNotificationCount(list.length);
        }
      } catch (_) {
        // Dashboard modules handle their own errors.
      }
    };

    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);

  const results = search.trim()
    ? cases.filter((item) => {
        const q = search.toLowerCase().trim();
        return [item.case_id, item.child_name, item.location]
          .some((value) => String(value || "").toLowerCase().includes(q));
      }).slice(0, 6)
    : [];

  const go = (id) => {
    setActivePage(id);
    setMenuOpen(false);
    setShowResults(false);
    setSearch("");
  };

  const logout = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <header className="admin-common-navbar">
      <div className="admin-common-navbar-container">
        <button className="admin-common-brand" onClick={() => go("dashboard")} type="button">
          <span className="admin-common-brand-mark">
            <img src="/logo.png" alt="Missing Child Rescue Network" />
          </span>
          <span className="admin-common-brand-text">
            <strong>Missing Child</strong>
            <span>Rescue Network</span>
          </span>
        </button>

        <nav className="admin-common-nav-links" aria-label="Administrator navigation">
          {items.map(([id, icon, label]) => (
            <button
              key={id}
              type="button"
              className={`admin-common-nav-link ${activePage === id ? "active" : ""}`}
              onClick={() => go(id)}
            >
              <span>{icon}</span>{label}
              {id === "notifications" && notificationCount > 0 && (
                <b className="admin-common-nav-badge">{notificationCount}</b>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-common-nav-right">
          <div className="admin-common-search-wrap">
            <span>⌕</span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowResults(Boolean(e.target.value.trim()));
              }}
              onFocus={() => setShowResults(Boolean(search.trim()))}
              placeholder="Search cases..."
              aria-label="Search cases"
            />
            {showResults && results.length > 0 && (
              <div className="admin-common-search-results">
                {results.map((item) => (
                  <button key={item.id || item.case_id} type="button" onClick={() => {
                    localStorage.setItem("selectedCaseId", item.case_id || item.id);
                    go("cases");
                  }}>
                    <strong>{item.case_id || "Case"}</strong>
                    <span>{item.child_name || "Unknown child"}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button type="button" className="admin-common-profile" onClick={() => go("profile")} title="Admin Profile">
            <span className="admin-common-avatar">{initials}</span>
            <span className="admin-common-profile-details">
              <strong>{adminName}</strong>
              <span>Administrator</span>
            </span>
            <span className="admin-common-arrow">⌄</span>
          </button>

          <button type="button" className="admin-common-logout" onClick={logout}>
            <span>↪</span> Logout
          </button>

          <button type="button" className="admin-common-menu" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle administrator menu" aria-expanded={menuOpen}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="admin-common-mobile-menu">
          {items.map(([id, icon, label]) => (
            <button key={id} type="button" className={`admin-common-mobile-link ${activePage === id ? "active" : ""}`} onClick={() => go(id)}>
              <span>{icon}</span>{label}
            </button>
          ))}
          <button type="button" className="admin-common-mobile-link" onClick={() => go("profile")}>◉ Profile</button>
          <button type="button" className="admin-common-mobile-link logout" onClick={logout}>↪ Logout</button>
        </nav>
      )}
    </header>
  );
}

export default AdminNavbar;
