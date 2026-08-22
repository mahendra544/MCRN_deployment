import React from "react";
import StatCard from "./components/StatCard";
import CaseTable from "./components/CaseTable";

function Dashboard() {

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

    <div>

      <div className="welcome-section">

        <div>

          <span className="section-label">
            ADMIN CONTROL CENTER
          </span>

          <h1>
            Welcome back, Admin 👋
          </h1>

          <p>
            Monitor cases, verify reports and
            coordinate rescue operations.
          </p>

        </div>

        <div className="date-card">

          <span>Today</span>

          <strong>
            21 August 2026
          </strong>

          <small>
            Friday · 04:35 PM
          </small>

        </div>

      </div>


      <div className="stats-grid">

        <StatCard
          title="Total Missing Cases"
          value="120"
          icon="📁"
          type="blue"
        />

        <StatCard
          title="Pending Verification"
          value="13"
          icon="⏳"
          type="orange"
        />

        <StatCard
          title="Active Cases"
          value="45"
          icon="🔎"
          type="purple"
        />

        <StatCard
          title="Rescued Children"
          value="62"
          icon="✓"
          type="green"
        />

        <StatCard
          title="Registered Police"
          value="25"
          icon="👮"
          type="red"
        />

        <StatCard
          title="Registered Users"
          value="850"
          icon="👤"
          type="cyan"
        />

      </div>


      <div className="dashboard-grid">

        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h2>Recent Cases</h2>
              <p>
                Latest missing child cases
              </p>
            </div>

            <button>
              View All →
            </button>

          </div>

          <CaseTable cases={cases} />

        </div>


        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h2>Quick Actions</h2>
              <p>
                Frequently used operations
              </p>
            </div>

          </div>

          <div className="quick-actions">

            <button>
              <span>✓</span>
              <div>
                <strong>
                  Verify Cases
                </strong>
                <small>
                  Review new reports
                </small>
              </div>
            </button>

            <button>
              <span>👮</span>
              <div>
                <strong>
                  Assign Police
                </strong>
                <small>
                  Assign verified cases
                </small>
              </div>
            </button>

            <button>
              <span>📊</span>
              <div>
                <strong>
                  View Analytics
                </strong>
                <small>
                  Check system statistics
                </small>
              </div>
            </button>

            <button>
              <span>🔔</span>
              <div>
                <strong>
                  Notifications
                </strong>
                <small>
                  View system alerts
                </small>
              </div>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;