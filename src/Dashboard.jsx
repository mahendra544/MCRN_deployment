import React, { useState, useEffect } from "react";
import StatCard from "./StatCard";
import CaseTable from "./CaseTable";

function Dashboard({ setActivePage }) {
  const [now, setNow] = useState(new Date());

  const [cases, setCases] = useState([]);
  const [policeCount, setPoliceCount] = useState(0);
  const [userCount, setUserCount] = useState(0);

  const [loading, setLoading] = useState(true);

  // ==============================
  // LOGGED-IN ADMIN
  // ==============================
  const adminData = JSON.parse(
    localStorage.getItem("adminData") || "{}"
  );

  const adminName = adminData.name || "Admin";

  // ==============================
  // LIVE DATE AND TIME
  // ==============================
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ==============================
  // FETCH DASHBOARD DATA
  // ==============================
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // --------------------------
        // CASES
        // --------------------------
        const casesResponse = await fetch(
          "http://localhost:5000/api/cases"
        );

        const casesData = await casesResponse.json();

        const caseData = Array.isArray(casesData)
          ? casesData
          : casesData.cases || [];

        setCases(caseData);

        // --------------------------
        // POLICE
        // --------------------------
        try {
          const policeResponse = await fetch(
            "http://localhost:5000/api/police"
          );

          const policeData = await policeResponse.json();

          const policeList = Array.isArray(policeData)
            ? policeData
            : policeData.officers ||
              policeData.police ||
              [];

          setPoliceCount(policeList.length);
        } catch (error) {
          console.error(
            "Error fetching police:",
            error
          );

          setPoliceCount(0);
        }

        // --------------------------
        // USERS
        // --------------------------
        try {
          const usersResponse = await fetch(
            "http://localhost:5000/api/users"
          );

          const usersData = await usersResponse.json();

          const usersList = Array.isArray(usersData)
            ? usersData
            : usersData.users || [];

          setUserCount(usersList.length);
        } catch (error) {
          console.error(
            "Error fetching users:",
            error
          );

          setUserCount(0);
        }

      } catch (error) {
        console.error(
          "Error fetching dashboard data:",
          error
        );

        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Refresh dashboard every 10 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // ==============================
  // DATE
  // ==============================
  const formattedDate = now.toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const formattedDay = now.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
    }
  );

  const formattedTime = now.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }
  );

  // ==============================
  // CASE COUNTS
  // ==============================
  const totalCases = cases.length;

  const pendingCases = cases.filter((item) => {
    const status = String(
      item.status || ""
    ).toLowerCase();

    return (
      status === "pending" ||
      status === "pending verification"
    );
  }).length;

  const activeCases = cases.filter((item) => {
    const status = String(
      item.status || ""
    ).toLowerCase();

    return (
      status === "assigned" ||
      status === "investigation"
    );
  }).length;

  const rescuedCases = cases.filter((item) => {
    const status = String(
      item.status || ""
    ).toLowerCase();

    return (
      status === "child located" ||
      status === "resolved" ||
      status === "closed"
    );
  }).length;

  const verifiedCases = cases.filter((item) => {
    const status = String(
      item.status || ""
    ).toLowerCase();

    return status === "verified";
  }).length;

  const assignedCases = cases.filter((item) => {
    const status = String(
      item.status || ""
    ).toLowerCase();

    return status === "assigned";
  }).length;

  const investigationCases = cases.filter(
    (item) => {
      const status = String(
        item.status || ""
      ).toLowerCase();

      return status === "investigation";
    }
  ).length;

  // ==============================
  // PRIORITY COUNTS
  // ==============================
  const highPriorityCases = cases.filter(
    (item) =>
      String(
        item.priority || ""
      ).toLowerCase() === "high"
  ).length;

  const mediumPriorityCases = cases.filter(
    (item) =>
      String(
        item.priority || ""
      ).toLowerCase() === "medium"
  ).length;

  // ==============================
  // RECENT CASES
  // ==============================
  const recentCases = cases
    .slice()
    .sort((a, b) => {
      return (
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
      );
    })
    .slice(0, 3)
    .map((item) => ({
      id:
        item.case_id ||
        `MCN-${item.id}`,

      child:
        item.child_name ||
        "Unknown Child",

      age:
        item.age || "-",

      location:
        item.location ||
        "Location not available",

      priority:
        item.priority ||
        "Medium",

      status:
        item.status ||
        "Pending",

      police:
        item.police_name ||
        item.assigned_officer ||
        "Not Assigned",
    }));

  // ==============================
  // SYSTEM ACTIVITIES
  // ==============================
  const systemActivities = cases
    .slice()
    .sort((a, b) => {
      return (
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
      );
    })
    .slice(0, 3)
    .map((item) => {
      const status = String(
        item.status || ""
      ).toLowerCase();

      if (status === "verified") {
        return {
          icon: "✓",
          color: "green",
          title: `Case ${
            item.case_id || ""
          } verified`,
          time: "Recently",
        };
      }

      if (status === "assigned") {
        return {
          icon: "👮",
          color: "blue",
          title: `Officer assigned to ${
            item.case_id || ""
          }`,
          time: "Recently",
        };
      }

      if (status === "investigation") {
        return {
          icon: "🔎",
          color: "orange",
          title: `Investigation started for ${
            item.case_id || ""
          }`,
          time: "Recently",
        };
      }

      if (
        status === "child located" ||
        status === "resolved" ||
        status === "closed"
      ) {
        return {
          icon: "✓",
          color: "green",
          title: `${
            item.case_id || "Case"
          } successfully resolved`,
          time: "Recently",
        };
      }

      return {
        icon: "📄",
        color: "orange",
        title: `New case ${
          item.case_id || ""
        } submitted`,
        time: "Recently",
      };
    });

  return (
    <div className="dashboard-page">

      {/* =========================
          TOP WELCOME SECTION
      ========================== */}

      <section className="welcome-section">

        <div className="welcome-content">

          <div className="status-line">
            <span className="live-dot"></span>
            SYSTEM OPERATIONAL
          </div>

          <span className="section-label">
            MISSING CHILD RESCUE NETWORK
          </span>

          <h1>
            Welcome back, {adminName}{" "}
            <span className="wave">👋</span>
          </h1>

          <p>
            Monitor missing child cases, verify
            reports and coordinate rescue operations
            from one centralized control center.
          </p>

          <div className="dashboard-mini-stats">

            <div className="mini-status">
              <span className="mini-icon">
                🛡️
              </span>

              <div>
                <strong>
                  Secure
                </strong>

                <small>
                  Admin Portal
                </small>
              </div>
            </div>

            <div className="mini-status">
              <span className="mini-icon">
                📡
              </span>

              <div>
                <strong>
                  Live
                </strong>

                <small>
                  Case Monitoring
                </small>
              </div>
            </div>

            <div className="mini-status">
              <span className="mini-icon">
                👮
              </span>

              <div>
                <strong>
                  {policeCount}
                </strong>

                <small>
                  Police Officers
                </small>
              </div>
            </div>

          </div>

        </div>

        {/* DATE / TIME CARD */}

        <div className="date-card">

          <div className="date-card-top">
            <span className="calendar-icon">
              📅
            </span>

            <span>
              OPERATIONS DATE
            </span>
          </div>

          <strong>
            {formattedDate}
          </strong>

          <div className="date-divider"></div>

          <div className="time-display">
            {formattedTime}
          </div>

          <small>
            {formattedDay}
          </small>

          <div className="live-time">
            <span></span>
            Live system time
          </div>

        </div>

      </section>

      {/* =========================
          STATISTICS
      ========================== */}

      <section className="stats-section">

        <div className="section-heading">

          <div>
            <span className="section-label">
              SYSTEM OVERVIEW
            </span>

            <h2>
              Rescue Operations
            </h2>
          </div>

          <span className="updated-label">
            ● Updated just now
          </span>

        </div>

        <div className="stats-grid">

          <StatCard
            title="Total Missing Cases"
            value={totalCases}
            icon="📁"
            type="blue"
          />

          <StatCard
            title="Pending Verification"
            value={pendingCases}
            icon="⏳"
            type="orange"
          />

          <StatCard
            title="Active Cases"
            value={activeCases}
            icon="🔎"
            type="purple"
          />

          <StatCard
            title="Rescued Children"
            value={rescuedCases}
            icon="✓"
            type="green"
          />

          <StatCard
            title="Registered Police"
            value={policeCount}
            icon="👮"
            type="red"
          />

          <StatCard
            title="Registered Users"
            value={userCount}
            icon="👤"
            type="cyan"
          />

        </div>

      </section>

      {/* =========================
          MAIN DASHBOARD
      ========================== */}

      <div className="dashboard-grid">

        {/* RECENT CASES */}

        <div className="dashboard-card recent-cases-card">

          <div className="card-header">

            <div>

              <div className="card-title-row">

                <span className="card-title-icon">
                  🚨
                </span>

                <h2>
                  Recent Cases
                </h2>

              </div>

              <p>
                Latest missing child reports
                requiring attention
              </p>

            </div>

            <button className="view-all-btn">
              View All
              <span>→</span>
            </button>

          </div>

          <div className="case-summary-bar">

            <div>
              <span className="summary-dot high"></span>

              <strong>
                {highPriorityCases}
              </strong>

              <small>
                High Priority
              </small>
            </div>

            <div>
              <span className="summary-dot medium"></span>

              <strong>
                {mediumPriorityCases}
              </strong>

              <small>
                Medium Priority
              </small>
            </div>

            <div>
              <span className="summary-dot active"></span>

              <strong>
                {activeCases}
              </strong>

              <small>
                Active Cases
              </small>
            </div>

          </div>

          {loading ? (
            <div
              style={{
                padding: "25px",
                textAlign: "center",
                color: "#777",
              }}
            >
              Loading cases...
            </div>
          ) : (
            <CaseTable
              cases={recentCases}
            />
          )}

        </div>

        {/* QUICK ACTIONS */}

        <div className="dashboard-card quick-actions-card">

          <div className="card-header">

            <div>

              <div className="card-title-row">

                <span className="card-title-icon">
                  ⚡
                </span>

                <h2>
                  Quick Actions
                </h2>

              </div>

              <p>
                Frequently used operations
              </p>

            </div>

          </div>

          <div className="quick-actions">

            {/* VERIFY CASES */}

            <button
              className="quick-action verify-action"
              onClick={() =>
                setActivePage("verification")
              }
            >

              <span className="action-icon">
                ✓
              </span>

              <div>
                <strong>
                  Verify Cases
                </strong>

                <small>
                  Review new reports
                </small>
              </div>

              <span className="action-arrow">
                →
              </span>

            </button>

            {/* ASSIGN POLICE */}

            <button
              className="quick-action police-action"
              onClick={() =>
                setActivePage("assignment")
              }
            >

              <span className="action-icon">
                👮
              </span>

              <div>
                <strong>
                  Assign Police
                </strong>

                <small>
                  Deploy officers to cases
                </small>
              </div>

              <span className="action-arrow">
                →
              </span>

            </button>

            {/* ANALYTICS */}

            <button
              className="quick-action analytics-action"
              onClick={() =>
                setActivePage("analytics")
              }
            >

              <span className="action-icon">
                📊
              </span>

              <div>
                <strong>
                  View Analytics
                </strong>

                <small>
                  Analyze rescue statistics
                </small>
              </div>

              <span className="action-arrow">
                →
              </span>

            </button>

            {/* NOTIFICATIONS */}

            <button
              className="quick-action notification-action"
              onClick={() =>
                setActivePage("notifications")
              }
            >

              <span className="action-icon">
                🔔
              </span>

              <div>
                <strong>
                  Notifications
                </strong>

                <small>
                  View important alerts
                </small>
              </div>

              <span className="action-arrow">
                →
              </span>

            </button>

          </div>

        </div>

      </div>

      {/* =========================
          LOWER OPERATION PANEL
      ========================== */}

      <div className="operations-grid">

        {/* CASE PIPELINE */}

        <div className="dashboard-card pipeline-card">

          <div className="card-header">

            <div>

              <div className="card-title-row">

                <span className="card-title-icon">
                  📋
                </span>

                <h2>
                  Case Pipeline
                </h2>

              </div>

              <p>
                Current status of reported cases
              </p>

            </div>

          </div>

          <div className="pipeline">

            <div className="pipeline-step">

              <div className="pipeline-number">
                {pendingCases}
              </div>

              <span>
                Pending
              </span>

            </div>

            <div className="pipeline-line"></div>

            <div className="pipeline-step">

              <div className="pipeline-number">
                {verifiedCases}
              </div>

              <span>
                Verified
              </span>

            </div>

            <div className="pipeline-line"></div>

            <div className="pipeline-step">

              <div className="pipeline-number">
                {assignedCases}
              </div>

              <span>
                Assigned
              </span>

            </div>

            <div className="pipeline-line"></div>

            <div className="pipeline-step">

              <div className="pipeline-number">
                {investigationCases}
              </div>

              <span>
                Investigation
              </span>

            </div>

            <div className="pipeline-line"></div>

            <div className="pipeline-step success-step">

              <div className="pipeline-number">
                {rescuedCases}
              </div>

              <span>
                Rescued
              </span>

            </div>

          </div>

        </div>

        {/* SYSTEM ACTIVITY */}

        <div className="dashboard-card activity-card">

          <div className="card-header">

            <div>

              <div className="card-title-row">

                <span className="card-title-icon">
                  📡
                </span>

                <h2>
                  System Activity
                </h2>

              </div>

              <p>
                Latest platform activity
              </p>

            </div>

          </div>

          <div className="activity-list">

            {systemActivities.length > 0 ? (

              systemActivities.map(
                (activity, index) => (

                  <div
                    className="activity-item"
                    key={index}
                  >

                    <span
                      className={`activity-icon ${activity.color}`}
                    >
                      {activity.icon}
                    </span>

                    <div>

                      <strong>
                        {activity.title}
                      </strong>

                      <small>
                        {activity.time}
                      </small>

                    </div>

                  </div>

                )
              )

            ) : (

              <div
                style={{
                  padding: "20px 0",
                  color: "#777",
                  textAlign: "center",
                }}
              >
                No recent activity
              </div>

            )}

          </div>

        </div>

      </div>

      {/* =========================
          FONT SIZE
      ========================== */}

      <style>{`

        .welcome-content h1 {
          font-size: 34px;
        }

        .welcome-content p {
          font-size: 16px;
          line-height: 1.6;
        }

        .section-heading h2 {
          font-size: 25px;
        }

        .section-label {
          font-size: 13px;
        }

        .updated-label {
          font-size: 14px;
        }

        .card-title-row h2 {
          font-size: 20px;
        }

        .card-header p {
          font-size: 14px;
        }

        .mini-status strong {
          font-size: 16px;
        }

        .mini-status small {
          font-size: 13px;
        }

        .date-card strong {
          font-size: 22px;
        }

        .time-display {
          font-size: 25px;
        }

        .date-card small {
          font-size: 13px;
        }

        .case-summary-bar strong {
          font-size: 20px;
        }

        .case-summary-bar small {
          font-size: 13px;
        }

        .pipeline-number {
          font-size: 20px;
        }

        .pipeline-step span {
          font-size: 13px;
        }

        .activity-item strong {
          font-size: 14px;
        }

        .activity-item small {
          font-size: 12px;
        }

        /* =========================
           QUICK ACTION FONT SIZE
        ========================== */

        .quick-action strong {
          font-size: 17px;
        }

        .quick-action small {
          font-size: 14px;
        }

        .quick-action .action-icon {
          font-size: 22px;
        }

        .quick-action .action-arrow {
          font-size: 24px;
          font-weight: 700;
        }

        .quick-action {
          cursor: pointer;
        }

      `}</style>

    </div>
  );
}

export default Dashboard;