import React from "react";
import { NavLink } from "react-router-dom";
import "./navigation.css";

function Navbar() {
  return (
    <header className="common-navbar">

      <div className="common-navbar-container">

        {/* =========================
            LOGO
        ========================= */}
        <NavLink to="/" className="common-brand">

          <div className="common-brand-mark">
            M
          </div>

          <div className="common-brand-text">
            <strong>Missing Child</strong>
            <span>Rescue Network</span>
          </div>

        </NavLink>


        {/* =========================
            NAVIGATION
        ========================= */}
        <nav className="common-nav-links">

          <NavLink
            to="/user-dashboard"
            className={({ isActive }) =>
              isActive
                ? "common-nav-link active"
                : "common-nav-link"
            }
          >
            <span className="common-nav-icon">⌂</span>
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
            <span className="common-nav-icon">⌕</span>
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
            <span className="common-nav-icon">+</span>
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
            <span className="common-nav-icon">◉</span>
            Report Sighting
          </NavLink>


          <NavLink
            to="/my-cases"
            className={({ isActive }) =>
              isActive
                ? "common-nav-link active"
                : "common-nav-link"
            }
          >
            <span className="common-nav-icon">▤</span>
            About Us
          </NavLink>

        </nav>


        {/* =========================
            RIGHT SIDE
        ========================= */}
        <div className="common-nav-right">

          {/* Notifications */}
          <NavLink
            to="/notifications"
            className="common-notification"
            aria-label="Notifications"
          >
            <span>🔔</span>
            <i>3</i>
          </NavLink>


          {/* Profile */}
          <NavLink
            to="/profile"
            className="common-profile"
          >

            <div className="common-profile-avatar">
              R
            </div>

            <div className="common-profile-details">
              <strong>Rishitha</strong>
              <span>User</span>
            </div>

            <span className="common-profile-arrow">
              ⌄
            </span>

          </NavLink>

        </div>

      </div>

    </header>
  );
}

export default Navbar;