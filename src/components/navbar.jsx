import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

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

          {/* MCRN LOGO */}
          <div className="common-brand-mark">
            <img
              src="/mcrn-logo.png"
              alt="Missing Child Rescue Network"
              className="common-brand-logo"
            />
          </div>

          {/* BRAND NAME */}
          <div className="common-brand-text">
            <strong>Missing Child</strong>
            <span>Rescue Network</span>
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
            to="/about-us"
            className={({ isActive }) =>
              isActive
                ? "common-nav-link active"
                : "common-nav-link"
            }
          >
            <span className="common-nav-icon">👥</span>
            About Us
          </NavLink>


          <NavLink
            to="/contact-us"
            className={({ isActive }) =>
              isActive
                ? "common-nav-link active"
                : "common-nav-link"
            }
          >
            <span className="common-nav-icon">🤝</span>
            Contact Us
          </NavLink>

        </nav>


        {/* RIGHT SIDE */}
        <div className="common-nav-right">

          {/* NOTIFICATIONS */}
          <NavLink
            to="/notifications"
            className="common-notification"
            aria-label="Notifications"
          >
            <span>🔔</span>
            <i>3</i>
          </NavLink>


          {/* PROFILE */}
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
            <span className="common-nav-icon">⌂</span>
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
            <span className="common-nav-icon">⌕</span>
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
            <span className="common-nav-icon">+</span>
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
            <span className="common-nav-icon">◉</span>
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
            <span className="common-nav-icon">👥</span>
            About Us
          </NavLink>


          <NavLink
            to="/contact-us"
            className={({ isActive }) =>
              isActive
                ? "common-mobile-link active"
                : "common-mobile-link"
            }
            onClick={closeMenu}
          >
            <span className="common-nav-icon">🤝</span>
            Contact Us
          </NavLink>

        </nav>
      )}

    </header>
  );
}

export default Navbar;