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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("mcrn_token") || ""}` });

function PoliceDashboard() {
  const location = useLocation();

  // =====================================================
  // CASES
  // =====================================================

  const [cases, setCases] = useState([]);

  const [casesLoading, setCasesLoading] =
    useState(false);

  const [casesError, setCasesError] =
    useState("");

  const [updatingCaseId, setUpdatingCaseId] =
    useState(null);

  const [filters, setFilters] =
    useState(EMPTY_FILTERS);

  const [selectedCaseId, setSelectedCaseId] =
    useState(null);

  const [activeTab, setActiveTab] =
    useState("assigned");

  // =====================================================
  // SIGHTING REPORTS
  // =====================================================

  const [sightings, setSightings] =
    useState([]);

  const [sightingsLoading, setSightingsLoading] =
    useState(false);

  const [sightingsError, setSightingsError] =
    useState("");

  const [updatingSightingId, setUpdatingSightingId] =
    useState(null);

  const [pendingSightingCount, setPendingSightingCount] =
    useState(0);

  const [notifications, setNotifications] = useState([]);

  const [officer, setOfficer] = useState({
    username: "Police Officer",
    name: "Police Officer",
    officialId: "",
    department: "Police Department",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mcrn_session");
      if (saved) {
        const session = JSON.parse(saved);
        setOfficer({
          username: session.username || session.name || "Police Officer",
          name: session.name || session.username || "Police Officer",
          officialId: session.officialId || "",
          department: session.department || "Police Department",
        });
      }
    } catch (error) {
      console.error("Unable to load police session:", error);
    }
  }, []);

  async function fetchNotifications() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications`, { headers: authHeaders() });
      const data = await response.json();
      if (response.ok) setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
    } catch (error) { console.error("Error fetching notifications:", error); }
  }

  // =====================================================
  // MATCH SIGHTING TO CASE
  // =====================================================

  // Which verified sighting currently has the
  // "Match to Case" panel open.
  const [matchingSightingId, setMatchingSightingId] =
    useState(null);

  // Selected missing-child case from dropdown.
  const [matchCaseId, setMatchCaseId] =
    useState("");

  // Which sighting is currently being submitted
  // to the backend for matching.
  const [submittingMatchId, setSubmittingMatchId] =
    useState(null);

  const [matchError, setMatchError] =
    useState("");

  // =====================================================
  // FETCH REAL CASES
  // =====================================================

  async function fetchCases() {
    try {
      setCasesLoading(true);
      setCasesError("");

      const response = await fetch(
        `${API_BASE_URL}/api/police/cases`,
        { headers: authHeaders() }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch cases."
        );
      }

      const realCases = Array.isArray(data)
        ? data
        : [];

      setCases(realCases);

      setSelectedCaseId((currentSelectedId) => {
        const stillExists = realCases.some(
          (item) =>
            String(item.case_id) ===
            String(currentSelectedId)
        );

        if (stillExists) {
          return currentSelectedId;
        }

        return realCases[0]?.case_id ?? null;
      });
    } catch (error) {
      console.error(
        "Error fetching cases:",
        error
      );

      setCasesError(
        error.message ||
          "Failed to load cases."
      );

      setCases([]);
      setSelectedCaseId(null);
    } finally {
      setCasesLoading(false);
    }
  }

  // =====================================================
  // FETCH SIGHTING REPORTS
  // =====================================================

  async function fetchSightings() {
    try {
      setSightingsLoading(true);
      setSightingsError("");

      const response = await fetch(
        `${API_BASE_URL}/api/police/sightings`,
        { headers: authHeaders() }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch sighting reports."
        );
      }

      setSightings(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Error fetching sighting reports:",
        error
      );

      setSightingsError(
        error.message ||
          "Failed to load sighting reports."
      );

      setSightings([]);
    } finally {
      setSightingsLoading(false);
    }
  }

  // =====================================================
  // FETCH PENDING SIGHTING COUNT
  // =====================================================

  async function fetchPendingSightingCount() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/police/sightings/pending/count`,
        { headers: authHeaders() }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch pending sighting count."
        );
      }

      setPendingSightingCount(
        Number(data.count || 0)
      );
    } catch (error) {
      console.error(
        "Error fetching pending sighting count:",
        error
      );
    }
  }

  // =====================================================
  // UPDATE SIGHTING STATUS
  // =====================================================

  async function updateSightingStatus(
    sightingId,
    newStatus
  ) {
    try {
      setUpdatingSightingId(sightingId);

      const response = await fetch(
        `${API_BASE_URL}/api/police/sightings/${encodeURIComponent(
          sightingId
        )}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update sighting status."
        );
      }

      setSightings((current) =>
        current.map((sighting) =>
          Number(sighting.id) ===
          Number(sightingId)
            ? {
                ...sighting,
                ...(data.sighting || {}),
                status:
                  data.sighting?.status ||
                  newStatus,
              }
            : sighting
        )
      );

      await fetchPendingSightingCount();
    } catch (error) {
      console.error(
        "Error updating sighting status:",
        error
      );

      alert(
        error.message ||
          "Failed to update sighting status."
      );
    } finally {
      setUpdatingSightingId(null);
    }
  }

  // =====================================================
  // MATCH VERIFIED SIGHTING TO CASE
  // =====================================================

  async function matchSightingToCase(
    sightingId
  ) {
    try {
      if (!matchCaseId) {
        setMatchError(
          "Please select a missing-child case."
        );
        return;
      }

      setSubmittingMatchId(sightingId);
      setMatchError("");

      const response = await fetch(
        `${API_BASE_URL}/api/police/sightings/${encodeURIComponent(
          sightingId
        )}/match`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({
            case_id: Number(matchCaseId),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to match sighting to case."
        );
      }

      // Update the sighting locally.
      setSightings((current) =>
        current.map((sighting) =>
          Number(sighting.id) ===
          Number(sightingId)
            ? {
                ...sighting,
                ...(data.sighting || {}),
                case_id:
                  data.sighting?.case_id ??
                  Number(matchCaseId),
                status:
                  data.sighting?.status ||
                  "Verified",
              }
            : sighting
        )
      );

      // Update the selected case locally if
      // the backend returned an updated case.
      if (data.case) {
        setCases((current) =>
          current.map((item) =>
            Number(item.id) ===
            Number(data.case.id)
              ? {
                  ...item,
                  ...data.case,
                }
              : item
          )
        );
      } else {
        // Refresh cases from database as a fallback.
        await fetchCases();
      }

      // Close the matching panel.
      setMatchingSightingId(null);
      setMatchCaseId("");
      setMatchError("");

      // Refresh sightings so the database state
      // is reflected immediately.
      await fetchSightings();
    } catch (error) {
      console.error(
        "Error matching sighting to case:",
        error
      );

      setMatchError(
        error.message ||
          "Failed to match sighting to case."
      );
    } finally {
      setSubmittingMatchId(null);
    }
  }

  // =====================================================
  // UPDATE CASE STAGE IN DATABASE
  // =====================================================

  async function advanceStage(
    caseId,
    newStage
  ) {
    try {
      setUpdatingCaseId(caseId);

      const response = await fetch(
        `${API_BASE_URL}/api/police/cases/${encodeURIComponent(
          caseId
        )}/stage`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({
            case_stage: newStage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update case stage."
        );
      }

      if (data.case) {
        setCases((current) =>
          current.map((item) =>
            String(item.case_id) ===
            String(data.case.case_id)
              ? {
                  ...item,
                  ...data.case,
                }
              : item
          )
        );
      } else {
        await fetchCases();
      }
    } catch (error) {
      console.error(
        "Error updating case stage:",
        error
      );

      alert(
        error.message ||
          "Failed to update case stage."
      );
    } finally {
      setUpdatingCaseId(null);
    }
  }

  // =====================================================
  // MARK CASE AS FOUND
  // =====================================================

  async function markFound(caseId) {
    try {
      setUpdatingCaseId(caseId);

      const response = await fetch(
        `${API_BASE_URL}/api/police/cases/${encodeURIComponent(
          caseId
        )}/found`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeaders() },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to mark case as found."
        );
      }

      if (data.case) {
        setCases((current) =>
          current.map((item) =>
            String(item.case_id) ===
            String(data.case.case_id)
              ? {
                  ...item,
                  ...data.case,
                }
              : item
          )
        );
      } else {
        await fetchCases();
      }
    } catch (error) {
      console.error(
        "Error marking case as found:",
        error
      );

      alert(
        error.message ||
          "Failed to mark case as found."
      );
    } finally {
      setUpdatingCaseId(null);
    }
  }

  // =====================================================
  // DELETE CASE FROM THE ENTIRE NETWORK
  // =====================================================

  async function deleteCase(caseId) {
    const selected = cases.find(
      (item) => String(item.case_id) === String(caseId)
    );

    const childName = selected?.child_name || "this case";
    const confirmed = window.confirm(
      `Delete ${childName} (${caseId})?\n\nThis will remove the case from the police dashboard and the user dashboard. This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setUpdatingCaseId(caseId);

      const response = await fetch(
        `${API_BASE_URL}/api/police/cases/${encodeURIComponent(caseId)}`,
        { method: "DELETE", headers: authHeaders() }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete case.");
      }

      setCases((current) =>
        current.filter(
          (item) => String(item.case_id) !== String(caseId)
        )
      );

      setSelectedCaseId((current) =>
        String(current) === String(caseId) ? null : current
      );

      alert("Case deleted successfully from the police and user dashboards.");
    } catch (error) {
      console.error("Error deleting case:", error);
      alert(error.message || "Failed to delete case.");
    } finally {
      setUpdatingCaseId(null);
    }
  }

  // =====================================================
  // INITIAL DATA
  // =====================================================

  useEffect(() => {
    fetchCases();
    fetchSightings();
    fetchPendingSightingCount();
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 15000);
    return () => clearInterval(timer);
  }, []);

  // =====================================================
  // FILTER CASES
  // =====================================================

  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      const name =
        item.child_name?.toLowerCase() || "";

      const locationName =
        item.last_seen_location?.toLowerCase() ||
        "";

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

  // =====================================================
  // SELECTED CASE
  // =====================================================

  const selectedCase =
    cases.find(
      (item) =>
        String(item.case_id) ===
        String(selectedCaseId)
    ) || null;

  // =====================================================
  // CASE COUNTS
  // =====================================================

  const stageCounts = useMemo(() => {
    return cases.reduce(
      (counts, item) => {
        const stage =
          item.case_stage || "Open";

        counts[stage] =
          (counts[stage] || 0) + 1;

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

  // =====================================================
  // DASHBOARD NAVIGATION
  // =====================================================

  useEffect(() => {
    const hash =
      location.hash.replace("#", "");

    if (hash === "verify-reports") {
      setActiveTab("sightings");
    } else {
      setActiveTab("assigned");
    }

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

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(value) {
    if (!value) {
      return "Not provided";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  // =====================================================
  // FORMAT TIME
  // =====================================================

  function formatTime(value) {
    if (!value) {
      return "Not provided";
    }

    const parts =
      String(value).split(":");

    if (parts.length < 2) {
      return String(value);
    }

    const hours =
      Number(parts[0]);

    const minutes =
      parts[1];

    if (Number.isNaN(hours)) {
      return String(value);
    }

    const suffix =
      hours >= 12 ? "PM" : "AM";

    const displayHour =
      hours % 12 || 12;

    return `${displayHour}:${minutes} ${suffix}`;
  }

  // =====================================================
  // SIGHTING STATUS CLASS
  // =====================================================

  function getStatusClass(status) {
    const normalizedStatus =
      String(status || "")
        .toLowerCase();

    if (normalizedStatus === "verified") {
      return "sighting-status verified";
    }

    if (normalizedStatus === "rejected") {
      return "sighting-status rejected";
    }

    return "sighting-status pending";
  }

  // =====================================================
  // RENDER
  // =====================================================

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
                {officer.username}
              </strong>

              <span>
                {officer.officialId || "Official ID not available"}
                {" · "}
                {officer.department}
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

          {/* OPEN CASES */}

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

          {/* INVESTIGATING */}

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

          {/* MATCHED */}

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

          {/* RESOLVED */}

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
              onClick={() => {
                setActiveTab("assigned");
                fetchCases();
              }}
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
              onClick={() => {
                setActiveTab("sightings");
                fetchSightings();
                fetchPendingSightingCount();
              }}
            >
              <span>
                Sighting Reports
              </span>

              <span className="tab-count">
                {pendingSightingCount}
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

            {/* CASE LOADING */}

            {casesLoading && (
              <div className="empty-sightings">
                <div className="empty-icon">
                  ⌛
                </div>

                <h3>
                  Loading cases...
                </h3>

                <p>
                  Retrieving cases from the
                  police database.
                </p>
              </div>
            )}

            {/* CASE ERROR */}

            {!casesLoading &&
              casesError && (
                <div className="empty-sightings">
                  <div className="empty-icon">
                    !
                  </div>

                  <h3>
                    Unable to load cases
                  </h3>

                  <p>
                    {casesError}
                  </p>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={fetchCases}
                  >
                    Try Again
                  </button>
                </div>
              )}

            {/* NO CASES */}

            {!casesLoading &&
              !casesError &&
              cases.length === 0 && (
                <div className="empty-sightings">
                  <div className="empty-icon">
                    ⌕
                  </div>

                  <h3>
                    No cases found
                  </h3>

                  <p>
                    There are currently no
                    missing-child cases in
                    the database.
                  </p>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={fetchCases}
                  >
                    Refresh Cases
                  </button>
                </div>
              )}

            {/* REAL CASE DATA */}

            {!casesLoading &&
              !casesError &&
              cases.length > 0 && (
                <>
                  {/* CASE LIST */}

                  <CaseList
                    cases={filteredCases}
                    selectedCaseId={
                      selectedCaseId
                    }
                    onOpenCase={
                      setSelectedCaseId
                    }
                  />

                  {/* RIGHT COLUMN */}

                  <div className="pd-right-column">

                    {/* CASE DETAILS */}

                    <CaseDetailPanel
                      caseItem={selectedCase}
                      onAdvanceStage={
                        advanceStage
                      }
                      onMarkFound={
                        markFound
                      }
                      onDeleteCase={
                        deleteCase
                      }
                    />

                    {/* CASE UPDATE INDICATOR */}

                    {updatingCaseId !== null && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          background:
                            "rgba(37, 99, 235, 0.08)",
                          color: "#1d4ed8",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        Saving case changes...
                      </div>
                    )}

                    {/* NOTIFICATIONS */}

                    <div id="notifications">
                      <NotificationPanel
                        notifications={notifications}
                      />
                    </div>

                  </div>
                </>
              )}

          </div>
        )}

        {/* =================================================
            SIGHTING REPORTS
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

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  fetchSightings();
                  fetchPendingSightingCount();
                  fetchCases();
                }}
                disabled={sightingsLoading}
              >
                {sightingsLoading
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>

            {/* LOADING */}

            {sightingsLoading && (
              <div className="empty-sightings">
                <div className="empty-icon">
                  ⌛
                </div>

                <h3>
                  Loading sighting reports...
                </h3>

                <p>
                  Please wait while reports are
                  retrieved from the server.
                </p>
              </div>
            )}

            {/* ERROR */}

            {!sightingsLoading &&
              sightingsError && (
                <div className="empty-sightings">
                  <div className="empty-icon">
                    !
                  </div>

                  <h3>
                    Unable to load reports
                  </h3>

                  <p>
                    {sightingsError}
                  </p>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      fetchSightings();
                      fetchPendingSightingCount();
                      fetchCases();
                    }}
                  >
                    Try again
                  </button>
                </div>
              )}

            {/* NO REPORTS */}

            {!sightingsLoading &&
              !sightingsError &&
              sightings.length === 0 && (
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
              )}

            {/* REPORT LIST */}

            {!sightingsLoading &&
              !sightingsError &&
              sightings.length > 0 && (
                <div className="sightings-list">

                  {sightings.map((sighting) => {
                    const imageUrl =
                      sighting.photo_url
                        ? sighting.photo_url.startsWith(
                            "http"
                          )
                          ? sighting.photo_url
                          : `${API_BASE_URL}${sighting.photo_url}`
                        : null;

                    const isUpdating =
                      Number(
                        updatingSightingId
                      ) === Number(
                        sighting.id
                      );

                    const normalizedStatus =
                      String(
                        sighting.status || ""
                      ).toLowerCase();

                    const isPending =
                      normalizedStatus ===
                      "pending";

                    const isVerified =
                      normalizedStatus ===
                      "verified";

                    const isRejected =
                      normalizedStatus ===
                      "rejected";

                    const isMatchPanelOpen =
                      Number(
                        matchingSightingId
                      ) === Number(
                        sighting.id
                      );

                    const isSubmittingMatch =
                      Number(
                        submittingMatchId
                      ) === Number(
                        sighting.id
                      );

                    const matchedCase =
                      sighting.case_id
                        ? cases.find(
                            (item) =>
                              Number(
                                item.id
                              ) ===
                              Number(
                                sighting.case_id
                              )
                          )
                        : null;

                    return (
                      <article
                        className="sighting-card"
                        key={sighting.id}
                      >

                        {/* PHOTO */}

                        <div className="sighting-photo-wrap">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt="Submitted sighting"
                              className="sighting-photo"
                            />
                          ) : (
                            <div className="sighting-photo-placeholder">
                              No photo
                            </div>
                          )}
                        </div>

                        {/* CONTENT */}

                        <div className="sighting-content">

                          <div className="sighting-card-header">

                            <div>
                              <span className="section-kicker">
                                SIGHTING REPORT
                              </span>

                              <h3>
                                Report #
                                {sighting.id}
                              </h3>
                            </div>

                            <span
                              className={getStatusClass(
                                sighting.status
                              )}
                            >
                              {sighting.status ||
                                "Pending"}
                            </span>

                          </div>

                          {/* INFORMATION */}

                          <div className="sighting-info-grid">

                            <div>
                              <span>
                                Location
                              </span>

                              <strong>
                                {sighting.location ||
                                  "Not provided"}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Approx. age
                              </span>

                              <strong>
                                {sighting.approximate_age ||
                                  "Not provided"}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Gender
                              </span>

                              <strong>
                                {sighting.gender ||
                                  "Not provided"}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Date
                              </span>

                              <strong>
                                {formatDate(
                                  sighting.sighting_date
                                )}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Time
                              </span>

                              <strong>
                                {formatTime(
                                  sighting.sighting_time
                                )}
                              </strong>
                            </div>

                          </div>

                          {/* DESCRIPTION */}

                          <div className="sighting-description">
                            <span>
                              Description
                            </span>

                            <p>
                              {sighting.description ||
                                "No description provided."}
                            </p>
                          </div>

                          {/* REPORTER */}

                          {(sighting.reporter_name ||
                            sighting.contact_number) && (
                            <div className="sighting-reporter">
                              <span>
                                Reporter
                              </span>

                              <strong>
                                {sighting.reporter_name ||
                                  "Anonymous"}

                                {sighting.contact_number &&
                                  ` · ${sighting.contact_number}`}
                              </strong>
                            </div>
                          )}

                          {/* =================================================
                              PENDING ACTIONS
                              ================================================= */}

                          {isPending && (
                            <div className="sighting-actions">

                              <button
                                type="button"
                                className="btn btn-primary"
                                disabled={isUpdating}
                                onClick={() =>
                                  updateSightingStatus(
                                    sighting.id,
                                    "Verified"
                                  )
                                }
                              >
                                {isUpdating
                                  ? "Updating..."
                                  : "Verify"}
                              </button>

                              <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={isUpdating}
                                onClick={() =>
                                  updateSightingStatus(
                                    sighting.id,
                                    "Rejected"
                                  )
                                }
                              >
                                {isUpdating
                                  ? "Updating..."
                                  : "Reject"}
                              </button>

                            </div>
                          )}

                          {/* =================================================
                              VERIFIED ACTIONS
                              ================================================= */}

                          {isVerified && (
                            <div
                              className="sighting-actions"
                              style={{
                                marginTop: "16px",
                                flexDirection:
                                  "column",
                                alignItems:
                                  "stretch",
                              }}
                            >

                              {/* ALREADY MATCHED */}

                              {sighting.case_id ? (
                                <div
                                  style={{
                                    padding:
                                      "14px 16px",
                                    borderRadius:
                                      "10px",
                                    background:
                                      "rgba(22, 163, 74, 0.10)",
                                    border:
                                      "1px solid rgba(22, 163, 74, 0.25)",
                                    color:
                                      "#166534",
                                    fontWeight:
                                      "600",
                                  }}
                                >
                                  ✓ Matched to case{" "}
                                  {matchedCase
                                    ?.case_id ||
                                    sighting.case_id}

                                  {matchedCase
                                    ?.child_name && (
                                    <span
                                      style={{
                                        fontWeight:
                                          "500",
                                        marginLeft:
                                          "6px",
                                      }}
                                    >
                                      —{" "}
                                      {
                                        matchedCase.child_name
                                      }
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <>
                                  {/* MATCH BUTTON */}

                                  {!isMatchPanelOpen && (
                                    <button
                                      type="button"
                                      className="btn btn-primary"
                                      onClick={() => {
                                        setMatchingSightingId(
                                          sighting.id
                                        );
                                        setMatchCaseId(
                                          ""
                                        );
                                        setMatchError(
                                          ""
                                        );
                                      }}
                                    >
                                      Match to Case
                                    </button>
                                  )}

                                  {/* MATCH PANEL */}

                                  {isMatchPanelOpen && (
                                    <div
                                      style={{
                                        marginTop:
                                          "4px",
                                        padding:
                                          "18px",
                                        border:
                                          "2px solid #1d4ed8",
                                        borderRadius:
                                          "12px",
                                        background:
                                          "#ffffff",
                                      }}
                                    >

                                      <strong
                                        style={{
                                          display:
                                            "block",
                                          fontSize:
                                            "18px",
                                          marginBottom:
                                            "8px",
                                        }}
                                      >
                                        Match Verified
                                        Sighting
                                      </strong>

                                      <p
                                        style={{
                                          marginTop:
                                            "0",
                                          marginBottom:
                                            "14px",
                                        }}
                                      >
                                        Select the
                                        missing-child
                                        case associated
                                        with this
                                        report.
                                      </p>

                                      {/* CASE DROPDOWN */}

                                      <label
                                        htmlFor={`match-case-${sighting.id}`}
                                        style={{
                                          display:
                                            "block",
                                          fontWeight:
                                            "600",
                                          marginBottom:
                                            "8px",
                                        }}
                                      >
                                        Missing-Child
                                        Case
                                      </label>

                                      <select
                                        id={`match-case-${sighting.id}`}
                                        value={
                                          matchCaseId
                                        }
                                        onChange={(
                                          event
                                        ) => {
                                          setMatchCaseId(
                                            event.target
                                              .value
                                          );
                                          setMatchError(
                                            ""
                                          );
                                        }}
                                        disabled={
                                          isSubmittingMatch
                                        }
                                        style={{
                                          display:
                                            "block",
                                          width:
                                            "100%",
                                          minHeight:
                                            "46px",
                                          padding:
                                            "10px 12px",
                                          fontSize:
                                            "16px",
                                          background:
                                            "#ffffff",
                                          color:
                                            "#111827",
                                          border:
                                            "1px solid #9ca3af",
                                          borderRadius:
                                            "8px",
                                          cursor:
                                            "pointer",
                                          marginBottom:
                                            "12px",
                                        }}
                                      >
                                        <option value="">
                                          Select a case
                                        </option>

                                        {cases.map(
                                          (item) => (
                                            <option
                                              key={
                                                item.id
                                              }
                                              value={
                                                item.id
                                              }
                                            >
                                              {item.case_id}
                                              {" — "}
                                              {
                                                item.child_name
                                              }
                                              {" — "}
                                              {
                                                item.last_seen_location
                                              }
                                            </option>
                                          )
                                        )}
                                      </select>

                                      {/* NO CASES */}

                                      {cases.length ===
                                        0 && (
                                        <p
                                          style={{
                                            color:
                                              "#b91c1c",
                                            marginBottom:
                                              "12px",
                                          }}
                                        >
                                          No
                                          missing-child
                                          cases are
                                          currently
                                          available.
                                        </p>
                                      )}

                                      {/* MATCH ERROR */}

                                      {matchError && (
                                        <p
                                          style={{
                                            color:
                                              "#b91c1c",
                                            marginBottom:
                                              "12px",
                                            fontWeight:
                                              "500",
                                          }}
                                        >
                                          {matchError}
                                        </p>
                                      )}

                                      {/* MATCH BUTTONS */}

                                      <div
                                        style={{
                                          display:
                                            "flex",
                                          gap: "10px",
                                          flexWrap:
                                            "wrap",
                                        }}
                                      >

                                        <button
                                          type="button"
                                          className="btn btn-primary"
                                          disabled={
                                            !matchCaseId ||
                                            isSubmittingMatch
                                          }
                                          onClick={() =>
                                            matchSightingToCase(
                                              sighting.id
                                            )
                                          }
                                        >
                                          {isSubmittingMatch
                                            ? "Matching..."
                                            : "Confirm Match"}
                                        </button>

                                        <button
                                          type="button"
                                          className="btn btn-secondary"
                                          disabled={
                                            isSubmittingMatch
                                          }
                                          onClick={() => {
                                            setMatchingSightingId(
                                              null
                                            );
                                            setMatchCaseId(
                                              ""
                                            );
                                            setMatchError(
                                              ""
                                            );
                                          }}
                                        >
                                          Cancel
                                        </button>

                                      </div>
                                    </div>
                                  )}

                                </>
                              )}

                            </div>
                          )}

                          {/* =================================================
                              REJECTED
                              ================================================= */}

                          {isRejected && (
                            <div
                              style={{
                                marginTop: "16px",
                                padding:
                                  "12px 14px",
                                borderRadius:
                                  "10px",
                                background:
                                  "rgba(185, 28, 28, 0.08)",
                                color:
                                  "#991b1b",
                                fontWeight:
                                  "600",
                              }}
                            >
                              This sighting report
                              was rejected.
                            </div>
                          )}

                        </div>
                      </article>
                    );
                  })}

                </div>
              )}

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