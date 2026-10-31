import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./navbar.css";
import { API_ORIGIN as API_BASE_URL } from "../../api.js";
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState({ name: "User", role: "User" });
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("mcrn_token");
    if (!token) return;
    fetch(`${API_BASE_URL}/api/user/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("profile")))
      .then((data) => setProfile({ name: data.name || "User", role: data.role === "USER" ? "User" : (data.role || "User") }))
      .catch(() => {});
    const loadNotifications = () => fetch(`${API_BASE_URL}/api/notifications`, { headers: { Authorization: `Bearer ${localStorage.getItem("mcrn_token") || ""}` } }).then(r => r.ok ? r.json() : null).then(data => setNotificationCount(Array.isArray(data?.notifications) ? data.notifications.length : 0)).catch(() => {});
    loadNotifications();
    const timer = setInterval(loadNotifications, 15000);
    return () => clearInterval(timer);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="common-navbar">

      <div className="common-navbar-container">

        {/* BRAND */}
        <NavLink
          to="/user-dashboard"
          className="common-brand"
          onClick={closeMenu}
        >
          <div className="common-brand-mark">
            <img
              src="/logo.png"
              alt="Missing Child Rescue Network"
          />
          </div>

          <div className="common-brand-text">
            <strong>
              Missing Child
            </strong>

            <span>
              Rescue Network
            </span>
          </div>
        </NavLink>


        {/* DESKTOP NAVIGATION */}
        <nav className="common-nav-links">

          <NavLink
            to="/user-dashboard"
            className={({ isActive }) =>
              isActive
                ? "common-nav-link active"
                : "common-nav-link"
            }
          >
            <span className="common-nav-icon">
              ⌂
            </span>
            Home
          </NavLink>


          <NavLink
            to="/search-children"
            className={({ isActive }) =>
              isActive
                ? "common-nav-link active"
                : "common-nav-link"
            }
          >
            <span className="common-nav-icon">
              ⌕
            </span>
            Search Children
          </NavLink>


          <NavLink
            to="/report-child"
            className={({ isActive }) =>
              isActive
                ? "common-nav-link active"
                : "common-nav-link"
            }
          >
            <span className="common-nav-icon">
              +
            </span>
            Report Missing
          </NavLink>


          <NavLink
            to="/report-sighting"
            className={({ isActive }) =>
              isActive
                ? "common-nav-link active"
                : "common-nav-link"
            }
          >
            <span className="common-nav-icon">
              ◉
            </span>
            Report Sighting
          </NavLink>


          <NavLink
            to="/about-us"
            className={({ isActive }) =>
              isActive
                ? "common-nav-link active"
                : "common-nav-link"
            }
          >
            <span className="common-nav-icon">
              👥
            </span>
            About Us
          </NavLink>

          <a href="/contact-us" className="common-nav-link" onClick={closeMenu}>
            <span className="common-nav-icon">
              ☎
            </span>
            Contact Us
          </a>

        </nav>


        {/* RIGHT SIDE */}
        <div className="common-nav-right">

          <NavLink
            to="/user-dashboard#notifications"
            className="common-notification"
            aria-label="Notifications"
            onClick={closeMenu}
          >
            <span>
              🔔
            </span>

            <i>{notificationCount}</i>
          </NavLink>


          <a
            href="/profile"
            className="common-profile"
          >
            <div className="common-profile-avatar">
              {(profile.name || "U").charAt(0).toUpperCase()}
            </div>

            <div className="common-profile-details">
              <strong>
                {profile.name}
              </strong>

              <span>
                User
              </span>
            </div>

            <span className="common-profile-arrow">
              ⌄
            </span>
          </a>


          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            className="common-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

        </div>

      </div>


      {/* MOBILE NAVIGATION */}
      {menuOpen && (
        <nav className="common-mobile-menu">

          <NavLink
            to="/user-dashboard"
            className={({ isActive }) =>
              isActive
                ? "common-mobile-link active"
                : "common-mobile-link"
            }
            onClick={closeMenu}
          >
            <span className="common-nav-icon">
              ⌂
            </span>
            Home
          </NavLink>


          <NavLink
            to="/search-children"
            className={({ isActive }) =>
              isActive
                ? "common-mobile-link active"
                : "common-mobile-link"
            }
            onClick={closeMenu}
          >
            <span className="common-nav-icon">
              ⌕
            </span>
            Search Children
          </NavLink>


          <NavLink
            to="/report-child"
            className={({ isActive }) =>
              isActive
                ? "common-mobile-link active"
                : "common-mobile-link"
            }
            onClick={closeMenu}
          >
            <span className="common-nav-icon">
              +
            </span>
            Report Missing
          </NavLink>


          <NavLink
            to="/report-sighting"
            className={({ isActive }) =>
              isActive
                ? "common-mobile-link active"
                : "common-mobile-link"
            }
            onClick={closeMenu}
          >
            <span className="common-nav-icon">
              ◉
            </span>
            Report Sighting
          </NavLink>


          <NavLink
            to="/about-us"
            className={({ isActive }) =>
              isActive
                ? "common-mobile-link active"
                : "common-mobile-link"
            }
            onClick={closeMenu}
          >
            <span className="common-nav-icon">
              👥
            </span>
            About Us
          </NavLink>

          <a href="/contact-us" className="common-mobile-link" onClick={closeMenu}>
            <span className="common-nav-icon">
              ☎
            </span>
            Contact Us
          </a>

        </nav>
      )}

    </header>
  );
}

export default Navbar;
