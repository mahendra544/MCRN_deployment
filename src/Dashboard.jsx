import React, { useState, useEffect } from "react";
import StatCard from "./StatCard";
import CaseTable from "./CaseTable";

function Dashboard() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const formattedDay = now.toLocaleDateString("en-US", {
    weekday: "long"
  });

  const formattedTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  const cases = [
    {
      id: "MCN-001",
      child: "Rahul Kumar",
      age: 10,
      location: "MVP Colony",
      priority: "High",
      status: "Investigation",
      police: "Ravi Kumar"
    },
    {
      id: "MCN-002",
      child: "Anjali Reddy",
      age: 8,
      location: "Guntur",
      priority: "Medium",
      status: "Assigned",
      police: "Sita Devi"
    },
    {
      id: "MCN-003",
      child: "Arjun Sai",
      age: 12,
      location: "Vijayawada",
      priority: "High",
      status: "Verified",
      police: "Not Assigned"
    }
  ];

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
            Welcome back, Admin <span className="wave">👋</span>
          </h1>

          <p>
            Monitor missing child cases, verify reports and coordinate
            rescue operations from one centralized control center.
          </p>

          <div className="dashboard-mini-stats">

            <div className="mini-status">
              <span className="mini-icon">🛡️</span>
              <div>
                <strong>Secure</strong>
                <small>Admin Portal</small>
              </div>
            </div>

            <div className="mini-status">
              <span className="mini-icon">📡</span>
              <div>
                <strong>Live</strong>
                <small>Case Monitoring</small>
              </div>
            </div>

            <div className="mini-status">
              <span className="mini-icon">👮</span>
              <div>
                <strong>25</strong>
                <small>Police Officers</small>
              </div>
            </div>

          </div>

        </div>

        {/* DATE / TIME CARD */}

        <div className="date-card">

          <div className="date-card-top">
            <span className="calendar-icon">📅</span>
            <span>OPERATIONS DATE</span>
          </div>

          <strong>{formattedDate}</strong>

          <div className="date-divider"></div>

          <div className="time-display">
            {formattedTime}
          </div>

          <small>{formattedDay}</small>

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
            <span className="section-label">SYSTEM OVERVIEW</span>
            <h2>Rescue Operations</h2>
          </div>

          <span className="updated-label">
            ● Updated just now
          </span>

        </div>

        <div className="stats-grid">

          <StatCard
            title="Total Missing Cases"
            value={120}
            icon="📁"
            type="blue"
          />

          <StatCard
            title="Pending Verification"
            value={13}
            icon="⏳"
            type="orange"
          />

          <StatCard
            title="Active Cases"
            value={45}
            icon="🔎"
            type="purple"
          />

          <StatCard
            title="Rescued Children"
            value={62}
            icon="✓"
            type="green"
          />

          <StatCard
            title="Registered Police"
            value={25}
            icon="👮"
            type="red"
          />

          <StatCard
            title="Registered Users"
            value={850}
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
                <span className="card-title-icon">🚨</span>
                <h2>Recent Cases</h2>
              </div>

              <p>
                Latest missing child reports requiring attention
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
              <strong>2</strong>
              <small>High Priority</small>
            </div>

            <div>
              <span className="summary-dot medium"></span>
              <strong>1</strong>
              <small>Medium Priority</small>
            </div>

            <div>
              <span className="summary-dot active"></span>
              <strong>3</strong>
              <small>Active Cases</small>
            </div>

          </div>

          <CaseTable cases={cases} />

        </div>


        {/* QUICK ACTIONS */}

        <div className="dashboard-card quick-actions-card">

          <div className="card-header">

            <div>
              <div className="card-title-row">
                <span className="card-title-icon">⚡</span>
                <h2>Quick Actions</h2>
              </div>

              <p>
                Frequently used operations
              </p>
            </div>

          </div>


          <div className="quick-actions">

            <button className="quick-action verify-action">

              <span className="action-icon">✓</span>

              <div>
                <strong>Verify Cases</strong>
                <small>Review new reports</small>
              </div>

              <span className="action-arrow">→</span>

            </button>


            <button className="quick-action police-action">

              <span className="action-icon">👮</span>

              <div>
                <strong>Assign Police</strong>
                <small>Deploy officers to cases</small>
              </div>

              <span className="action-arrow">→</span>

            </button>


            <button className="quick-action analytics-action">

              <span className="action-icon">📊</span>

              <div>
                <strong>View Analytics</strong>
                <small>Analyze rescue statistics</small>
              </div>

              <span className="action-arrow">→</span>

            </button>


            <button className="quick-action notification-action">

              <span className="action-icon">🔔</span>

              <div>
                <strong>Notifications</strong>
                <small>View important alerts</small>
              </div>

              <span className="action-arrow">→</span>

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
                <span className="card-title-icon">📋</span>
                <h2>Case Pipeline</h2>
              </div>

              <p>
                Current status of reported cases
              </p>
            </div>

          </div>


          <div className="pipeline">

            <div className="pipeline-step">
              <div className="pipeline-number">13</div>
              <span>Pending</span>
            </div>

            <div className="pipeline-line"></div>

            <div className="pipeline-step">
              <div className="pipeline-number">18</div>
              <span>Verified</span>
            </div>

            <div className="pipeline-line"></div>

            <div className="pipeline-step">
              <div className="pipeline-number">27</div>
              <span>Assigned</span>
            </div>

            <div className="pipeline-line"></div>

            <div className="pipeline-step">
              <div className="pipeline-number">45</div>
              <span>Investigation</span>
            </div>

            <div className="pipeline-line"></div>

            <div className="pipeline-step success-step">
              <div className="pipeline-number">62</div>
              <span>Rescued</span>
            </div>

          </div>

        </div>


        {/* SYSTEM ACTIVITY */}

        <div className="dashboard-card activity-card">

          <div className="card-header">

            <div>
              <div className="card-title-row">
                <span className="card-title-icon">📡</span>
                <h2>System Activity</h2>
              </div>

              <p>
                Latest platform activity
              </p>
            </div>

          </div>


          <div className="activity-list">

            <div className="activity-item">

              <span className="activity-icon green">✓</span>

              <div>
                <strong>Case MCN-003 verified</strong>
                <small>8 minutes ago</small>
              </div>

            </div>


            <div className="activity-item">

              <span className="activity-icon blue">👮</span>

              <div>
                <strong>Officer assigned to MCN-002</strong>
                <small>21 minutes ago</small>
              </div>

            </div>


            <div className="activity-item">

              <span className="activity-icon orange">📄</span>

              <div>
                <strong>New missing case submitted</strong>
                <small>34 minutes ago</small>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;