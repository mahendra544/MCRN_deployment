import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useLocation } from "react-router-dom";

import PoliceNavbar from "./police-navbar.jsx";
import SearchPanel from "./search-panel.jsx";
import CaseList from "./case-list.jsx";
import CaseDetailPanel from "./case-detail-panel.jsx";
import NotificationPanel from "./notification-panel.jsx";

import {
  mockOfficer,
  mockCases,
  mockNotifications,
} from "./mock-cases.js";

import "./dashboard.css";
import "./notifications.css";
import "./forms-search.css";
import "./animations.css";
import "./police-dashboard.css";


const EMPTY_FILTERS = {
  name: "",
  stage: "",
  location: "",
};


function PoliceDashboard() {

  const location = useLocation();

  const [cases, setCases] = useState(mockCases);

  const [filters, setFilters] =
    useState(EMPTY_FILTERS);

  const [selectedCaseId, setSelectedCaseId] =
    useState(
      mockCases[0]?.case_id ?? null
    );

  const [activeTab, setActiveTab] =
    useState("assigned");


  /* =====================================================
     FILTER CASES
     ===================================================== */

  const filteredCases = useMemo(() => {

    return cases.filter((item) => {

      const name =
        item.child_name?.toLowerCase() || "";

      const locationName =
        item.last_seen_location?.toLowerCase() || "";

      const searchName =
        filters.name.toLowerCase();

      const searchLocation =
        filters.location.toLowerCase();

      return (
        name.includes(searchName) &&
        (
          !filters.stage ||
          item.case_stage === filters.stage
        ) &&
        locationName.includes(searchLocation)
      );

    });

  }, [cases, filters]);


  /* =====================================================
     SELECTED CASE
     ===================================================== */

  const selectedCase =
    cases.find(
      (item) =>
        item.case_id === selectedCaseId
    ) || null;


  /* =====================================================
     CASE COUNTS
     ===================================================== */

  const stageCounts = useMemo(() => {

    return cases.reduce(
      (counts, item) => {

        counts[item.case_stage] =
          (counts[item.case_stage] || 0) + 1;

        return counts;

      },
      {
        Open: 0,
        Investigating: 0,
        Matched: 0,
        Resolved: 0,
        Closed: 0,
      }
    );

  }, [cases]);


  /* =====================================================
     UPDATE CASE STAGE
     ===================================================== */

  function advanceStage(caseId, newStage) {

    setCases((current) =>

      current.map((item) =>

        item.case_id === caseId
          ? {
              ...item,
              case_stage: newStage,
            }
          : item

      )

    );

  }


  /* =====================================================
     MARK CASE AS FOUND
     ===================================================== */

  function markFound(caseId) {

    advanceStage(
      caseId,
      "Resolved"
    );

  }


  /* =====================================================
     DASHBOARD NAVIGATION
     ===================================================== */

  useEffect(() => {

    const hash =
      location.hash.replace("#", "");

    /*
     * When Verify Reports is selected,
     * display the Sighting Reports tab.
     */

    if (hash === "verify-reports") {

      setActiveTab("sightings");

    } else {

      setActiveTab("assigned");

    }


    /*
     * Wait for React to render the
     * correct section before scrolling.
     */

    const timer = setTimeout(() => {

      if (!hash) {

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }


      const element =
        document.getElementById(hash);


      if (element) {

        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

      }

    }, 150);


    return () => {
      clearTimeout(timer);
    };

  }, [
    location.pathname,
    location.hash,
  ]);


  return (
    <div className="police-dashboard-shell">

      {/* =================================================
          NAVBAR
          ================================================= */}

      <PoliceNavbar />


      <main className="police-dashboard-page">

        {/* =================================================
            HERO
            ================================================= */}

        <section
          id="dashboard"
          className="pd-hero"
        >

          <div>

            <div className="pd-eyebrow">

              <span className="pd-live-dot" />

              POLICE OPERATIONS PORTAL

            </div>


            <h1>
              Case command center
            </h1>


            <p>
              Review verified reports, manage
              assigned cases, and move
              investigations forward.
            </p>

          </div>


          {/* =================================================
              OFFICER PROFILE
              ================================================= */}

          <div
            id="profile-section"
            className="pd-officer-chip"
          >

            <div className="pd-officer-avatar">
              RN
            </div>


            <div>

              <strong>
                {mockOfficer.full_name}
              </strong>

              <span>
                {mockOfficer.badge_id}
                {" · "}
                {mockOfficer.department}
              </span>

            </div>


            <span className="pd-online">
              Online
            </span>

          </div>

        </section>


        {/* =================================================
            STATISTICS
            ================================================= */}

        <section className="pd-stats-row">

          {/* ================= OPEN CASES ================= */}

          <div className="pd-stat pd-stat--open">

            <div className="pd-stat-icon">
              !
            </div>

            <div>

              <span className="pd-stat-number">
                {stageCounts.Open}
              </span>

              <span className="pd-stat-label">
                Open cases
              </span>

            </div>

          </div>


          {/* ============== INVESTIGATING ================ */}

          <div className="pd-stat pd-stat--investigating">

            <div className="pd-stat-icon">
              ↗
            </div>

            <div>

              <span className="pd-stat-number">
                {stageCounts.Investigating}
              </span>

              <span className="pd-stat-label">
                Investigating
              </span>

            </div>

          </div>


          {/* ================= MATCHED ================== */}

          <div className="pd-stat pd-stat--matched">

            <div className="pd-stat-icon">
              ✓
            </div>

            <div>

              <span className="pd-stat-number">
                {stageCounts.Matched}
              </span>

              <span className="pd-stat-label">
                Matched
              </span>

            </div>

          </div>


          {/* ================= RESOLVED ================= */}

          <div className="pd-stat pd-stat--resolved">

            <div className="pd-stat-icon">
              ★
            </div>

            <div>

              <span className="pd-stat-number">
                {stageCounts.Resolved +
                  stageCounts.Closed}
              </span>

              <span className="pd-stat-label">
                Resolved
              </span>

            </div>

          </div>

        </section>


        {/* =================================================
            SEARCH RECORDS
            ================================================= */}

        <section
          id="search-records"
          className="pd-section-anchor"
        >

          <SearchPanel
            filters={filters}
            onChange={setFilters}
            onReset={() =>
              setFilters(EMPTY_FILTERS)
            }
          />

        </section>


        {/* =================================================
            TABS
            ================================================= */}

        <section className="pd-tabs-wrap">

          <div className="pd-tabs">

            {/* ASSIGNED CASES */}

            <button
              type="button"
              className={
                `pd-tab ${
                  activeTab === "assigned"
                    ? "active"
                    : ""
                }`
              }
              onClick={() =>
                setActiveTab("assigned")
              }
            >

              <span>
                Assigned Cases
              </span>

              <span className="tab-count">
                {filteredCases.length}
              </span>

            </button>


            {/* SIGHTING REPORTS */}

            <button
              type="button"
              className={
                `pd-tab ${
                  activeTab === "sightings"
                    ? "active"
                    : ""
                }`
              }
              onClick={() =>
                setActiveTab("sightings")
              }
            >

              <span>
                Sighting Reports
              </span>

            </button>

          </div>

        </section>


        {/* =================================================
            ASSIGNED CASES
            ================================================= */}

        {activeTab === "assigned" && (

          <div
            id="all-cases"
            className="dashboard-grid"
          >

            {/* ================= CASE LIST ================= */}

            <CaseList
              cases={filteredCases}
              selectedCaseId={
                selectedCaseId
              }
              onOpenCase={
                setSelectedCaseId
              }
            />


            {/* ================= RIGHT COLUMN ============= */}

            <div className="pd-right-column">

              {/* ================= CASE DETAILS ============ */}

              <CaseDetailPanel
                caseItem={selectedCase}
                onAdvanceStage={
                  advanceStage
                }
                onMarkFound={
                  markFound
                }
              />


              {/* ================= NOTIFICATIONS =========== */}

              <div id="notifications">

                <NotificationPanel
                  notifications={
                    mockNotifications
                  }
                />

              </div>

            </div>

          </div>

        )}


        {/* =================================================
            VERIFY / SIGHTING REPORTS
            ================================================= */}

        {activeTab === "sightings" && (

          <section
            id="verify-reports"
            className="sightings-section"
          >

            <div className="section-heading">

              <div>

                <span className="section-kicker">
                  PUBLIC REPORTS
                </span>

                <h2>
                  Sighting Reports
                </h2>

              </div>

            </div>


            <div className="empty-sightings">

              <div className="empty-icon">
                ⌕
              </div>

              <h3>
                No sighting reports
                to display
              </h3>

              <p>
                Submitted sighting reports
                will appear here for police
                review.
              </p>

            </div>

          </section>

        )}

      </main>


      {/* =================================================
          FOOTER
          ================================================= */}

      <footer className="police-footer">

        <div className="police-footer-content">

          <div className="footer-brand">

            <strong>
              Missing Child Rescue Network
            </strong>

            <span>
              Police Operations Portal
            </span>

          </div>


          <div className="footer-links">

            <span>
              © 2026 Missing Child Rescue Network
            </span>

            <span>
              Emergency: 1098
            </span>

          </div>

        </div>

      </footer>

    </div>
  );
}


export default PoliceDashboard;