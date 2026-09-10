import { NavLink } from "react-router-dom";

function BellIcon() {
  return (
    <svg
      className="pd-bell-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 21h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CasesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M8 9h8M8 13h8M8 17h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VerifyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="m8 12 2.6 2.6L16.5 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="10.8"
        cy="10.8"
        r="6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="m16 16 5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PoliceNavbar() {
  return (
    <header className="pd-navbar">
      <div className="pd-navbar-inner">

        {/* =========================
            BRAND
        ========================== */}
        <NavLink
          to="/police-dashboard"
          end
          className="pd-brand"
        >
          <div className="pd-brand-mark">
            <img src="missing-child-logo.jpeg"></img>
          </div>

          <div className="pd-brand-text">
            <strong>Missing Child</strong>
            <span>Rescue Network</span>
          </div>
        </NavLink>

        {/* =========================
            NAVIGATION
        ========================== */}
        <nav
          className="pd-nav"
          aria-label="Police dashboard navigation"
        >

          {/* Dashboard */}
          <NavLink
            to="/police-dashboard"
            end
            className={({ isActive }) =>
              `pd-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="pd-nav-icon">
              <HomeIcon />
            </span>

            <span>Dashboard</span>
          </NavLink>

          {/* All Cases */}
          <NavLink
            to="/police-cases#all-cases"
            className={({ isActive }) =>
              `pd-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="pd-nav-icon">
              <CasesIcon />
            </span>

            <span>All Cases</span>
          </NavLink>

          {/* Verify Reports */}
          <NavLink
            to="/police-verify#verify-reports"
            className={({ isActive }) =>
              `pd-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="pd-nav-icon">
              <VerifyIcon />
            </span>

            <span>Verify Reports</span>
          </NavLink>

          {/* Search Records */}
          <NavLink
            to="/police-search#search-records"
            className={({ isActive }) =>
              `pd-nav-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="pd-nav-icon">
              <SearchIcon />
            </span>

            <span>Search Records</span>
          </NavLink>

        </nav>

        {/* =========================
            RIGHT SIDE
        ========================== */}
        <div className="pd-navbar-right">

          {/* Notifications */}
          <NavLink
            to="/police-notifications#notifications"
            className="pd-notification"
            aria-label="Notifications"
          >
            <BellIcon />

            <span className="pd-notification-count">
              2
            </span>
          </NavLink>

          {/* Profile */}
          <NavLink
            to="/police-profile#profile-section"
            className="pd-profile"
          >
            <div className="pd-profile-avatar">
              RN
            </div>

            <div className="pd-profile-info">
              <strong>Insp. Naidu</strong>

              <span>
                Police Officer
              </span>
            </div>

            <span className="pd-profile-arrow">
              ⌄
            </span>
          </NavLink>

        </div>

      </div>
    </header>
  );
}

export default PoliceNavbar;